'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, Reorder } from 'framer-motion';
import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    BookOpen,
    Download,
    FileCode,
    GripVertical,
    Link as LinkIcon,
    Plus,
    Scissors,
    Trash2,
    X,
} from 'lucide-react';
import {
    createUniqueFileName,
    downloadMarkdownFile,
    HEAVY_FILE_BYTES,
} from '@/components/ui/fileHelpers';
import { useAppStore, type FileNode } from '@/lib/store';
import { cn, formatBytes, generateId, getUtf8ByteLength } from '@/lib/utils';

/**
 * Props for the BinderPanel workspace assembly panel.
 */
export interface BinderPanelProps {
    className?: string;
    onOpenBinding?: () => void;
    onClose?: () => void;
    titleId?: string;
    isModal?: boolean;
}

/**
 * Modular chapter assembler ("The Binder") supporting drag-and-drop, keyboard quick-add,
 * Framer & button reordering, and one-click manuscript compilation into the workspace.
 */
export default function BinderPanel({
    className,
    onOpenBinding,
    onClose,
    titleId,
    isModal = false,
}: BinderPanelProps) {
    const {
        files,
        binderItems,
        setBinderItems,
        addToBinder,
        removeFromBinder,
        addFile,
        setActiveFileId,
        addNotification,
    } = useAppStore();

    const [useHorizontalSeparator, setUseHorizontalSeparator] = useState(true);
    const [selectedFileId, setSelectedFileId] = useState<string>('');
    const [isDropActive, setIsDropActive] = useState(false);

    const binderFiles = useMemo(
        () =>
            binderItems
                .map((id) => files.find((file) => file.id === id))
                .filter((file): file is FileNode => Boolean(file)),
        [binderItems, files]
    );

    const availableFiles = useMemo(
        () =>
            files.filter(
                (file) => file.type === 'file' && !binderItems.includes(file.id)
            ),
        [files, binderItems]
    );

    const effectiveQuickAddId = availableFiles.some((file) => file.id === selectedFileId)
        ? selectedFileId
        : (availableFiles[0]?.id ?? '');

    const mergedContent = useMemo(() => {
        if (binderFiles.length === 0) {
            return '';
        }
        const separator = useHorizontalSeparator ? '\n\n---\n\n' : '\n\n';
        return binderFiles
            .map((file) => file.content.replace(/\s+$/, ''))
            .join(separator);
    }, [binderFiles, useHorizontalSeparator]);

    const totalBytes = useMemo(
        () => getUtf8ByteLength(mergedContent),
        [mergedContent]
    );

    const isHeavy = totalBytes > HEAVY_FILE_BYTES;

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDropActive(false);

        const rawId =
            event.dataTransfer.getData('text/plain').trim() ||
            event.dataTransfer.getData('fileId').trim();

        if (!rawId) {
            return;
        }

        const matchedFile = files.find((file) => file.id === rawId && file.type === 'file');
        if (!matchedFile) {
            addNotification('El elemento soltado no corresponde a un archivo válido.', 'error');
            return;
        }

        if (binderItems.includes(matchedFile.id)) {
            addNotification(`"${matchedFile.name}" ya está en The Binder.`, 'info');
            return;
        }

        addToBinder(matchedFile.id);
        addNotification(`"${matchedFile.name}" añadido a The Binder.`, 'success');
    };

    const handleQuickAdd = () => {
        if (!effectiveQuickAddId) {
            return;
        }
        const target = availableFiles.find((file) => file.id === effectiveQuickAddId);
        if (!target) {
            return;
        }
        addToBinder(target.id);
        addNotification(`"${target.name}" añadido a The Binder.`, 'success');
    };

    const moveItem = (index: number, delta: -1 | 1) => {
        const targetIndex = index + delta;
        if (targetIndex < 0 || targetIndex >= binderFiles.length) {
            return;
        }
        const nextIds = binderFiles.map((file) => file.id);
        const [moved] = nextIds.splice(index, 1);
        nextIds.splice(targetIndex, 0, moved);
        setBinderItems(nextIds);
    };

    const handleMergeNow = () => {
        if (binderFiles.length === 0) {
            return;
        }

        const compiledName = createUniqueFileName(
            'Libro_Compilado.md',
            files.map((file) => file.name)
        );
        const compiledFile: FileNode = {
            id: generateId('binder'),
            name: compiledName,
            content: mergedContent,
            type: 'file',
            parentId: null,
        };

        addFile(compiledFile);
        setActiveFileId(compiledFile.id);
        addNotification(
            `Manuscrito "${compiledName}" creado con ${binderFiles.length} documento(s).`,
            'success'
        );
        onClose?.();
    };

    const handleDownloadCompiled = () => {
        if (binderFiles.length === 0) {
            return;
        }
        const compiledName = createUniqueFileName(
            'Libro_Compilado.md',
            files.map((file) => file.name)
        );
        downloadMarkdownFile(compiledName, mergedContent);
        addNotification(`Descargado "${compiledName}".`, 'success');
    };

    return (
        <section
            aria-label="Panel The Binder para ensamblar capítulos"
            onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
                setIsDropActive(true);
            }}
            onDragLeave={(event) => {
                if (
                    !(event.relatedTarget instanceof Node) ||
                    !event.currentTarget.contains(event.relatedTarget)
                ) {
                    setIsDropActive(false);
                }
            }}
            onDrop={handleDrop}
            className={cn(
                'flex h-full flex-col overflow-hidden bg-card text-card-foreground',
                !isModal && 'w-full sm:w-80 border-l border-border shadow-xl',
                isDropActive && 'ring-2 ring-inset ring-accent',
                className
            )}
        >
            <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-3.5 sm:px-5">
                <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent-text">
                        {isModal ? (
                            <BookOpen size={17} aria-hidden="true" />
                        ) : (
                            <Scissors size={17} aria-hidden="true" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <h2
                            id={titleId}
                            className="truncate text-base font-bold text-foreground"
                        >
                            The Binder
                        </h2>
                        <p className="truncate text-[11px] text-muted-foreground">
                            Ordena capítulos y compila tu libro
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                    <span className="rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent-text">
                        {binderFiles.length}
                    </span>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Cerrar The Binder"
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                        >
                            <X size={18} aria-hidden="true" />
                        </button>
                    )}
                </div>
            </div>

            <div className="border-b border-border bg-background/60 p-3 sm:px-5">
                <label
                    htmlFor="binder-quick-add"
                    className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                    Añadir archivo del proyecto
                </label>
                {availableFiles.length > 0 ? (
                    <div className="flex items-center gap-2">
                        <select
                            id="binder-quick-add"
                            aria-label="Seleccionar archivo para añadir a The Binder"
                            value={effectiveQuickAddId}
                            onChange={(event) => setSelectedFileId(event.target.value)}
                            className="min-w-0 flex-1 rounded-xl border border-border bg-background px-2.5 py-2 text-xs font-medium text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            {availableFiles.map((file) => (
                                <option key={file.id} value={file.id}>
                                    {file.name}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={handleQuickAdd}
                            className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                        >
                            <Plus size={14} aria-hidden="true" />
                            <span>Añadir</span>
                        </button>
                    </div>
                ) : (
                    <p className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                        {files.length === 0
                            ? 'No hay archivos disponibles en el espacio de trabajo.'
                            : 'Todos los archivos del proyecto ya están en The Binder.'}
                    </p>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
                {binderFiles.length === 0 ? (
                    <div
                        className={cn(
                            'flex min-h-[180px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors',
                            isDropActive
                                ? 'border-accent bg-accent/10'
                                : 'border-border bg-muted/20'
                        )}
                    >
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <FileCode size={22} aria-hidden="true" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                            Tu manuscrito está vacío
                        </p>
                        <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                            Arrastra archivos desde la barra lateral o usa el selector superior para añadir capítulos sin ratón.
                        </p>
                    </div>
                ) : (
                    <Reorder.Group
                        axis="y"
                        values={binderFiles}
                        onReorder={(nextFiles) => setBinderItems(nextFiles.map((file) => file.id))}
                        className="space-y-2.5"
                    >
                        <AnimatePresence mode="popLayout">
                            {binderFiles.map((file, index) => {
                                const fileBytes = getUtf8ByteLength(file.content);
                                return (
                                    <Reorder.Item
                                        key={file.id}
                                        value={file}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -16 }}
                                        whileDrag={{
                                            scale: 1.02,
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                                            zIndex: 20,
                                        }}
                                        className="flex items-center gap-2 rounded-xl border border-border bg-background p-2.5 shadow-xs transition-colors hover:border-accent/50 cursor-grab active:cursor-grabbing"
                                    >
                                        <GripVertical
                                            size={16}
                                            aria-hidden="true"
                                            className="shrink-0 text-muted-foreground"
                                        />
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[11px] font-bold text-accent-text">
                                            {index + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-foreground">
                                                {file.name}
                                            </p>
                                            <p className="text-[11px] font-mono text-muted-foreground">
                                                {formatBytes(fileBytes)}
                                            </p>
                                        </div>

                                        <div
                                            className="flex shrink-0 items-center gap-0.5"
                                            onPointerDown={(event) => event.stopPropagation()}
                                        >
                                            <button
                                                type="button"
                                                disabled={index === 0}
                                                onClick={() => moveItem(index, -1)}
                                                aria-label={`Mover arriba ${file.name}`}
                                                title="Mover arriba"
                                                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                                            >
                                                <ArrowUp size={14} aria-hidden="true" />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={index === binderFiles.length - 1}
                                                onClick={() => moveItem(index, 1)}
                                                aria-label={`Mover abajo ${file.name}`}
                                                title="Mover abajo"
                                                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                                            >
                                                <ArrowDown size={14} aria-hidden="true" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeFromBinder(file.id)}
                                                aria-label={`Quitar ${file.name} de The Binder`}
                                                title="Quitar"
                                                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                                            >
                                                <Trash2 size={14} aria-hidden="true" />
                                            </button>
                                        </div>
                                    </Reorder.Item>
                                );
                            })}
                        </AnimatePresence>
                    </Reorder.Group>
                )}

                <div className="space-y-3 border-t border-border pt-3">
                    <label className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-xs font-medium text-foreground cursor-pointer hover:bg-muted/50">
                        <input
                            type="checkbox"
                            checked={useHorizontalSeparator}
                            onChange={(event) => setUseHorizontalSeparator(event.target.checked)}
                            className="h-4 w-4 rounded border-border text-accent focus:ring-ring"
                        />
                        <span>Insertar regla separadora (---) entre capítulos</span>
                    </label>

                    <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/20 bg-accent/5 px-3.5 py-3">
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                Tamaño combinado UTF-8
                            </span>
                            <p className="mt-0.5 text-base font-bold text-foreground">
                                {formatBytes(totalBytes)}
                            </p>
                        </div>
                        {isHeavy && (
                            <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/35 bg-amber-500/15 px-2 py-1 text-[11px] font-bold text-amber-900 dark:text-amber-200">
                                <AlertTriangle size={12} aria-hidden="true" />
                                &gt; 2 MB
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-2 border-t border-border bg-muted/20 p-3 sm:p-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                        type="button"
                        onClick={handleMergeNow}
                        disabled={binderFiles.length < 1}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    >
                        <Scissors size={16} aria-hidden="true" />
                        <span>Unir ahora</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleDownloadCompiled}
                        disabled={binderFiles.length < 1}
                        aria-label="Descargar manuscrito compilado en Markdown"
                        title="Descargar .md"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    >
                        <Download size={15} aria-hidden="true" />
                        <span>Descargar</span>
                    </button>
                </div>

                {onOpenBinding && (
                    <button
                        type="button"
                        onClick={onOpenBinding}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-accent-text transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    >
                        <LinkIcon size={14} aria-hidden="true" />
                        <span>Configurar en Binding Tool</span>
                    </button>
                )}
            </div>
        </section>
    );
}
