import { Metadata } from 'next';
import { getAllReportDates, getReportByDate } from '@/lib/reports';
import { ReportDetailClient } from '@/components/ReportDetailClient';
import { JsonLd } from '@/components/JsonLd';

export const dynamicParams = false;

export async function generateStaticParams() {
  const dates = await getAllReportDates();
  return dates.map((date) => ({ date }));
}

interface ReportPageProps {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: ReportPageProps): Promise<Metadata> {
  const { date } = await params;
  const report = await getReportByDate(date);
  const title = report?.title || `DevAtlas Daily Intelligence Report — ${date}`;

  return {
    title,
    description: `Autonomous developer ecosystem intelligence report for ${date}. Cataloged AI models, open-source repositories, and verified developer jobs.`,
    openGraph: {
      title: `${title} | DevAtlas`,
      description: `Autonomous developer ecosystem intelligence report for ${date}.`,
      url: `/reports/${date}`,
    },
    alternates: {
      canonical: `/reports/${date}`,
    },
  };
}

export default async function ReportDatePage({ params }: ReportPageProps) {
  const { date } = await params;
  const report = await getReportByDate(date);

  const title = report?.title || `Developer Intelligence Digest: ${date}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    datePublished: `${date}T00:00:00Z`,
    author: {
      '@type': 'Organization',
      name: 'DevAtlas Engineering',
    },
    description: `Autonomous developer intelligence report generated on ${date}.`,
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <ReportDetailClient initialReport={report} date={date} />
    </>
  );
}
