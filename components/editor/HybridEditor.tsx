'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { processMarkdown } from '@/lib/markdown';
import { Copy, Check } from 'lucide-react';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';
import Toolbar from './Toolbar';

interface HybridEditorProps {
    initialValue: string;
    onChange?: (value: string) => void;
}

export default function HybridEditor({ initialValue, onChange }: HybridEditorProps) {
    const [content, setContent] = useState(initialValue);
    const [html, setHtml] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [copiedMarkdown, setCopiedMarkdown] = useState(false);
    const [copiedHtml, setCopiedHtml] = useState(false);
    const [previewKey, setPreviewKey] = useState(0);
    const { focusMode, typewriterMode, splitView } = useAppStore();
    const { theme, resolvedTheme } = useTheme();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const editing = splitView || isEditing;

    // Initialize mermaid when theme changes
    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: resolvedTheme === 'dark' ? 'dark' : 'default',
            securityLevel: 'loose',
            fontFamily: 'Inter, sans-serif',
            themeVariables: {
                darkMode: resolvedTheme === 'dark',
                primaryColor: resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb',
            }
        });
    }, [resolvedTheme]);

    // Force re-render after printing to restore Mermaid diagrams
    useEffect(() => {
        const handleAfterPrint = () => {
            setPreviewKey(prev => prev + 1);
        };
        window.addEventListener('afterprint', handleAfterPrint);
        return () => window.removeEventListener('afterprint', handleAfterPrint);
    }, []);

    // Re-render diagrams when HTML content changes
    useEffect(() => {
        const renderMermaid = async () => {
            if (typeof window !== 'undefined' && html) {
                try {
                    // Slight delay to ensure DOM is updated via dangerouslySetInnerHTML
                    setTimeout(async () => {
                        const elements = document.querySelectorAll('.mermaid');
                        if (elements.length > 0) {
                            // Clear processed state to force re-render
                            elements.forEach(el => {
                                el.removeAttribute('data-processed');
                            });
                            await mermaid.run({
                                querySelector: '.mermaid',
                                suppressErrors: true
                            });
                        }
                    }, 100);
                } catch (err) {
                    console.error('Mermaid render error:', err);
                }
            }
        };
        renderMermaid();
    }, [html, resolvedTheme, previewKey]);

    useEffect(() => {
        const render = async () => {
            try {
                const result = await processMarkdown(content);
                setHtml(result);
            } catch (err) {
                console.error('Render error:', err);
            }
        };
        render();
    }, [content]);

    useEffect(() => {
        if ((isEditing || splitView) && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isEditing, splitView]);

    // Typewriter Mode logic
    useEffect(() => {
        if (typewriterMode && (editing) && textareaRef.current) {
            const textarea = textareaRef.current;
            const container = textarea.parentElement;
            if (!container) return;

            const handleInput = () => {
                const { selectionStart } = textarea;
                const textBeforeCursor = textarea.value.substring(0, selectionStart);
                const linesBeforeCursor = textBeforeCursor.split('\n').length;
                const lineHeight = 28; // matches leading-relaxed approx
                const cursorY = linesBeforeCursor * lineHeight;

                // Center cursor in the scrollable container
                const containerHeight = container.clientHeight;
                const targetScroll = cursorY - containerHeight / 2 + 40;

                container.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                });
            };

            textarea.addEventListener('input', handleInput);
            textarea.addEventListener('click', handleInput); // Also center on click
            textarea.addEventListener('keyup', handleInput); // Center on arrow keys

            return () => {
                textarea.removeEventListener('input', handleInput);
                textarea.removeEventListener('click', handleInput);
                textarea.removeEventListener('keyup', handleInput);
            };
        }
    }, [typewriterMode, editing]);

    const handleDoubleClick = () => {
        if (!splitView) {
            setIsEditing(true);
        }
    };

    const handleBlur = () => {
        if (!splitView) {
            setIsEditing(false);
        }
    };

    const handleAction = (actionId: string) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selection = content.substring(start, end);

        let before = content.substring(0, start);
        let after = content.substring(end);
        let newContent = content;
        let newCursorPos = start;

        const wrap = (prefix: string, suffix: string = prefix) => {
            newContent = before + prefix + (selection || 'texto') + suffix + after;
            newCursorPos = selection ? start + prefix.length + selection.length + suffix.length : start + prefix.length;
        };

        const prepend = (prefix: string) => {
            const lines = (selection || 'Línea de texto').split('\n');
            const prepended = lines.map(line => prefix + line).join('\n');
            newContent = before + prepended + after;
            newCursorPos = start + prepended.length;
        };

        switch (actionId) {
            case 'h1': prepend('# '); break;
            case 'h2': prepend('## '); break;
            case 'h3': prepend('### '); break;
            case 'bold': wrap('**'); break;
            case 'italic': wrap('*'); break;
            case 'strikethrough': wrap('~~'); break;
            case 'superscript': wrap('<sup>', '</sup>'); break;
            case 'subscript': wrap('<sub>', '</sub>'); break;
            case 'list-unordered': prepend('- '); break;
            case 'list-ordered': prepend('1. '); break;
            case 'blockquote': prepend('> '); break;
            case 'code':
                if (selection.includes('\n')) {
                    wrap('```\n', '\n```');
                } else {
                    wrap('`');
                }
                break;
            case 'table':
                const tableTpl = "\n| Col 1 | Col 2 |\n| :--- | :--- |\n| Dato | Dato |\n";
                newContent = before + tableTpl + after;
                newCursorPos = start + tableTpl.length;
                break;
            case 'link': wrap('[', '](url)'); break;
            case 'image': wrap('![alt](', ')'); break;
            default: break;
        }

        setContent(newContent);
        onChange?.(newContent);

        // Reset focus and selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setContent(value);
        onChange?.(value);
    };

    const copyMarkdown = async () => {
        await navigator.clipboard.writeText(content);
        setCopiedMarkdown(true);
        setTimeout(() => setCopiedMarkdown(false), 2000);
    };

    const copyHtml = async () => {
        const htmlContent = await processMarkdown(content);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const data = [new ClipboardItem({ 'text/html': blob })];
        await navigator.clipboard.write(data);
        setCopiedHtml(true);
        setTimeout(() => setCopiedHtml(false), 2000);
    };


    return (
        <div className={cn(
            "flex-1 w-full mx-auto transition-all duration-700 h-full overflow-hidden flex flex-col",
            splitView ? "max-w-none" : "max-w-4xl px-8 py-12"
        )}>
            {splitView ? (
                <div className="flex w-full h-full divide-x divide-border overflow-hidden">
                    {/* Editor Side */}
                    <div className="flex-1 h-full p-8 overflow-y-auto bg-card/5 relative flex flex-col">
                        <Toolbar onAction={handleAction} className="mb-4 sticky top-0 z-20" />
                        <div className="relative flex-1">
                            <div className="absolute -top-6 left-0 text-[10px] uppercase tracking-widest text-muted-foreground opacity-50 select-none">
                                Editor
                            </div>
                            <button
                                onClick={copyMarkdown}
                                className="absolute top-2 right-4 p-2 bg-background/80 hover:bg-accent/10 border border-border rounded-lg transition-all hover:scale-105 shadow-sm group cursor-pointer"
                                title="Copiar Markdown"
                            >
                                {copiedMarkdown ? (
                                    <Check size={16} className="text-green-500" />
                                ) : (
                                    <Copy size={16} className="text-muted-foreground group-hover:text-accent transition-colors" />
                                )}
                            </button>
                            <textarea
                                ref={textareaRef}
                                value={content}
                                onChange={handleChange}
                                className={cn(
                                    "w-full h-full bg-transparent border-none outline-none resize-none font-mono text-base leading-relaxed p-0 mt-4 focus:ring-0 text-foreground",
                                    focusMode && "opacity-20 focus:opacity-100 transition-opacity duration-500"
                                )}
                                placeholder="Escribe tu Markdown aquí..."
                            />
                        </div>
                    </div>
                    {/* Preview Side */}
                    <div className="flex-1 h-full p-8 overflow-y-auto bg-background relative shadow-inner">
                        <div className="absolute top-2 right-4 text-[10px] uppercase tracking-widest text-muted-foreground opacity-50 select-none">
                            Vista Previa
                        </div>
                        <button
                            onClick={copyHtml}
                            className="absolute top-2 left-4 p-2 bg-background/80 hover:bg-accent/10 border border-border rounded-lg transition-all hover:scale-105 shadow-sm group cursor-pointer"
                            title="Copiar como HTML"
                        >
                            {copiedHtml ? (
                                <Check size={16} className="text-green-500" />
                            ) : (
                                <Copy size={16} className="text-muted-foreground group-hover:text-accent transition-colors" />
                            )}
                        </button>
                        <div
                            key={previewKey}
                            className="prose dark:prose-invert prose-slate prose-base max-w-none text-foreground mt-4"
                            dangerouslySetInnerHTML={{ __html: html }}
                        />
                    </div>
                </div>
            ) : (
                <div className="relative flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {!isEditing ? (
                            <motion.div
                                key={`preview-${previewKey}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                onDoubleClick={handleDoubleClick}
                                className="cursor-text min-h-[50vh] prose dark:prose-invert prose-slate prose-base max-w-none text-foreground"
                                dangerouslySetInnerHTML={{ __html: html }}
                            />
                        ) : (
                            <motion.div
                                key="editor-wrapper"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="relative flex flex-col h-full"
                            >
                                <Toolbar onAction={handleAction} className="mb-4" />
                                <textarea
                                    ref={textareaRef}
                                    value={content}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={cn(
                                        "w-full min-h-[70vh] bg-transparent border-none outline-none resize-none font-mono text-base leading-relaxed p-0 m-0 focus:ring-0 text-foreground",
                                        focusMode && "opacity-20 focus:opacity-100 transition-opacity duration-500"
                                    )}
                                    placeholder="Escribe tu Markdown aquí..."
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {!splitView && (
                <div className="fixed bottom-8 right-8 flex flex-col items-end gap-2 text-[10px] uppercase tracking-widest text-muted-foreground opacity-30 select-none pointer-events-none">
                    <div className="flex gap-4">
                        {focusMode && <span className="text-accent animate-pulse">Focus Mode ON</span>}
                        {typewriterMode && <span className="text-accent animate-pulse">Typewriter Mode ON</span>}
                    </div>
                    <span>{isEditing ? 'Pulse fuera para visualizar' : 'Doble clic para editar sintaxis'}</span>
                </div>
            )}
        </div>
    );
}
