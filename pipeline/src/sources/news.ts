import { clip, decodeEntities, getJson, getText, isHttpUrl, stripHtml, toIso } from '../util';

/** A story as a source reports it, before desks, scores and dedupe. */
export interface RawStory {
  title: string;
  url: string;
  blurb: string;
  source: string;
  discussionUrl?: string;
  points?: number;
  comments?: number;
  author?: string;
  publishedAt: string;
  tags?: string[];
  /** 0..1 popularity relative to what is normal for this source. */
  heat: number;
}

const BLURB = 300;

export async function hackerNews(): Promise<RawStory[]> {
  const data = await getJson<{ hits: any[] }>(
    'https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=40',
  );
  return (data.hits ?? [])
    .filter((h) => h.title)
    .map((h) => {
      const thread = `https://news.ycombinator.com/item?id=${h.objectID}`;
      const points = Number(h.points) || 0;
      const comments = Number(h.num_comments) || 0;
      return {
        title: String(h.title),
        url: isHttpUrl(h.url) ? h.url : thread,
        blurb: clip(stripHtml(h.story_text), BLURB),
        source: 'Hacker News',
        discussionUrl: thread,
        points,
        comments,
        author: h.author,
        publishedAt: toIso(h.created_at),
        heat: Math.min(1, (points + comments * 0.5) / 700),
      };
    });
}

export async function lobsters(): Promise<RawStory[]> {
  const data = await getJson<any[]>('https://lobste.rs/hottest.json');
  return (data ?? [])
    .filter((s) => s.title)
    .map((s) => {
      const points = Number(s.score) || 0;
      const comments = Number(s.comment_count) || 0;
      return {
        title: String(s.title),
        url: isHttpUrl(s.url) ? s.url : s.comments_url,
        blurb: clip(stripHtml(s.description_plain || s.description), BLURB),
        source: 'Lobsters',
        discussionUrl: s.comments_url,
        points,
        comments,
        author: typeof s.submitter_user === 'string' ? s.submitter_user : s.submitter_user?.username,
        publishedAt: toIso(s.created_at),
        tags: Array.isArray(s.tags) ? s.tags : [],
        heat: Math.min(1, (points + comments * 0.5) / 110),
      };
    });
}

export async function devTo(): Promise<RawStory[]> {
  const data = await getJson<any[]>('https://dev.to/api/articles?top=2&per_page=20');
  return (data ?? [])
    .filter((a) => a.title && isHttpUrl(a.url))
    .map((a) => {
      const points = Number(a.positive_reactions_count) || 0;
      const comments = Number(a.comments_count) || 0;
      return {
        title: String(a.title),
        url: a.url,
        blurb: clip(String(a.description ?? ''), BLURB),
        source: 'DEV Community',
        points,
        comments,
        author: a.user?.name,
        publishedAt: toIso(a.published_at),
        tags: Array.isArray(a.tag_list) ? a.tag_list : [],
        heat: Math.min(1, (points + comments) / 260),
      };
    });
}

export interface Feed {
  name: string;
  url: string;
}

export const FEEDS: Feed[] = [
  { name: 'The GitHub Blog', url: 'https://github.blog/feed/' },
  { name: 'Cloudflare Blog', url: 'https://blog.cloudflare.com/rss/' },
  { name: 'InfoQ', url: 'https://feed.infoq.com/' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab' },
];

function tag(block: string, name: string): string {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return match ? match[1].trim() : '';
}

/** Small RSS 2.0 / Atom reader. Good enough for well-formed publisher feeds. */
export function parseFeed(xml: string, source: string, limit = 8): RawStory[] {
  const blocks = xml.match(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi) ?? [];
  const stories: RawStory[] = [];
  for (const block of blocks.slice(0, limit)) {
    const title = stripHtml(tag(block, 'title'));
    const href =
      block.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i)?.[1] ??
      block.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1] ??
      stripHtml(tag(block, 'link'));
    const url = decodeEntities(href ?? '').trim();
    if (!title || !isHttpUrl(url)) continue;
    const body = tag(block, 'description') || tag(block, 'summary') || tag(block, 'content');
    stories.push({
      title,
      url,
      blurb: clip(stripHtml(body), BLURB),
      source,
      author: stripHtml(tag(block, 'dc:creator')) || stripHtml(tag(tag(block, 'author'), 'name')) || undefined,
      publishedAt: toIso(tag(block, 'pubDate') || tag(block, 'published') || tag(block, 'updated')),
      heat: 0.3,
    });
  }
  return stories;
}

export async function feed(f: Feed): Promise<RawStory[]> {
  const xml = await getText(f.url, { headers: { Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' } });
  return parseFeed(xml, f.name);
}

const NO_PICTURE = /(^|\.)(github\.com|news\.ycombinator\.com|lobste\.rs|dev\.to)$/;

/** Read a page's own description and lead picture, the way a link preview does. */
export async function pageMeta(url: string): Promise<{ description: string; image?: string }> {
  const out: { description: string; image?: string } = { description: '' };
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DevAtlasBot/2.0)', Accept: 'text/html' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok || !(res.headers.get('content-type') ?? '').includes('html')) return out;
    const html = (await res.text()).slice(0, 200_000);
    const find = (key: string) =>
        html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']+)["']`, 'i')) ??
        html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${key}["']`, 'i'));
    for (const key of ['og:description', 'description', 'twitter:description']) {
      const text = stripHtml(find(key)?.[1] ?? '');
      if (text.length > 40) {
        out.description = clip(text, BLURB);
        break;
      }
    }
    const picture = decodeEntities(find('og:image')?.[1] ?? find('twitter:image')?.[1] ?? '').trim();
    if (picture && !NO_PICTURE.test(new URL(url).hostname)) {
      const absolute = new URL(picture, url).toString();
      if (/^https:/.test(absolute) && !/\.svg(\?|$)/i.test(absolute)) out.image = absolute;
    }
  } catch {
    // A page that will not answer simply runs without a standfirst or picture.
  }
  return out;
}
