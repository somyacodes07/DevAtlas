import type { MetadataRoute } from 'next';
import { getIndex } from '@/lib/data';
import { SITE_URL } from '@/lib/format';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const index = getIndex();
  const lastModified = index[0]?.generatedAt;
  return [
    ...['/', '/open-source/', '/jobs/', '/archive/', '/about/'].map((path) => ({ url: `${SITE_URL}${path}`, lastModified })),
    ...index.map((e) => ({ url: `${SITE_URL}/edition/${e.id}/`, lastModified: e.generatedAt })),
  ];
}
