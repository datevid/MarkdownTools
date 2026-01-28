'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Check } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addFile, setActiveFileId, addNotification } = useAppStore();

    const MAX_RECOMMENDED_SIZE = 2 * 1024 * 1024; // 2MB
    const MAX_WARNING_SIZE = 5 * 1024 * 1024; // 5MB

    const handleFiles = async (files: FileList) => {
        const newUploadedFiles: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
                if (file.size > MAX_WARNING_SIZE) {
                    addNotification(`Archivo "${file.name}" es muy pesado (${(file.size / 1024 / 1024).toFixed(2)}MB). Puede causar lag.`, 'error');
                } else if (file.size > MAX_RECOMMENDED_SIZE) {
                    addNotification(`Archivo "${file.name}" supera el tamaño recomendado para fluidez.`, 'info');
                }

                const content = await file.text();
                const newFile = {
                    id: Date.now().toString() + i,
                    name: file.name,
                    content: content,
                    type: 'file' as const,
                    parentId: null
                };
                addFile(newFile);
                setActiveFileId(newFile.id);
                newUploadedFiles.push(file.name);
            }
        }

        if (newUploadedFiles.length > 0) {
            addNotification(`Cargados ${newUploadedFiles.length} archivos con éxito`, 'success');
        }

        setUploadedFiles(newUploadedFiles);

        // Auto-close after 1.5 seconds if files were uploaded
        if (newUploadedFiles.length > 0) {
            setTimeout(() => {
                onClose();
                setUploadedFiles([]);
            }, 1500);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-background border-2 border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-accent/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                            <Upload size={20} className="text-accent" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Cargar Archivos</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Markdown (.md, .markdown) • Máx. recomendado 2MB por archivo</p>
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
                <div className="p-6">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".md,.markdown"
                        multiple
                        onChange={handleFileInput}
                        className="hidden"
                    />

                    {/* Drop Zone */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
              border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer
              transition-all duration-200
              ${isDragging
                                ? 'border-accent bg-accent/10 scale-[1.02]'
                                : 'border-border hover:border-accent/50 hover:bg-muted/30'
                            }
            `}
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center transition-all
                ${isDragging ? 'bg-accent/20 scale-110' : 'bg-muted'}
              `}>
                                <Upload size={32} className={isDragging ? 'text-accent' : 'text-muted-foreground'} />
                            </div>

                            <div>
                                <p className="text-lg font-semibold mb-1">
                                    {isDragging ? '¡Suelta aquí!' : 'Arrastra archivos aquí'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    o haz clic para seleccionar
                                </p>
                            </div>

                            <div className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1"><FileText size={12} /> Formatos: .md, .markdown</span>
                                <span className="opacity-70 font-medium">Nota: Archivos mayores a 5MB pueden degradar el rendimiento.</span>
                            </div>
                        </div>
                    </div>

                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Archivos cargados:</p>
                            {uploadedFiles.map((fileName, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 p-3 bg-accent/10 border border-accent/20 rounded-lg"
                                >
                                    <Check size={16} className="text-accent" />
                                    <span className="text-sm font-medium truncate">{fileName}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-muted/10">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-3 border-2 border-border rounded-xl font-semibold hover:bg-muted transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
