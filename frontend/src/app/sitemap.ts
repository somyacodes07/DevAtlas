import { MetadataRoute } from 'next';
import { getAllReportDates } from '@/lib/reports';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://devatlas.pages.dev';
  const lastModified = new Date();

  const staticRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'hourly' as const },
    { path: '/explore', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/jobs', priority: 0.95, changeFrequency: 'hourly' as const },
    { path: '/tools', priority: 0.85, changeFrequency: 'daily' as const },
    { path: '/repositories', priority: 0.85, changeFrequency: 'daily' as const },
    { path: '/reports', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/docs', priority: 0.95, changeFrequency: 'weekly' as const },
    { path: '/ops', priority: 0.8, changeFrequency: 'hourly' as const },
  ];

  const reportDates = await getAllReportDates();

  const routes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  reportDates.forEach((date) => {
    routes.push({
      url: `${baseUrl}/reports/${date}`,
      lastModified: new Date(date),
      changeFrequency: 'never',
      priority: 0.7,
    });
  });

  return routes;
}
