import { PaperSkeleton } from '@/components/PaperSkeleton';

export default function Loading() {
  return (
    <div className="paper-page" aria-label="Loading page">
      <PaperSkeleton />
    </div>
  );
}
