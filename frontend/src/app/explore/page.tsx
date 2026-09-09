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
      <div className="border-b-2 border-border pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-muted mb-3">
              <span className="h-2 w-2 bg-accent" />
              <span>DISCOVERY INDEX</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Ecosystem Explorer
            </h1>
            <p className="mt-2 text-sm text-foreground/80 max-w-xl font-sans">
              Live index across AI models, open-source projects, developer jobs, and technology releases.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-muted">
            <span className="border border-border bg-foreground px-4 py-2 font-bold uppercase tracking-wider text-background">
              {items.length} Discoveries
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Client Component with Suspense Boundary */}
      <Suspense fallback={<div className="font-mono text-xs text-muted/60 py-12 text-center">Loading Explorer...</div>}>
        <ExploreClient initialItems={items} />
      </Suspense>
    </div>
  );
}
