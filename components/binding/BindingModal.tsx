'use client';

import React, { useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { formatBytes, cn } from '@/lib/utils';
import { X, Download, GripVertical, FileText, Trash2, Upload, Link } from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';

interface BindingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ExternalFile {
    id: string;
    name: string;
    content: string;
    type: 'external';
}

type BindableItem = { id: string; name: string; content: string; type: 'file' | 'external' };

export default function BindingModal({ isOpen, onClose }: BindingModalProps) {
    const { files, addFile, setActiveFileId, addNotification } = useAppStore();
    const MAX_BINDING_RECOMMENDED = 8 * 1024 * 1024; // 8MB
    const [tab, setTab] = useState<'project' | 'external'>('project');
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
    const [externalFiles, setExternalFiles] = useState<ExternalFile[]>([]);
    const [orderedItems, setOrderedItems] = useState<BindableItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    // Sync orderedItems when selections change
    React.useEffect(() => {
        const projectItems: BindableItem[] = files
            .filter(f => selectedProjectIds.includes(f.id))
            .map(f => ({ id: f.id, name: f.name, content: f.content, type: 'file' }));

        const extItems: BindableItem[] = externalFiles.map(f => ({ ...f }));

        // Merge: keep order of existing items, add new ones at the end
        const currentIds = orderedItems.map(i => i.id);
        const newItems = [...projectItems, ...extItems];

        const result: BindableItem[] = [];
        // Preserve order for items still present
        orderedItems.forEach(item => {
            const found = newItems.find(n => n.id === item.id);
            if (found) result.push(found);
        });
        // Add truly new items
        newItems.forEach(item => {
            if (!currentIds.includes(item.id)) result.push(item);
        });

        setOrderedItems(result);
    }, [selectedProjectIds, externalFiles, files]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        let uploadFiles: FileList | null = null;
        if ('dataTransfer' in e) {
            e.preventDefault();
            uploadFiles = e.dataTransfer.files;
            setIsDragging(false);
        } else {
            uploadFiles = e.target.files;
        }

        if (!uploadFiles) return;

        const newExt: ExternalFile[] = [];
        for (let i = 0; i < uploadFiles.length; i++) {
            const file = uploadFiles[i];
            if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
                const content = await file.text();
                newExt.push({
                    id: `ext-${Date.now()}-${i}`,
                    name: file.name,
                    content,
                    type: 'external'
                });
            }
        }
        setExternalFiles(prev => [...prev, ...newExt]);
    };

    const removeItem = (id: string, type: 'file' | 'external') => {
        if (type === 'file') {
            setSelectedProjectIds(prev => prev.filter(i => i !== id));
        } else {
            setExternalFiles(prev => prev.filter(i => i.id !== id));
        }
    };

    const handleDownload = () => {
        if (orderedItems.length === 0) return;
        const mergedContent = orderedItems.map(i => i.content).join('\n\n---\n\n');
        const fileName = `binding_${Date.now()}.md`;

        const blob = new Blob([mergedContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);

        addNotification(`Archivo "${fileName}" descargado con éxito`, 'success');
    };

    const handleIntegrate = () => {
        if (orderedItems.length === 0) return;
        const mergedContent = orderedItems.map(i => i.content).join('\n\n---\n\n');
        const fileName = `binding_${Date.now()}.md`;

        const newFile = {
            id: `bound-${Date.now()}`,
            name: fileName,
            content: mergedContent,
            type: 'file' as const,
            parentId: null
        };
        addFile(newFile);
        setActiveFileId(newFile.id);
        addNotification('Binding generado e integrado al proyecto', 'success');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-background border border-border rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Link className="text-accent" />
                            Binding Tool
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">Fusiona archivos del proyecto o externos en un solo manuscrito.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Column: Selection */}
                    <div className="w-1/2 border-r border-border flex flex-col overflow-hidden bg-muted/20">
                        <div className="flex border-b border-border">
                            <button
                                onClick={() => setTab('project')}
                                className={cn(
                                    "flex-1 py-3 text-sm font-bold transition-all border-b-2",
                                    tab === 'project' ? "border-accent text-accent bg-accent/5" : "border-transparent text-muted-foreground hover:bg-muted"
                                )}
                            >
                                Archivos del Proyecto
                            </button>
                            <button
                                onClick={() => setTab('external')}
                                className={cn(
                                    "flex-1 py-3 text-sm font-bold transition-all border-b-2",
                                    tab === 'external' ? "border-accent text-accent bg-accent/5" : "border-transparent text-muted-foreground hover:bg-muted"
                                )}
                            >
                                Carga Externa
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                            {tab === 'project' ? (
                                <div className="space-y-2 flex-1">
                                    {files.length > 0 && (
                                        <div className="flex items-center justify-between mb-4 px-1">
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase">Selección de Proyecto</span>
                                            <button
                                                onClick={() => {
                                                    if (selectedProjectIds.length === files.length) setSelectedProjectIds([]);
                                                    else setSelectedProjectIds(files.map(f => f.id));
                                                }}
                                                className="text-[10px] text-accent font-bold hover:underline cursor-pointer"
                                            >
                                                {selectedProjectIds.length === files.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                                            </button>
                                        </div>
                                    )}
                                    {files.map(file => (
                                        <label key={file.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl cursor-pointer hover:border-accent/40 transition-all active:scale-[0.98]">
                                            <input
                                                type="checkbox"
                                                checked={selectedProjectIds.includes(file.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedProjectIds(prev => [...prev, file.id]);
                                                    else setSelectedProjectIds(prev => prev.filter(id => id !== file.id));
                                                }}
                                                className="w-5 h-5 rounded border-border text-accent focus:ring-accent cursor-pointer"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{file.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase">{formatBytes(file.content.length)}</p>
                                            </div>
                                            <FileText size={16} className="text-muted-foreground" />
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col space-y-4">
                                    <div
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={handleFileUpload}
                                        onClick={() => document.getElementById('bind-upload')?.click()}
                                        className={cn(
                                            "flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer",
                                            isDragging ? "border-accent bg-accent/10" : "border-border hover:border-accent/50 hover:bg-accent/5"
                                        )}
                                    >
                                        <Upload className={cn("w-12 h-12 mb-4 transition-all", isDragging ? "text-accent scale-110" : "text-muted-foreground")} />
                                        <p className="text-sm font-bold">Suelta archivos .md aquí</p>
                                        <p className="text-xs text-muted-foreground mt-2">O haz clic para seleccionar</p>
                                        <input id="bind-upload" type="file" multiple accept=".md" onChange={handleFileUpload} className="hidden" />
                                    </div>
                                </div>
                            )}
                            <div className="p-4 mt-auto border-t border-border bg-accent/5">
                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                    <span className="font-bold text-accent italic">Recomendación técnica:</span><br />
                                    Archivos de más de <span className="text-foreground">2MB</span> individuales o fusiones de más de <span className="text-foreground">8MB</span> pueden afectar la fluidez del motor de previsualización.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Ordering & Fusion */}
                    <div className="w-1/2 flex flex-col overflow-hidden bg-background">
                        <div className="p-4 border-b border-border bg-muted/10 flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Listado para Binding</span>
                            <span className="text-xs font-bold text-accent px-2 py-0.5 bg-accent/10 rounded-full">{orderedItems.length} items</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {orderedItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                    <Link size={48} className="mb-4" />
                                    <p className="text-sm">Selecciona o carga archivos<br />para empezar el binding.</p>
                                </div>
                            ) : (
                                <Reorder.Group axis="y" values={orderedItems} onReorder={setOrderedItems} className="space-y-2">
                                    {orderedItems.map((item) => (
                                        <Reorder.Item
                                            key={item.id}
                                            value={item}
                                            className="bg-card border border-border p-3 rounded-xl flex items-center gap-3 group shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                                        >
                                            <GripVertical size={16} className="text-muted-foreground opacity-50" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "text-[8px] px-1 rounded-sm font-bold uppercase",
                                                        item.type === 'file' ? "bg-accent/10 text-accent" : "bg-orange-500/10 text-orange-500"
                                                    )}>
                                                        {item.type === 'file' ? 'Proyecto' : 'Externo'}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">{formatBytes(item.content.length)}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id, item.type)}
                                                className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded transition-colors cursor-pointer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            )}
                        </div>

                        <div className="p-6 bg-muted/30 border-t border-border space-y-4">
                            <div className="flex items-center justify-between text-sm font-bold">
                                <span className="text-muted-foreground uppercase tracking-tighter">Tamaño Total Fusión</span>
                                <span className={cn(
                                    orderedItems.reduce((acc, i) => acc + i.content.length, 0) > MAX_BINDING_RECOMMENDED ? "text-red-500" : "text-foreground"
                                )}>
                                    {formatBytes(orderedItems.reduce((acc, i) => acc + i.content.length, 0))}
                                    {orderedItems.reduce((acc, i) => acc + i.content.length, 0) > MAX_BINDING_RECOMMENDED && (
                                        <span className="ml-2 text-[10px] font-normal block text-right">(Excede recomendado)</span>
                                    )}
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleIntegrate}
                                    disabled={orderedItems.length === 0}
                                    className="flex-1 py-4 bg-accent text-accent-foreground rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none cursor-pointer"
                                >
                                    <Link size={20} />
                                    Generar Binding
                                </button>
                                <button
                                    onClick={handleDownload}
                                    disabled={orderedItems.length === 0}
                                    className="flex-1 py-4 bg-background border-2 border-accent text-accent rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:bg-accent/5 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none cursor-pointer"
                                >
                                    <Download size={20} />
                                    Descargar Archivo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
