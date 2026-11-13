import { Sheet, Unprinted } from '@/components/Chrome';
import { EditionView } from '@/components/EditionView';
import { getLatest } from '@/lib/data';

export default function FrontPage() {
  const edition = getLatest();
  return (
    <Sheet paper={edition} section="/">
      {edition ? <EditionView edition={edition} /> : <Unprinted />}
    </Sheet>
  );
}
