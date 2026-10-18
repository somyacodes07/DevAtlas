import { Metadata } from 'next';
import { DocsClient } from '@/components/DocsClient';

export const metadata: Metadata = {
  title: 'About DevAtlas',
  description: 'How the DevAtlas daily edition is collected, scored, and published.',
  openGraph: {
    title: 'About DevAtlas',
    description: 'How the DevAtlas daily edition is collected, scored, and published.',
    url: '/docs',
  },
  alternates: {
    canonical: '/docs',
  },
};

export default function DocsPage() {
  return <DocsClient />;
}
