'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback, useSyncExternalStore } from 'react';
import { useAppStore, type ViewMode } from '@/lib/store';
import { cn, formatBytes, computeDocumentStats } from '@/lib/utils';
import { extractHeadings, type MarkdownHeading } from '@/lib/headings';
import { createLatestMarkdownRenderer } from '@/lib/markdownClient';
import { useTheme } from 'next-themes';
import Toolbar, { type ToolbarAction } from './Toolbar';
import {
    Copy,
    Check,
    Search,
    X,
    ChevronUp,
    ChevronDown,
    ListTree,
    Eye,
    Pencil,
    Columns2,
    Link2,
    Bold,
    Italic,
    Code,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Download,
    AlertTriangle,
    Focus,
    Type,
} from 'lucide-react';

/**
 * Props for the interactive HybridEditor component.
 */
export interface HybridEditorProps {
    initialValue: string;
    fileId?: string;
    fileName?: string;
    onChange?: (value: string) => void;
}

interface HistorySnapshot {
    value: string;
    selectionStart: number;
    selectionEnd: number;
}

interface HistoryState {
    past: HistorySnapshot[];
    present: HistorySnapshot;
    future: HistorySnapshot[];
}

interface SearchMatch {
    start: number;
    end: number;
}

interface LightboxState {
    svg: string;
    source: string;
}

const HEAVY_FILE_BYTES = 2 * 1024 * 1024;
const LARGE_HISTORY_THRESHOLD = 500_000;

function subscribeDesktopMediaQuery(onStoreChange: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const mq = window.matchMedia('(min-width: 768px)');
    mq.addEventListener('change', onStoreChange);
    return () => mq.removeEventListener('change', onStoreChange);
}

function getDesktopMediaSnapshot(): boolean {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(min-width: 768px)').matches;
}

function getDesktopServerSnapshot(): boolean {
    return true;
}

function getMaxHistoryForLength(length: number): number {
    return length > LARGE_HISTORY_THRESHOLD ? 25 : 100;
}

function getCursorCoordinates(text: string, selectionStart: number): { line: number; column: number } {
    const safeOffset = Math.max(0, Math.min(selectionStart, text.length));
    const before = text.slice(0, safeOffset);
    const lines = before.split(/\r\n|\r|\n/);
    const lastLine = lines[lines.length - 1] ?? '';
    return {
        line: lines.length,
        column: lastLine.length + 1,
    };
}

function getOffsetForLine(text: string, oneBasedLine: number): number {
    if (oneBasedLine <= 1) return 0;
    const lines = text.split('\n');
    const targetIndex = Math.min(oneBasedLine - 1, lines.length - 1);
    let offset = 0;
    for (let i = 0; i < targetIndex; i += 1) {
        offset += lines[i].length + 1;
    }
    return offset;
}

function toggleTaskCheckboxInMarkdown(markdown: string, targetCheckboxIndex: number): string {
    const lines = markdown.split('\n');
    let fenceChar: '`' | '~' | null = null;
    let fenceLen = 0;
    let currentCheckboxIndex = 0;

    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        const fenceMatch = line.match(/^\s{0,3}(`{3,}|~{3,})(.*)$/);
        if (fenceMatch) {
            const marker = fenceMatch[1];
            const ch = marker[0] as '`' | '~';
            if (fenceChar === null) {
                fenceChar = ch;
                fenceLen = marker.length;
                continue;
            }
            if (ch === fenceChar && marker.length >= fenceLen && fenceMatch[2].trim() === '') {
                fenceChar = null;
                fenceLen = 0;
                continue;
            }
        }

        if (fenceChar !== null) continue;

        const taskMatch = line.match(/^(\s*(?:[-*+]|\d+[.)])\s+\[)( |x|X)(\].*)$/);
        if (!taskMatch) continue;

        if (currentCheckboxIndex === targetCheckboxIndex) {
            const nextMark = taskMatch[2] === ' ' ? 'x' : ' ';
            lines[i] = `${taskMatch[1]}${nextMark}${taskMatch[3]}`;
            return lines.join('\n');
        }
        currentCheckboxIndex += 1;
    }

    return markdown;
}

