import { getEdition, getIndex } from '@/lib/data';
import { SITE_URL } from '@/lib/format';
import { SITE_NAME, editionTitle } from '@/lib/seo';

// One RSS item per edition, so feed readers get the paper twice a day.
export const dynamic = 'force-static';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function GET() {
  const items = getIndex()
    .slice(0, 30)
    .map((entry) => {
      const e = getEdition(entry.id);
      if (!e) return '';
      const link = `${SITE_URL}/edition/${e.id}/`;
      const body = [
        ...e.briefing.map((p) => `<p>${esc(p)}</p>`),
        '<ul>',
        ...[e.lead, ...e.stories.slice(0, 12)].map((s) => `<li><a href="${esc(s.url)}">${esc(s.title)}</a> (${esc(s.source)})</li>`),
        '</ul>',
        `<p><a href="${link}">Read the full edition</a></p>`,
      ].join('');
      return `    <item>
      <title>${esc(`${editionTitle(e)}: ${e.lead.title}`)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(e.generatedAt).toUTCString()}</pubDate>
      <description><![CDATA[${body.replace(/]]>/g, ']]&gt;')}]]></description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}/</link>
    <description>Developer news, open source and jobs, printed twice a day.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image><url>${SITE_URL}/icons/192.png</url><title>${SITE_NAME}</title><link>${SITE_URL}/</link></image>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
