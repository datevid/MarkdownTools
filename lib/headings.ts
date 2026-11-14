import { slugifyHeading } from './utils';

/**
 * Heading item extracted from Markdown source for Table of Contents navigation.
 */
export interface MarkdownHeading {
    id: string;
    text: string;
    level: number;
    line: number;
}

function stripInlineMarkdown(raw: string): string {
    return raw
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        .replace(/~~(.*?)~~/g, '$1')
        .replace(/\\([\\`*_{}[\]()#+\-.!>~])/g, '$1')
        .trim();
}

/**
 * Extract ATX headings from Markdown source while skipping fenced code blocks,
 * producing deterministic IDs matching the rendered HTML headings.
 */
export function extractHeadings(markdown: string): MarkdownHeading[] {
    if (!markdown) return [];

    const lines = markdown.split(/\r?\n/);
    const headings: MarkdownHeading[] = [];
    const seen = new Map<string, number>();
    const usedIds = new Set<string>();

    let fenceChar: '`' | '~' | null = null;
    let fenceLength = 0;

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const fenceMatch = line.match(/^\s{0,3}(`{3,}|~{3,})(.*)$/);

        if (fenceMatch) {
            const marker = fenceMatch[1];
            const char = marker[0] as '`' | '~';
            if (fenceChar === null) {
                fenceChar = char;
                fenceLength = marker.length;
                continue;
            }
            if (
                char === fenceChar &&
                marker.length >= fenceLength &&
                fenceMatch[2].trim() === ''
            ) {
                fenceChar = null;
                fenceLength = 0;
                continue;
            }
        }

        if (fenceChar !== null) {
            continue;
        }

        const headingMatch = line.match(/^\s{0,3}(#{1,6})\s+(.+?)(?:\s+#+\s*)?$/);
        if (!headingMatch) continue;

        const level = headingMatch[1].length;
        const text = stripInlineMarkdown(headingMatch[2]);
        if (!text) continue;

        const base = slugifyHeading(text);
        let candidate = base;
        let suffix = seen.get(base) ?? 0;

        while (usedIds.has(candidate)) {
            suffix += 1;
            candidate = `${base}-${suffix}`;
        }

        seen.set(base, suffix);
        usedIds.add(candidate);

        headings.push({
            id: candidate,
            text,
            level,
            line: index + 1,
        });
    }

    return headings;
}
