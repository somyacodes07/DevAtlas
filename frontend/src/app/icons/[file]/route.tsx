import { iconCard } from '@/lib/og';

// PNG icons for the web app manifest: /icons/192.png and /icons/512.png
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ file: '192.png' }, { file: '512.png' }];
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  return iconCard(Number.parseInt((await params).file, 10));
}
