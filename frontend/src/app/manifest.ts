import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'The DevAtlas',
    short_name: 'DevAtlas',
    description: 'Developer news, open source and jobs, printed twice a day.',
    start_url: '/',
    display: 'standalone',
    background_color: '#E9E7E0',
    categories: ['news', 'developer', 'productivity'],
    theme_color: '#E9E7E0',
    icons: [
      { src: '/icons/192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
