import { getEdition, getIndex } from '@/lib/data';
import { OG_SIZE, OG_TYPE, editionCard } from '@/lib/og';

export const dynamicParams = false;
export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = 'Front page of this edition of The DevAtlas';

export function generateStaticParams() {
  const index = getIndex();
  return index.length ? index.map((e) => ({ id: e.id })) : [{ id: 'first' }];
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  return editionCard(getEdition((await params).id));
}
