import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import { Element } from 'hast';

import rehypeHighlight from 'rehype-highlight';

function rehypeMermaid() {
    return (tree: any) => {
        visit(tree, 'element', (node: Element) => {
            if (
                node.tagName === 'pre' &&
                node.children.length === 1 &&
                (node.children[0] as Element).tagName === 'code' &&
                (node.children[0] as Element).properties?.className &&
                ((node.children[0] as Element).properties!.className as string[]).includes('language-mermaid')
            ) {
                const codeNode = node.children[0] as Element;
                const codeContent = (codeNode.children[0] as any).value;

                // Transform to <div class="mermaid">
                node.tagName = 'div';
                node.properties = { className: ['mermaid'] };
                node.children = [{
                    type: 'text',
                    value: codeContent
                }] as any;
            }
        });
    };
}

export async function processMarkdown(content: string) {
    try {
        const file = await unified()
            .use(remarkParse)
            .use(remarkGfm)
            .use(remarkMath)
            .use(remarkRehype)
            .use(rehypeHighlight, { detect: true })
            .use(rehypeMermaid)
            .use(rehypeKatex)
            .use(rehypeStringify)
            .process(content);

        return String(file);
    } catch (error) {
        console.error('[Markdown] Transformation failed:', error);
        return `<p style="color:red">Error rendering markdown: ${(error as Error).message}</p>`;
    }
}
