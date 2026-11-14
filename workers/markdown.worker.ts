import {
    processMarkdown,
    type MarkdownWorkerRequest,
    type MarkdownWorkerResponse,
} from '../lib/markdown';

self.onmessage = async (event: MessageEvent<MarkdownWorkerRequest>) => {
    const { id, content } = event.data;
    try {
        const html = await processMarkdown(content);
        const response: MarkdownWorkerResponse = { id, html };
        self.postMessage(response);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Error al procesar Markdown en el worker';
        const response: MarkdownWorkerResponse = { id, error: message };
        self.postMessage(response);
    }
};
