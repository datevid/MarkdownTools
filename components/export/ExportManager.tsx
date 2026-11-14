'use client';

import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { renderMarkdownAsync } from '@/lib/markdownClient';
import { cn } from '@/lib/utils';
import {
    Download,
    ChevronDown,
    FileText,
    FileCode,
    Clipboard,
    FileDown,
    Printer,
    Loader2,
    Sparkles,
    Code2,
} from 'lucide-react';

/**
 * Props for the ExportManager dropdown component.
 */
export interface ExportManagerProps {
    className?: string;
}

const UNSUPPORTED_COLOR_FN_PATTERN = /(oklch|oklab|lab|lch|color-mix)\s*\(/gi;

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getSafeBaseFilename(rawName: string): string {
    const cleaned = rawName.replace(/\.(md|markdown|txt)$/i, '').trim();
    return cleaned || 'documento';
}

function getMarkdownFilename(rawName: string): string {
    const trimmed = rawName.trim() || 'documento.md';
    return /\.(md|markdown)$/i.test(trimmed) ? trimmed : `${trimmed}.md`;
}

function hasUnsupportedCssColor(cssText: string): boolean {
    UNSUPPORTED_COLOR_FN_PATTERN.lastIndex = 0;
    return UNSUPPORTED_COLOR_FN_PATTERN.test(cssText);
}

/**
 * Replace modern CSS color functions (`oklch`, `oklab`, `lab`, `lch`, `color-mix`)
 * including nested parentheses so `html2canvas@1.4.1` never throws while parsing CSS.
 */
function sanitizeUnsupportedCssColors(cssText: string, fallbackColor = '#111827'): string {
    const lower = cssText.toLowerCase();
    const prefixes = ['oklch(', 'oklab(', 'color-mix(', 'lab(', 'lch('];
    let output = '';
    let cursor = 0;

    while (cursor < cssText.length) {
        let nextMatchIdx = -1;
        let matchedPrefix = '';

        for (const prefix of prefixes) {
            const idx = lower.indexOf(prefix, cursor);
            if (idx !== -1 && (nextMatchIdx === -1 || idx < nextMatchIdx)) {
                nextMatchIdx = idx;
                matchedPrefix = prefix;
            }
        }

        if (nextMatchIdx === -1) {
            output += cssText.slice(cursor);
            break;
        }

        output += cssText.slice(cursor, nextMatchIdx);

        let depth = 1;
        let scan = nextMatchIdx + matchedPrefix.length;
        while (scan < cssText.length && depth > 0) {
            const ch = cssText[scan];
            if (ch === '(') depth += 1;
            else if (ch === ')') depth -= 1;
            scan += 1;
        }

        output += fallbackColor;
        cursor = scan;
    }

    return output;
}

function collectSafeKatexAndFontRules(): string {
    if (typeof document === 'undefined') return '';
    const collected: string[] = [];

    for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRuleList | undefined;
        try {
            rules = sheet.cssRules;
        } catch {
            // Skip cross-origin stylesheets that restrict cssRules access
            continue;
        }
        if (!rules) continue;

        for (const rule of Array.from(rules)) {
            const text = rule.cssText;
            const isFontFace = rule.type === CSSRule.FONT_FACE_RULE || text.startsWith('@font-face');
            const isKatexRule = text.includes('.katex');
            if (!isFontFace && !isKatexRule) continue;

            collected.push(
                hasUnsupportedCssColor(text) ? sanitizeUnsupportedCssColors(text) : text
            );
        }
    }

    return collected.join('\n');
}

const PDF_LIGHT_BODY_CSS = `
html, body {
  background: #ffffff !important;
  color: #111827 !important;
  margin: 0;
  padding: 0;
  font-family: Arial, Helvetica, sans-serif;
  color-scheme: light;
}
`;

