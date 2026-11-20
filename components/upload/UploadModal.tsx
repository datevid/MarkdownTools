'use client';

import React, { useId, useRef, useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import ModalContainer from '@/components/ui/ModalContainer';
import {
    createUniqueFileName,
    HEAVY_FILE_BYTES,
    isSupportedMarkdownFile,
} from '@/components/ui/fileHelpers';
import { useAppStore, type FileNode } from '@/lib/store';
import { cn, formatBytes, generateId, getUtf8ByteLength } from '@/lib/utils';

/**
 * Props for the UploadModal file-import dialog.
 */
export interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Accessible upload modal supporting drag-and-drop and multi-file import for Markdown documents.
 */
export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
    const titleId = useId();

    return (
        <ModalContainer
            isOpen={isOpen}
            onClose={onClose}
            ariaLabelledBy={titleId}
            maxWidthClassName="max-w-lg"
            zIndexClassName="z-50"
        >
            <UploadModalBody titleId={titleId} onClose={onClose} />
        </ModalContainer>
    );
}

function UploadModalBody({
    titleId,
    onClose,
}: {
    titleId: string;
    onClose: () => void;
}) {
    const dontShowSwitchId = useId();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const {
        dontShowUploadOnStartup,
        setDontShowUploadOnStartup,
    } = useAppStore();

    const processFileList = async (fileList: FileList) => {
        const state = useAppStore.getState();
        const currentNames = state.files.map((file) => file.name);
        let importedCount = 0;
        let lastImportedName = '';

        for (let index = 0; index < fileList.length; index += 1) {
            const rawFile = fileList[index];
            if (!isSupportedMarkdownFile(rawFile)) {
                state.addNotification(
                    `Archivo "${rawFile.name}" no soportado. Usa formatos .md, .markdown o .txt.`,
                    'error'
                );
                continue;
            }

            try {
                const content = await rawFile.text();
                const exactBytes = getUtf8ByteLength(content);
                const uniqueName = createUniqueFileName(rawFile.name, currentNames);
                currentNames.push(uniqueName);

                if (exactBytes > HEAVY_FILE_BYTES) {
                    state.addNotification(
                        `"${uniqueName}" pesa ${formatBytes(exactBytes)} (> 2 MB). Considera dividirlo o gestionarlo con Binder / Binding Tool para mayor fluidez.`,
                        'info'
                    );
                }

                const newFile: FileNode = {
                    id: generateId('file'),
                    name: uniqueName,
                    content,
                    type: 'file',
                    parentId: null,
                };

                state.addFile(newFile);
                state.setActiveFileId(newFile.id);
                importedCount += 1;
                lastImportedName = uniqueName;
            } catch {
                state.addNotification(
                    `No se pudo leer el archivo "${rawFile.name}".`,
                    'error'
                );
            }
        }

        if (importedCount > 0) {
            state.addNotification(
                importedCount === 1
                    ? `Archivo "${lastImportedName}" cargado con éxito.`
                    : `Cargados ${importedCount} archivos con éxito.`,
                'success'
            );
        }
    };

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            onClose();
            void processFileList(selectedFiles);
        }
        event.target.value = '';
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        const droppedFiles = event.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
            onClose();
            void processFileList(droppedFiles);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between gap-3 border-b border-border bg-gradient-to-r from-accent/10 to-transparent p-4 sm:p-6">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-text">
                        <Upload size={20} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <h2 id={titleId} className="text-lg font-bold text-foreground sm:text-xl">
                            Cargar Archivos
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Formatos .md, .markdown o .txt • Recomendado hasta 2 MB por archivo
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar ventana de carga de archivos"
                    className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                    <X size={20} aria-hidden="true" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".md,.markdown,.txt"
                    multiple
                    onChange={handleFileInputChange}
                    aria-label="Seleccionar archivos Markdown o texto plano"
                    className="hidden"
                />

                <div
                    role="button"
                    tabIndex={0}
                    onDrop={handleDrop}
                    onDragOver={(event) => {
                        event.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={(event) => {
                        event.preventDefault();
                        setIsDragging(false);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            fileInputRef.current?.click();
                        }
                    }}
                    className={cn(
                        'rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 cursor-pointer sm:p-10',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isDragging
                            ? 'scale-[1.01] border-accent bg-accent/10'
                            : 'border-border hover:border-accent/60 hover:bg-muted/40'
                    )}
                >
                    <div className="flex flex-col items-center gap-3.5">
                        <div
                            className={cn(
                                'flex h-14 w-14 items-center justify-center rounded-2xl transition-colors',
                                isDragging
                                    ? 'bg-accent/20 text-accent-text'
                                    : 'bg-muted text-muted-foreground'
                            )}
                        >
                            <Upload size={28} aria-hidden="true" />
                        </div>

                        <div>
                            <p className="text-base font-semibold text-foreground sm:text-lg">
                                {isDragging ? '¡Suelta los archivos aquí!' : 'Arrastra archivos aquí'}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                o haz clic para explorar tu equipo
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5 font-medium">
                                <FileText size={13} aria-hidden="true" />
                                Compatibles: .md, .markdown, .txt
                            </span>
                            <span>
                                Archivos mayores a 2 MB mostrarán aviso para gestionarlos en Binder.
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-3 border-t border-border bg-muted/20 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-background/70 px-3.5 py-2.5">
                    <label
                        htmlFor={dontShowSwitchId}
                        className="cursor-pointer select-none text-xs font-medium text-foreground sm:text-sm"
                    >
                        No mostrarme otra vez
                    </label>
                    <button
                        id={dontShowSwitchId}
                        type="button"
                        role="switch"
                        aria-checked={dontShowUploadOnStartup}
                        onClick={() => setDontShowUploadOnStartup(!dontShowUploadOnStartup)}
                        className={cn(
                            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                            dontShowUploadOnStartup
                                ? 'bg-accent'
                                : 'bg-zinc-300 dark:bg-zinc-700'
                        )}
                    >
                        <span
                            aria-hidden="true"
                            className={cn(
                                'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-150',
                                dontShowUploadOnStartup ? 'translate-x-5' : 'translate-x-0'
                            )}
                        />
                    </button>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                    Cerrar
                </button>
            </div>
        </>
    );
}
