import { processMarkdown } from '../lib/markdown';

self.onmessage = async (e: MessageEvent) => {
    const { content, id } = e.data;
    console.log('[Worker] Processing content for id:', id);
    try {
        const html = await processMarkdown(content);
        console.log('[Worker] Processing complete for id:', id);
        self.postMessage({ html, id });
    } catch (error) {
        console.error('[Worker] Error processing markdown:', error);
        self.postMessage({ error: (error as Error).message, id });
    }
};
