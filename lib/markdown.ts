import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import type { Element, ElementContent, Root, Text } from 'hast';
import { slugifyHeading } from './utils';
export { extractHeadings, type MarkdownHeading } from './headings';

/**
 * Request message payload sent to the Markdown Web Worker.
 */
export interface MarkdownWorkerRequest {
    id: number;
    content: string;
}

/**
 * Response message payload returned by the Markdown Web Worker.
 */
export interface MarkdownWorkerResponse {
    id: number;
    html?: string;
    error?: string;
}

const UNSAFE_HREF_PROTOCOLS = [
    'javascript:',
    'vbscript:',
    'data:text/html',
    'data:image/svg+xml',
];

const UNSAFE_SRC_PROTOCOLS = [
    'javascript:',
    'vbscript:',
    'data:text/html',
    'data:image/svg+xml',
];

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getClassList(node: Element): string[] {
    const className = node.properties?.className;
    if (Array.isArray(className)) {
        return className.map((entry) => String(entry));
    }
    if (typeof className === 'string') {
        return className.split(/\s+/).filter(Boolean);
    }
    return [];
}

function extractNodeText(node: Element | ElementContent): string {
    if (node.type === 'text') {
        return node.value;
    }
    if (node.type === 'element') {
        return node.children.map(extractNodeText).join('');
    }
    return '';
}

function findCodeChild(preNode: Element): Element | null {
    for (const child of preNode.children) {
        if (child.type === 'element' && child.tagName === 'code') {
            return child;
        }
    }
    return null;
}

function normalizeUrlForProtocolCheck(raw: string): string {
    return raw.replace(/[\u0000-\u0020]+/g, '').toLowerCase();
}

function isUnsafeProtocol(url: string, blockedPrefixes: string[]): boolean {
    const normalized = normalizeUrlForProtocolCheck(url);
    return blockedPrefixes.some((prefix) => normalized.startsWith(prefix));
}

function rehypeMermaid() {
    return (tree: Root): void => {
        visit(tree, 'element', (node: Element) => {
            if (node.tagName !== 'pre') return;
            const codeNode = findCodeChild(node);
            if (!codeNode) return;

            const classes = getClassList(codeNode);
            if (!classes.includes('language-mermaid')) return;

            const codeContent = extractNodeText(codeNode);
            const trimmed = codeContent.trim();

            if (!trimmed) {
                const emptyText: Text = {
                    type: 'text',
                    value:
                        'Bloque Mermaid vacío: añade una definición de diagrama (p. ej. graph TD; A-->B;).',
                };
                node.tagName = 'div';
                node.properties = {
                    className: ['mermaid-empty'],
                    'data-mermaid-empty': 'true',
                };
                node.children = [emptyText];
                return;
            }

            const rawText: Text = {
                type: 'text',
                value: codeContent,
            };
            const encodedSource = encodeURIComponent(codeContent);

            node.tagName = 'div';
            node.properties = {
                className: ['mermaid'],
                'data-mermaid-source': encodedSource,
            };
            node.children = [rawText];
        });
    };
}

function rehypeHeadingIds() {
    return (tree: Root): void => {
        const seen = new Map<string, number>();
        const usedIds = new Set<string>();

        visit(tree, 'element', (node: Element) => {
            if (!/^h[1-6]$/.test(node.tagName)) return;

            const text = extractNodeText(node).trim();
            const base = slugifyHeading(text);
            let candidate = base;
            let suffix = seen.get(base) ?? 0;

            while (usedIds.has(candidate)) {
                suffix += 1;
                candidate = `${base}-${suffix}`;
            }

            seen.set(base, suffix);
            usedIds.add(candidate);

            node.properties = {
                ...node.properties,
                id: candidate,
            };
        });
    };
}

function rehypeCodeMeta() {
    return (tree: Root): void => {
        visit(tree, 'element', (node: Element) => {
            if (node.tagName !== 'pre') return;
            const codeNode = findCodeChild(node);
            if (!codeNode) return;

            const classes = getClassList(codeNode);
            const langClass = classes.find((cls) => cls.startsWith('language-'));
            const language = langClass ? langClass.slice('language-'.length) : undefined;

            if (language === 'math') return;

            node.properties = {
                ...node.properties,
                tabIndex: 0,
                ...(language ? { 'data-language': language } : {}),
            };
        });
    };
}

function rehypeSafeLinks() {
    return (tree: Root): void => {
        visit(tree, 'element', (node: Element) => {
            if (!node.properties) return;

            const href = node.properties.href;
            if (typeof href === 'string') {
                const normalized = normalizeUrlForProtocolCheck(href);
                if (
                    isUnsafeProtocol(href, UNSAFE_HREF_PROTOCOLS) ||
                    normalized.startsWith('data:')
                ) {
                    node.properties.href = '#';
                    node.properties['data-unsafe-link'] = 'true';
                } else if (
                    normalized.startsWith('http://') ||
                    normalized.startsWith('https://')
                ) {
                    node.properties.target = '_blank';
                    node.properties.rel = ['noopener', 'noreferrer'];
                }
            }

            const src = node.properties.src;
            if (typeof src === 'string' && isUnsafeProtocol(src, UNSAFE_SRC_PROTOCOLS)) {
                delete node.properties.src;
                node.properties['data-unsafe-src'] = 'true';
            }
        });
    };
}

function createMarkdownProcessor() {
    return unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkRehype)
        .use(rehypeMermaid)
        .use(rehypeHighlight, {
            detect: false,
            plainText: ['text', 'txt', 'plain', 'math'],
        })
        .use(rehypeHeadingIds)
        .use(rehypeCodeMeta)
        .use(rehypeSafeLinks)
        .use(rehypeKatex, {
            strict: 'ignore',
            errorColor: '#dc2626',
        })
        .use(rehypeStringify);
}

type MarkdownProcessor = ReturnType<typeof createMarkdownProcessor>;

let cachedProcessor: MarkdownProcessor | null = null;

function getMarkdownProcessor(): MarkdownProcessor {
    if (!cachedProcessor) {
        cachedProcessor = createMarkdownProcessor();
    }
    return cachedProcessor;
}

/**
 * Transform a Markdown string into sanitized, highlighted HTML with Mermaid placeholders and KaTeX math.
 */
export async function processMarkdown(content: string): Promise<string> {
    try {
        const processor = getMarkdownProcessor();
        const file = await processor.process(content);
        return String(file);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Error desconocido al procesar Markdown';
        return `<p class="text-destructive">Error al renderizar Markdown: ${escapeHtml(message)}</p>`;
    }
}
