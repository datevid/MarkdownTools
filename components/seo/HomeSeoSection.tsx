import React from 'react';
import Link from 'next/link';
import {
  Sparkles, GitBranch, Sigma, FileText, Layers, Download,
  ShieldCheck, Keyboard, ArrowRight, ChevronDown
} from 'lucide-react';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/siteConfig';

const FAQ_ITEMS = [
  {
    q: '¿Es gratuito este editor Markdown online y requiere registro?',
    a: 'Sí. Markdown Tools es 100% gratuito y no requiere cuenta, registro ni suscripción. Puedes empezar a escribir, importar archivos .md y exportar al instante.',
  },
  {
    q: '¿Mis documentos se suben a algún servidor o se guardan en privado?',
    a: 'Tus documentos se procesan íntegramente en tu navegador utilizando JavaScript y Web Workers, y se guardan localmente en localStorage. Ningún archivo sale de tu dispositivo.',
  },
  {
    q: '¿Soporta diagramas Mermaid.js y fórmulas matemáticas KaTeX?',
    a: 'Sí. Detecta bloques ```mermaid para diagramas de flujo, secuencia, Gantt, clases o estados (con modo claro/oscuro, zoom y descarga SVG), así como ecuaciones LaTeX inline ($...$) y en bloque ($$...$$) con KaTeX.',
  },
  {
    q: '¿Cómo funciona la herramienta Binder y Binding para unir archivos Markdown?',
    a: 'Puedes añadir múltiples archivos del proyecto o subir archivos .md externos en Binding Tool, reordenarlos mediante arrastrar y soltar (drag-and-drop) y fusionarlos en un único documento maestro limpio.',
  },
  {
    q: '¿A qué formatos puedo exportar mis documentos?',
    a: 'Puedes descargar PDF con maquetación limpia (incluso desde el tema oscuro), exportar HTML completo o fragmento, copiar como Rich Text compatible con Word y Google Docs, imprimir o descargar Markdown limpio (.md).',
  },
] as const;

const HOWTO_STEPS = [
  {
    name: 'Escribe o importa tus archivos Markdown',
    text: 'Redacta directamente en el editor con atajos de teclado o arrastra archivos .md y .markdown desde tu computadora.',
  },
  {
    name: 'Visualiza en tiempo real con Mermaid y KaTeX',
    text: 'Alterna entre Vista Dividida sincronizada, Vista Híbrida o Lectura, y previsualiza tablas GFM, código resaltado, diagramas SVG y ecuaciones.',
  },
  {
    name: 'Organiza y fusiona capítulos con Binding Tool',
    text: 'Combina documentos modulares mediante el panel Binder rápido o Binding Tool con reordenamiento drag-and-drop.',
  },
  {
    name: 'Exporta a PDF, HTML, Rich Text o Markdown',
    text: 'Descarga tu trabajo terminado en PDF con estilo editorial, HTML listo para publicar o Rich Text para procesadores de texto.',
  },
] as const;

/**
 * Server-rendered SEO and informational hub displayed below the interactive workspace on `/`.
 * Provides the page's unique semantic H1, crawlable documentation, FAQ, and structured JSON-LD.
 */