const PDF_LIGHT_ROOT_CSS = `
.pdf-export-root,
.pdf-export-root *,
.pdf-export-root *::before,
.pdf-export-root *::after {
  box-sizing: border-box;
}
.pdf-export-root,
.pdf-export-root.prose {
  background: #ffffff !important;
  color: #111827 !important;
  max-width: 100% !important;
  font-size: 13.5px;
  line-height: 1.65;
}
.pdf-export-root .pdf-heading-group {
  break-inside: avoid;
  page-break-inside: avoid;
}
.pdf-export-root h1,
.pdf-export-root h2,
.pdf-export-root h3,
.pdf-export-root h4,
.pdf-export-root h5,
.pdf-export-root h6 {
  color: #0f172a !important;
  font-weight: 700;
  margin-top: 1.35em;
  margin-bottom: 0.55em;
  line-height: 1.3;
  break-inside: avoid;
  page-break-inside: avoid;
  break-after: avoid;
  page-break-after: avoid;
}
.pdf-export-root h1 { font-size: 1.85em; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
.pdf-export-root h2 { font-size: 1.45em; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.25em; }
.pdf-export-root h3 { font-size: 1.2em; }
.pdf-export-root h4 { font-size: 1.05em; }
.pdf-export-root h5 { font-size: 0.95em; }
.pdf-export-root h6 { font-size: 0.9em; }
.pdf-export-root p,
.pdf-export-root li {
  color: #1f2937 !important;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  break-inside: avoid;
  page-break-inside: avoid;
}
.pdf-export-root a {
  color: #1d4ed8 !important;
  text-decoration: underline;
}
.pdf-export-root strong {
  color: #111827 !important;
  font-weight: 700;
}
.pdf-export-root blockquote {
  border-left: 4px solid #2563eb !important;
  background: #f8fafc !important;
  color: #334155 !important;
  margin: 1em 0;
  padding: 0.65em 1em;
  border-radius: 0 6px 6px 0;
  break-inside: avoid;
  page-break-inside: avoid;
}
.pdf-export-root ul,
.pdf-export-root ol {
  padding-left: 1.5em;
  margin: 0.65em 0;
}
.pdf-export-root ul.contains-task-list {
  list-style: none !important;
  padding-left: 0.25em !important;
}
.pdf-export-root li.task-list-item {
  list-style: none !important;
  position: relative;
  padding-left: 1.65em;
}
.pdf-export-root li.task-list-item::marker,
.pdf-export-root li.task-list-item::before {
  content: none !important;
  display: none !important;
}
.pdf-export-root li.task-list-item > input[type="checkbox"],
.pdf-export-root li.task-list-item > p:first-child > input[type="checkbox"] {
  position: absolute;
  left: 0;
  top: 0.35em;
  margin: 0;
  width: 14px;
  height: 14px;
}
.pdf-export-root hr {
  border: 0;
  border-top: 1px solid #d0d7de;
  margin: 1.5em 0;
}
.pdf-export-root table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  font-size: 12.5px;
}
.pdf-export-root th,
.pdf-export-root td {
  border: 1px solid #d0d7de !important;
  padding: 6px 10px;
  text-align: left;
  color: #111827 !important;
}
.pdf-export-root th {
  background: #f6f8fa !important;
  font-weight: 700;
}
.pdf-export-root tr {
  break-inside: avoid;
}
.pdf-export-root pre {
  background: #f6f8fa !important;
  color: #24292f !important;
  border: 1px solid #d0d7de !important;
  border-radius: 6px;
  padding: 12px 14px;
  margin: 1em 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: "Courier New", Courier, monospace;
  font-size: 12px;
  line-height: 1.55;
  break-inside: avoid;
}
.pdf-export-root pre code {
  background: transparent !important;
  border: 0 !important;
  padding: 0 !important;
  color: inherit !important;
}
.pdf-export-root :not(pre) > code {
  display: inline-block;
  line-height: 1.35;
  vertical-align: baseline;
  background: #f1f5f9 !important;
  color: #0f172a !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 4px;
  padding: 1px 5px;
  font-family: "Courier New", Courier, monospace;
  font-size: 0.88em;
}
.pdf-export-root .hljs { background: #f6f8fa !important; color: #24292f !important; }
.pdf-export-root .hljs-keyword,
.pdf-export-root .hljs-doctag,
.pdf-export-root .hljs-template-tag,
.pdf-export-root .hljs-template-variable,
.pdf-export-root .hljs-variable.language_ { color: #cf222e !important; }
.pdf-export-root .hljs-title,
.pdf-export-root .hljs-title.class_,
.pdf-export-root .hljs-title.function_ { color: #6639ba !important; }
.pdf-export-root .hljs-attr,
.pdf-export-root .hljs-attribute,
.pdf-export-root .hljs-literal,
.pdf-export-root .hljs-number,
.pdf-export-root .hljs-operator,
.pdf-export-root .hljs-variable { color: #0550ae !important; }
.pdf-export-root .hljs-string,
.pdf-export-root .hljs-regexp { color: #0a3069 !important; }
.pdf-export-root .hljs-comment { color: #57606a !important; font-style: italic; }
.pdf-export-root .hljs-built_in,
.pdf-export-root .hljs-symbol,
.pdf-export-root .hljs-type { color: #953800 !important; }
.pdf-export-root .hljs-name,
.pdf-export-root .hljs-quote,
.pdf-export-root .hljs-selector-tag { color: #116329 !important; }
.pdf-export-root .katex { color: #111827 !important; }
.pdf-export-root .katex-display {
  margin: 1.15em 0;
  padding: 0.35em 0;
  max-width: 100%;
  break-inside: avoid;
  page-break-inside: avoid;
}
.pdf-export-root img {
  display: block;
  max-width: 100%;
  height: auto;
}
.pdf-export-root .mermaid-export-card {
  margin: 14px 0;
  padding: 12px;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  background: #ffffff;
  text-align: center;
  break-inside: avoid;
  page-break-inside: avoid;
}
.pdf-export-root .mermaid-export-card svg {
  max-width: 100%;
  height: auto;
}
`;

