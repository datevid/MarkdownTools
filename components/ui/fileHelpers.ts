/**
 * Shared file validation, unique naming, and download helpers for Wave 2A UI components.
 */

export const HEAVY_FILE_BYTES = 2 * 1024 * 1024;

const SUPPORTED_EXTENSIONS = ['.md', '.markdown', '.txt'] as const;
const SUPPORTED_MIME_TYPES = new Set([
    'text/markdown',
    'text/x-markdown',
    'text/plain',
]);

/**
 * Determine whether a File object is a supported Markdown or plain-text document.
 */
export function isSupportedMarkdownFile(file: Pick<File, 'name' | 'type'>): boolean {
    const lowerName = file.name.toLowerCase().trim();
    const hasSupportedExt = SUPPORTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    if (hasSupportedExt) {
        return true;
    }

    const mime = file.type.toLowerCase().trim();
    if (!mime) {
        return false;
    }

    // Only accept MIME match when there is no conflicting non-markdown extension (e.g. .html/.csv)
    const dotIndex = lowerName.lastIndexOf('.');
    if (dotIndex > 0) {
        return false;
    }

    return SUPPORTED_MIME_TYPES.has(mime);
}

/**
 * Normalize a user-supplied Markdown file name and guarantee a supported extension.
 */
export function normalizeMarkdownFileName(
    rawName: string,
    fallback = 'Documento_Unido.md'
): string {
    const withoutControls = Array.from(rawName.trim())
        .filter((char) => char.charCodeAt(0) >= 32)
        .join('');
    const cleaned = withoutControls.replace(/[<>:"/\\|?*]/g, '_');
    if (!cleaned) {
        return fallback;
    }

    const lower = cleaned.toLowerCase();
    const hasValidExt = SUPPORTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
    return hasValidExt ? cleaned : `${cleaned}.md`;
}

/**
 * Generate a collision-free file name (e.g. `README (2).md`) against existing workspace names.
 */
export function createUniqueFileName(
    desiredName: string,
    existingNames: string[]
): string {
    const normalizedSet = new Set(existingNames.map((name) => name.trim().toLowerCase()));
    const baseFull = desiredName.trim() || 'Documento.md';

    if (!normalizedSet.has(baseFull.toLowerCase())) {
        return baseFull;
    }

    const dotIndex = baseFull.lastIndexOf('.');
    const hasExtension = dotIndex > 0;
    const stem = hasExtension ? baseFull.slice(0, dotIndex) : baseFull;
    const ext = hasExtension ? baseFull.slice(dotIndex) : '.md';

    let counter = 2;
    let candidate = `${stem} (${counter})${ext}`;
    while (normalizedSet.has(candidate.toLowerCase())) {
        counter += 1;
        candidate = `${stem} (${counter})${ext}`;
    }

    return candidate;
}

/**
 * Trigger a client-side download for a Markdown document.
 */
export function downloadMarkdownFile(fileName: string, content: string): void {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
