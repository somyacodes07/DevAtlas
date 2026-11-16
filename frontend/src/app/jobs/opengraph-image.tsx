import { getJobs, getLatest } from '@/lib/data';
import { OG_SIZE, OG_TYPE, jobsCard } from '@/lib/og';

export const dynamic = 'force-static';
export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = 'The DevAtlas jobs board: developer jobs from employers’ own careers pages';

export default function Image() {
  const jobs = getJobs();
  const paper = getLatest();
  return jobsCard(paper, {
    total: jobs.length,
    direct: jobs.filter((j) => j.direct).length,
    india: jobs.filter((j) => j.region === 'india').length,
    employers: paper?.employers ?? [],
  });
}