export function HomeSeoSection() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      browserRequirements: 'Navegador web moderno con JavaScript habilitado',
      isAccessibleForFree: true,
      inLanguage: 'es',
      description:
        'Editor Markdown online gratuito con vista previa en tiempo real, diagramas Mermaid.js, fórmulas matemáticas KaTeX, fusión multi-archivo (Binding Tool) y exportación a PDF, HTML y Rich Text.',
      featureList: [
        'Vista Dividida sincronizada y Modo Híbrido',
        'Focus Mode y Typewriter Mode',
        'Diagramas Mermaid.js interactivos con exportación SVG',
        'Fórmulas científicas KaTeX inline y bloque',
        'Fusión multi-archivo Binding Tool con Drag-and-Drop',
        'Exportación directa a PDF, HTML, Rich Text y Markdown',
      ],
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'Cómo editar, diagramar y exportar documentos en Markdown Tools',
      description:
        'Flujo paso a paso para redactar documentación técnica, diagramar con Mermaid y exportar a PDF o HTML desde el navegador.',
      step: HOWTO_STEPS.map((s, idx) => ({
        '@type': 'HowToStep',
        position: idx + 1,
        name: s.name,
        text: s.text,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: absoluteUrl('/') },
      ],
    },
  ];

  return (
    <div
      id="info-herramienta"
      className="border-t border-border bg-background text-foreground [content-visibility:auto] [contain-intrinsic-size:auto_1100px]"
    >
      <JsonLd data={jsonLd} />

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 space-y-16">
        {/* Hero / Unique H1 */}
        <section aria-labelledby="main-seo-heading" className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-semibold text-foreground">
            <Sparkles size={14} className="text-accent" aria-hidden="true" />
            <span>100% Privado · Sin Registro · Web Worker 60 FPS</span>
          </div>
          <h1
            id="main-seo-heading"
            className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Editor Markdown Online Gratis con Vista Previa, Mermaid, KaTeX y Fusión de Archivos
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Escribe documentación técnica, artículos científicos y archivos README sin fricción.
            Disfruta de vista dividida con scroll sincronizado, resaltado de código, diagramas{' '}
            <strong>Mermaid.js</strong>, fórmulas <strong>KaTeX</strong>, fusión de capítulos con{' '}
            <strong>Binding Tool</strong> y exportación instantánea a PDF, HTML y Rich Text.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="#workspace-editor"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground hover:opacity-90 transition-opacity"
            >
              <span>Volver al Editor</span>
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            <Link
              href="/guia-markdown-mermaid-katex"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
            >
              <span>Leer Guía de Markdown, Mermaid y KaTeX</span>
            </Link>
          </div>
        </section>

        {/* Características */}
        <section aria-labelledby="features-heading" className="space-y-6">
          <div className="space-y-2">
            <h2 id="features-heading" className="text-2xl font-bold tracking-tight">
              Características diseñadas para superar a cualquier editor Markdown web
            </h2>
            <p className="text-sm text-muted-foreground">
              Herramientas pensadas para desarrolladores, estudiantes, equipos técnicos y escritores.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-2xl border border-border bg-card p-5 space-y-2.5">
              <FileText size={20} className="text-accent" aria-hidden="true" />
              <h3 className="text-base font-bold">Vista Dividida, Híbrida y Lectura</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Edita lado a lado con sincronización de scroll automática, o usa el modo híbrido y
                Focus / Typewriter Mode para máxima concentración.
              </p>
            </article>

            <article className="rounded-2xl border border-border bg-card p-5 space-y-2.5">
              <GitBranch size={20} className="text-accent" aria-hidden="true" />
              <h3 className="text-base font-bold">Diagramas Mermaid Interactivos</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Renderizado instantáneo de flowcharts, secuencias y cronogramas con diagnóstico de
                errores, ampliación en pantalla completa y descarga SVG.
              </p>
            </article>

            <article className="rounded-2xl border border-border bg-card p-5 space-y-2.5">
              <Sigma size={20} className="text-accent" aria-hidden="true" />
              <h3 className="text-base font-bold">Ecuaciones KaTeX de Alta Precisión</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Soporte tipográfico completo para LaTeX matemático en línea y en bloque, matrices,
                integrales y símbolos científicos.
              </p>
            </article>

            <article className="rounded-2xl border border-border bg-card p-5 space-y-2.5">
              <Layers size={20} className="text-accent" aria-hidden="true" />
              <h3 className="text-base font-bold">Binder y Binding Tool Multi-Archivo</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Sube varios archivos <code>.md</code>, organízalos con arrastrar y soltar y únelos
                en un manuscrito consolidado al instante.
              </p>
            </article>

            <article className="rounded-2xl border border-border bg-card p-5 space-y-2.5">
              <Download size={20} className="text-accent" aria-hidden="true" />
              <h3 className="text-base font-bold">Exportación PDF, HTML y Rich Text</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Genera PDFs limpios (incluso trabajando en modo oscuro), descarga HTML completo o
                copia con formato para Word y Google Docs.
              </p>
            </article>

            <article className="rounded-2xl border border-border bg-card p-5 space-y-2.5">
              <Keyboard size={20} className="text-accent" aria-hidden="true" />
              <h3 className="text-base font-bold">Atajos, Plantillas y Tabla de Contenidos</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Acelera tu flujo con Buscar y Reemplazar, galería de plantillas técnicas, índice
                navegable de encabezados y guardado local automático.
              </p>
            </article>
          </div>
        </section>

        {/* HowTo */}
        <section aria-labelledby="howto-heading" className="space-y-6">
          <h2 id="howto-heading" className="text-2xl font-bold tracking-tight">
            Cómo usar Markdown Tools en 4 pasos
          </h2>
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOWTO_STEPS.map((step, i) => (
              <li
                key={step.name}
                className="rounded-2xl border border-border bg-muted/30 p-5 space-y-2"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-extrabold text-accent-foreground">
                  {i + 1}
                </span>
                <h3 className="text-sm font-bold text-foreground">{step.name}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Privacidad + Enlaces a guía */}
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck size={20} className="text-accent" aria-hidden="true" />
              <span>Privacidad garantizada y referencia completa de sintaxis</span>
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Todo ocurre en tu navegador. Si quieres dominar tablas, diagramas de secuencia o
              matrices LaTeX, explora nuestra guía interactiva paso a paso.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/guia-markdown-mermaid-katex"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground hover:opacity-90 transition-opacity"
            >
              <span>Ver Guía Completa</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              href="/sobre-nosotros"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
            >
              <span>Sobre Nosotros</span>
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="space-y-5">
          <h2 id="faq-heading" className="text-2xl font-bold tracking-tight">
            Preguntas Frecuentes sobre el Editor Markdown
          </h2>
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {FAQ_ITEMS.map((item) => (
              <details key={item.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground">
                  <span>{item.q}</span>
                  <ChevronDown
                    size={18}
                    className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
