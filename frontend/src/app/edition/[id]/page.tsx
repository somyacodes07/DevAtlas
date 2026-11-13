import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Sheet } from '@/components/Chrome';
import { EditionView } from '@/components/EditionView';
import { getEdition, getIndex } from '@/lib/data';
import { longDate, slotName } from '@/lib/format';

export const dynamicParams = false;

export function generateStaticParams() {
  const index = getIndex();
  // Static export needs at least one path, even before the first edition exists.
  return index.length ? index.map((e) => ({ id: e.id })) : [{ id: 'first' }];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const edition = getEdition((await params).id);
  if (!edition) return { title: 'Edition not found' };
  return {
    title: `${slotName(edition.slot)}, ${longDate(edition.date)}`,
    description: edition.lead.title,
    alternates: { canonical: `/edition/${edition.id}/` },
  };
}

export default async function EditionPage({ params }: { params: Promise<{ id: string }> }) {
  const edition = getEdition((await params).id);
  if (!edition) notFound();
  const latest = getIndex()[0]?.id === edition.id;
  return (
    <Sheet paper={edition} section="/archive/">
      <EditionView edition={edition} latest={latest} />
    </Sheet>
  );
}
