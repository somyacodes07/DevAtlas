import { Metadata } from 'next';
import { fetchJobs } from '@/lib/api';
import { JobsClient } from '@/components/JobsClient';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Verified Developer Jobs & Internships',
  description:
    'Curated software engineering roles, high-stipend summer 2026 internships, and senior positions across India tech hubs and Remote Worldwide.',
  keywords: [
    'software engineering internships 2026',
    'bengaluru developer jobs',
    'india tech salaries',
    'remote software engineering roles',
    'cred backend engineer',
    'google india internship',
  ],
  openGraph: {
    title: 'Verified Developer Jobs & Internships | DevAtlas',
    description:
      'Curated software engineering roles, high-stipend summer 2026 internships, and senior positions with verified compensation.',
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
          name: item.job?.company || 'Verified Company',
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
        baseSalary: item.job?.salary
          ? {
              '@type': 'MonetaryAmount',
              currency: 'INR',
              value: {
                '@type': 'QuantitativeValue',
                unitText: 'MONTH',
              },
            }
          : undefined,
        url: item.canonicalUrl,
      },
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 space-y-8">
      <JsonLd data={jobSchemaList} />

      {/* Header Banner - Clean, Low-Text, On Point */}
      <div className="border-b border-border pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-0.5 text-xs font-mono text-zinc-400 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>VERIFIED HIRING RADAR</span>
            </div>
            <h1 className="font-mono text-2xl sm:text-3xl font-bold text-white">
              Developer Jobs &amp; Internships
            </h1>
            <p className="mt-1 text-xs text-zinc-400 max-w-xl font-mono">
              Curated roles with verified stipend &amp; CTC data across Bengaluru, Hyderabad, and Remote Worldwide.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
            <span className="rounded border border-border bg-card px-3 py-1.5 font-bold text-white">
              {jobs.length} Active Openings
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Client Component */}
      <JobsClient initialJobs={jobs} />
    </div>
  );
}
