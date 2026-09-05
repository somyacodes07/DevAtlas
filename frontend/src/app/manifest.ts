import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DevAtlas — Autonomous Developer Intelligence',
    short_name: 'DevAtlas',
    description: 'Real-time radar for verified developer jobs, internships, frontier AI tools, and fast-growing repositories.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
