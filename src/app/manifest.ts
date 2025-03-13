import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sola AI',
    short_name: 'Sola AI',
    description: 'Voice Assistant on Solana',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#c5b3fe',
    icons: [
      {
        src: '/icons/pwa-64x64.png',
        sizes: '64x64',
        type: 'image/png',
      },
      {
        src: '/icons/pwa-180x180.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icons/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
