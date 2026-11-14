import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, GitBranch, Sigma, Keyboard, Layers } from 'lucide-react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { CopySnippetButton } from '@/components/ui/CopySnippetButton';
import { JsonLd } from '@/components/seo/JsonLd';
import { AUTHOR_INFO, SITE_NAME, absoluteUrl } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Guía Completa de Markdown, Mermaid y KaTeX en Español',
  description:
    'Aprende sintaxis GitHub Flavored Markdown (GFM), tablas, checklists, diagramas Mermaid (flujo, secuencia, Gantt) y ecuaciones matemáticas KaTeX con ejemplos listos para probar.',
  alternates: { canonical: '/guia-markdown-mermaid-katex' },
  openGraph: {
    title: `Guía Completa de Markdown, Mermaid y KaTeX | ${SITE_NAME}`,
    description:
      'Referencia práctica con ejemplos copiables de Markdown GFM, diagramas Mermaid.js y fórmulas matemáticas KaTeX.',
    url: absoluteUrl('/guia-markdown-mermaid-katex'),
    type: 'article',
  },
};

const BASIC_SYNTAX = `# Título Principal (H1)
## Subtítulo (H2)
### Sección (H3)

Texto en **negrita**, *cursiva*, ~~tachado~~ y \`código en línea\`.

> Cita técnica destacada para notas o advertencias importantes.

- [x] Tarea completada
- [ ] Tarea pendiente con checklist GFM`;

const TABLE_CODE_SYNTAX = `| Característica | Soporte | Exportación |
| :--- | :---: | :--- |
| GitHub Flavored Markdown | Nativo | PDF, HTML, MD |
| Diagramas Mermaid.js | Tiempo real | SVG, PDF |
| Fórmulas KaTeX | Inline y Bloque | Rich Text, PDF |

\`\`\`typescript
export function sumar(a: number, b: number): number {
  return a + b;
}
\`\`\``;

const MERMAID_FLOWCHART = `\`\`\`mermaid
flowchart LR
    A[Borrador .md] --> B{Validación}
    B -- Sintaxis OK --> C[Vista Previa 60FPS]
    B -- Multi-archivo --> D[Binding Tool]
    C --> E[Exportar PDF / HTML]
    D --> E
\`\`\``;

const MERMAID_SEQUENCE = `\`\`\`mermaid
sequenceDiagram
    participant Autor
    participant Worker as Web Worker
    participant Vista as Vista Previa
    Autor->>Worker: Edita bloque Markdown
    Worker-->>Vista: Devuelve HTML seguro + KaTeX
    Vista-->>Autor: Renderiza diagramas SVG
\`\`\``;

const KATEX_SYNTAX = `Fórmula en línea: la identidad de Euler es $e^{i\\pi} + 1 = 0$.

Fórmula en bloque (centrada):

$$
\\int_{a}^{b} f(x)\\,dx = F(b) - F(a) \\qquad \\mathbf{A} = \\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}
$$`;

export default function GuiaMarkdownMermaidKatexPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: 'Guía Completa de Markdown, Mermaid y KaTeX en Español',
      description: metadata.description,
      inLanguage: 'es',
      author: {
        '@type': 'Person',
        name: AUTHOR_INFO.name,
      },
      mainEntityOfPage: absoluteUrl('/guia-markdown-mermaid-katex'),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: absoluteUrl('/') },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Guía Markdown, Mermaid y KaTeX',
          item: absoluteUrl('/guia-markdown-mermaid-katex'),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <JsonLd data={jsonLd} />
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 space-y-14">
        <nav aria-label="Migas de pan" className="text-xs text-muted-foreground flex items-center gap-2">
          <Link href="/" className="hover:text-foreground underline-offset-4 hover:underline">
            Inicio
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-foreground">Guía Markdown, Mermaid y KaTeX</span>
        </nav>

        <header className="space-y-5 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-foreground">
            <BookOpen size={14} className="text-accent" aria-hidden="true" />
            <span>Documentación Técnica y Hoja de Referencia</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Guía Completa de Markdown, Diagramas Mermaid y Fórmulas KaTeX
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg max-w-3xl">
            Domina desde los encabezados y tablas GFM hasta diagramas de flujo, secuencias y
            ecuaciones científicas en LaTeX. Copia cualquier bloque o ábrelo directamente en el
            editor interactivo.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/?template=readme-pro"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground hover:opacity-90 transition-opacity"
            >
              <span>Probar plantilla README</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              href="/?template=adr-mermaid"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
            >
              <span>Abrir ejemplo Mermaid</span>
            </Link>
            <Link
              href="/?template=paper-katex"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
            >
              <span>Abrir ejemplo KaTeX</span>
            </Link>
          </div>
        </header>

        {/* Índice rápido */}
        <section aria-labelledby="toc-heading" className="rounded-2xl border border-border bg-muted/30 p-6">
          <h2 id="toc-heading" className="text-lg font-bold mb-3">Contenido de la guía</h2>
          <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <li>
              <a href="#sintaxis-gfm" className="text-accent hover:underline underline-offset-4 font-medium">
                1. Sintaxis Markdown y GFM (encabezados, listas, tablas y código)
              </a>
            </li>
            <li>
              <a href="#diagramas-mermaid" className="text-accent hover:underline underline-offset-4 font-medium">
                2. Diagramas técnicos con Mermaid.js (Flujo y Secuencia)
              </a>
            </li>
            <li>
              <a href="#ecuaciones-katex" className="text-accent hover:underline underline-offset-4 font-medium">
                3. Fórmulas matemáticas y matrices con KaTeX
              </a>
            </li>
            <li>
              <a href="#atajos-y-binding" className="text-accent hover:underline underline-offset-4 font-medium">
                4. Atajos de teclado y fusión multi-archivo (Binding)
              </a>
            </li>
          </ul>
        </section>

        {/* Sección 1: Markdown & GFM */}
        <section id="sintaxis-gfm" className="space-y-6 scroll-mt-24">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold flex items-center gap-2.5">
              <BookOpen size={22} className="text-accent" aria-hidden="true" />
              <span>1. Sintaxis Markdown y GitHub Flavored Markdown (GFM)</span>
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Markdown permite estructurar documentación técnica limpia utilizando texto plano. Con
              la extensión GFM también cuentas con tablas alineadas, tareas interactivas y bloques
              de código con resaltado automático de sintaxis.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
                <h3 className="text-sm font-bold">Formato básico y checklists</h3>
                <CopySnippetButton code={BASIC_SYNTAX} />
              </div>
              <pre className="overflow-x-auto p-4 text-xs sm:text-sm font-mono leading-relaxed text-foreground">
                <code>{BASIC_SYNTAX}</code>
              </pre>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
                <h3 className="text-sm font-bold">Tablas alineadas y bloques de código</h3>
                <CopySnippetButton code={TABLE_CODE_SYNTAX} />
              </div>
              <pre className="overflow-x-auto p-4 text-xs sm:text-sm font-mono leading-relaxed text-foreground">
                <code>{TABLE_CODE_SYNTAX}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Sección 2: Mermaid */}
        <section id="diagramas-mermaid" className="space-y-6 scroll-mt-24">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold flex items-center gap-2.5">
              <GitBranch size={22} className="text-accent" aria-hidden="true" />
              <span>2. Diagramas de Arquitectura con Mermaid.js</span>
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Escribe diagramas directamente como código dentro de un bloque{' '}
              <code>```mermaid</code>. Markdown Tools renderiza los gráficos en SVG, se adapta
              automáticamente al modo claro/oscuro y te permite ampliarlos o descargarlos en SVG.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
                <h3 className="text-sm font-bold">Diagrama de Flujo (Flowchart)</h3>
                <CopySnippetButton code={MERMAID_FLOWCHART} />
              </div>
              <pre className="overflow-x-auto p-4 text-xs sm:text-sm font-mono leading-relaxed text-foreground">
                <code>{MERMAID_FLOWCHART}</code>
              </pre>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
                <h3 className="text-sm font-bold">Diagrama de Secuencia</h3>
                <CopySnippetButton code={MERMAID_SEQUENCE} />
              </div>
              <pre className="overflow-x-auto p-4 text-xs sm:text-sm font-mono leading-relaxed text-foreground">
                <code>{MERMAID_SEQUENCE}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Sección 3: KaTeX */}
        <section id="ecuaciones-katex" className="space-y-6 scroll-mt-24">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold flex items-center gap-2.5">
              <Sigma size={22} className="text-accent" aria-hidden="true" />
              <span>3. Matemáticas y Notación Científica con KaTeX</span>
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Usa signos de dólar simples (<code>$...$</code>) para expresiones en línea o dobles (
              <code>$$...$$</code>) para bloques matemáticos centrados de alta precisión tipográfica.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
              <h3 className="text-sm font-bold">Ejemplos de KaTeX inline y en bloque</h3>
              <CopySnippetButton code={KATEX_SYNTAX} />
            </div>
            <pre className="overflow-x-auto p-4 text-xs sm:text-sm font-mono leading-relaxed text-foreground">
              <code>{KATEX_SYNTAX}</code>
            </pre>
          </div>
        </section>

        {/* Sección 4: Atajos & Binding */}
        <section id="atajos-y-binding" className="space-y-6 scroll-mt-24">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Keyboard size={20} className="text-accent" aria-hidden="true" />
                <span>Atajos de Teclado Esenciales</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                      <th className="py-2 pr-4">Acción</th>
                      <th className="py-2">Atajo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-2 pr-4">Negrita / Cursiva</td>
                      <td className="py-2 font-mono text-xs">Ctrl/Cmd + B · Ctrl/Cmd + I</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Enlace / Código</td>
                      <td className="py-2 font-mono text-xs">Ctrl/Cmd + K · Ctrl/Cmd + E</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Insertar KaTeX / Mermaid</td>
                      <td className="py-2 font-mono text-xs">Ctrl+Shift+M · Ctrl+Shift+D</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Buscar y Reemplazar</td>
                      <td className="py-2 font-mono text-xs">Ctrl/Cmd + F</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Deshacer / Rehacer</td>
                      <td className="py-2 font-mono text-xs">Ctrl/Cmd + Z · Ctrl/Cmd + Y</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>

            <article className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Layers size={20} className="text-accent" aria-hidden="true" />
                <span>Cómo fusionar capítulos con Binding Tool</span>
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-sm leading-relaxed text-muted-foreground">
                <li>Crea o sube tus capítulos individuales en formato <code>.md</code>.</li>
                <li>Abre <strong>Binding Tool</strong> en la barra lateral o usa el <strong>Binder rápido</strong>.</li>
                <li>Reordena las secciones mediante arrastrar y soltar (drag-and-drop).</li>
                <li>Genera el manuscrito consolidado en el editor o expórtalo directamente a PDF.</li>
              </ol>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground hover:opacity-90 transition-opacity"
              >
                <span>Empezar ahora en el Editor</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
