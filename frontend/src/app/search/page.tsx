import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { Sheet } from '@/components/Chrome';
import { SearchClient } from '@/components/SearchClient';
import { getLatest } from '@/lib/data';

export const metadata: Metadata = pageMeta({
  title: 'Search',
  description:
    'Search every story from the last 30 days and every developer job on the board.',
  path: '/search/',
});

export default function SearchPage() {
  return (
    <Sheet paper={getLatest()} section="/search/">
      <SearchClient />
    </Sheet>
  );
}