const PDF_LIGHT_CSS = `${PDF_LIGHT_BODY_CSS}\n${PDF_LIGHT_ROOT_CSS}`;

const PDF_UNWRAPPED_NEXT_TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'TABLE', 'UL', 'OL']);

function wrapPdfHeadingGroups(root: HTMLElement): void {
    const headings = Array.from(root.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    for (const heading of headings) {
        if (heading.parentElement !== root) continue;
        const nextEl = heading.nextElementSibling;
        if (!nextEl || PDF_UNWRAPPED_NEXT_TAGS.has(nextEl.tagName.toUpperCase())) {
            continue;
        }

        let hasInlineTextBetween = false;
        let cursor: ChildNode | null = heading.nextSibling;
        while (cursor && cursor !== nextEl) {
            if (cursor.nodeType === Node.TEXT_NODE && (cursor.textContent ?? '').trim().length > 0) {
                hasInlineTextBetween = true;
                break;
            }
            cursor = cursor.nextSibling;
        }
        if (hasInlineTextBetween) continue;

        cursor = heading.nextSibling;
        while (cursor && cursor !== nextEl) {
            const whitespaceNode = cursor;
            cursor = cursor.nextSibling;
            whitespaceNode.parentNode?.removeChild(whitespaceNode);
        }

        const group = root.ownerDocument.createElement('div');
        group.className = 'pdf-heading-group';
        root.insertBefore(group, heading);
        group.appendChild(heading);
        group.appendChild(nextEl);
    }
}

type MermaidApi = typeof import('mermaid').default;

function restoreAppMermaidTheme(mermaid: MermaidApi): void {
    const isDark =
        typeof document !== 'undefined' &&
        document.documentElement.classList.contains('dark');
    mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        securityLevel: 'strict',
        fontFamily: 'var(--font-geist-sans), sans-serif',
        suppressErrorRendering: true,
    });
}

