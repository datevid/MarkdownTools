import type { Metadata } from 'next';
import Link from 'next/link';
import { Github, Linkedin, Mail, BookOpen } from 'lucide-react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { ContactForm } from '@/components/pages/ContactForm';
import { JsonLd } from '@/components/seo/JsonLd';
import { AUTHOR_INFO, SITE_NAME, absoluteUrl } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Contacto y Soporte Técnico',
  description:
    'Comunícate con el equipo de Markdown Tools para reportar errores, proponer nuevas funcionalidades o resolver dudas sobre edición Markdown, Mermaid y KaTeX.',
  alternates: { canonical: '/contacto' },
  openGraph: {
    title: `Contacto | ${SITE_NAME}`,
    description:
      'Envía sugerencias, reportes de bugs o consultas sobre Markdown Tools.',
    url: absoluteUrl('/contacto'),
    type: 'website',
  },
};

export default function ContactoPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: `Contacto — ${SITE_NAME}`,
      url: absoluteUrl('/contacto'),
      inLanguage: 'es',
      description: metadata.description,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Contacto', item: absoluteUrl('/contacto') },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <JsonLd data={jsonLd} />
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 space-y-10">
        <nav aria-label="Migas de pan" className="text-xs text-muted-foreground flex items-center gap-2">
          <Link href="/" className="hover:text-foreground underline-offset-4 hover:underline">
            Inicio
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-foreground">Contacto</span>
        </nav>

        <section className="space-y-3 max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Contacto y Sugerencias
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            ¿Encontraste un caso especial en Mermaid o KaTeX, o quieres proponer una plantilla nueva?
            Escríbenos mediante el formulario o los canales directos.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-6">Envíanos tu consulta</h2>
            <ContactForm />
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-lg font-bold">Canales Directos</h2>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href={`mailto:${AUTHOR_INFO.email}`}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted transition-colors"
                  >
                    <Mail size={18} className="text-accent shrink-0" aria-hidden="true" />
                    <span className="truncate font-medium">{AUTHOR_INFO.email}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={AUTHOR_INFO.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted transition-colors"
                  >
                    <Github size={18} className="text-accent shrink-0" aria-hidden="true" />
                    <span className="font-medium">GitHub (@datevid)</span>
                  </a>
                </li>
                <li>
                  <a
                    href={AUTHOR_INFO.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted transition-colors"
                  >
                    <Linkedin size={18} className="text-accent shrink-0" aria-hidden="true" />
                    <span className="font-medium">LinkedIn profesional</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-muted/30 p-6 space-y-3">
              <h2 className="text-base font-bold flex items-center gap-2">
                <BookOpen size={18} className="text-accent" aria-hidden="true" />
                <span>¿Dudas de sintaxis?</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Revisa ejemplos listos para copiar de tablas, bloques de código, diagramas Mermaid y
                fórmulas KaTeX.
              </p>
              <Link
                href="/guia-markdown-mermaid-katex"
                className="inline-block text-sm font-semibold text-accent hover:underline underline-offset-4"
              >
                Ir a la Guía Completa →
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
