import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Cpu, Layers, Zap, Github, Linkedin, ArrowRight } from 'lucide-react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { JsonLd } from '@/components/seo/JsonLd';
import { AUTHOR_INFO, SITE_NAME, absoluteUrl } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Sobre Nosotros — Arquitectura y Misión',
  description:
    'Conoce la misión, arquitectura técnica 100% privada en el navegador y el equipo detrás de Markdown Tools, la suite gratuita para documentación con Mermaid y KaTeX.',
  alternates: { canonical: '/sobre-nosotros' },
  openGraph: {
    title: `Sobre Nosotros | ${SITE_NAME}`,
    description:
      'Suite técnica de Markdown creada para escribir, diagramar con Mermaid, formular con KaTeX y fusionar documentos sin subir datos a servidores.',
    url: absoluteUrl('/sobre-nosotros'),
    type: 'website',
  },
};

export default function SobreNosotrosPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: `Sobre Nosotros — ${SITE_NAME}`,
      url: absoluteUrl('/sobre-nosotros'),
      inLanguage: 'es',
      description: metadata.description,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Sobre Nosotros', item: absoluteUrl('/sobre-nosotros') },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <JsonLd data={jsonLd} />
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 space-y-12">
        <nav aria-label="Migas de pan" className="text-xs text-muted-foreground flex items-center gap-2">
          <Link href="/" className="hover:text-foreground underline-offset-4 hover:underline">
            Inicio
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-foreground">Sobre Nosotros</span>
        </nav>

        <section className="space-y-4">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Sobre Markdown Tools: Ingeniería para Escritura Técnica Sin Fricción
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            <strong>Markdown Tools</strong> nació con un objetivo claro: ofrecer un entorno de
            escritura Markdown de nivel profesional en el navegador, sin registros obligatorios, sin
            telemetría invasiva y con capacidades nativas para documentación técnica compleja
            (Mermaid.js, KaTeX, resaltado de código y fusión multi-archivo).
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <ShieldCheck size={20} aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold">Privacidad 100% Local</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Tus borradores, diagramas y manuscritos nunca se envían a un servidor remoto. Todo el
              análisis sintáctico, la previsualización y las exportaciones se ejecutan en tu propio
              navegador con guardado local automático.
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Cpu size={20} aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold">Motor de Alto Rendimiento</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Construido sobre Next.js App Router, Unified.js (Remark y Rehype) y Web Workers para
              mantener una interfaz fluida a 60 FPS incluso con documentación extensa, tablas
              complejas y múltiples bloques matemáticos.
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Layers size={20} aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold">Flujo Modular con Binding Tool</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Redacta por capítulos independientes, carga archivos externos desde tu equipo y
              combínalos mediante reordenamiento visual drag-and-drop en un único documento maestro.
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Zap size={20} aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold">Exportación Profesional</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Convierte tus documentos al instante a PDF con maquetación limpia, HTML semántico,
              Rich Text listo para Word o Google Docs y Markdown estandarizado.
            </p>
          </article>
        </section>

        <section className="rounded-2xl border border-border bg-muted/30 p-6 sm:p-8 space-y-4">
          <h2 className="text-2xl font-bold">Autoría y Mantenimiento</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Proyecto diseñado y desarrollado por <strong className="text-foreground">{AUTHOR_INFO.name}</strong>{' '}
            ({AUTHOR_INFO.role}), enfocado en herramientas de productividad para desarrolladores,
            investigadores y equipos técnicos hispanohablantes e internacionales.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={AUTHOR_INFO.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors"
            >
              <Github size={16} aria-hidden="true" />
              <span>GitHub (@datevid)</span>
            </a>
            <a
              href={AUTHOR_INFO.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors"
            >
              <Linkedin size={16} aria-hidden="true" />
              <span>LinkedIn</span>
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
            >
              <span>Ir al Editor Markdown</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
