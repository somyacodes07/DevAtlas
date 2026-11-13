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
    theme_color: '#E9E7E0',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
