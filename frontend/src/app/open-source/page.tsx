import type { Metadata } from 'next';
import { SectionHead, Sheet, Unprinted } from '@/components/Chrome';
import { Exchange } from '@/components/Parts';
import { getLatest } from '@/lib/data';
import { num } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Open source exchange',
  description: 'GitHub repositories under a month old with the most stars, and how many they gained since the last edition.',
  alternates: { canonical: '/open-source/' },
};

export default function OpenSourcePage() {
  const edition = getLatest();
  if (!edition) return <Sheet paper={null} section="/open-source/"><Unprinted /></Sheet>;
  const movers = edition.repos.filter((r) => (r.gain ?? 0) > 0).sort((a, b) => b.gain! - a.gain!).slice(0, 3);
  const debuts = edition.repos.filter((r) => r.gain === null).length;
  return (
    <Sheet paper={edition} section="/open-source/">
      <SectionHead title="Open source exchange" note={`${edition.repos.length} repositories listed`} />
      <p className="standfirst wide">
        Every repository here was created in the last 30 days and already has more than 200 stars. The change column
        compares star counts with the previous edition, about twelve hours earlier.
        {movers.length
          ? ` Biggest movers: ${movers.map((r) => `${r.name} (+${num(r.gain!)})`).join(', ')}.`
          : debuts === edition.repos.length
            ? ' This is the first table on file, so every entry is marked new.'
            : ''}
      </p>
      <Exchange repos={edition.repos} />
    </Sheet>
  );
}
