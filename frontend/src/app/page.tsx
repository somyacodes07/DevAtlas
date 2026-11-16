import { Sheet, Unprinted } from '@/components/Chrome';
import { LivePaper } from '@/components/LivePaper';
import type { Metadata } from 'next';
import { getLatest } from '@/lib/data';
import { JsonLd, SITE_DESCRIPTION, editionDescription, editionLd, pageMeta } from '@/lib/seo';

export function generateMetadata(): Metadata {
  const edition = getLatest();
  return pageMeta({ description: edition ? editionDescription(edition) : SITE_DESCRIPTION, path: '/' });
}

export default function FrontPage() {
  const edition = getLatest();
  if (edition) {
    return (
      <>
        <JsonLd data={editionLd(edition, '/')} />
        <LivePaper baked={edition} />
      </>
    );
  }
  return (
    <Sheet paper={null} section="/">
      <Unprinted />
    </Sheet>
  );
}
