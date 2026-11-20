import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Download,
  FileText,
  Printer,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Sigma,
  GitBranch,
} from 'lucide-react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { JsonLd } from '@/components/seo/JsonLd';
import { AUTHOR_INFO, SITE_NAME, absoluteUrl } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Convertir Markdown a PDF Online Gratis — Exportador Profesional',
  description:
    'Convierte y exporta documentos Markdown (.md) a PDF con maquetación editorial limpia, soporte para diagramas Mermaid.js, ecuaciones matemáticas KaTeX y saltos de página. 100% gratuito y privado en tu navegador.',
  alternates: { canonical: '/markdown-a-pdf' },
  keywords: [
    'markdown a pdf',
    'convertir markdown a pdf',
    'exportar markdown a pdf online',
    'markdown to pdf gratis',
    'markdown to pdf converter',
    'markdown a pdf con formulas',
    'markdown a pdf con diagramas',
    'imprimir markdown a pdf',
  ],
  openGraph: {
    title: `Convertir Markdown a PDF Online Gratis | ${SITE_NAME}`,
    description:
      'Exporta documentos Markdown a PDF con estilo profesional, ecuaciones KaTeX y diagramas Mermaid sin registros ni marcas de agua.',
    url: absoluteUrl('/markdown-a-pdf'),
    type: 'article',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Convertir Markdown a PDF Online Gratis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Convertir Markdown a PDF Online | ${SITE_NAME}`,
    description:
      'Convierte Markdown a PDF con soporte KaTeX y Mermaid sin enviar tus datos a la nube.',
    images: ['/og-image.png'],
  },
};

const FAQ_ITEMS = [
  {
    q: '¿Cómo convertir un archivo Markdown a PDF con Markdown Tools?',
    a: 'Escribe o carga tu archivo .md en el editor, haz clic en el botón "Exportar" en la barra de herramientas superior y selecciona "Descargar PDF". En pocos segundos se generará un documento PDF de alta calidad con fuentes nítidas y elementos visuales optimizados.',
  },
  {
    q: '¿Se ven bien las fórmulas matemáticas KaTeX y los diagramas Mermaid en el PDF?',
    a: 'Sí. A diferencia de convertidores genéricos, Markdown Tools renderiza las ecuaciones LaTeX con KaTeX y los diagramas Mermaid en gráficos vectoriales de alta definición antes de generar el PDF.',
  },
  {
    q: '¿Cómo puedo insertar saltos de página entre capítulos en el PDF?',
    a: 'Puedes agregar la etiqueta `<div class="page-break"></div>` o `<div style="page-break-after: always;"></div>` en cualquier lugar de tu texto para forzar el inicio de una nueva página en el PDF.',
  },
  {
    q: '¿Si tengo el editor en modo oscuro, el PDF saldrá oscuro?',
    a: 'No. El generador de PDF aplica automáticamente una hoja de estilo limpia sobre fondo blanco con contraste editorial óptimo, garantizando una impresión perfecta sin gastar tinta innecesaria.',
  },
  {
    q: '¿Es gratuito y hay límites de páginas?',
    a: 'Es 100% gratuito, sin límites de páginas, sin marcas de agua y sin necesidad de crear una cuenta.',
  },
] as const;

export default function MarkdownAPdfPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Convertidor Markdown a PDF (Markdown Tools)',
      url: absoluteUrl('/markdown-a-pdf'),
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
      name: 'Cómo convertir Markdown a PDF en 3 pasos',
      description: 'Guía rápida para generar archivos PDF de alta calidad a partir de Markdown.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Pega o carga tu Markdown',
          text: 'Escribe tu contenido en el editor o arrastra un archivo .md existente.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Previsualiza el diseño',
          text: 'Comprueba el renderizado de tablas GFM, fórmulas matemáticas KaTeX y diagramas Mermaid.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Exporta a PDF',
          text: 'Haz clic en Exportar > Descargar PDF para guardar el documento listo para imprimir o compartir.',
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
          name: 'Markdown a PDF',
          item: absoluteUrl('/markdown-a-pdf'),
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
          <span className="text-foreground font-medium">Markdown a PDF</span>
        </nav>

        {/* Hero Section */}
        <section className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-semibold text-foreground">
            <Sparkles size={14} className="text-accent" aria-hidden="true" />
            <span>Exportación Editorial · Sin Marcas de Agua · 100% Gratuito</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Convertir Markdown a PDF Online Gratis
          </h1>

          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Genera documentos PDF de calidad profesional a partir de tus archivos Markdown. Con
            soporte completo para fórmulas matemáticas <strong>LaTeX / KaTeX</strong>, diagramas{' '}
            <strong>Mermaid.js</strong> y tablas estilizadas sin enviar tus datos a la nube.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/?action=upload"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-accent-foreground shadow-md transition-all hover:opacity-90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Download size={17} aria-hidden="true" />
              <span>Cargar Archivo y Convertir a PDF</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-muted transition-colors"
            >
              <span>Abrir Editor en Blanco</span>
            </Link>
          </div>
        </section>

        {/* Feature Comparison */}
        <section aria-labelledby="features-heading" className="space-y-6">
          <div className="space-y-2">
            <h2 id="features-heading" className="text-2xl font-bold tracking-tight">
              ¿Por qué usar Markdown Tools para generar PDFs?
            </h2>
            <p className="text-sm text-muted-foreground">
              A diferencia de herramientas básicas de conversión, nuestro motor está optimizado para documentación científica y de ingeniería.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Sigma size={20} aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold">Fórmulas KaTeX de Alta Fidelidad</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Tus ecuaciones en bloque e inline ($...$) se convierten con tipografía matemática nítida, ideales para papers y tareas universitarias.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <GitBranch size={20} aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold">Diagramas Mermaid Vectoriales</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Los diagramas de arquitectura, secuencias y flujo se exportan en vectores limpios sin pixelación ni desenfoque.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Printer size={20} aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold">Control de Saltos de Página</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Inserta <code>&lt;div class=&quot;page-break&quot;&gt;&lt;/div&gt;</code> para forzar saltos de página exactos donde los necesites.
              </p>
            </div>
          </div>
        </section>

        {/* Security & Highlights */}
        <section aria-labelledby="security-heading" className="space-y-6">
          <h2 id="security-heading" className="text-2xl font-bold tracking-tight">
            Garantías y Beneficios Clave
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4">
              <ShieldCheck size={20} className="shrink-0 text-accent mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-bold text-foreground">Procesamiento 100% Local</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Tu contenido nunca viaja por internet. La conversión a PDF ocurre dentro de tu navegador web sin guardar copias externas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4">
              <CheckCircle2 size={20} className="shrink-0 text-accent mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-bold text-foreground">Sin Marcas de Agua</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Documentos limpios y listos para entregar a clientes, profesores o publicar en repositorios oficiales.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4">
              <FileText size={20} className="shrink-0 text-accent mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-bold text-foreground">Modo Claro Automático para Imprimir</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Incluso si trabajas en modo oscuro, el PDF se genera con fondo blanco y tipografía de alto contraste para ahorrar tinta.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4">
              <Sparkles size={20} className="shrink-0 text-accent mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-bold text-foreground">Múltiples Formatos Adicionales</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Además de PDF, puedes exportar a HTML completo, copiar como Rich Text para Word o descargar el Markdown limpio.
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
              Preguntas Frecuentes sobre la Conversión a PDF
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
            Convierte tu primer documento Markdown a PDF
          </h2>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground">
            Pruébalo ahora mismo de forma gratuita, sin registros y con vista previa instantánea.
          </p>
          <div className="pt-2">
            <Link
              href="/?action=upload"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-accent-foreground shadow-sm hover:opacity-90 transition-opacity"
            >
              <span>Empezar Ahora</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