async function renderLightHtmlForExport(markdown: string): Promise<string> {
    const rawHtml = await renderMarkdownAsync(markdown);
    if (typeof document === 'undefined') {
        return rawHtml;
    }

    const host = document.createElement('div');
    host.style.position = 'fixed';
    host.style.left = '-99999px';
    host.style.top = '0';
    host.style.width = '760px';
    host.style.opacity = '0';
    host.style.pointerEvents = 'none';
    host.style.background = '#ffffff';
    host.style.color = '#111827';
    host.innerHTML = rawHtml;
    document.body.appendChild(host);

    let counter = 0;
    let loadedMermaid: MermaidApi | null = null;
    try {
        const mermaidNodes = Array.from(
            host.querySelectorAll<HTMLElement>('.mermaid[data-mermaid-source]')
        );

        if (mermaidNodes.length > 0) {
            const { default: mermaid } = await import('mermaid');
            loadedMermaid = mermaid;
            mermaid.initialize({
                startOnLoad: false,
                theme: 'default',
                securityLevel: 'strict',
                fontFamily: 'Arial, Helvetica, sans-serif',
                suppressErrorRendering: true,
                htmlLabels: false,
                flowchart: { htmlLabels: false },
            });

            for (const el of mermaidNodes) {
                const encoded = el.getAttribute('data-mermaid-source') ?? '';
                let source = '';
                try {
                    source = decodeURIComponent(encoded);
                } catch {
                    source = el.textContent ?? '';
                }

                const renderId = `mermaid-export-${Date.now()}-${++counter}`;
                try {
                    await mermaid.parse(source);
                    const { svg } = await mermaid.render(renderId, source);
                    const wrapper = document.createElement('div');
                    wrapper.className = 'mermaid-export-card';
                    wrapper.setAttribute(
                        'style',
                        'margin: 16px 0; padding: 12px; border: 1px solid #d0d7de; border-radius: 8px; background: #ffffff; text-align: center;'
                    );
                    wrapper.innerHTML = svg;
                    el.replaceWith(wrapper);
                } catch (err) {
                    const msg =
                        err instanceof Error ? err.message : 'Sintaxis Mermaid inválida';
                    const errorBox = document.createElement('div');
                    errorBox.setAttribute(
                        'style',
                        'margin: 16px 0; padding: 12px; border: 1px solid #fca5a5; border-radius: 8px; background: #fef2f2; color: #991b1b; font-size: 13px;'
                    );
                    errorBox.textContent = `Diagrama Mermaid inválido: ${msg}`;
                    el.replaceWith(errorBox);
                } finally {
                    document.getElementById(`d${renderId}`)?.remove();
                }
            }
        }

        return host.innerHTML;
    } finally {
        host.remove();
        if (loadedMermaid) {
            restoreAppMermaidTheme(loadedMermaid);
        }
    }
}

function triggerFileDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Accessible click-and-keyboard dropdown menu for exporting the active Markdown document
 * to PDF (light paper mode), standalone HTML, raw HTML, Rich Text, Markdown, or print.
 */