function downloadSvgFile(svgContent: string, baseFileName?: string): void {
    const cleanBase = (baseFileName ?? 'diagrama')
        .replace(/\.(md|markdown|txt)$/i, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '-');
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cleanBase || 'diagrama'}-mermaid.svg`;
    link.click();
    URL.revokeObjectURL(url);
}

function escapeSelectorId(id: string): string {
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
        return CSS.escape(id);
    }
    return id.replace(/([ #;?%&,.+*~':"!^$[\]()=>|/@])/g, '\\$1');
}

function createCopyIconSvg(checked: boolean): SVGSVGElement {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');

    if (checked) {
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', 'M20 6 9 17l-5-5');
        svg.appendChild(path);
    } else {
        const rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('width', '14');
        rect.setAttribute('height', '14');
        rect.setAttribute('x', '8');
        rect.setAttribute('y', '8');
        rect.setAttribute('rx', '2');
        rect.setAttribute('ry', '2');
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2');
        svg.appendChild(rect);
        svg.appendChild(path);
    }
    return svg;
}

/**
 * Full-featured Markdown editor supporting Split, Hybrid, and Preview modes,
 * async Web Worker rendering, Undo/Redo history, Find & Replace, Mermaid diagrams
 * with Lightbox & error reporting, interactive checkboxes, TOC navigation,
 * Typewriter Mode, Focus Mode, and proportional Scroll Sync.
 */
export default function HybridEditor({
    initialValue,
    fileId,
    fileName,
    onChange,
}: HybridEditorProps) {
    const {
        viewMode,
        setViewMode,
        splitRatio,
        setSplitRatio,
        focusMode,
        typewriterMode,
        syncScroll,
        setSyncScroll,
        tocOpen,
        setTocOpen,
        setTemplatesOpen,
        setShortcutsOpen,
        addNotification,
    } = useAppStore();

    const { resolvedTheme } = useTheme();

    const [history, setHistory] = useState<HistoryState>(() => ({
        past: [],
        present: { value: initialValue, selectionStart: 0, selectionEnd: 0 },
        future: [],
    }));
    const content = history.present.value;

    const [html, setHtml] = useState('');
    const [renderError, setRenderError] = useState<string | null>(null);
    const [isHybridEditing, setIsHybridEditing] = useState(false);
    const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
    const [copiedMarkdown, setCopiedMarkdown] = useState(false);
    const [cursor, setCursor] = useState<{ line: number; column: number }>({ line: 1, column: 1 });

    // Selection bubble menu state
    const [selectionMenu, setSelectionMenu] = useState<{ visible: boolean; top: number }>({
        visible: false,
        top: 12,
    });

    // Find & Replace state
    const [findOpen, setFindOpen] = useState(false);
    const [findQuery, setFindQuery] = useState('');
    const [replaceQuery, setReplaceQuery] = useState('');
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [activeMatchIndex, setActiveMatchIndex] = useState(0);

    // Mermaid Lightbox state
    const [lightbox, setLightbox] = useState<LightboxState | null>(null);
    const [lightboxZoom, setLightboxZoom] = useState(1);

    // Track desktop breakpoint without setState-in-effect
    const isDesktop = useSyncExternalStore(
        subscribeDesktopMediaQuery,
        getDesktopMediaSnapshot,
        getDesktopServerSnapshot
    );

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const previewScrollRef = useRef<HTMLDivElement>(null);
    const previewContentRef = useRef<HTMLDivElement>(null);
    const findInputRef = useRef<HTMLInputElement>(null);
    const lightboxSvgRef = useRef<HTMLDivElement>(null);
    const splitContainerRef = useRef<HTMLDivElement>(null);
    const splitDragCleanupRef = useRef<(() => void) | null>(null);

    const [dragSplitRatio, setDragSplitRatio] = useState<number | null>(null);
    const [isResizingSplit, setIsResizingSplit] = useState(false);
    const effectiveSplitRatio = dragSplitRatio ?? splitRatio;

    const rendererRef = useRef<ReturnType<typeof createLatestMarkdownRenderer> | null>(null);
    const hasMountedRenderRef = useRef(false);
    const renderedContentRef = useRef<string | null>(null);
    const wasPreviewShownRef = useRef(false);
    const lastEmittedRef = useRef(initialValue);
    const contentRef = useRef(content);
    const historyRef = useRef<HistoryState>(history);

    const activeScrollerRef = useRef<'editor' | 'preview' | null>(null);
    const scrollLockRafRef = useRef<number | null>(null);
    const mermaidIdCounterRef = useRef(0);

    const canUndo = history.past.length > 0;
    const canRedo = history.future.length > 0;

    const stats = useMemo(() => computeDocumentStats(content), [content]);
    const headings = useMemo<MarkdownHeading[]>(
        () => extractHeadings(content).filter((h) => h.level <= 4),
        [content]
    );
    const isHeavyFile = stats.bytes > HEAVY_FILE_BYTES;

    // Keep refs synchronized with latest React state outside render
    useEffect(() => {
        contentRef.current = content;
        historyRef.current = history;
    }, [content, history]);

    // Sync if initialValue changes externally (e.g., store mutation from outside editor)
    useEffect(() => {
        if (initialValue === lastEmittedRef.current) return;
        const timer = setTimeout(() => {
            const nextState: HistoryState = {
                past: [],
                present: { value: initialValue, selectionStart: 0, selectionEnd: 0 },
                future: [],
            };
            lastEmittedRef.current = initialValue;
            contentRef.current = initialValue;
            historyRef.current = nextState;
            setHistory(nextState);
            setCursor({ line: 1, column: 1 });
        }, 0);
        return () => clearTimeout(timer);
    }, [initialValue, fileId]);

    // Clean up pending rAF lock on unmount
    useEffect(() => {
        return () => {
            if (scrollLockRafRef.current !== null) {
                cancelAnimationFrame(scrollLockRafRef.current);
            }
        };
    }, []);

    // Commit new content to undo stack & notify parent
    const commitContent = useCallback(
        (nextValue: string, selectionStart: number, selectionEnd: number) => {
            if (nextValue === contentRef.current) return;

            const currentHistory = historyRef.current;
            const maxHistory = getMaxHistoryForLength(nextValue.length);
            const nextPast = [...currentHistory.past, currentHistory.present];
            if (nextPast.length > maxHistory) {
                nextPast.splice(0, nextPast.length - maxHistory);
            }
            const nextState: HistoryState = {
                past: nextPast,
                present: {
                    value: nextValue,
                    selectionStart,
                    selectionEnd,
                },
                future: [],
            };

            historyRef.current = nextState;
            contentRef.current = nextValue;
            lastEmittedRef.current = nextValue;
            setHistory(nextState);
            setCursor(getCursorCoordinates(nextValue, selectionStart));
            onChange?.(nextValue);
        },
        [onChange]
    );

    const restoreTextareaSelection = useCallback((start: number, end: number) => {
        requestAnimationFrame(() => {
            const ta = textareaRef.current;
            if (!ta) return;
            ta.focus();
            ta.setSelectionRange(start, end);
        });
    }, []);

    const handleUndo = useCallback(() => {
        const currentHistory = historyRef.current;
        if (currentHistory.past.length === 0) return;
        const previous = currentHistory.past[currentHistory.past.length - 1];
        const nextState: HistoryState = {
            past: currentHistory.past.slice(0, -1),
            present: previous,
            future: [currentHistory.present, ...currentHistory.future],
        };

        historyRef.current = nextState;
        contentRef.current = previous.value;
        lastEmittedRef.current = previous.value;
        setHistory(nextState);
        setCursor(getCursorCoordinates(previous.value, previous.selectionStart));
        onChange?.(previous.value);
        restoreTextareaSelection(previous.selectionStart, previous.selectionEnd);
    }, [onChange, restoreTextareaSelection]);

    const handleRedo = useCallback(() => {
        const currentHistory = historyRef.current;
        if (currentHistory.future.length === 0) return;
        const [next, ...restFuture] = currentHistory.future;
        const nextState: HistoryState = {
            past: [...currentHistory.past, currentHistory.present],
            present: next,
            future: restFuture,
        };

        historyRef.current = nextState;
        contentRef.current = next.value;
        lastEmittedRef.current = next.value;
        setHistory(nextState);
        setCursor(getCursorCoordinates(next.value, next.selectionStart));
        onChange?.(next.value);
        restoreTextareaSelection(next.selectionStart, next.selectionEnd);
    }, [onChange, restoreTextareaSelection]);

    // Determine whether the preview pane is currently mounted & visible
    const isPreviewShown =
        viewMode === 'preview' ||
        (viewMode === 'hybrid' && !isHybridEditing) ||
        (viewMode === 'split' && (isDesktop || mobileTab === 'preview'));

    // Determine whether the editor pane is currently visible
    const isEditorShown =
        (viewMode === 'hybrid' && isHybridEditing) ||
        (viewMode === 'split' && (isDesktop || mobileTab === 'editor'));

    // Initialize latest-wins renderer & render only when preview is visible
    useEffect(() => {
        const justBecameVisible = isPreviewShown && !wasPreviewShownRef.current;
        wasPreviewShownRef.current = isPreviewShown;

        if (!isPreviewShown) return;

        if (!rendererRef.current) {
            rendererRef.current = createLatestMarkdownRenderer();
        }
        const renderer = rendererRef.current;
        let cancelled = false;

        const runRender = async () => {
            try {
                const output = await renderer.render(content);
                if (cancelled) return;
                renderedContentRef.current = content;
                setHtml(output);
                setRenderError(null);
            } catch (error) {
                if (cancelled) return;
                if (error instanceof Error && error.name === 'AbortError') {
                    return;
                }
                const message =
                    error instanceof Error ? error.message : 'Error inesperado al renderizar Markdown.';
                setRenderError(message);
            }
        };

        if (!hasMountedRenderRef.current || renderedContentRef.current === null || justBecameVisible) {
            hasMountedRenderRef.current = true;
            if (renderedContentRef.current !== content) {
                void runRender();
            }
            return () => {
                cancelled = true;
                renderer.cancel();
            };
        }

        if (renderedContentRef.current === content) {
            return;
        }

        const timer = setTimeout(() => {
            void runRender();
        }, 100);

        return () => {
            cancelled = true;
            clearTimeout(timer);
            renderer.cancel();
        };
    }, [content, isPreviewShown]);

    // Cancel renderer & split drag listeners on full unmount
    useEffect(() => {
        return () => {
            rendererRef.current?.cancel();
            splitDragCleanupRef.current?.();
        };
    }, []);

    // Enhance preview DOM: code block cards, interactive checkboxes, secure Mermaid + error cards
    useEffect(() => {
        const container = previewContentRef.current;
        if (!container || !isPreviewShown) return;

        let cancelled = false;
        container.innerHTML = html;

        // 1. Enhance <pre> code blocks with language badge and Copy button
        const preNodes = Array.from(container.querySelectorAll<HTMLPreElement>('pre'));
        for (const pre of preNodes) {
            if (pre.dataset.enhanced === 'true') continue;
            pre.dataset.enhanced = 'true';

            const codeEl = pre.querySelector('code');
            const language = pre.getAttribute('data-language') ?? '';
            const wrapper = document.createElement('div');
            wrapper.className =
                'code-block-card my-5 overflow-hidden rounded-xl border border-border bg-[#f6f8fa] dark:bg-[#0d1117]';

            const header = document.createElement('div');
            header.className =
                'flex items-center justify-between border-b border-border bg-muted/60 px-3.5 py-1.5 text-xs';

            const badge = document.createElement('span');
            badge.className = 'font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground';
            badge.textContent = language ? language : 'código';

            const copyBtn = document.createElement('button');
            copyBtn.type = 'button';
            copyBtn.className =
                'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer';
            copyBtn.setAttribute('aria-label', 'Copiar código del bloque');

            const labelSpan = document.createElement('span');
            labelSpan.textContent = 'Copiar código';
            copyBtn.appendChild(createCopyIconSvg(false));
            copyBtn.appendChild(labelSpan);

            let copyTimer: ReturnType<typeof setTimeout> | null = null;
            copyBtn.addEventListener('click', () => {
                const rawCode = codeEl?.textContent ?? pre.textContent ?? '';
                void navigator.clipboard.writeText(rawCode).then(() => {
                    copyBtn.replaceChildren(createCopyIconSvg(true));
                    const doneSpan = document.createElement('span');
                    doneSpan.textContent = 'Copiado';
                    doneSpan.className = 'text-emerald-600 dark:text-emerald-400';
                    copyBtn.appendChild(doneSpan);
                    if (copyTimer) clearTimeout(copyTimer);
                    copyTimer = setTimeout(() => {
                        copyBtn.replaceChildren(createCopyIconSvg(false));
                        const resetSpan = document.createElement('span');
                        resetSpan.textContent = 'Copiar código';
                        copyBtn.appendChild(resetSpan);
                    }, 1800);
                });
            });

            header.appendChild(badge);
            header.appendChild(copyBtn);

            pre.classList.add('!my-0', '!border-0', '!rounded-none');
            const parent = pre.parentNode;
            if (parent) {
                parent.insertBefore(wrapper, pre);
                wrapper.appendChild(header);
                wrapper.appendChild(pre);
            }
        }

        // 2. Make GFM task list checkboxes interactive
        const checkboxes = Array.from(
            container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
        );
        checkboxes.forEach((checkbox, idx) => {
            checkbox.disabled = false;
            checkbox.classList.add('cursor-pointer', 'accent-accent');
            checkbox.setAttribute('aria-label', `Alternar tarea ${idx + 1}`);
            checkbox.addEventListener('change', () => {
                const currentMd = contentRef.current;
                const nextMd = toggleTaskCheckboxInMarkdown(currentMd, idx);
                if (nextMd !== currentMd) {
                    const pos = textareaRef.current?.selectionStart ?? 0;
                    commitContent(nextMd, pos, pos);
                }
            });
        });

        // 3. Render Mermaid diagrams securely with parse validation and Lightbox/Copy/Download controls
        const mermaidNodes = Array.from(
            container.querySelectorAll<HTMLElement>('.mermaid[data-mermaid-source]')
        );

        const renderDiagrams = async () => {
            if (mermaidNodes.length === 0) return;
            if (container.offsetParent === null) return;

            const { default: mermaid } = await import('mermaid');
            if (cancelled) return;

            mermaid.initialize({
                startOnLoad: false,
                theme: resolvedTheme === 'dark' ? 'dark' : 'default',
                securityLevel: 'strict',
                fontFamily: 'var(--font-geist-sans), sans-serif',
                suppressErrorRendering: true,
            });

            for (const el of mermaidNodes) {
                if (cancelled) return;
                const encoded = el.getAttribute('data-mermaid-source') ?? '';
                let source = '';
                try {
                    source = decodeURIComponent(encoded);
                } catch {
                    source = el.textContent ?? '';
                }

                const renderId = `mermaid-diagram-${++mermaidIdCounterRef.current}`;

                try {
                    await mermaid.parse(source);
                    const { svg } = await mermaid.render(renderId, source);
                    if (cancelled) return;

                    const card = document.createElement('div');
                    card.className =
                        'mermaid-card not-prose my-6 flex flex-col items-stretch overflow-hidden rounded-xl border border-border bg-muted/25 p-0';
                    card.setAttribute('role', 'region');
                    card.setAttribute('aria-label', 'Diagrama Mermaid');

                    const bar = document.createElement('div');
                    bar.className =
                        'flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/50 px-3.5 py-2 text-xs';

                    const title = document.createElement('span');
                    title.className =
                        'font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground';
                    title.textContent = 'Diagrama Mermaid';

                    const actions = document.createElement('div');
                    actions.className = 'flex items-center gap-1.5';

                    const zoomBtn = document.createElement('button');
                    zoomBtn.type = 'button';
                    zoomBtn.className =
                        'rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors cursor-pointer';
                    zoomBtn.textContent = 'Ampliar';
                    zoomBtn.addEventListener('click', () => {
                        setLightboxZoom(1);
                        setLightbox({ svg, source });
                    });

                    const copySvgBtn = document.createElement('button');
                    copySvgBtn.type = 'button';
                    copySvgBtn.className =
                        'rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors cursor-pointer';
                    copySvgBtn.textContent = 'Copiar SVG';
                    copySvgBtn.addEventListener('click', () => {
                        void navigator.clipboard.writeText(svg).then(() => {
                            copySvgBtn.textContent = 'Copiado';
                            addNotification('SVG copiado al portapapeles', 'success');
                            setTimeout(() => {
                                copySvgBtn.textContent = 'Copiar SVG';
                            }, 1800);
                        });
                    });

                    const downloadBtn = document.createElement('button');
                    downloadBtn.type = 'button';
                    downloadBtn.className =
                        'rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors cursor-pointer';
                    downloadBtn.textContent = 'Descargar SVG';
                    downloadBtn.addEventListener('click', () => {
                        downloadSvgFile(svg, fileName);
                        addNotification('Diagrama SVG descargado', 'success');
                    });

                    actions.appendChild(zoomBtn);
                    actions.appendChild(copySvgBtn);
                    actions.appendChild(downloadBtn);
                    bar.appendChild(title);
                    bar.appendChild(actions);

                    const viewport = document.createElement('div');
                    viewport.className =
                        'flex w-full justify-center overflow-x-auto p-4 [&_svg]:h-auto [&_svg]:max-w-full';
                    viewport.innerHTML = svg;

                    card.appendChild(bar);
                    card.appendChild(viewport);
                    el.replaceWith(card);
                } catch (err) {
                    if (cancelled) return;
                    const message =
                        err instanceof Error ? err.message : 'Error de sintaxis en el diagrama Mermaid.';

                    const errorCard = document.createElement('div');
                    errorCard.className =
                        'mermaid-error-card not-prose my-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground';
                    errorCard.setAttribute('role', 'alert');

                    const heading = document.createElement('p');
                    heading.className = 'font-semibold text-destructive';
                    heading.textContent = 'Diagrama Mermaid inválido: revisa la sintaxis';

                    const detail = document.createElement('p');
                    detail.className = 'mt-1.5 font-mono text-xs text-muted-foreground break-words';
                    detail.textContent = message;

                    const sourcePre = document.createElement('pre');
                    sourcePre.className =
                        'mt-3 overflow-x-auto rounded-lg border border-border bg-background/80 p-3 font-mono text-xs text-foreground';
                    sourcePre.textContent = source;

                    errorCard.appendChild(heading);
                    errorCard.appendChild(detail);
                    errorCard.appendChild(sourcePre);
                    el.replaceWith(errorCard);
                } finally {
                    document.getElementById(`d${renderId}`)?.remove();
                }
            }
        };

        void renderDiagrams();

        return () => {
            cancelled = true;
        };
    }, [html, resolvedTheme, isPreviewShown, commitContent, addNotification, fileName]);

    // Sync Lightbox SVG container safely
    useEffect(() => {
        if (lightbox && lightboxSvgRef.current) {
            lightboxSvgRef.current.innerHTML = lightbox.svg;
        }
    }, [lightbox]);

    // Close Lightbox on Escape
    useEffect(() => {
        if (!lightbox) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                setLightbox(null);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [lightbox]);

    // Helper: center active caret line in textarea for Typewriter Mode
    const centerCaretInTextarea = useCallback(() => {
        const ta = textareaRef.current;
        if (!ta || !typewriterMode) return;
        const computed = window.getComputedStyle(ta);
        const parsedLineHeight = parseFloat(computed.lineHeight);
        const fontSize = parseFloat(computed.fontSize) || 16;
        const lineHeight = Number.isFinite(parsedLineHeight) ? parsedLineHeight : fontSize * 1.65;
        const paddingTop = parseFloat(computed.paddingTop) || 0;

        const textBefore = ta.value.slice(0, ta.selectionStart);
        const lineIndex = textBefore.split('\n').length - 1;
        const caretY = paddingTop + lineIndex * lineHeight + lineHeight / 2;
        const targetScrollTop = Math.max(0, caretY - ta.clientHeight / 2);

        ta.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    }, [typewriterMode]);

    // Recenter on initial activation of Typewriter Mode
    useEffect(() => {
        if (typewriterMode && isEditorShown) {
            centerCaretInTextarea();
        }
    }, [typewriterMode, isEditorShown, centerCaretInTextarea]);

    // Update cursor & floating selection bubble coordinates
    const syncSelectionState = useCallback(() => {
        const ta = textareaRef.current;
        if (!ta) return;

        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        setCursor(getCursorCoordinates(ta.value, start));

        if (end > start) {
            const computed = window.getComputedStyle(ta);
            const parsedLineHeight = parseFloat(computed.lineHeight);
            const fontSize = parseFloat(computed.fontSize) || 16;
            const lineHeight = Number.isFinite(parsedLineHeight) ? parsedLineHeight : fontSize * 1.65;
            const paddingTop = parseFloat(computed.paddingTop) || 0;
            const lineIndex = ta.value.slice(0, start).split('\n').length - 1;
            const rawTop = paddingTop + lineIndex * lineHeight - ta.scrollTop - 44;
            const clampedTop = Math.max(8, Math.min(rawTop, Math.max(8, ta.clientHeight - 48)));
            setSelectionMenu({ visible: true, top: clampedTop });
        } else {
            setSelectionMenu((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        }
    }, []);

    // Proportional bidirectional scroll sync
    const handleEditorScroll = useCallback(() => {
        if (selectionMenu.visible) {
            syncSelectionState();
        }
        if (!syncScroll || viewMode !== 'split' || !isDesktop) return;
        if (activeScrollerRef.current === 'preview') return;

        const editorEl = textareaRef.current;
        const previewEl = previewScrollRef.current;
        if (!editorEl || !previewEl) return;

        const maxEditor = editorEl.scrollHeight - editorEl.clientHeight;
        const maxPreview = previewEl.scrollHeight - previewEl.clientHeight;
        if (maxEditor <= 0 || maxPreview <= 0) return;

        activeScrollerRef.current = 'editor';
        const ratio = editorEl.scrollTop / maxEditor;
        previewEl.scrollTop = ratio * maxPreview;

        if (scrollLockRafRef.current !== null) {
            cancelAnimationFrame(scrollLockRafRef.current);
        }
        scrollLockRafRef.current = requestAnimationFrame(() => {
            scrollLockRafRef.current = requestAnimationFrame(() => {
                activeScrollerRef.current = null;
            });
        });
    }, [syncScroll, viewMode, isDesktop, selectionMenu.visible, syncSelectionState]);

    const handlePreviewScroll = useCallback(() => {
        if (!syncScroll || viewMode !== 'split' || !isDesktop) return;
        if (activeScrollerRef.current === 'editor') return;

        const editorEl = textareaRef.current;
        const previewEl = previewScrollRef.current;
        if (!editorEl || !previewEl) return;

        const maxEditor = editorEl.scrollHeight - editorEl.clientHeight;
        const maxPreview = previewEl.scrollHeight - previewEl.clientHeight;
        if (maxEditor <= 0 || maxPreview <= 0) return;

        activeScrollerRef.current = 'preview';
        const ratio = previewEl.scrollTop / maxPreview;
        editorEl.scrollTop = ratio * maxEditor;

        if (scrollLockRafRef.current !== null) {
            cancelAnimationFrame(scrollLockRafRef.current);
        }
        scrollLockRafRef.current = requestAnimationFrame(() => {
            scrollLockRafRef.current = requestAnimationFrame(() => {
                activeScrollerRef.current = null;
            });
        });
    }, [syncScroll, viewMode, isDesktop]);

    // Open Find & Replace bar and focus input
    const openFindBar = useCallback(() => {
        setFindOpen(true);
        if (viewMode === 'hybrid' && !isHybridEditing) {
            setIsHybridEditing(true);
        }
        if (viewMode === 'split' && !isDesktop && mobileTab !== 'editor') {
            setMobileTab('editor');
        }
        requestAnimationFrame(() => {
            findInputRef.current?.focus();
            findInputRef.current?.select();
        });
    }, [viewMode, isHybridEditing, isDesktop, mobileTab]);

    // Compute Find & Replace matches
    const searchMatches = useMemo<SearchMatch[]>(() => {
        if (!findQuery) return [];
        const haystack = caseSensitive ? content : content.toLowerCase();
        const needle = caseSensitive ? findQuery : findQuery.toLowerCase();
        if (!needle) return [];

        const matches: SearchMatch[] = [];
        let index = 0;
        while (index <= haystack.length) {
            const found = haystack.indexOf(needle, index);
            if (found === -1) break;
            matches.push({ start: found, end: found + needle.length });
            index = found + Math.max(1, needle.length);
            if (matches.length >= 2000) break;
        }
        return matches;
    }, [content, findQuery, caseSensitive]);

    const safeActiveMatchIndex =
        searchMatches.length === 0 ? 0 : Math.min(activeMatchIndex, searchMatches.length - 1);

    const scrollTextareaToOffset = useCallback((offset: number) => {
        const ta = textareaRef.current;
        if (!ta) return;
        const computed = window.getComputedStyle(ta);
        const parsedLineHeight = parseFloat(computed.lineHeight);
        const fontSize = parseFloat(computed.fontSize) || 16;
        const lineHeight = Number.isFinite(parsedLineHeight) ? parsedLineHeight : fontSize * 1.65;
        const paddingTop = parseFloat(computed.paddingTop) || 0;
        const lineIndex = ta.value.slice(0, offset).split('\n').length - 1;
        const targetY = Math.max(0, paddingTop + lineIndex * lineHeight - ta.clientHeight / 2);
        ta.scrollTo({ top: targetY, behavior: 'smooth' });
    }, []);

    const jumpToMatch = useCallback(
        (targetIndex: number) => {
            if (searchMatches.length === 0) return;
            const wrapped =
                ((targetIndex % searchMatches.length) + searchMatches.length) % searchMatches.length;
            setActiveMatchIndex(wrapped);
            const match = searchMatches[wrapped];
            const ta = textareaRef.current;
            if (ta) {
                ta.setSelectionRange(match.start, match.end);
                scrollTextareaToOffset(match.start);
                setCursor(getCursorCoordinates(ta.value, match.start));
            }
        },
        [searchMatches, scrollTextareaToOffset]
    );

    const handleReplaceCurrent = useCallback(() => {
        if (searchMatches.length === 0) return;
        const match = searchMatches[safeActiveMatchIndex];
        const nextValue =
            content.slice(0, match.start) + replaceQuery + content.slice(match.end);
        const nextEnd = match.start + replaceQuery.length;
        commitContent(nextValue, match.start, nextEnd);
        restoreTextareaSelection(match.start, nextEnd);
    }, [searchMatches, safeActiveMatchIndex, content, replaceQuery, commitContent, restoreTextareaSelection]);

    const handleReplaceAll = useCallback(() => {
        if (!findQuery || searchMatches.length === 0) return;
        let result = '';
        let cursorIdx = 0;
        for (const match of searchMatches) {
            result += content.slice(cursorIdx, match.start) + replaceQuery;
            cursorIdx = match.end;
        }
        result += content.slice(cursorIdx);
        const count = searchMatches.length;
        commitContent(result, 0, 0);
        addNotification(`Se reemplazaron ${count} coincidencia${count === 1 ? '' : 's'}`, 'success');
    }, [findQuery, searchMatches, content, replaceQuery, commitContent, addNotification]);

    // Apply all 26 Toolbar actions cleanly
    const handleToolbarAction = useCallback(
        (action: ToolbarAction) => {
            if (action === 'undo') {
                handleUndo();
                return;
            }
            if (action === 'redo') {
                handleRedo();
                return;
            }
            if (action === 'templates') {
                setTemplatesOpen(true);
                return;
            }
            if (action === 'find') {
                if (findOpen) {
                    setFindOpen(false);
                    textareaRef.current?.focus();
                } else {
                    openFindBar();
                }
                return;
            }
            if (action === 'shortcuts') {
                setShortcutsOpen(true);
                return;
            }

            const ta = textareaRef.current;
            if (!ta) return;

            const current = contentRef.current;
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            const selection = current.slice(start, end);
            const before = current.slice(0, start);
            const after = current.slice(end);

            let nextValue = current;
            let nextSelStart = start;
            let nextSelEnd = end;

            const applyWrap = (prefix: string, suffix: string, fallback: string) => {
                const inner = selection || fallback;
                nextValue = `${before}${prefix}${inner}${suffix}${after}`;
                if (selection) {
                    nextSelStart = start + prefix.length;
                    nextSelEnd = nextSelStart + inner.length;
                } else {
                    nextSelStart = start + prefix.length;
                    nextSelEnd = nextSelStart + fallback.length;
                }
            };

            const applyLinePrefix = (prefixFactory: (idx: number) => string, fallback: string) => {
                const lineStart = current.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
                const lineEndRaw = current.indexOf('\n', end);
                const lineEnd = lineEndRaw === -1 ? current.length : lineEndRaw;
                const block = current.slice(lineStart, lineEnd);

                if (!block && !selection) {
                    const prefix = prefixFactory(0);
                    nextValue = `${before}${prefix}${fallback}${after}`;
                    nextSelStart = start + prefix.length;
                    nextSelEnd = nextSelStart + fallback.length;
                    return;
                }

                const lines = block.split('\n');
                const updated = lines.map((line, idx) => `${prefixFactory(idx)}${line}`).join('\n');
                nextValue = `${current.slice(0, lineStart)}${updated}${current.slice(lineEnd)}`;
                nextSelStart = lineStart;
                nextSelEnd = lineStart + updated.length;
            };

            const insertBlock = (blockText: string, selectFrom?: number, selectLen?: number) => {
                const needsLeadingNewline = before.length > 0 && !before.endsWith('\n');
                const prefix = needsLeadingNewline ? '\n\n' : before.length > 0 && !before.endsWith('\n\n') ? '\n' : '';
                const suffix = after.length > 0 && !after.startsWith('\n') ? '\n\n' : '';
                const inserted = `${prefix}${blockText}${suffix}`;
                nextValue = `${before}${inserted}${after}`;
                if (selectFrom !== undefined && selectLen !== undefined) {
                    nextSelStart = start + prefix.length + selectFrom;
                    nextSelEnd = nextSelStart + selectLen;
                } else {
                    const pos = start + inserted.length;
                    nextSelStart = pos;
                    nextSelEnd = pos;
                }
            };

            switch (action) {
                case 'h1':
                    applyLinePrefix(() => '# ', 'Título principal');
                    break;
                case 'h2':
                    applyLinePrefix(() => '## ', 'Subtítulo de sección');
                    break;
                case 'h3':
                    applyLinePrefix(() => '### ', 'Encabezado de subsección');
                    break;
                case 'bold':
                    applyWrap('**', '**', 'texto en negrita');
                    break;
                case 'italic':
                    applyWrap('*', '*', 'texto en cursiva');
                    break;
                case 'strike':
                    applyWrap('~~', '~~', 'texto tachado');
                    break;
                case 'code-inline':
                    applyWrap('`', '`', 'código');
                    break;
                case 'sup':
                    applyWrap('<sup>', '</sup>', '2');
                    break;
                case 'sub':
                    applyWrap('<sub>', '</sub>', 'i');
                    break;
                case 'ul':
                    applyLinePrefix(() => '- ', 'Elemento de lista');
                    break;
                case 'ol':
                    applyLinePrefix((idx) => `${idx + 1}. `, 'Elemento numerado');
                    break;
                case 'checklist':
                    applyLinePrefix(() => '- [ ] ', 'Tarea pendiente');
                    break;
                case 'quote':
                    applyLinePrefix(() => '> ', 'Cita destacada');
                    break;
                case 'code': {
                    const inner = selection || 'const saludo = "Hola Markdown";';
                    const block = `\`\`\`typescript\n${inner}\n\`\`\``;
                    insertBlock(block, '```typescript\n'.length, inner.length);
                    break;
                }
                case 'table': {
                    const tableSnippet =
                        '| Columna 1 | Columna 2 | Columna 3 |\n| :--- | :---: | ---: |\n| Dato A | Valor B | 100 |\n| Dato C | Valor D | 200 |';
                    insertBlock(tableSnippet);
                    break;
                }
                case 'hr':
                    insertBlock('---');
                    break;
                case 'link': {
                    const label = selection || 'texto del enlace';
                    const placeholderUrl = 'https://ejemplo.com';
                    nextValue = `${before}[${label}](${placeholderUrl})${after}`;
                    nextSelStart = start + label.length + 3;
                    nextSelEnd = nextSelStart + placeholderUrl.length;
                    break;
                }
                case 'image': {
                    const alt = selection || 'descripción de la imagen';
                    const placeholderUrl = 'https://ejemplo.com/imagen.png';
                    nextValue = `${before}![${alt}](${placeholderUrl})${after}`;
                    nextSelStart = start + alt.length + 4;
                    nextSelEnd = nextSelStart + placeholderUrl.length;
                    break;
                }
                case 'math-inline':
                    applyWrap('$', '$', 'E = mc^2');
                    break;
                case 'math-block': {
                    const formula = selection || '\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)';
                    const block = `$$\n${formula}\n$$`;
                    insertBlock(block, '$$\n'.length, formula.length);
                    break;
                }
                case 'mermaid': {
                    const diagram =
                        selection ||
                        'flowchart LR\n    A["Inicio"] --> B["Proceso"]\n    B --> C["Resultado"]';
                    const block = `\`\`\`mermaid\n${diagram}\n\`\`\``;
                    insertBlock(block, '```mermaid\n'.length, diagram.length);
                    break;
                }
                default:
                    break;
            }

            commitContent(nextValue, nextSelStart, nextSelEnd);
            restoreTextareaSelection(nextSelStart, nextSelEnd);
            setSelectionMenu((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        },
        [
            handleUndo,
            handleRedo,
            setTemplatesOpen,
            findOpen,
            openFindBar,
            setShortcutsOpen,
            commitContent,
            restoreTextareaSelection,
        ]
    );

    // Handle keyboard shortcuts inside textarea
    const handleTextareaKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            const mod = e.ctrlKey || e.metaKey;
            const lowerKey = e.key.toLowerCase();

            if (mod && !e.shiftKey && !e.altKey) {
                if (lowerKey === 'b') {
                    e.preventDefault();
                    handleToolbarAction('bold');
                    return;
                }
                if (lowerKey === 'i') {
                    e.preventDefault();
                    handleToolbarAction('italic');
                    return;
                }
                if (lowerKey === 'k') {
                    e.preventDefault();
                    handleToolbarAction('link');
                    return;
                }
                if (lowerKey === 'e') {
                    e.preventDefault();
                    handleToolbarAction('code-inline');
                    return;
                }
                if (lowerKey === 'z') {
                    e.preventDefault();
                    handleUndo();
                    return;
                }
                if (lowerKey === 'y') {
                    e.preventDefault();
                    handleRedo();
                    return;
                }
                if (lowerKey === 'f') {
                    e.preventDefault();
                    openFindBar();
                    return;
                }
                if (e.key === '/') {
                    e.preventDefault();
                    setShortcutsOpen(true);
                    return;
                }
            }

            if (mod && e.shiftKey && !e.altKey) {
                if (lowerKey === 'z') {
                    e.preventDefault();
                    handleRedo();
                    return;
                }
                if (lowerKey === 'm') {
                    e.preventDefault();
                    handleToolbarAction('math-block');
                    return;
                }
                if (lowerKey === 'd') {
                    e.preventDefault();
                    handleToolbarAction('mermaid');
                    return;
                }
            }

            if (e.key === 'Tab') {
                e.preventDefault();
                const ta = e.currentTarget;
                const start = ta.selectionStart;
                const end = ta.selectionEnd;
                const current = ta.value;

                if (!e.shiftKey && start === end) {
                    const nextVal = `${current.slice(0, start)}  ${current.slice(end)}`;
                    commitContent(nextVal, start + 2, start + 2);
                    restoreTextareaSelection(start + 2, start + 2);
                    return;
                }

                const lineStart = current.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
                const lineEndRaw = current.indexOf('\n', end);
                const lineEnd = lineEndRaw === -1 ? current.length : lineEndRaw;
                const block = current.slice(lineStart, lineEnd);
                const lines = block.split('\n');

                if (e.shiftKey) {
                    let removedFirst = 0;
                    let removedTotal = 0;
                    const outdented = lines
                        .map((line, idx) => {
                            const match = line.match(/^( {1,2}|\t)/);
                            if (!match) return line;
                            const len = match[1].length;
                            if (idx === 0) removedFirst = len;
                            removedTotal += len;
                            return line.slice(len);
                        })
                        .join('\n');
                    const nextVal = `${current.slice(0, lineStart)}${outdented}${current.slice(lineEnd)}`;
                    const nextStart = Math.max(lineStart, start - removedFirst);
                    const nextEnd = Math.max(nextStart, end - removedTotal);
                    commitContent(nextVal, nextStart, nextEnd);
                    restoreTextareaSelection(nextStart, nextEnd);
                } else {
                    const indented = lines.map((line) => `  ${line}`).join('\n');
                    const nextVal = `${current.slice(0, lineStart)}${indented}${current.slice(lineEnd)}`;
                    const nextStart = start + 2;
                    const nextEnd = end + lines.length * 2;
                    commitContent(nextVal, nextStart, nextEnd);
                    restoreTextareaSelection(nextStart, nextEnd);
                }
                return;
            }

            if (e.key === 'Escape') {
                if (lightbox) {
                    e.preventDefault();
                    setLightbox(null);
                    return;
                }
                if (findOpen) {
                    e.preventDefault();
                    setFindOpen(false);
                    return;
                }
                if (viewMode === 'hybrid' && isHybridEditing) {
                    e.preventDefault();
                    setIsHybridEditing(false);
                }
            }
        },
        [
            handleToolbarAction,
            handleUndo,
            handleRedo,
            openFindBar,
            setShortcutsOpen,
            commitContent,
            restoreTextareaSelection,
            lightbox,
            findOpen,
            viewMode,
            isHybridEditing,
        ]
    );

    // Global Ctrl/Cmd+/ and Ctrl/Cmd+F when editor is active in hybrid preview
    useEffect(() => {
        const onGlobalKeyDown = (e: KeyboardEvent) => {
            const mod = e.ctrlKey || e.metaKey;
            if (mod && e.key === '/') {
                e.preventDefault();
                setShortcutsOpen(true);
            }
        };
        window.addEventListener('keydown', onGlobalKeyDown);
        return () => window.removeEventListener('keydown', onGlobalKeyDown);
    }, [setShortcutsOpen]);

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const ta = e.target;
        commitContent(ta.value, ta.selectionStart, ta.selectionEnd);
        if (typewriterMode) {
            centerCaretInTextarea();
        }
    };

    const handleCopyMarkdown = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedMarkdown(true);
            addNotification('Markdown copiado al portapapeles', 'success');
            setTimeout(() => setCopiedMarkdown(false), 1800);
        } catch {
            addNotification('No se pudo copiar el contenido al portapapeles', 'error');
        }
    };

    // Jump to heading in both Preview (smooth scroll) and Editor (cursor line)
    const handleTocJump = useCallback(
        (heading: MarkdownHeading) => {
            const previewRoot = previewContentRef.current;
            if (previewRoot) {
                const targetEl = previewRoot.querySelector<HTMLElement>(
                    `#${escapeSelectorId(heading.id)}`
                );
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }

            const offset = getOffsetForLine(contentRef.current, heading.line);
            const ta = textareaRef.current;
            if (ta) {
                if (isDesktop || mobileTab === 'editor') {
                    ta.focus();
                }
                ta.setSelectionRange(offset, offset);
                scrollTextareaToOffset(offset);
                setCursor(getCursorCoordinates(contentRef.current, offset));
            }

            if (!isDesktop) {
                setTocOpen(false);
            }
        },
        [scrollTextareaToOffset, isDesktop, mobileTab, setTocOpen]
    );

    const handleSplitPointerDown = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            if (e.button !== 0 || !isDesktop) return;
            const container = splitContainerRef.current;
            if (!container) return;

            e.preventDefault();
            splitDragCleanupRef.current?.();

            const startX = e.clientX;
            let hasDragged = false;
            let latestRatio = effectiveSplitRatio;

            const previousCursor = document.body.style.cursor;
            const previousUserSelect = document.body.style.userSelect;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';

            const computeRatio = (clientX: number): number => {
                const rect = container.getBoundingClientRect();
                if (rect.width <= 0) return latestRatio;
                const pct = ((clientX - rect.left) / rect.width) * 100;
                return Math.round(Math.min(80, Math.max(20, pct)) * 10) / 10;
            };

            const onPointerMove = (moveEvent: PointerEvent) => {
                if (!hasDragged) {
                    if (Math.abs(moveEvent.clientX - startX) < 2) return;
                    hasDragged = true;
                    setIsResizingSplit(true);
                }
                latestRatio = computeRatio(moveEvent.clientX);
                setDragSplitRatio(latestRatio);
            };

            const cleanup = () => {
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerEnd);
                window.removeEventListener('pointercancel', onPointerEnd);
                document.body.style.cursor = previousCursor;
                document.body.style.userSelect = previousUserSelect;
                splitDragCleanupRef.current = null;
            };

            const onPointerEnd = () => {
                cleanup();
                if (hasDragged) {
                    setIsResizingSplit(false);
                    setDragSplitRatio(null);
                    setSplitRatio(latestRatio);
                }
            };

            splitDragCleanupRef.current = cleanup;
            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerEnd);
            window.addEventListener('pointercancel', onPointerEnd);
        },
        [isDesktop, effectiveSplitRatio, setSplitRatio]
    );

    const handleSplitKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (!isDesktop) return;
            const step = e.shiftKey ? 5 : 2;
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setSplitRatio(effectiveSplitRatio - step);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                setSplitRatio(effectiveSplitRatio + step);
            } else if (e.key === 'Home') {
                e.preventDefault();
                setSplitRatio(20);
            } else if (e.key === 'End') {
                e.preventDefault();
                setSplitRatio(80);
            } else if (e.key === 'Enter' || e.key === '0') {
                e.preventDefault();
                setSplitRatio(50);
            }
        },
        [isDesktop, effectiveSplitRatio, setSplitRatio]
    );

    const viewModeButtons: { mode: ViewMode; label: string }[] = [
        { mode: 'split', label: 'Dividida' },
        { mode: 'hybrid', label: 'Híbrida' },
        { mode: 'preview', label: 'Previa' },
    ];

    const renderEditorPane = (isHybridPane: boolean) => (
        <div
            className={cn(
                'flex-1 min-w-0 min-h-0 flex flex-col bg-card/10 transition-all',
                focusMode && 'bg-background'
            )}
        >
            {/* Editor Toolbar + Quick Controls */}
            <div
                className={cn(
                    'flex items-center gap-2 border-b border-border bg-background/80 px-2 sm:px-3 py-1.5 transition-opacity duration-300',
                    focusMode && 'opacity-45 hover:opacity-100 focus-within:opacity-100'
                )}
            >
                <Toolbar
                    onAction={handleToolbarAction}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    className="flex-1 min-w-0"
                />

                <div className="flex items-center gap-1.5 shrink-0">
                    {isHybridPane && (
                        <button
                            type="button"
                            onClick={() => setIsHybridEditing(false)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                            title="Volver a la vista previa (Escape)"
                        >
                            <Eye size={14} aria-hidden="true" />
                            <span className="hidden sm:inline">Ver Vista Previa</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleCopyMarkdown}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                        aria-label={copiedMarkdown ? 'Copiado Markdown' : 'Copiar MD (Markdown)'}
                        title="Copiar Markdown"
                    >
                        {copiedMarkdown ? (
                            <Check size={14} className="text-emerald-500" aria-hidden="true" />
                        ) : (
                            <Copy size={14} aria-hidden="true" />
                        )}
                        <span className="hidden xl:inline">
                            {copiedMarkdown ? 'Copiado' : 'Copiar MD'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Find & Replace Bar */}
            {findOpen && (
                <div
                    role="region"
                    aria-label="Buscar y reemplazar"
                    className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/40 px-3 py-2 text-xs"
                >
                    <div className="flex items-center gap-1.5 flex-1 min-w-[160px]">
                        <Search size={14} className="text-muted-foreground shrink-0" aria-hidden="true" />
                        <input
                            ref={findInputRef}
                            type="text"
                            value={findQuery}
                            onChange={(e) => {
                                setFindQuery(e.target.value);
                                setActiveMatchIndex(0);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    jumpToMatch(e.shiftKey ? safeActiveMatchIndex - 1 : safeActiveMatchIndex + 1);
                                } else if (e.key === 'Escape') {
                                    e.preventDefault();
                                    setFindOpen(false);
                                    textareaRef.current?.focus();
                                }
                            }}
                            placeholder="Buscar..."
                            aria-label="Buscar texto"
                            className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
                        <input
                            type="text"
                            value={replaceQuery}
                            onChange={(e) => setReplaceQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    e.preventDefault();
                                    setFindOpen(false);
                                    textareaRef.current?.focus();
                                }
                            }}
                            placeholder="Reemplazar por..."
                            aria-label="Reemplazar con"
                            className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            type="button"
                            onClick={() => setCaseSensitive((prev) => !prev)}
                            aria-pressed={caseSensitive}
                            title="Coincidir mayúsculas y minúsculas"
                            className={cn(
                                'rounded-md border px-2 py-1 font-mono text-[11px] font-bold transition-colors cursor-pointer',
                                caseSensitive
                                    ? 'border-accent bg-accent/15 text-accent-text'
                                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
                            )}
                        >
                            Aa
                        </button>

                        <span className="px-1.5 text-[11px] text-muted-foreground tabular-nums">
                            {findQuery
                                ? searchMatches.length > 0
                                    ? `${safeActiveMatchIndex + 1} de ${searchMatches.length}`
                                    : '0 de 0'
                                : '—'}
                        </span>

                        <button
                            type="button"
                            onClick={() => jumpToMatch(safeActiveMatchIndex - 1)}
                            disabled={searchMatches.length === 0}
                            aria-label="Coincidencia anterior"
                            className="rounded-md border border-border bg-background p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 cursor-pointer"
                        >
                            <ChevronUp size={14} />
                        </button>

                        <button
                            type="button"
                            onClick={() => jumpToMatch(safeActiveMatchIndex + 1)}
                            disabled={searchMatches.length === 0}
                            aria-label="Siguiente coincidencia"
                            className="rounded-md border border-border bg-background p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 cursor-pointer"
                        >
                            <ChevronDown size={14} />
                        </button>

                        <button
                            type="button"
                            onClick={handleReplaceCurrent}
                            disabled={searchMatches.length === 0}
                            className="rounded-md border border-border bg-background px-2 py-1 font-medium text-foreground hover:bg-muted disabled:opacity-40 cursor-pointer"
                        >
                            Reemplazar
                        </button>

                        <button
                            type="button"
                            onClick={handleReplaceAll}
                            disabled={searchMatches.length === 0}
                            className="rounded-md border border-border bg-background px-2 py-1 font-medium text-foreground hover:bg-muted disabled:opacity-40 cursor-pointer"
                        >
                            Todos
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setFindOpen(false);
                                textareaRef.current?.focus();
                            }}
                            aria-label="Cerrar buscar y reemplazar"
                            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Textarea Surface */}
            <div className="relative flex-1 min-h-0 flex flex-col">
                {focusMode && (
                    <div className="pointer-events-none absolute top-2.5 right-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent-text">
                        <Focus size={12} aria-hidden="true" />
                        <span>Focus Mode Activo</span>
                    </div>
                )}

                {typewriterMode && (
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 border-t border-dashed border-accent/25"
                    />
                )}

                {/* Floating Selection Bubble Menu */}
                {selectionMenu.visible && (
                    <div
                        role="toolbar"
                        aria-label="Formato rápido de selección"
                        style={{ top: `${selectionMenu.top}px` }}
                        onMouseDown={(e) => e.preventDefault()}
                        className="absolute left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-full border border-border bg-card/95 px-2 py-1 shadow-lg backdrop-blur-md"
                    >
                        <button
                            type="button"
                            onClick={() => handleToolbarAction('bold')}
                            aria-label="Negrita"
                            title="Negrita (Ctrl+B)"
                            className="rounded-full p-1.5 text-foreground hover:bg-muted cursor-pointer"
                        >
                            <Bold size={13} />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleToolbarAction('italic')}
                            aria-label="Cursiva"
                            title="Cursiva (Ctrl+I)"
                            className="rounded-full p-1.5 text-foreground hover:bg-muted cursor-pointer"
                        >
                            <Italic size={13} />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleToolbarAction('code-inline')}
                            aria-label="Código en línea"
                            title="Código en línea (Ctrl+E)"
                            className="rounded-full p-1.5 text-foreground hover:bg-muted cursor-pointer"
                        >
                            <Code size={13} />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleToolbarAction('link')}
                            aria-label="Insertar enlace"
                            title="Enlace (Ctrl+K)"
                            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-foreground hover:bg-muted cursor-pointer"
                        >
                            <Link2 size={13} />
                            <span>Enlace</span>
                        </button>
                    </div>
                )}

                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleTextareaChange}
                    onKeyDown={handleTextareaKeyDown}
                    onKeyUp={() => {
                        syncSelectionState();
                        if (typewriterMode) centerCaretInTextarea();
                    }}
                    onClick={() => {
                        syncSelectionState();
                        if (typewriterMode) centerCaretInTextarea();
                    }}
                    onSelect={syncSelectionState}
                    onBlur={() =>
                        setSelectionMenu((prev) => (prev.visible ? { ...prev, visible: false } : prev))
                    }
                    onScroll={handleEditorScroll}
                    aria-label={fileName ? `Editor Markdown para ${fileName}` : 'Editor Markdown'}
                    spellCheck={false}
                    style={
                        typewriterMode
                            ? { paddingTop: '40vh', paddingBottom: '40vh' }
                            : undefined
                    }
                    className={cn(
                        'w-full flex-1 min-h-0 resize-none border-none bg-transparent font-mono text-sm sm:text-[15px] leading-relaxed text-foreground outline-none focus:ring-0 overflow-y-auto opacity-100',
                        !typewriterMode && 'p-4 sm:p-6',
                        typewriterMode && 'px-4 sm:px-6',
                        focusMode && 'ring-1 ring-inset ring-accent/25 rounded-lg'
                    )}
                    placeholder="Escribe tu Markdown aquí..."
                />
            </div>
        </div>
    );

    const renderPreviewPane = (allowHybridEnter: boolean) => (
        <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-background">
            {allowHybridEnter && (
                <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/20 px-4 py-2">
                    <span className="text-xs text-muted-foreground">
                        Modo Híbrido — haz doble clic en el documento o pulsa editar
                    </span>
                    <button
                        type="button"
                        onClick={() => {
                            setIsHybridEditing(true);
                            requestAnimationFrame(() => textareaRef.current?.focus());
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        <Pencil size={13} aria-hidden="true" />
                        <span>Editar documento</span>
                    </button>
                </div>
            )}

            {renderError && (
                <div
                    role="alert"
                    className="mx-4 mt-3 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                >
                    <AlertTriangle size={14} className="shrink-0" aria-hidden="true" />
                    <span>No se pudo actualizar la vista previa: {renderError}</span>
                </div>
            )}

            <div
                ref={previewScrollRef}
                onScroll={handlePreviewScroll}
                onDoubleClick={
                    allowHybridEnter
                        ? () => {
                              setIsHybridEditing(true);
                              requestAnimationFrame(() => textareaRef.current?.focus());
                          }
                        : undefined
                }
                className={cn(
                    'flex-1 min-h-0 overflow-y-auto px-4 py-6 sm:px-8',
                    allowHybridEnter && 'cursor-text'
                )}
            >
                <div
                    ref={previewContentRef}
                    className={cn(
                        'prose dark:prose-invert prose-slate prose-base max-w-none text-foreground',
                        viewMode !== 'split' && 'mx-auto max-w-4xl'
                    )}
                />
            </div>
        </div>
    );

    return (
        <div className="flex-1 w-full h-full min-h-0 flex flex-col overflow-hidden bg-background">
            {/* Mobile Tab Switcher for Split Mode */}
            {viewMode === 'split' && (
                <div
                    role="tablist"
                    aria-label="Cambiar entre editor y vista previa"
                    className="flex items-center gap-1.5 border-b border-border bg-muted/30 px-3 py-1.5 md:hidden"
                >
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mobileTab === 'editor'}
                        onClick={() => setMobileTab('editor')}
                        className={cn(
                            'flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors cursor-pointer',
                            mobileTab === 'editor'
                                ? 'bg-accent text-accent-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                    >
                        Editor
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mobileTab === 'preview'}
                        onClick={() => setMobileTab('preview')}
                        className={cn(
                            'flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors cursor-pointer',
                            mobileTab === 'preview'
                                ? 'bg-accent text-accent-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                    >
                        Vista Previa
                    </button>
                </div>
            )}

            {/* Main Workspace + Optional TOC Outline */}
            <div className="flex-1 min-h-0 flex overflow-hidden relative">
                {viewMode === 'split' && (
                    <div
                        ref={splitContainerRef}
                        className="flex-1 min-w-0 min-h-0 flex flex-col md:flex-row overflow-hidden"
                    >
                        <div
                            style={
                                isDesktop
                                    ? {
                                          flexGrow: effectiveSplitRatio,
                                          flexShrink: 1,
                                          flexBasis: '0%',
                                      }
                                    : undefined
                            }
                            className={cn(
                                'min-w-0 min-h-0 overflow-hidden',
                                !isDesktop && 'flex-1',
                                mobileTab === 'editor' ? 'flex' : 'hidden md:flex'
                            )}
                        >
                            {renderEditorPane(false)}
                        </div>

                        {/* Movable Desktop Split Divider */}
                        <div
                            role="separator"
                            tabIndex={0}
                            aria-orientation="vertical"
                            aria-label="Redimensionar editor y vista previa"
                            aria-valuemin={20}
                            aria-valuemax={80}
                            aria-valuenow={Math.round(effectiveSplitRatio)}
                            title="Arrastra para redimensionar · Doble clic para centrar (50/50)"
                            onPointerDown={handleSplitPointerDown}
                            onDoubleClick={() => {
                                setDragSplitRatio(null);
                                setSplitRatio(50);
                            }}
                            onKeyDown={handleSplitKeyDown}
                            className={cn(
                                'hidden md:flex w-2 shrink-0 items-center justify-center cursor-col-resize select-none touch-none transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                                isResizingSplit ? 'bg-accent/15' : 'hover:bg-accent/10'
                            )}
                        >
                            <div
                                aria-hidden="true"
                                className={cn(
                                    'relative h-full w-px transition-colors',
                                    isResizingSplit
                                        ? 'bg-accent'
                                        : 'bg-border group-hover:bg-accent/70'
                                )}
                            >
                                <span
                                    className={cn(
                                        'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-9 w-1 rounded-full transition-colors',
                                        isResizingSplit
                                            ? 'bg-accent'
                                            : 'bg-muted-foreground/35 group-hover:bg-accent'
                                    )}
                                />
                            </div>
                        </div>

                        <div
                            style={
                                isDesktop
                                    ? {
                                          flexGrow: 100 - effectiveSplitRatio,
                                          flexShrink: 1,
                                          flexBasis: '0%',
                                      }
                                    : undefined
                            }
                            className={cn(
                                'min-w-0 min-h-0 overflow-hidden',
                                !isDesktop && 'flex-1',
                                mobileTab === 'preview' ? 'flex' : 'hidden md:flex'
                            )}
                        >
                            {renderPreviewPane(false)}
                        </div>
                    </div>
                )}

                {viewMode === 'hybrid' && (
                    <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
                        {isHybridEditing ? renderEditorPane(true) : renderPreviewPane(true)}
                    </div>
                )}

                {viewMode === 'preview' && (
                    <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
                        {renderPreviewPane(false)}
                    </div>
                )}

                {/* Table of Contents Slide-In Outline Panel */}
                {tocOpen && (
                    <>
                        <div
                            onClick={() => setTocOpen(false)}
                            className="fixed inset-0 z-20 bg-black/40 md:hidden"
                            aria-hidden="true"
                        />
                        <aside
                            aria-label="Tabla de contenidos"
                            className="fixed inset-y-0 right-0 z-30 w-64 max-w-[82vw] md:static md:z-auto md:w-64 shrink-0 border-l border-border bg-card flex flex-col overflow-hidden shadow-xl md:shadow-none"
                        >
                            <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    <ListTree size={14} className="text-accent" aria-hidden="true" />
                                    <span>Contenidos</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setTocOpen(false)}
                                    aria-label="Cerrar tabla de contenidos"
                                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                            <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
                                {headings.length === 0 ? (
                                    <p className="px-2 py-4 text-xs text-muted-foreground">
                                        Sin encabezados H1–H4 todavía.
                                    </p>
                                ) : (
                                    headings.map((heading) => (
                                        <button
                                            key={`${heading.id}-${heading.line}`}
                                            type="button"
                                            onClick={() => handleTocJump(heading)}
                                            style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
                                            className="w-full rounded-md py-1.5 pr-2 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors truncate cursor-pointer"
                                            title={`Línea ${heading.line}: ${heading.text}`}
                                        >
                                            <span className="mr-1.5 font-mono text-[10px] opacity-60">
                                                H{heading.level}
                                            </span>
                                            <span>{heading.text}</span>
                                        </button>
                                    ))
                                )}
                            </nav>
                        </aside>
                    </>
                )}
            </div>

            {/* Bottom Status Bar */}
            <footer
                aria-label="Estado del documento"
                className={cn(
                    'flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-border bg-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground transition-opacity duration-300',
                    focusMode && 'opacity-50 hover:opacity-100 focus-within:opacity-100'
                )}
            >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
                    <span className="font-mono tabular-nums">
                        Ln {cursor.line}, Col {cursor.column}
                    </span>
                    <span className="tabular-nums">{stats.words} palabras</span>
                    <span className="hidden sm:inline tabular-nums">{stats.chars} caracteres</span>
                    <span className="hidden md:inline tabular-nums">{stats.lines} líneas</span>
                    <span className="hidden lg:inline tabular-nums">~{stats.readingMinutes} min lectura</span>
                    <span
                        className={cn(
                            'inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium tabular-nums',
                            isHeavyFile
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : 'text-muted-foreground'
                        )}
                        title={
                            isHeavyFile
                                ? 'Documento superior a 2 MB: considera dividirlo con Binder'
                                : 'Tamaño exacto UTF-8'
                        }
                    >
                        {isHeavyFile && <AlertTriangle size={11} aria-hidden="true" />}
                        <span>{formatBytes(stats.bytes)}</span>
                    </span>
                    <span className="hidden sm:inline text-emerald-600 dark:text-emerald-400 font-medium">
                        Guardado local ✓
                    </span>
                    {typewriterMode && (
                        <span className="hidden xl:inline-flex items-center gap-1 text-accent-text font-medium">
                            <Type size={11} aria-hidden="true" />
                            <span>Typewriter</span>
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {viewMode === 'split' && (
                        <button
                            type="button"
                            onClick={() => setSyncScroll(!syncScroll)}
                            aria-pressed={syncScroll}
                            className={cn(
                                'hidden md:inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer',
                                syncScroll
                                    ? 'border-accent/40 bg-accent/10 text-accent-text'
                                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
                            )}
                            title="Sincronizar desplazamiento entre Editor y Vista Previa"
                        >
                            <Columns2 size={12} aria-hidden="true" />
                            <span>{syncScroll ? 'Sync Scroll' : 'Sync Off'}</span>
                        </button>
                    )}

                    <div
                        role="group"
                        aria-label="Modo de visualización"
                        className="inline-flex items-center rounded-lg border border-border bg-background p-0.5"
                    >
                        {viewModeButtons.map((btn) => (
                            <button
                                key={btn.mode}
                                type="button"
                                aria-pressed={viewMode === btn.mode}
                                onClick={() => setViewMode(btn.mode)}
                                className={cn(
                                    'rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors cursor-pointer',
                                    viewMode === btn.mode
                                        ? 'bg-accent text-accent-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
            </footer>

            {/* Mermaid Lightbox Modal */}
            {lightbox && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Vista ampliada de diagrama Mermaid"
                    onClick={() => setLightbox(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-6 backdrop-blur-xs"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                            <span className="text-sm font-bold text-foreground">
                                Diagrama Mermaid — Vista Ampliada
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setLightboxZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))
                                    }
                                    aria-label="Alejar diagrama"
                                    className="rounded-lg border border-border bg-background p-1.5 text-foreground hover:bg-muted cursor-pointer"
                                >
                                    <ZoomOut size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLightboxZoom(1)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold tabular-nums text-foreground hover:bg-muted cursor-pointer"
                                    title="Restablecer zoom al 100%"
                                >
                                    <RotateCcw size={13} aria-hidden="true" />
                                    <span>{Math.round(lightboxZoom * 100)}%</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setLightboxZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))
                                    }
                                    aria-label="Acercar diagrama"
                                    className="rounded-lg border border-border bg-background p-1.5 text-foreground hover:bg-muted cursor-pointer"
                                >
                                    <ZoomIn size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        void navigator.clipboard.writeText(lightbox.svg).then(() => {
                                            addNotification('SVG copiado al portapapeles', 'success');
                                        });
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted cursor-pointer"
                                >
                                    <Copy size={13} aria-hidden="true" />
                                    <span>Copiar SVG</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        downloadSvgFile(lightbox.svg, fileName);
                                        addNotification('Diagrama SVG descargado', 'success');
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-accent-foreground hover:opacity-90 cursor-pointer"
                                >
                                    <Download size={13} aria-hidden="true" />
                                    <span>Descargar .svg</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLightbox(null)}
                                    aria-label="Cerrar vista ampliada"
                                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-muted/20">
                            <div
                                ref={lightboxSvgRef}
                                style={{
                                    transform: `scale(${lightboxZoom})`,
                                    transformOrigin: 'center center',
                                }}
                                className="transition-transform duration-150"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
