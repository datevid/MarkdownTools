import type {
    MarkdownWorkerRequest,
    MarkdownWorkerResponse,
} from './markdown';

function processMarkdownFallback(content: string): Promise<string> {
    return import('./markdown').then(({ processMarkdown }) => processMarkdown(content));
}

/**
 * Options for asynchronous Markdown rendering in the Web Worker.
 */
export interface RenderMarkdownOptions {
    signal?: AbortSignal;
    timeoutMs?: number;
}

interface PendingRequest {
    content: string;
    resolve: (html: string) => void;
    reject: (reason: unknown) => void;
    timeoutId: ReturnType<typeof setTimeout>;
    cleanupAbort: () => void;
}

const DEFAULT_TIMEOUT_MS = 10_000;

let workerInstance: Worker | null = null;
let workerDisabled = false;
let nextRequestId = 1;
const pendingRequests = new Map<number, PendingRequest>();

function createAbortError(): Error {
    if (typeof DOMException !== 'undefined') {
        return new DOMException('Renderizado de Markdown cancelado', 'AbortError');
    }
    const err = new Error('Renderizado de Markdown cancelado');
    err.name = 'AbortError';
    return err;
}

function settlePendingWithFallback(id: number, entry: PendingRequest): void {
    clearTimeout(entry.timeoutId);
    entry.cleanupAbort();
    pendingRequests.delete(id);

    processMarkdownFallback(entry.content).then(entry.resolve, entry.reject);
}

function resetWorkerAndFallbackAll(): void {
    if (workerInstance) {
        workerInstance.terminate();
        workerInstance = null;
    }
    workerDisabled = true;

    const entries = Array.from(pendingRequests.entries());
    pendingRequests.clear();
    for (const [id, entry] of entries) {
        settlePendingWithFallback(id, entry);
    }
}

function getOrCreateWorker(): Worker | null {
    if (workerDisabled || typeof window === 'undefined' || typeof Worker === 'undefined') {
        return null;
    }

    if (workerInstance) {
        return workerInstance;
    }

    try {
        const worker = new Worker(
            new URL('../workers/markdown.worker.ts', import.meta.url)
        );

        worker.onmessage = (event: MessageEvent<MarkdownWorkerResponse>) => {
            const { id, html, error } = event.data;
            const entry = pendingRequests.get(id);
            if (!entry) return;

            clearTimeout(entry.timeoutId);
            entry.cleanupAbort();
            pendingRequests.delete(id);

            if (typeof html === 'string' && !error) {
                entry.resolve(html);
                return;
            }

            processMarkdownFallback(entry.content).then(entry.resolve, entry.reject);
        };

        worker.onerror = () => {
            resetWorkerAndFallbackAll();
        };

        worker.onmessageerror = () => {
            resetWorkerAndFallbackAll();
        };

        workerInstance = worker;
        return workerInstance;
    } catch {
        workerDisabled = true;
        return null;
    }
}

/**
 * Render Markdown asynchronously via a lazy singleton Web Worker with request-ID correlation,
 * AbortSignal cancellation, timeout handling, and automatic main-thread fallback.
 */
export function renderMarkdownAsync(
    content: string,
    options: RenderMarkdownOptions = {}
): Promise<string> {
    const { signal, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

    if (signal?.aborted) {
        return Promise.reject(createAbortError());
    }

    const worker = getOrCreateWorker();
    if (!worker) {
        return processMarkdownFallback(content);
    }

    const id = nextRequestId++;

    return new Promise<string>((resolve, reject) => {
        const onAbort = () => {
            const entry = pendingRequests.get(id);
            if (!entry) return;
            clearTimeout(entry.timeoutId);
            pendingRequests.delete(id);
            entry.cleanupAbort();
            reject(createAbortError());
        };

        const cleanupAbort = () => {
            signal?.removeEventListener('abort', onAbort);
        };

        const timeoutId = setTimeout(() => {
            if (!pendingRequests.has(id)) return;
            resetWorkerAndFallbackAll();
        }, timeoutMs);

        pendingRequests.set(id, {
            content,
            resolve,
            reject,
            timeoutId,
            cleanupAbort,
        });

        if (signal) {
            signal.addEventListener('abort', onAbort, { once: true });
        }

        try {
            const payload: MarkdownWorkerRequest = { id, content };
            worker.postMessage(payload);
        } catch {
            if (pendingRequests.has(id)) {
                resetWorkerAndFallbackAll();
            }
        }
    });
}

/**
 * Create a latest-wins Markdown renderer that cancels superseded in-flight render requests.
 */
export function createLatestMarkdownRenderer() {
    let activeController: AbortController | null = null;

    return {
        render(content: string, timeoutMs?: number): Promise<string> {
            if (activeController) {
                activeController.abort();
            }
            const controller = new AbortController();
            activeController = controller;
            return renderMarkdownAsync(content, {
                signal: controller.signal,
                timeoutMs,
            });
        },
        cancel(): void {
            if (activeController) {
                activeController.abort();
                activeController = null;
            }
        },
    };
}

/**
 * Terminate the singleton Markdown Web Worker and settle any pending requests on the main thread.
 */
export function terminateMarkdownWorker(): void {
    if (workerInstance) {
        workerInstance.terminate();
        workerInstance = null;
    }

    const entries = Array.from(pendingRequests.entries());
    pendingRequests.clear();
    for (const [id, entry] of entries) {
        settlePendingWithFallback(id, entry);
    }
}
