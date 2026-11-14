import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AUTHOR_INFO, NAV_LINKS, SITE_NAME } from '@/lib/siteConfig';

/**
 * Semantic site footer providing internal navigation links, privacy summary, and authorship.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30 text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-foreground">
              <Image
                src="/logo.png"
                alt="Logotipo de Markdown Tools"
                width={28}
                height={28}
                className="rounded-lg"
              />
              <span>{SITE_NAME}</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Editor Markdown online gratuito con vista previa en tiempo real, diagramas Mermaid,
              matemáticas KaTeX, fusión de archivos (Binding) y exportación a PDF, HTML y Rich Text.
              Todo se procesa de forma local en tu navegador.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Recursos y Navegación
            </h3>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Autoría y Comunidad
            </h3>
            <p className="text-sm text-muted-foreground">
              Desarrollado por <strong className="text-foreground">{AUTHOR_INFO.name}</strong>.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <a
                href={AUTHOR_INFO.github}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border bg-card px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-muted"
              >
                GitHub
              </a>
              <a
                href={AUTHOR_INFO.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border bg-card px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-muted"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {year} {SITE_NAME}. Licencia MIT. Procesamiento 100% privado en tu navegador.</p>
          <p>Soporte nativo para GitHub Flavored Markdown, KaTeX y Mermaid.js.</p>
        </div>
      </div>
    </footer>
  );
}
