import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { SectionHead, Sheet } from '@/components/Chrome';
import { JobsBoard } from '@/components/JobsBoard';
import { getJobs, getJobsFirstPage, getLatest } from '@/lib/data';
import { num } from '@/lib/format';

export const metadata: Metadata = pageMeta({
  title: 'Developer jobs',
  description:
    'Software engineering jobs and internships in India, Europe, the Americas and remote, read from employers’ own careers pages on Greenhouse, Lever and Ashby.',
  path: '/jobs/',
});

export default function JobsPage() {
  const jobs = getJobs();
  const direct = jobs.filter((j) => j.direct).length;
  const employers = new Set(jobs.filter((j) => j.direct).map((j) => j.company)).size;
  return (
    <Sheet paper={getLatest()} section="/jobs/">
      <SectionHead title="Situations vacant" note="Newest first, refreshed with every edition" />
      {jobs.length ? (
        <p className="standfirst wide">
          {num(direct)} of these {num(jobs.length)} jobs are read straight from the careers pages of {employers}{' '}
          employers, through the public Greenhouse, Lever and Ashby job board APIs and the SimplifyJobs lists. Each
          one links to the employer’s own posting and leaves this board when the employer closes it. The rest come
          from remote job boards and are marked as such.
        </p>
      ) : null}
      {jobs.length ? (
        <JobsBoard initial={getJobsFirstPage()} />
      ) : (
        <p className="quiet">No jobs on the board yet. They arrive with the next edition.</p>
      )}
    </Sheet>
  );
}
