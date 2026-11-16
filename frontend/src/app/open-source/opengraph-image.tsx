import { getLatest } from '@/lib/data';
import { OG_SIZE, OG_TYPE, reposCard } from '@/lib/og';

export const dynamic = 'force-static';
export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = 'The DevAtlas open source exchange: young GitHub repositories ranked by stars';

export default function Image() {
  return reposCard(getLatest());
}
