import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionHead, Sheet, Unprinted } from '@/components/Chrome';
import { getIndex, getLatest } from '@/lib/data';
import { longDate, plural, pressTime, slotName } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Back issues',
  description: 'Every edition of The DevAtlas from the last 30 days.',
  alternates: { canonical: '/archive/' },
};

export default function ArchivePage() {
  const index = getIndex();
  const dates = [...new Set(index.map((e) => e.date))];
  return (
    <Sheet paper={getLatest()} section="/archive/">
      {index.length ? (
        <>
          <SectionHead title="Back issues" note={`${plural(index.length, 'edition')} on file. Papers older than 30 days are recycled.`} />
          <ol className="issues">
            {dates.map((date) => (
              <li key={date}>
                <h3>{longDate(date)}</h3>
                <ul>
                  {index
                    .filter((e) => e.date === date)
                    .map((e) => (
                      <li key={e.id}>
                        <p className="issue-slot">
                          {slotName(e.slot)}, No. {e.number}
                          <span>{pressTime(e.generatedAt)}</span>
                        </p>
                        <Link href={`/edition/${e.id}/`}>{e.headline}</Link>
                        <p className="meta">
                          <span>{plural(e.stories, 'story', 'stories')}</span>
                        </p>
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <Unprinted />
      )}
    </Sheet>
  );
}
