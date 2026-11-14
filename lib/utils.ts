import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const utf8Encoder = new TextEncoder();

/**
 * Computed metrics for a Markdown document.
 */
export interface DocumentStats {
    words: number;
    chars: number;
    charsNoSpaces: number;
    lines: number;
    bytes: number;
    readingMinutes: number;
}

/**
 * Merge conditional class names with Tailwind conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

/**
 * Format a byte count into a human-readable size label.
 */
export function formatBytes(bytes: number, decimals = 2): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const rawIndex = Math.floor(Math.log(bytes) / Math.log(k));
    const index = Math.min(Math.max(rawIndex, 0), sizes.length - 1);
    return `${parseFloat((bytes / Math.pow(k, index)).toFixed(dm))} ${sizes[index]}`;
}

/**
 * Compute exact UTF-8 byte length for a string.
 */
export function getUtf8ByteLength(text: string): number {
    if (!text) return 0;
    return utf8Encoder.encode(text).byteLength;
}

/**
 * Compute word, character, line, byte, and reading-time statistics for a document.
 */
export function computeDocumentStats(text: string): DocumentStats {
    if (!text) {
        return {
            words: 0,
            chars: 0,
            charsNoSpaces: 0,
            lines: 0,
            bytes: 0,
            readingMinutes: 0,
        };
    }

    const trimmed = text.trim();
    const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s+/g, '').length;
    const lines = text.split(/\r\n|\r|\n/).length;
    const bytes = getUtf8ByteLength(text);
    const readingMinutes = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));

    return {
        words,
        chars,
        charsNoSpaces,
        lines,
        bytes,
        readingMinutes,
    };
}

/**
 * Convert a heading string into a URL-safe slug, preserving base ASCII letters for accented characters.
 */
export function slugifyHeading(text: string): string {
    const slug = text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

    return slug || 'section';
}

/**
 * Generate a unique identifier using `crypto.randomUUID` with a timestamp-random fallback.
 */
export function generateId(prefix?: string): string {
    const raw =
        typeof globalThis !== 'undefined' &&
        typeof globalThis.crypto !== 'undefined' &&
        typeof globalThis.crypto.randomUUID === 'function'
            ? globalThis.crypto.randomUUID()
            : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

    return prefix ? `${prefix}-${raw}` : raw;
}
