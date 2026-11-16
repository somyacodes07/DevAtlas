import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, Manufacturing_Consent, Newsreader } from 'next/font/google';
import type { ReactNode } from 'react';
import '../styles/globals.css';
import { API_URL } from '@/lib/api';
import { SITE_URL } from '@/lib/format';
import { JsonLd, SITE_DESCRIPTION, SITE_NAME, pageMeta, siteLd, withoutCanonical } from '@/lib/seo';

// Self-hosted at build time: no request to Google from readers, no render-blocking
// third-party stylesheet, and size-matched fallbacks so text does not jump on load.
// Newsreader is two variable files (~280 KB with the optical-size axis), so it is not
// preloaded: text paints at once in the size-matched fallback and swaps when it arrives.
const serif = Newsreader({ subsets: ['latin'], style: ['normal', 'italic'], axes: ['opsz'], display: 'swap', preload: false, variable: '--font-serif' });
const cond = Barlow_Condensed({ subsets: ['latin'], weight: ['500', '600'], display: 'swap', variable: '--font-cond' });
const plate = Manufacturing_Consent({ subsets: ['latin'], weight: '400', display: 'swap', variable: '--font-plate' });

export const viewport: Viewport = { width: 'device-width', initialScale: 1, colorScheme: 'light', themeColor: '#e9e7e0' };

export const metadata: Metadata = {
  // No canonical here: each page sets its own, and the 404 page must not claim to be the home page.
  ...withoutCanonical(pageMeta({ description: SITE_DESCRIPTION, path: '/' })),
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}: developer news, printed twice a day`, template: `%s | ${SITE_NAME}` },
  applicationName: SITE_NAME,
  authors: [{ name: 'somyacodes07', url: 'https://github.com/somyacodes07' }],
  category: 'technology',
  formatDetection: { telephone: false, email: false, address: false },
};

// Light paper is the default. Runs before paint so a reader who chose dark never sees a light flash.
const INK = `try{var t=localStorage.getItem('devatlas-ink');if(t==='dark')document.documentElement.dataset.theme='dark'}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${cond.variable} ${plate.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INK }} />
        {/* The page asks the API for the newest edition and its health straight after load. */}
        <link rel="preconnect" href={new URL(API_URL).origin} crossOrigin="anonymous" />
        <JsonLd data={siteLd()} />
      </head>
      <body>{children}</body>
    </html>
  );
}
