import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '../styles/globals.css';
import { SITE_URL } from '@/lib/format';

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'The DevAtlas: developer news, printed twice a day', template: '%s | The DevAtlas' },
  description:
    'A free developer newspaper. Top stories from Hacker News, Lobsters and engineering blogs, rising GitHub repositories, security advisories and developer jobs, in a morning and an evening edition.',
  openGraph: { type: 'website', siteName: 'The DevAtlas', url: SITE_URL },
  alternates: { canonical: '/' },
};

// Runs before paint so a saved light or dark choice never flashes the other paper.
const INK = `try{var t=localStorage.getItem('devatlas-ink');if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INK }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600&family=Manufacturing+Consent&family=Newsreader:ital,opsz,wght@0,6..72,400..800;1,6..72,400..600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
