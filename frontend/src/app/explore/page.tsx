import { Suspense } from 'react';
import { Metadata } from 'next';
import { fetchItems } from '@/lib/api';
import { ExploreClient } from '@/components/ExploreClient';

export const metadata: Metadata = {
  title: 'Ecosystem Explorer',
  description:
    'Search and filter cataloged developer ecosystem discoveries: AI tools, open-source repositories, developer jobs, and tech news.',
  openGraph: {
    title: 'Ecosystem Explorer | DevAtlas',
    description:
      'Search and filter cataloged developer ecosystem discoveries with sub-millisecond in-memory response.',
    url: '/explore',
  },
  alternates: {
    canonical: '/explore',
  },
};

export default async function ExplorePage() {
  const res = await fetchItems({ limit: '100' });
  const items = res.data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 space-y-8">
      {/* Section Header */}
      <div className="border-b border-double-rule-bottom pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="stamp-badge mb-3 inline-flex">
              <span className="h-1.5 w-1.5 bg-accent" />
              § F. DISCOVERY INDEX
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-black text-foreground tracking-tight">
              THE COMPLETE<br />
              <span className="font-editorial italic text-dateline">Archive & Ecosystem Directory</span>
            </h1>
            <p className="mt-3 font-editorial text-sm text-muted max-w-xl leading-relaxed">
              Live index across AI models, open-source projects, developer jobs, and technology releases.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="border border-border px-4 py-2 font-mono text-[10px] font-bold tracking-[0.15em] uppercase text-foreground">
              {items.length} Discoveries
            </span>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="font-mono text-[10px] tracking-wider uppercase text-muted py-12 text-center">Loading Explorer...</div>}>
        <ExploreClient initialItems={items} />
      </Suspense>
    </div>
  );
}
