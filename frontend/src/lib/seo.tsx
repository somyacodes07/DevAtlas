import type { Metadata } from 'next';
import type { Edition, Repo } from '@/lib/data';
import { REPO_URL, SITE_URL, longDate, slotName } from '@/lib/format';

export const SITE_NAME = 'The DevAtlas';

export const SITE_DESCRIPTION =
  'A free developer newspaper. Top stories from Hacker News, Lobsters and engineering blogs, rising GitHub repositories, security advisories and developer jobs, in a morning and an evening edition.';

/**
 * Metadata for one page. Next replaces a parent's openGraph and alternates
 * objects wholesale, so every page gets the full set from here rather than
 * relying on the layout. Card images come from each route's opengraph-image.
 */
export function pageMeta({ title, description, path, type = 'website', publishedAt, noindex = false }: {
  title?: string; description: string; path: string; type?: 'website' | 'article'; publishedAt?: string; noindex?: boolean;
}): Metadata {
  const ogTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME}: developer news, printed twice a day`;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path, types: { 'application/rss+xml': [{ url: '/feed.xml', title: SITE_NAME }] } },
    openGraph: {
      type, siteName: SITE_NAME, locale: 'en_IN', url: path, title: ogTitle, description,
      ...(type === 'article' && publishedAt ? { publishedTime: publishedAt } : {}),
    },
    twitter: { card: 'summary_large_image', title: ogTitle, description },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export function withoutCanonical(meta: Metadata): Metadata {
  const { canonical: _canonical, ...rest } = meta.alternates ?? {};
  return { ...meta, alternates: rest };
}

export const editionTitle = (e: Pick<Edition, 'slot' | 'date'>) => `${slotName(e.slot)}, ${longDate(e.date)}`;

export function editionDescription(e: Edition): string {
  const more = e.stories.slice(0, 2).map((s) => s.title).join('; ');
  return `${e.lead.title}. Also: ${more}. Plus ${e.repos.length} rising repositories and ${e.jobsTotal} developer jobs.`.slice(0, 300);
}

/** JSON-LD, escaped so headline text can never close the script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
  );
}

const publisher = {
  '@type': 'NewsMediaOrganization',
  '@id': `${SITE_URL}/#publisher`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: { '@type': 'ImageObject', url: `${SITE_URL}/icons/512.png`, width: 512, height: 512 },
  sameAs: [REPO_URL],
};

export const siteLd = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    publisher,
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      inLanguage: 'en',
      publisher: { '@id': `${SITE_URL}/#publisher` },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search/?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
});

/** An edition is a dated page that lists stories published elsewhere. */
export const editionLd = (e: Edition, path: string) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${SITE_URL}${path}`,
  url: `${SITE_URL}${path}`,
  name: `${SITE_NAME}, ${editionTitle(e)}`,
  headline: e.lead.title,
  description: editionDescription(e),
  datePublished: e.generatedAt,
  dateModified: e.generatedAt,
  inLanguage: 'en',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  publisher: { '@id': `${SITE_URL}/#publisher` },
  image: `${SITE_URL}${path === '/' ? '' : path.replace(/\/$/, '')}/opengraph-image`,
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: e.stories.length + 1,
    itemListElement: [e.lead, ...e.stories].map((s, i) => ({ '@type': 'ListItem', position: i + 1, url: s.url, name: s.title })),
  },
});

export const reposLd = (repos: Repo[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Open source exchange',
  numberOfItems: repos.length,
  itemListElement: repos.map((r, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'SoftwareSourceCode',
      name: r.name,
      codeRepository: r.url,
      ...(r.language && r.language !== '—' ? { programmingLanguage: r.language } : {}),
      ...(r.description ? { description: r.description } : {}),
    },
  })),
});
