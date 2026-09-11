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

      {/* Newspaper Section Header */}
      <div className="border-b border-double-rule-bottom pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="stamp-badge mb-3 inline-flex">
              <span className="h-1.5 w-1.5 bg-accent" />
              § B. VERIFIED HIRING RADAR
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-black text-foreground tracking-tight">
              POSITIONS VACANT &<br />
              <span className="font-editorial italic text-dateline">Technical Callings</span>
            </h1>
            <p className="mt-3 font-editorial text-sm text-muted max-w-xl leading-relaxed">
              Curated roles with verified requirements across Remote Worldwide, Europe, and Global tech hubs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="border border-border px-4 py-2 font-mono text-[10px] font-bold tracking-[0.15em] uppercase text-foreground">
              {jobs.length} Active Roles
            </span>
          </div>
        </div>
      </div>

      <JobsClient initialJobs={jobs} />
    </div>
  );
}
