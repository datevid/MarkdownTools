'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { cn, formatBytes } from '@/lib/utils';
import { GripVertical, X, Download, Scissors, FileCode } from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';

export default function BinderPanel() {
    const { files, binderItems, setBinderItems, removeFromBinder, addToBinder } = useAppStore();
    const [smartGlue, setSmartGlue] = useState(true);

    // Debug logging
    console.log('BinderPanel render - binderItems:', binderItems);
    console.log('BinderPanel render - files:', files.map(f => ({ id: f.id, name: f.name })));

    // Filter out any IDs that might have been deleted but are still in binderItems
    const validBinderIds = binderItems.filter(id => files.some(f => f.id === id));
    console.log('BinderPanel render - validBinderIds:', validBinderIds);

    const totalSize = validBinderIds.reduce((acc, id) => {
        const file = files.find(f => f.id === id);
        return acc + (file?.content.length || 0);
    }, 0);

    const handleMerge = () => {
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
    };

    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={(e) => {
                e.preventDefault();
                const fileId = e.dataTransfer.getData('fileId');
                console.log('File dropped on Binder:', fileId);
                if (fileId) {
                    addToBinder(fileId);
                    console.log('File added to Binder successfully');
                }
            }}
            className="flex flex-col h-full bg-card/80 backdrop-blur-xl border-l border-border w-80 shadow-2xl overflow-hidden"
        >
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
                <h2 className="font-semibold flex items-center gap-2">
                    <Scissors size={16} className="text-accent" />
                    The Binder
                </h2>
                <span className="text-[10px] px-2 py-0.5 bg-accent/20 text-accent rounded-full font-bold uppercase tracking-wider">
                    Fusión
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {validBinderIds.length === 0 ? (
                    <div
                        className="h-60 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-muted/10 space-y-3 transition-colors hover:border-accent/40"
                    >
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center opacity-40">
                            <FileCode size={24} />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Arrastra archivos aquí o haz clic en <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-accent/20 text-accent font-bold">+</span> para añadirlos.
                        </p>
                    </div>
                ) : (
                    <Reorder.Group
                        axis="y"
                        values={binderItems}
                        onReorder={setBinderItems}
                        className="space-y-3"
                    >
                        <AnimatePresence mode="popLayout">
                            {validBinderIds.map((id) => {
                                const file = files.find(f => f.id === id);
                                if (!file) return null;
                                return (
                                    <Reorder.Item
                                        key={id}
                                        value={id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        whileDrag={{
                                            scale: 1.05,
                                            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                                            zIndex: 50
                                        }}
                                        className="bg-card border border-border p-3 rounded-xl flex items-center gap-3 group relative cursor-grab active:cursor-grabbing hover:border-accent/40 transition-colors"
                                    >
                                        <GripVertical size={14} className="text-muted-foreground/50" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{file.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{formatBytes(file.content.length)}</p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFromBinder(id);
                                            }}
                                            className="p-1.5 hover:bg-muted rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                        >
                                            <X size={14} />
                                        </button>
                                    </Reorder.Item>
                                );
                            })}
                        </AnimatePresence>
                    </Reorder.Group>
                )}

                <div className="space-y-4 pt-4 border-t border-border mt-4">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors">
                            <input
                                type="checkbox"
                                checked={smartGlue}
                                onChange={(e) => setSmartGlue(e.target.checked)}
                                className="rounded border-border text-accent focus:ring-accent w-4 h-4"
                            />
                            Line Break Fusion
                        </label>
                    </div>

                    <div className="p-4 bg-accent/5 border border-accent/10 rounded-2xl flex items-center justify-between">
                        <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-accent/60 tracking-tighter">Peso del Manuscrito</span>
                            <p className="text-sm font-bold">{formatBytes(totalSize)}</p>
                        </div>
                        <div className="flex -space-x-2 overflow-hidden">
                            {validBinderIds.slice(0, 3).map((id, i) => (
                                <div key={id} className="w-6 h-6 rounded-full bg-accent border-2 border-background flex items-center justify-center text-[8px] font-bold text-white uppercase select-none">
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-border bg-muted/10">
                <button
                    onClick={handleMerge}
                    disabled={validBinderIds.length < 1}
                    className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-3 rounded-2xl text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                >
                    <Download size={18} />
                    Fusionar Manuscrito
                </button>
            </div>
        </div>
    );
}
