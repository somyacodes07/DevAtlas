import { Metadata } from 'next';
import { fetchJobs } from '@/lib/api';
import { JobsClient } from '@/components/JobsClient';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Verified Developer Jobs & Engineering Roles',
  description:
    'Curated software engineering roles, verified backend, infrastructure, and QA positions across Remote Worldwide, Europe, and Global tech hubs.',
  keywords: [
    'software engineering jobs 2026',
    'remote developer jobs',
    'datadog engineering roles',
    'qa automation engineer',
    'backend software engineer',
    'arbeitnow verified tech jobs',
  ],
  openGraph: {
    title: 'Verified Developer Jobs & Engineering Roles | DevAtlas',
    description:
      'Curated software engineering roles, infrastructure positions, and developer jobs with verified requirements.',
    url: '/jobs',
  },
  alternates: {
    canonical: '/jobs',
  },
};

export default async function JobsPage() {
  const res = await fetchJobs({ limit: '100' });
  const jobs = res.data;

  // Schema.org JobPosting structured data for Google for Jobs
  const jobSchemaList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: jobs.slice(0, 10).map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'JobPosting',
        title: item.title,
        description: item.description,
        datePosted: item.publishedAt || new Date().toISOString(),
        hiringOrganization: {
          '@type': 'Organization',
          name: item.job?.company || 'Verified Tech Company',
        },
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: item.job?.location || 'Remote',
          },
        },
        employmentType:
          item.job?.experienceLevel === 'INTERNSHIP' ? 'INTERN' : 'FULL_TIME',
        url: item.canonicalUrl,
      },
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 space-y-8">
      <JsonLd data={jobSchemaList} />

      {/* Clean Header */}
      <div className="border-b-2 border-border pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-muted mb-3">
              <span className="h-2 w-2 bg-accent" />
              <span>VERIFIED HIRING RADAR</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Developer Jobs &amp; Engineering Roles
            </h1>
            <p className="mt-2 text-sm text-foreground/80 max-w-xl font-sans">
              Curated roles with verified requirements across Remote Worldwide, Europe, and Global tech hubs.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-muted">
            <span className="rounded-full border border-border bg-card px-4 py-2 font-bold uppercase tracking-wider text-foreground shadow-sm">
              {jobs.length} Active Roles
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Client Component */}
      <JobsClient initialJobs={jobs} />
    </div>
  );
}
