import { Sheet, Unprinted } from '@/components/Chrome';
import { LivePaper } from '@/components/LivePaper';
import { getLatest } from '@/lib/data';

export default function FrontPage() {
  const edition = getLatest();
  if (edition) return <LivePaper baked={edition} />;
  return (
    <Sheet paper={null} section="/">
      <Unprinted />
    </Sheet>
  );
}
