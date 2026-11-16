import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Sheet } from '@/components/Chrome';
import { EditionView } from '@/components/EditionView';
import { getEdition, getIndex } from '@/lib/data';
import { JsonLd, editionDescription, editionLd, editionTitle, pageMeta } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  const index = getIndex();
  // Static export needs at least one path, even before the first edition exists.
  return index.length ? index.map((e) => ({ id: e.id })) : [{ id: 'first' }];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const edition = getEdition((await params).id);
  if (!edition) return { title: 'Edition not found' };
  return pageMeta({
    title: editionTitle(edition),
    description: editionDescription(edition),
    path: `/edition/${edition.id}/`,
    type: 'article',
    publishedAt: edition.generatedAt,
  });
}

export default async function EditionPage({ params }: { params: Promise<{ id: string }> }) {
  const edition = getEdition((await params).id);
  if (!edition) notFound();
  const latest = getIndex()[0]?.id === edition.id;
  return (
    <Sheet paper={edition} section="/archive/">
      <JsonLd data={editionLd(edition, `/edition/${edition.id}/`)} />
      <EditionView edition={edition} latest={latest} />
    </Sheet>
  );
}
