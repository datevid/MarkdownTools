'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { processMarkdown } from '@/lib/markdown';
import { Clipboard, FileCode, FileText, Download, Check, Sparkles } from 'lucide-react';

export default function ExportManager() {
    const { files, activeFileId, addNotification } = useAppStore();

    const activeFile = files.find(f => f.id === activeFileId);

    const copyAsHTML = async () => {
        if (!activeFile) return;
        const html = await processMarkdown(activeFile.content);
        await navigator.clipboard.writeText(html);
        addNotification('HTML copiado al portapapeles', 'success');
    };

    const copyAsRichText = async () => {
        if (!activeFile) return;
        const html = await processMarkdown(activeFile.content);
        const blob = new Blob([html], { type: 'text/html' });
        const data = [new ClipboardItem({ 'text/html': blob })];
        await navigator.clipboard.write(data);
        addNotification('Rich Text copiado con éxito', 'success');
    };

    const downloadAsMarkdown = () => {
        if (!activeFile) return;
        const blob = new Blob([activeFile.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = activeFile.name;
        a.click();
        URL.revokeObjectURL(url);
        addNotification(`Descargando "${activeFile.name}"`, 'success');
    };

    const downloadAsPDF = async () => {
        if (!activeFile) return;

        // Dynamic import to avoid SSR issues
        // @ts-ignore - html2pdf doesn't have official types for this usage
        const html2pdf = (await import('html2pdf.js')).default;

        const element = document.querySelector('.prose');
        if (!element) {
            addNotification('No se encontró contenido para exportar', 'error');
            return;
        }

        const opt = {
            margin: 1,
            filename: `${activeFile.name.replace('.md', '')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        addNotification('Generando PDF...', 'info');

        try {
            await html2pdf().set(opt).from(element).save();
            addNotification('PDF generado con éxito', 'success');
        } catch (error) {
            console.error('PDF generation error:', error);
            addNotification('Error al generar el PDF', 'error');
        }
    };

    const printDocument = () => {
        if (!activeFile) return;
        window.print();
    };

    return (
        <div
            className="p-4 bg-card border-2 border-border rounded-xl shadow-2xl w-72 space-y-2"
            onMouseLeave={(e) => e.stopPropagation()}
        >
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">
                Exportar contenido
            </div>

            <button
                onClick={copyAsHTML}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-lg transition-colors group cursor-pointer"
            >
                <FileCode size={18} className="text-muted-foreground group-hover:text-accent transition-colors" />
                <span className="text-sm font-medium">Copiar como HTML</span>
            </button>

            <button
                onClick={copyAsRichText}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-lg transition-colors group cursor-pointer"
            >
                <Clipboard size={18} className="text-muted-foreground group-hover:text-accent transition-colors" />
                <span className="text-sm font-medium">Copiar Rich Text</span>
            </button>

            <button
                onClick={downloadAsMarkdown}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent/10 text-accent rounded-lg transition-colors group font-semibold border border-transparent hover:border-accent/20 cursor-pointer"
            >
                <Download size={18} />
                <span className="text-sm">Descargar Markdown (.md)</span>
            </button>

            <div className="pt-2 border-t border-border mt-2 space-y-2">
                <button
                    onClick={downloadAsPDF}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 bg-gradient-to-r from-accent/10 to-accent/5 hover:from-accent/20 hover:to-accent/10 border border-accent/20 rounded-lg transition-all group cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <FileText size={18} className="text-accent" />
                        <div className="text-left">
                            <div className="text-sm font-semibold">Generar PDF</div>
                            <div className="text-[10px] text-accent/70 flex items-center gap-1">
                                <Sparkles size={10} />
                                <span>Exportar con estilos</span>
                            </div>
                        </div>
                    </div>
                </button>

                <button
                    onClick={printDocument}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-lg transition-colors group cursor-pointer"
                >
                    <FileText size={18} className="text-muted-foreground group-hover:text-accent transition-colors" />
                    <span className="text-sm font-medium">Imprimir</span>
                </button>
            </div>
        </div>
    );
}
