/**
 * Central site configuration, URL helpers, and shared navigation links
 * used across metadata, sitemap, robots, JSON-LD, and layout components.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://markdown-tools.vercel.app'
).replace(/\/+$/, '');

export const SITE_NAME = 'Markdown Tools';

export const SITE_TAGLINE =
  'Editor Markdown Online Gratis con Vista Previa, Mermaid, KaTeX y Fusión de Archivos';

export const AUTHOR_INFO = {
  name: 'David León Vilca',
  role: 'Software Developer & Technical Author',
  linkedin: 'https://www.linkedin.com/in/datevid/',
  github: 'https://github.com/datevid',
  email: 'contacto@markdown-tools.dev',
} as const;

export const NAV_LINKS = [
  { href: '/', label: 'Editor' },
  { href: '/guia-markdown-mermaid-katex', label: 'Guía Técnica' },
  { href: '/sobre-nosotros', label: 'Sobre Nosotros' },
  { href: '/contacto', label: 'Contacto' },
  { href: '/aviso-legal', label: 'Aviso Legal' },
] as const;

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}
