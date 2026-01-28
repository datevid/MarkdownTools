'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { formatBytes } from '@/lib/utils';
import { X, Download, GripVertical, FileText, Trash2, BookOpen } from 'lucide-react';
import { Reorder, AnimatePresence } from 'framer-motion';

interface BinderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BinderModal({ isOpen, onClose }: BinderModalProps) {
    const { files, binderItems, setBinderItems, removeFromBinder } = useAppStore();
    const [smartGlue, setSmartGlue] = useState(true);

    console.log('BinderModal render - isOpen:', isOpen);
    console.log('BinderModal render - binderItems:', binderItems);
    console.log('BinderModal render - files count:', files.length);

    const validBinderIds = binderItems.filter(id => files.some(f => f.id === id));

    const totalSize = validBinderIds.reduce((acc, id) => {
        const file = files.find(f => f.id === id);
        return acc + (file?.content.length || 0);
    }, 0);

    const handleMerge = () => {
        if (validBinderIds.length < 1) return;

        const mergedContent = validBinderIds
            .map(id => files.find(f => f.id === id)?.content || '')
            .join(smartGlue ? '\n\n' : '\n');

        const blob = new Blob([mergedContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'manuscript_merged.md';
        a.click();
        URL.revokeObjectURL(url);

        alert('¡Manuscrito descargado exitosamente!');
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-background border-2 border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-accent/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                            <BookOpen size={20} className="text-accent" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">The Binder</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Fusiona tus archivos en un manuscrito</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border">
                        💡 <strong>Tip:</strong> Haz clic en el botón <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-accent/20 text-accent font-bold text-xs mx-1">+</span> junto a un archivo en la barra lateral para añadirlo aquí.
                    </div>

                    {validBinderIds.length === 0 ? (
                        <div className="h-60 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center p-8 bg-muted/10">
                            <FileText size={48} className="text-muted-foreground/40 mb-4" />
                            <p className="text-sm font-medium mb-2">No hay archivos en el Binder</p>
                            <p className="text-xs text-muted-foreground max-w-xs">
                                Añade archivos usando el botón + en la barra lateral
                            </p>
                        </div>
                    ) : (
                        <Reorder.Group
                            axis="y"
                            values={binderItems}
                            onReorder={setBinderItems}
                            className="space-y-3"
                        >
                            {validBinderIds.map((id) => {
                                const file = files.find(f => f.id === id);
                                if (!file) return null;
                                return (
                                    <Reorder.Item
                                        key={id}
                                        value={id}
                                        className="bg-card border-2 border-border p-4 rounded-xl flex items-center gap-3 group cursor-grab active:cursor-grabbing hover:border-accent/50 hover:shadow-lg transition-all"
                                    >
                                        <GripVertical size={20} className="text-muted-foreground/50 group-hover:text-accent transition-colors" />
                                        <FileText size={20} className="text-accent" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate">{file.name}</p>
                                            <p className="text-xs text-muted-foreground">{formatBytes(file.content.length)}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                console.log('Removing file from binder:', id);
                                                removeFromBinder(id);
                                            }}
                                            className="p-2.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                                            title="Eliminar del Binder"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </Reorder.Item>
                                );
                            })}
                        </Reorder.Group>
                    )}

                    {/* Options */}
                    {validBinderIds.length > 0 && (
                        <div className="pt-4 border-t-2 border-border space-y-4">
                            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={smartGlue}
                                    onChange={(e) => setSmartGlue(e.target.checked)}
                                    className="w-5 h-5 mt-0.5 rounded border-border text-accent focus:ring-accent"
                                />
                                <div>
                                    <p className="text-sm font-semibold">Smart Glue</p>
                                    <p className="text-xs text-muted-foreground mt-1">Añade un salto de línea doble entre archivos para mejor separación</p>
                                </div>
                            </label>

                            <div className="p-5 bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20 rounded-xl flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-accent/70 font-bold uppercase tracking-wider mb-1">Peso Total</p>
                                    <p className="text-2xl font-bold">{formatBytes(totalSize)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground font-medium mb-1">Archivos</p>
                                    <p className="text-3xl font-bold text-accent">{validBinderIds.length}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t-2 border-border bg-muted/10 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border-2 border-border rounded-xl font-semibold hover:bg-muted transition-colors"
                    >
                        Cerrar
                    </button>
                    <button
                        onClick={handleMerge}
                        disabled={validBinderIds.length < 1}
                        className="flex-1 px-4 py-3 bg-accent text-accent-foreground rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Download size={18} />
                        Fusionar ({validBinderIds.length})
                    </button>
                </div>
            </div>
        </div>
    );
}
