import type { MetadataRoute } from 'next';
import { getIndex } from '@/lib/data';
import { SITE_URL } from '@/lib/format';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const index = getIndex();
  const latest = index[0]?.generatedAt;
  const page = (path: string, changeFrequency: 'daily' | 'weekly' | 'monthly', priority: number, lastModified = latest) => ({
    url: `${SITE_URL}${path}`, lastModified, changeFrequency, priority,
  });
  return [
    page('/', 'daily', 1),
    page('/jobs/', 'daily', 0.9),
    page('/open-source/', 'daily', 0.8),
    page('/archive/', 'daily', 0.6),
    page('/search/', 'monthly', 0.3),
    page('/about/', 'monthly', 0.4, undefined),
    ...index.map((e) => page(`/edition/${e.id}/`, 'monthly', 0.5, e.generatedAt)),
  ];
}
