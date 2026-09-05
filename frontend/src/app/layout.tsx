import type { Metadata } from 'next';
import '../styles/globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'DevAtlas — Autonomous Developer Intelligence & CI/CD Platform',
  description:
    'Continuously discovered, AI-classified, and validated developer tools, open-source repositories, developer jobs, and tech ecosystem changes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-zinc-800 selection:text-white">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
