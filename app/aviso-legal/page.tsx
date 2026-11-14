import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { JsonLd } from '@/components/seo/JsonLd';
import { AUTHOR_INFO, SITE_NAME, absoluteUrl } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Aviso Legal y Política de Privacidad',
  description:
    'Información legal, licencia MIT y política de privacidad de Markdown Tools: procesamiento 100% local en tu navegador sin almacenamiento de documentos en servidores.',
  alternates: { canonical: '/aviso-legal' },
  openGraph: {
    title: `Aviso Legal y Privacidad | ${SITE_NAME}`,
    description:
      'Política de privacidad transparente y condiciones de uso de Markdown Tools.',
    url: absoluteUrl('/aviso-legal'),
    type: 'website',
  },
};

export default function AvisoLegalPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `Aviso Legal y Política de Privacidad — ${SITE_NAME}`,
      url: absoluteUrl('/aviso-legal'),
      inLanguage: 'es',
      description: metadata.description,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Aviso Legal y Privacidad', item: absoluteUrl('/aviso-legal') },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <JsonLd data={jsonLd} />
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 space-y-10">
        <nav aria-label="Migas de pan" className="text-xs text-muted-foreground flex items-center gap-2">
          <Link href="/" className="hover:text-foreground underline-offset-4 hover:underline">
            Inicio
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-foreground">Aviso Legal y Privacidad</span>
        </nav>

        <article className="space-y-8">
          <header className="space-y-3 border-b border-border pb-6">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Aviso Legal y Política de Privacidad
            </h1>
            <p className="text-sm text-muted-foreground">
              Última actualización: noviembre de 2026 • Responsable: {AUTHOR_INFO.name}
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">1. Naturaleza del Servicio y Titularidad</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <strong>{SITE_NAME}</strong> es una aplicación web gratuita de edición, previsualización
              y fusión de documentos Markdown desarrollada por {AUTHOR_INFO.name} bajo licencia de
              código abierto MIT. Su acceso es libre y no exige creación de cuenta ni registro.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">2. Privacidad de Documentos y Almacenamiento Local</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Todo el contenido que escribes, importas mediante archivos `.md` o fusionas con la
              herramienta Binding se procesa <strong>íntegramente en la memoria de tu navegador</strong>.
              Los borradores se conservan únicamente en tu dispositivo mediante <code>localStorage</code>{' '}
              para evitar pérdidas accidentales al recargar la página. Ningún documento es enviado,
              leído ni almacenado en servidores externos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">3. Analítica Técnica Mínima</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              En entornos productivos desplegados en Vercel puede habilitarse Vercel Web Analytics
              agregada y sin cookies publicitarias con el único fin de medir rendimiento y
              disponibilidad técnica. Puedes borrar en cualquier momento el almacenamiento local de
              tu navegador desde la configuración de tu dispositivo o usando la opción «Borrar todos
              los archivos» del editor.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">4. Propiedad Intelectual y Licencia</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Los documentos, diagramas y archivos generados en el editor pertenecen exclusivamente a
              su autor o creador. El código fuente de {SITE_NAME} se distribuye bajo licencia MIT,
              incluyendo librerías de código abierto como Next.js, Unified.js, Mermaid.js y KaTeX.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">5. Contacto Legal</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Para cualquier consulta sobre privacidad, atribuciones o condiciones de uso, utiliza
              nuestra{' '}
              <Link href="/contacto" className="font-semibold text-accent hover:underline">
                página de contacto
              </Link>{' '}
              o escribe a{' '}
              <a
                href={`mailto:${AUTHOR_INFO.email}`}
                className="font-semibold text-accent hover:underline"
              >
                {AUTHOR_INFO.email}
              </a>
              .
            </p>
          </section>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
