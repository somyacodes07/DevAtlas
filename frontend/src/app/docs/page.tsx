import { Metadata } from 'next';
import { DocsClient } from '@/components/DocsClient';

export const metadata: Metadata = {
  title: 'DevOps & Systems Architecture Documentation',
  description:
    'In-depth technical documentation of the DevAtlas autonomous developer intelligence platform: data crawlers, SHA-256 deduplication, Cloudflare Workers edge serving, Git commit gate, and CI/CD pipelines.',
  openGraph: {
    title: 'DevOps & Systems Architecture Documentation | DevAtlas',
    description:
      'In-depth technical breakdown of DevAtlas autonomous ingestion, SHA-256 deduplication, Cloudflare edge delivery, and $0/month serverless infrastructure.',
    url: '/docs',
  },
  alternates: {
    canonical: '/docs',
  },
};

export default function DocsPage() {
  return <DocsClient />;
}