export default function ExportManager({ className }: ExportManagerProps) {
    const { files, activeFileId, addNotification } = useAppStore();
    const activeFile = files.find((f) => f.id === activeFileId);

    const [isOpen, setIsOpen] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuId = useId();

    const closeMenu = useCallback((returnFocus = false) => {
        setIsOpen(false);
        if (returnFocus) {
            requestAnimationFrame(() => triggerRef.current?.focus());
        }
    }, []);

    // Close on outside click & Escape key
    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDown = (e: PointerEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeMenu(true);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, closeMenu]);

    const requireActiveFile = () => {
        if (!activeFile) {
            addNotification('Abre o crea un documento antes de exportar', 'info');
            return null;
        }
        return activeFile;
    };

    const handleCopyHtml = async () => {
        const file = requireActiveFile();
        if (!file) return;
        closeMenu();
        try {
            const html = await renderMarkdownAsync(file.content);
            await navigator.clipboard.writeText(html);
            addNotification('HTML copiado al portapapeles', 'success');
        } catch {
            addNotification('No se pudo copiar el HTML al portapapeles', 'error');
        }
    };

    const handleDownloadHtml = async () => {
        const file = requireActiveFile();
        if (!file) return;
        closeMenu();
        try {
            const rendered = await renderLightHtmlForExport(file.content);
            const title = getSafeBaseFilename(file.name);
            const standaloneHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.28/dist/katex.min.css" crossorigin="anonymous" />
  <style>
    body {
      margin: 0;
      padding: 2rem 1.25rem;
      background: #ffffff;
      color: #111827;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.65;
    }
    main.markdown-body {
      max-width: 840px;
      margin: 0 auto;
    }
    ${PDF_LIGHT_CSS}
  </style>
</head>
<body>
  <main class="markdown-body pdf-export-root">
    ${rendered}
  </main>
</body>
</html>`;
            const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
            triggerFileDownload(blob, `${title}.html`);
            addNotification(`HTML descargado: "${title}.html"`, 'success');
        } catch {
            addNotification('No se pudo exportar el archivo HTML', 'error');
        }
    };

    const handleCopyRichText = async () => {
        const file = requireActiveFile();
        if (!file) return;
        closeMenu();
        try {
            const rendered = await renderLightHtmlForExport(file.content);
            const wrapped = `<div style="background:#ffffff;color:#111827;font-family:Arial,Helvetica,sans-serif;line-height:1.6;">${rendered}</div>`;

            if (
                typeof ClipboardItem !== 'undefined' &&
                typeof navigator.clipboard?.write === 'function'
            ) {
                const htmlBlob = new Blob([wrapped], { type: 'text/html' });
                const textBlob = new Blob([file.content], { type: 'text/plain' });
                await navigator.clipboard.write([
                    new ClipboardItem({
                        'text/html': htmlBlob,
                        'text/plain': textBlob,
                    }),
                ]);
            } else {
                await navigator.clipboard.writeText(wrapped);
            }
            addNotification('Texto enriquecido copiado al portapapeles', 'success');
        } catch {
            try {
                await navigator.clipboard.writeText(file.content);
                addNotification('Copiado como texto plano (ClipboardItem no disponible)', 'info');
            } catch {
                addNotification('No se pudo copiar el texto enriquecido', 'error');
            }
        }
    };

    const handleDownloadMarkdown = () => {
        const file = requireActiveFile();
        if (!file) return;
        closeMenu();
        const filename = getMarkdownFilename(file.name);
        const blob = new Blob([file.content], { type: 'text/markdown;charset=utf-8' });
        triggerFileDownload(blob, filename);
        addNotification(`Descargando "${filename}"`, 'success');
    };

    const handleDownloadPdf = async () => {
        const file = requireActiveFile();
        if (!file || isExportingPdf) return;
        closeMenu();
        setIsExportingPdf(true);
        addNotification('Generando PDF...', 'info');

        let exportWrapper: HTMLDivElement | null = null;
        let liveScopeStyle: HTMLStyleElement | null = null;
        try {
            const renderedHtml = await renderLightHtmlForExport(file.content);
            const collectedKatexAndFontCss = collectSafeKatexAndFontRules();
            const baseName = getSafeBaseFilename(file.name);

            liveScopeStyle = document.createElement('style');
            liveScopeStyle.setAttribute('data-pdf-live-scope', 'true');
            liveScopeStyle.textContent = PDF_LIGHT_ROOT_CSS;
            document.head.appendChild(liveScopeStyle);

            exportWrapper = document.createElement('div');
            exportWrapper.setAttribute('style', [
                'position: fixed',
                'left: -99999px',
                'top: 0',
                'width: 710px',
                'background: #ffffff',
                'color: #111827',
                'pointer-events: none',
            ].join('; '));

            const article = document.createElement('article');
            article.className = 'pdf-export-root';
            article.setAttribute('style', [
                'position: static',
                'box-sizing: border-box',
                'width: 100%',
                'background: #ffffff',
                'color: #111827',
                'padding: 16px 20px',
                'font-family: Arial, Helvetica, sans-serif',
                'font-size: 13.5px',
                'line-height: 1.65',
                'opacity: 1',
                'visibility: visible',
            ].join('; '));
            article.innerHTML = renderedHtml;
            wrapPdfHeadingGroups(article);
            exportWrapper.appendChild(article);
            document.body.appendChild(exportWrapper);

            const html2pdfModule = await import('html2pdf.js');
            const html2pdf = html2pdfModule.default;

            const options = {
                margin: [0.5, 0.5, 0.5, 0.5] as [number, number, number, number],
                filename: `${baseName}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                enableLinks: true,
                pagebreak: {
                    mode: ['css', 'legacy'] as const,
                    avoid: [
                        '.pdf-heading-group',
                        'h1',
                        'h2',
                        'h3',
                        'h4',
                        'h5',
                        'h6',
                        'p',
                        'li',
                        'tr',
                        'pre',
                        'blockquote',
                        '.mermaid-export-card',
                        '.katex-display',
                    ],
                },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    onclone: (clonedDoc: Document) => {
                        clonedDoc.documentElement.classList.remove('dark');
                        clonedDoc.body.classList.remove('dark');
                        clonedDoc.documentElement.style.colorScheme = 'light';
                        clonedDoc.documentElement.style.background = '#ffffff';
                        clonedDoc.body.style.background = '#ffffff';
                        clonedDoc.body.style.color = '#111827';

                        // Force html2pdf's cloned overlay/container & export article to visible static flow
                        const overlay = clonedDoc.querySelector<HTMLElement>('.html2pdf__overlay');
                        if (overlay) {
                            overlay.style.opacity = '1';
                            overlay.style.visibility = 'visible';
                            overlay.style.backgroundColor = '#ffffff';
                        }
                        const container = clonedDoc.querySelector<HTMLElement>('.html2pdf__container');
                        if (container) {
                            container.style.opacity = '1';
                            container.style.visibility = 'visible';
                            container.style.position = 'static';
                            container.style.left = '0';
                            container.style.top = '0';
                            container.style.backgroundColor = '#ffffff';
                        }
                        const clonedRoot = clonedDoc.querySelector<HTMLElement>('.pdf-export-root');
                        if (clonedRoot) {
                            clonedRoot.style.position = 'static';
                            clonedRoot.style.left = 'auto';
                            clonedRoot.style.top = 'auto';
                            clonedRoot.style.opacity = '1';
                            clonedRoot.style.visibility = 'visible';
                        }

                        // Remove stylesheets with Tailwind v4 oklch()/color-mix() that crash html2canvas@1.4.1
                        clonedDoc
                            .querySelectorAll('link[rel="stylesheet"], style')
                            .forEach((node) => {
                                if (node.getAttribute('data-pdf-safe') === 'true') return;
                                if (node.getAttribute('data-pdf-live-scope') === 'true') {
                                    node.remove();
                                    return;
                                }
                                if (node.tagName.toLowerCase() === 'style') {
                                    const text = node.textContent ?? '';
                                    if (!hasUnsupportedCssColor(text)) {
                                        return;
                                    }
                                }
                                node.remove();
                            });

                        // Strip any unsupported inline color functions on cloned elements
                        clonedDoc.querySelectorAll<HTMLElement>('[style]').forEach((el) => {
                            const styleAttr = el.getAttribute('style') ?? '';
                            if (hasUnsupportedCssColor(styleAttr)) {
                                el.setAttribute('style', sanitizeUnsupportedCssColors(styleAttr));
                            }
                        });

                        const safeStyle = clonedDoc.createElement('style');
                        safeStyle.setAttribute('data-pdf-safe', 'true');
                        safeStyle.textContent = `${collectedKatexAndFontCss}\n${PDF_LIGHT_CSS}`;
                        clonedDoc.head.appendChild(safeStyle);
                    },
                },
                jsPDF: {
                    unit: 'in',
                    format: 'letter',
                    orientation: 'portrait' as const,
                },
            };

            const pdfResult: unknown = await html2pdf()
                .set(options)
                .from(article)
                .outputPdf('blob');

            if (!(pdfResult instanceof Blob) || pdfResult.size <= 0) {
                throw new Error('El archivo PDF generado está vacío.');
            }

            triggerFileDownload(pdfResult, `${baseName}.pdf`);
            addNotification(`PDF generado: "${baseName}.pdf"`, 'success');
        } catch (error) {
            const msg =
                error instanceof Error ? error.message : 'Error inesperado al generar el PDF.';
            addNotification(`Error al generar PDF: ${msg}`, 'error');
        } finally {
            liveScopeStyle?.remove();
            exportWrapper?.remove();
            setIsExportingPdf(false);
        }
    };

    const handlePrint = () => {
        const file = requireActiveFile();
        if (!file) return;
        closeMenu();
        setTimeout(() => {
            window.print();
        }, 60);
    };

    return (
        <div ref={containerRef} className={cn('relative inline-block', className)}>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                aria-controls={menuId}
                aria-label="Exportar documento"
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                {isExportingPdf ? (
                    <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                ) : (
                    <Download size={15} aria-hidden="true" />
                )}
                <span className="hidden sm:inline">
                    {isExportingPdf ? 'Generando PDF...' : 'Exportar'}
                </span>
                <ChevronDown
                    size={14}
                    className={cn('transition-transform duration-150', isOpen && 'rotate-180')}
                    aria-hidden="true"
                />
            </button>

            {isOpen && (
                <div
                    id={menuId}
                    role="menu"
                    aria-label="Opciones de exportación"
                    className="absolute right-0 top-full mt-2 z-50 w-72 max-w-[calc(100vw-1.5rem)] rounded-xl border border-border bg-card p-2 text-card-foreground shadow-2xl"
                >
                    <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Exportar contenido
                    </div>

                    <button
                        type="button"
                        role="menuitem"
                        disabled={!activeFile || isExportingPdf}
                        onClick={handleDownloadPdf}
                        className="w-full flex items-center justify-between gap-3 rounded-lg border border-accent/25 bg-accent/10 px-3 py-2.5 text-left hover:bg-accent/15 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5">
                            {isExportingPdf ? (
                                <Loader2 size={17} className="animate-spin text-accent-text" aria-hidden="true" />
                            ) : (
                                <FileText size={17} className="text-accent-text" aria-hidden="true" />
                            )}
                            <div>
                                <div className="text-sm font-semibold text-foreground">
                                    {isExportingPdf ? 'Generando PDF...' : 'Exportar PDF (.pdf)'}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-accent-text">
                                    <Sparkles size={10} aria-hidden="true" />
                                    <span>Papel blanco editorial + KaTeX + Mermaid</span>
                                </div>
                            </div>
                        </div>
                    </button>

                    <div role="separator" className="my-1.5 border-t border-border" />

                    <button
                        type="button"
                        role="menuitem"
                        disabled={!activeFile}
                        onClick={handleCopyHtml}
                        className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        <Code2 size={16} className="text-muted-foreground" aria-hidden="true" />
                        <span>Copiar HTML</span>
                    </button>

                    <button
                        type="button"
                        role="menuitem"
                        disabled={!activeFile}
                        onClick={handleDownloadHtml}
                        className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        <FileCode size={16} className="text-muted-foreground" aria-hidden="true" />
                        <span>Descargar HTML (.html)</span>
                    </button>

                    <button
                        type="button"
                        role="menuitem"
                        disabled={!activeFile}
                        onClick={handleCopyRichText}
                        className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        <Clipboard size={16} className="text-muted-foreground" aria-hidden="true" />
                        <span>Copiar Texto Enriquecido</span>
                    </button>

                    <button
                        type="button"
                        role="menuitem"
                        disabled={!activeFile}
                        onClick={handleDownloadMarkdown}
                        className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        <FileDown size={16} className="text-muted-foreground" aria-hidden="true" />
                        <span>Descargar Markdown (.md)</span>
                    </button>

                    <div role="separator" className="my-1.5 border-t border-border" />

                    <button
                        type="button"
                        role="menuitem"
                        disabled={!activeFile}
                        onClick={handlePrint}
                        className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        <Printer size={16} className="text-muted-foreground" aria-hidden="true" />
                        <span>Imprimir</span>
                    </button>
                </div>
            )}
        </div>
    );
}
