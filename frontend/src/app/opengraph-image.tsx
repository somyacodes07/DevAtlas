import { getLatest } from '@/lib/data';
import { OG_SIZE, OG_TYPE, editionCard } from '@/lib/og';

export const dynamic = 'force-static';
export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = 'Front page of the latest edition of The DevAtlas';

export default function Image() {
  return editionCard(getLatest());
}
