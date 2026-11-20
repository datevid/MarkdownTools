import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Markdown Tools — Editor Markdown con Mermaid, KaTeX y Fusión',
    short_name: 'Markdown Tools',
    description:
      'Suite gratuita de edición Markdown en tiempo real con vista previa, diagramas Mermaid, fórmulas matemáticas KaTeX, fusión de archivos y exportación a PDF.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#2563eb',
    lang: 'es',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
