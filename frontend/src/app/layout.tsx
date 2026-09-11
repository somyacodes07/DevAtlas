import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google';
import '../styles/globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { JsonLd } from '@/components/JsonLd';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://devatlas.pages.dev';

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'DevAtlas — Autonomous Developer Intelligence & Engineering Radar',
    template: '%s | DevAtlas',
  },
  description:
    'Real-time developer intelligence platform. Curated software engineering roles, high-stipend internships, frontier AI tools, and fast-growing open source repositories.',
  keywords: [
    'developer jobs',
    'software engineering internships 2026',
    'bengaluru tech jobs',
    'remote developer jobs',
    'ai tools',
    'frontier ai models',
    'open source repositories',
    'developer intelligence',
    'tech news',
    'cve advisories',
  ],
  authors: [{ name: 'DevAtlas Team', url: siteUrl }],
  creator: 'DevAtlas Engineering',
  publisher: 'DevAtlas',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'DevAtlas',
    title: 'DevAtlas — Autonomous Developer Intelligence & Engineering Radar',
    description:
      'Continuous real-time radar for verified software engineering roles, internships, AI tools, and fast-growing repositories.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevAtlas — Developer Intelligence & Engineering Radar',
    description:
      'Continuous real-time radar for verified software engineering roles, internships, AI tools, and open source momentum.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('devatlas-theme');
                  var isDark = stored ? stored === 'dark' : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <JsonLd />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-accent/30 selection:text-white" suppressHydrationWarning>
        {/* Accessible Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:font-bold focus:text-white focus:shadow-lg focus:shadow-accent/50 transition-all"
        >
          Skip to main content
        </a>

        <div className="flex min-h-screen flex-col">
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
