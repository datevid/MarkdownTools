import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/siteConfig';

export const dynamic = 'force-static';

/**
 * Generates sitemap.xml listing all indexable routes of Markdown Tools.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: absoluteUrl('/guia-markdown-mermaid-katex'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/sobre-nosotros'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: absoluteUrl('/contacto'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: absoluteUrl('/aviso-legal'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];
}
