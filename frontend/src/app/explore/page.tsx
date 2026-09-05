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
      {/* Clean Header */}
      <div className="border-b border-border pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-0.5 text-xs font-mono text-zinc-400 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>DISCOVERY INDEX</span>
            </div>
            <h1 className="font-mono text-2xl sm:text-3xl font-bold text-white">
              Ecosystem Explorer
            </h1>
            <p className="mt-1 text-xs text-zinc-400 max-w-xl font-mono">
              Live index across AI models, open-source projects, developer jobs, and technology releases.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
            <span className="rounded border border-border bg-card px-3 py-1.5 font-bold text-white">
              {items.length} Discoveries
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Client Component with Suspense Boundary */}
      <Suspense fallback={<div className="font-mono text-xs text-zinc-500 py-12 text-center">Loading Explorer...</div>}>
        <ExploreClient initialItems={items} />
      </Suspense>
    </div>
  );
}
