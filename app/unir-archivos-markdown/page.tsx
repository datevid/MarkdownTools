import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  GitMerge,
  Layers,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { JsonLd } from '@/components/seo/JsonLd';
import { AUTHOR_INFO, SITE_NAME, absoluteUrl } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Unir Archivos Markdown Online Gratis — Fusión y Binding de .md',
  description:
    'Combina y fusiona múltiples archivos Markdown (.md) en un único documento maestro limpio. Reordena capítulos con drag-and-drop, añade separadores y procesa todo 100% privado en tu navegador.',
  alternates: { canonical: '/unir-archivos-markdown' },
  keywords: [
    'unir archivos markdown',
    'combinar archivos markdown online',
    'fusionar markdown',
    'markdown merge online',
    'markdown binder',
    'unir archivos md gratis',
    'juntar varios archivos markdown',
  ],
  openGraph: {
    title: `Unir Archivos Markdown Online Gratis | ${SITE_NAME}`,
    description:
      'Herramienta web gratuita para combinar y reordenar múltiples archivos .md sin subir datos a ningún servidor.',
    url: absoluteUrl('/unir-archivos-markdown'),
    type: 'article',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Unir Archivos Markdown Online Gratis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Unir Archivos Markdown Online | ${SITE_NAME}`,
    description:
      'Combina y fusiona múltiples archivos Markdown (.md) en un único documento maestro.',
    images: ['/og-image.png'],
  },
};

const FAQ_ITEMS = [
  {
    q: '¿Cómo puedo unir varios archivos Markdown en un solo documento?',
    a: 'En Markdown Tools abre la herramienta de Fusión (Binding Tool), arrastra o selecciona todos tus archivos .md, organízalos en el orden que prefieras mediante arrastrar y soltar, y haz clic en "Fusionar Documentos". Obtendrás un archivo consolidado listo para editar o exportar.',
  },
  {
    q: '¿Se suben mis archivos a un servidor externo al fusionarlos?',
    a: 'No. Todo el procesamiento de lectura, ordenamiento y fusión se ejecuta estrictamente en la memoria de tu navegador (lado del cliente). Ningún fragmento de texto viaja a internet.',
  },
  {
    q: '¿Puedo elegir separadores personalizados entre los capítulos o archivos?',
    a: 'Sí. Puedes intercalar saltos de página para PDF, líneas horizontales (---), encabezados de nivel automático (# Capítulo) o fusionar el contenido de manera continua.',
  },
  {
    q: '¿Existe un límite en la cantidad de archivos .md que puedo unir?',
    a: 'No hay límite impuesto. Puedes fusionar decenas de capítulos, documentación técnica modular o libros completos.',
  },
] as const;

export default function UnirArchivosMarkdownPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Herramienta de Fusión Markdown (Binding Tool)',
      url: absoluteUrl('/unir-archivos-markdown'),
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      isAccessibleForFree: true,
      inLanguage: 'es',
      description: metadata.description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      author: {
        '@type': 'Person',
        name: AUTHOR_INFO.name,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'Cómo unir múltiples archivos Markdown en 3 pasos',
      description: 'Guía paso a paso para combinar varios archivos .md en un único documento maestro.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Carga tus archivos .md',
          text: 'Haz clic en "Abrir Herramienta de Fusión" y arrastra tus archivos Markdown al área de carga.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Ordena los capítulos',
          text: 'Arrastra y suelta cada tarjeta de archivo para definir la secuencia deseada (Capítulo 1, 2, 3...).',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Fusiona y descarga',
          text: 'Genera el documento maestro para editarlo en el editor o descargarlo directamente en formato Markdown o PDF.',
        },
      ],
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
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Unir Archivos Markdown',
          item: absoluteUrl('/unir-archivos-markdown'),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <JsonLd data={jsonLd} />
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 space-y-16">
        {/* Breadcrumb */}
        <nav aria-label="Migas de pan" className="text-xs text-muted-foreground flex items-center gap-2">
          <Link href="/" className="hover:text-foreground underline-offset-4 hover:underline">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Unir Archivos Markdown</span>
        </nav>

        {/* Hero Section */}
        <section className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-semibold text-foreground">
            <Sparkles size={14} className="text-accent" aria-hidden="true" />
            <span>Binding Tool · Multi-archivo · 100% Privado en Cliente</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Unir y Fusionar Archivos Markdown Online Gratis
          </h1>

          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Combina múltiples archivos <code>.md</code> o <code>.markdown</code> en un único
            documento estructurado. Ideal para unir capítulos de libros, documentación de software,
            tesis académicas o informes técnicos modulares.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/?action=binding"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-accent-foreground shadow-md transition-all hover:opacity-90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <GitMerge size={17} aria-hidden="true" />
              <span>Abrir Herramienta de Fusión Ahora</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-muted transition-colors"
            >
              <span>Ir al Editor Principal</span>
            </Link>
          </div>
        </section>

        {/* Visual Workflow Steps */}
        <section aria-labelledby="workflow-heading" className="space-y-6">
          <div className="space-y-2">
            <h2 id="workflow-heading" className="text-2xl font-bold tracking-tight">
              ¿Cómo funciona la fusión de archivos Markdown?
            </h2>
            <p className="text-sm text-muted-foreground">
              Un flujo de trabajo visual diseñado para ahorrar tiempo sin necesidad de scripts de consola.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent font-bold">
                1
              </div>
              <h3 className="text-base font-bold">Carga tus archivos .md</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Selecciona o arrastra todos los archivos Markdown que conforman tu proyecto. Puedes importar desde tu equipo o seleccionar documentos abiertos en el editor.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent font-bold">
                2
              </div>
              <h3 className="text-base font-bold">Ordena con Drag-and-Drop</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Reordena los capítulos o secciones fácilmente arrastrando cada elemento a su posición final. Visualiza el conteo de palabras y tamaño al instante.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent font-bold">
                3
              </div>
              <h3 className="text-base font-bold">Fusión instantánea</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                El motor compila un único documento maestro limpio. Podrás previsualizarlo con fórmulas KaTeX y diagramas Mermaid, o exportarlo a PDF y HTML.
              </p>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section aria-labelledby="features-heading" className="space-y-6">
          <h2 id="features-heading" className="text-2xl font-bold tracking-tight">
            Ventajas de usar el Binder y Binding Tool de Markdown Tools
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4">
              <CheckCircle2 size={20} className="shrink-0 text-accent mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-bold text-foreground">Sin instalación ni línea de comandos</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Olvídate de scripts en Python, herramientas complejas como Pandoc o comandos de terminal para unir tus archivos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4">
              <ShieldCheck size={20} className="shrink-0 text-accent mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-bold text-foreground">Privacidad Absoluta (0% Servidor)</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Tus documentos confidenciales, código propietario o borradores nunca se envían a ningún servidor en la nube.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4">
              <Layers size={20} className="shrink-0 text-accent mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-bold text-foreground">Compatibilidad con Binder Rápido</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Organiza y fija tus capítulos habituales en el panel lateral para fusionarlos en cualquier momento con un solo clic.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4">
              <FileText size={20} className="shrink-0 text-accent mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-bold text-foreground">Exportación directa a PDF y HTML</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Convierte el documento fusionado en un PDF maquetado profesionalmente o en código HTML completo para tu sitio web.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section aria-labelledby="faq-heading" className="space-y-6">
          <div className="flex items-center gap-2">
            <HelpCircle size={20} className="text-accent" aria-hidden="true" />
            <h2 id="faq-heading" className="text-2xl font-bold tracking-tight">
              Preguntas Frecuentes sobre la Unión de Archivos Markdown
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-card p-5 transition-colors open:bg-muted/20"
              >
                <summary className="cursor-pointer text-base font-semibold text-foreground list-none flex items-center justify-between gap-3">
                  <span>{item.q}</span>
                  <span className="text-muted-foreground transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground border-t border-border/60 pt-3">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="rounded-3xl border border-accent/30 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent p-8 sm:p-10 text-center space-y-4">
          <h2 className="text-2xl font-extrabold sm:text-3xl text-foreground">
            Comienza a fusionar tus archivos Markdown ahora
          </h2>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground">
            Sin registro, sin límites y con la máxima velocidad en tu navegador.
          </p>
          <div className="pt-2">
            <Link
              href="/?action=binding"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-accent-foreground shadow-sm hover:opacity-90 transition-opacity"
            >
              <span>Abrir Binding Tool</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
