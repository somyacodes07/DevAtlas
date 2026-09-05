import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://devatlas.pages.dev';
  const lastModified = new Date();

  const staticRoutes = [
    '',
    '/explore',
    '/jobs',
    '/tools',
    '/repositories',
    '/reports',
    '/ops',
  ];

  const reportDates = ['2026-09-06', '2026-09-05', '2026-09-04'];

  const routes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === '' || route === '/jobs' ? 'hourly' : 'daily',
    priority: route === '' ? 1.0 : route === '/jobs' || route === '/explore' ? 0.9 : 0.8,
  }));

  reportDates.forEach((date) => {
    routes.push({
      url: `${baseUrl}/reports/${date}`,
      lastModified: new Date(date),
      changeFrequency: 'never',
      priority: 0.6,
    });
  });

  return routes;
}
