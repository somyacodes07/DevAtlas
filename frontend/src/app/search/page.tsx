import type { Metadata } from 'next';
import { Sheet } from '@/components/Chrome';
import { SearchClient } from '@/components/SearchClient';
import { getLatest } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search every story and job in The DevAtlas.',
  alternates: { canonical: '/search/' },
};

export default function SearchPage() {
  return (
    <Sheet paper={getLatest()} section="/search/">
      <SearchClient />
    </Sheet>
  );
}
