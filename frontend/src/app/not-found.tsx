import type { Metadata } from 'next';
import Link from 'next/link';
import { Sheet } from '@/components/Chrome';
import { getLatest } from '@/lib/data';

// Next marks the 404 page noindex by itself.
export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <Sheet paper={getLatest()} section="">
      <div className="unprinted">
        <h1>This page is not in the paper</h1>
        <p>
          The edition may have been recycled after 30 days, or the address is wrong.{' '}
          <Link href="/">Read the latest edition</Link> or <Link href="/archive/">look through the back issues</Link>.
        </p>
      </div>
    </Sheet>
  );
}
