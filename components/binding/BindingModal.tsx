'use client';

import React, { useId, useMemo, useRef, useState } from 'react';
import { Reorder } from 'framer-motion';
import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    Download,
    FileText,
    GripVertical,
    Link as LinkIcon,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import ModalContainer from '@/components/ui/ModalContainer';
import {
    createUniqueFileName,
    downloadMarkdownFile,
    HEAVY_FILE_BYTES,
    isSupportedMarkdownFile,
    normalizeMarkdownFileName,
} from '@/components/ui/fileHelpers';
import { useAppStore, type FileNode } from '@/lib/store';
import { cn, formatBytes, generateId, getUtf8ByteLength } from '@/lib/utils';

/**
 * Props for the BindingModal multi-source merge dialog.
 */
export interface BindingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type BindingSeparator = 'hr' | 'blank' | 'heading';

interface ExternalFile {
    id: string;
    name: string;
    content: string;
}

interface OrderedRef {
    kind: 'file' | 'external';
    id: string;
}

interface BindableItem {
    id: string;
    name: string;
    content: string;
    type: 'file' | 'external';
}

const SEPARATOR_OPTIONS: ReadonlyArray<{
    id: BindingSeparator;
    label: string;
    hint: string;
}> = [
    { id: 'hr', label: 'Regla horizontal (---)', hint: 'Separa con línea divisoria' },
    { id: 'blank', label: 'Salto doble', hint: 'Línea en blanco entre bloques' },
    { id: 'heading', label: 'Encabezado por archivo', hint: 'Añade título # con el nombre' },
];

function buildMergedDocument(items: BindableItem[], separator: BindingSeparator): string {
    if (items.length === 0) {
        return '';
    }

    if (separator === 'heading') {
        return items
            .map((item) => {
                const heading = item.name.replace(/\.(md|markdown|txt)$/i, '').trim() || item.name;
                const body = item.content.trim();
                return body ? `# ${heading}\n\n${body}` : `# ${heading}`;
            })
            .join('\n\n');
    }

    const joiner = separator === 'hr' ? '\n\n---\n\n' : '\n\n';
    return items.map((item) => item.content.replace(/\s+$/, '')).join(joiner);
}

/**
 * Accessible multi-file merge modal combining workspace and external Markdown files
 * with responsive mobile layout, separator presets, and live UTF-8 size tracking.
 */
export default function BindingModal({ isOpen, onClose }: BindingModalProps) {
    const titleId = useId();

    return (
        <ModalContainer
            isOpen={isOpen}
            onClose={onClose}
            ariaLabelledBy={titleId}
            maxWidthClassName="max-w-5xl"
            zIndexClassName="z-50"
        >
            <BindingModalBody titleId={titleId} onClose={onClose} />
        </ModalContainer>
    );
}

function BindingModalBody({
    titleId,
    onClose,
}: {
    titleId: string;
    onClose: () => void;
}) {
    const fileInputId = useId();
    const outputNameId = useId();
    const externalInputRef = useRef<HTMLInputElement>(null);

    const { files, addFile, setActiveFileId, addNotification } = useAppStore();

    const workspaceFiles = useMemo(
        () => files.filter((file) => file.type === 'file'),
        [files]
    );

    const [tab, setTab] = useState<'project' | 'external'>('project');
    const [externalFiles, setExternalFiles] = useState<ExternalFile[]>([]);
    const [orderedRefs, setOrderedRefs] = useState<OrderedRef[]>(() =>
        files
            .filter((file) => file.type === 'file')
            .map((file) => ({ kind: 'file', id: file.id }))
    );
    const [outputFileName, setOutputFileName] = useState<string>(() =>
        createUniqueFileName(
            'Documento_Unido.md',
            files.map((file) => file.name)
        )
    );
    const [separator, setSeparator] = useState<BindingSeparator>('hr');
    const [isDragging, setIsDragging] = useState(false);

    const orderedItems = useMemo<BindableItem[]>(() => {
        const result: BindableItem[] = [];
        for (const ref of orderedRefs) {
            if (ref.kind === 'file') {
                const projectFile = workspaceFiles.find((file) => file.id === ref.id);
                if (projectFile) {
                    result.push({
                        id: projectFile.id,
                        name: projectFile.name,
                        content: projectFile.content,
                        type: 'file',
                    });
                }
            } else {
                const extFile = externalFiles.find((file) => file.id === ref.id);
                if (extFile) {
                    result.push({
                        id: extFile.id,
                        name: extFile.name,
                        content: extFile.content,
                        type: 'external',
                    });
                }
            }
        }
        return result;
    }, [orderedRefs, workspaceFiles, externalFiles]);

    const selectedProjectIdSet = useMemo(
        () =>
            new Set(
                orderedRefs
                    .filter((ref) => ref.kind === 'file')
                    .map((ref) => ref.id)
            ),
        [orderedRefs]
    );

    const mergedContent = useMemo(
        () => buildMergedDocument(orderedItems, separator),
        [orderedItems, separator]
    );

    const combinedBytes = useMemo(
        () => getUtf8ByteLength(mergedContent),
        [mergedContent]
    );

    const exceedsRecommended = combinedBytes > HEAVY_FILE_BYTES;
    const allProjectSelected =
        workspaceFiles.length > 0 &&
        workspaceFiles.every((file) => selectedProjectIdSet.has(file.id));

    const toggleProjectFile = (fileId: string, checked: boolean) => {
        setOrderedRefs((prev) => {
            if (checked) {
                if (prev.some((ref) => ref.kind === 'file' && ref.id === fileId)) {
                    return prev;
                }
                return [...prev, { kind: 'file', id: fileId }];
            }
            return prev.filter((ref) => !(ref.kind === 'file' && ref.id === fileId));
        });
    };

    const toggleAllProjectFiles = () => {
        if (allProjectSelected) {
            setOrderedRefs((prev) => prev.filter((ref) => ref.kind !== 'file'));
            return;
        }
        setOrderedRefs((prev) => {
            const existingFileIds = new Set(
                prev.filter((ref) => ref.kind === 'file').map((ref) => ref.id)
            );
            const missingRefs: OrderedRef[] = workspaceFiles
                .filter((file) => !existingFileIds.has(file.id))
                .map((file) => ({ kind: 'file', id: file.id }));
            return [...prev, ...missingRefs];
        });
    };

    const processExternalFiles = async (fileList: FileList) => {
        const addedExternal: ExternalFile[] = [];

        for (let index = 0; index < fileList.length; index += 1) {
            const rawFile = fileList[index];
            if (!isSupportedMarkdownFile(rawFile)) {
                addNotification(
                    `Archivo "${rawFile.name}" no compatible. Usa formatos .md, .markdown o .txt.`,
                    'error'
                );
                continue;
            }

            try {
                const content = await rawFile.text();
                const bytes = getUtf8ByteLength(content);
                if (bytes > HEAVY_FILE_BYTES) {
                    addNotification(
                        `El archivo externo "${rawFile.name}" supera los 2 MB (${formatBytes(bytes)}).`,
                        'info'
                    );
                }
                addedExternal.push({
                    id: generateId('ext'),
                    name: rawFile.name,
                    content,
                });
            } catch {
                addNotification(`Error al leer "${rawFile.name}".`, 'error');
            }
        }

        if (addedExternal.length > 0) {
            setExternalFiles((prev) => [...prev, ...addedExternal]);
            setOrderedRefs((prev) => [
                ...prev,
                ...addedExternal.map((file): OrderedRef => ({ kind: 'external', id: file.id })),
            ]);
            addNotification(
                addedExternal.length === 1
                    ? `Añadido "${addedExternal[0].name}" al listado de fusión.`
                    : `Añadidos ${addedExternal.length} archivos externos.`,
                'success'
            );
        }
    };

    const handleExternalInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const list = event.target.files;
        if (list && list.length > 0) {
            void processExternalFiles(list);
        }
        event.target.value = '';
    };

    const handleExternalDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            void processExternalFiles(event.dataTransfer.files);
        }
    };

    const removeItem = (id: string, kind: 'file' | 'external') => {
        setOrderedRefs((prev) =>
            prev.filter((ref) => !(ref.kind === kind && ref.id === id))
        );
        if (kind === 'external') {
            setExternalFiles((prev) => prev.filter((file) => file.id !== id));
        }
    };

    const moveItem = (index: number, delta: -1 | 1) => {
        const targetIndex = index + delta;
        if (targetIndex < 0 || targetIndex >= orderedItems.length) {
            return;
        }
        const nextItems = [...orderedItems];
        const [moved] = nextItems.splice(index, 1);
        nextItems.splice(targetIndex, 0, moved);
        setOrderedRefs(nextItems.map((item) => ({ kind: item.type, id: item.id })));
    };

    const resolveTargetFileName = (): string => {
        const normalized = normalizeMarkdownFileName(outputFileName, 'Documento_Unido.md');
        return createUniqueFileName(
            normalized,
            files.map((file) => file.name)
        );
    };

    const handleCreateMergedDocument = () => {
        if (orderedItems.length === 0) {
            return;
        }

        const finalName = resolveTargetFileName();
        const newFile: FileNode = {
            id: generateId('bound'),
            name: finalName,
            content: mergedContent,
            type: 'file',
            parentId: null,
        };

        addFile(newFile);
        setActiveFileId(newFile.id);
        addNotification(
            `Documento "${finalName}" creado con ${orderedItems.length} archivo(s).`,
            'success'
        );
        onClose();
    };

    const handleDownload = () => {
        if (orderedItems.length === 0) {
            return;
        }
        const finalName = resolveTargetFileName();
        downloadMarkdownFile(finalName, mergedContent);
        addNotification(`Archivo "${finalName}" descargado con éxito.`, 'success');
    };

    return (
        <>
            <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/20 p-4 sm:p-6">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-text">
                        <LinkIcon size={20} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <h2 id={titleId} className="text-lg font-bold text-foreground sm:text-xl">
                            Binding Tool
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Combina documentos del proyecto y archivos externos en un único archivo Markdown
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar Binding Tool"
                    className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                    <X size={20} aria-hidden="true" />
                </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
                {/* Left Column: Sources */}
                <div className="flex min-w-0 flex-col border-b border-border bg-muted/20 md:w-1/2 md:border-r md:border-b-0 md:overflow-hidden">
                    <div role="tablist" aria-label="Origen de archivos para fusionar" className="flex border-b border-border">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={tab === 'project'}
                            onClick={() => setTab('project')}
                            className={cn(
                                'flex-1 border-b-2 py-3 text-xs font-bold transition-colors sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring cursor-pointer',
                                tab === 'project'
                                    ? 'border-accent bg-accent/10 text-accent-text'
                                    : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            Archivos del Proyecto ({workspaceFiles.length})
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={tab === 'external'}
                            onClick={() => setTab('external')}
                            className={cn(
                                'flex-1 border-b-2 py-3 text-xs font-bold transition-colors sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring cursor-pointer',
                                tab === 'external'
                                    ? 'border-accent bg-accent/10 text-accent-text'
                                    : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            Carga Externa ({externalFiles.length})
                        </button>
                    </div>

                    <div className="max-h-60 overflow-y-auto p-4 md:max-h-none md:flex-1">
                        {tab === 'project' ? (
                            <div className="space-y-2">
                                {workspaceFiles.length > 0 ? (
                                    <>
                                        <div className="mb-3 flex items-center justify-between px-1">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                Selección del espacio de trabajo
                                            </span>
                                            <button
                                                type="button"
                                                onClick={toggleAllProjectFiles}
                                                className="text-xs font-bold text-accent-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded cursor-pointer"
                                            >
                                                {allProjectSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                                            </button>
                                        </div>
                                        {workspaceFiles.map((file) => {
                                            const checked = selectedProjectIdSet.has(file.id);
                                            const bytes = getUtf8ByteLength(file.content);
                                            return (
                                                <label
                                                    key={file.id}
                                                    className={cn(
                                                        'flex items-center gap-3 rounded-xl border p-3 transition-colors cursor-pointer',
                                                        checked
                                                            ? 'border-accent/45 bg-accent/5'
                                                            : 'border-border bg-card hover:border-accent/40'
                                                    )}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={(event) =>
                                                            toggleProjectFile(file.id, event.target.checked)
                                                        }
                                                        className="h-4 w-4 rounded border-border text-accent focus:ring-ring"
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-foreground">
                                                            {file.name}
                                                        </p>
                                                        <p className="text-[11px] font-mono text-muted-foreground">
                                                            {formatBytes(bytes)}
                                                        </p>
                                                    </div>
                                                    <FileText
                                                        size={16}
                                                        aria-hidden="true"
                                                        className="shrink-0 text-muted-foreground"
                                                    />
                                                </label>
                                            );
                                        })}
                                    </>
                                ) : (
                                    <p className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                                        No hay archivos guardados en el proyecto todavía. Puedes importar archivos externos en la pestaña contigua.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <input
                                    ref={externalInputRef}
                                    id={fileInputId}
                                    type="file"
                                    multiple
                                    accept=".md,.markdown,.txt"
                                    onChange={handleExternalInput}
                                    className="hidden"
                                />
                                <div
                                    role="button"
                                    tabIndex={0}
                                    aria-label="Subir archivos externos .md, .markdown o .txt para fusionar"
                                    onDragOver={(event) => {
                                        event.preventDefault();
                                        setIsDragging(true);
                                    }}
                                    onDragLeave={(event) => {
                                        event.preventDefault();
                                        setIsDragging(false);
                                    }}
                                    onDrop={handleExternalDrop}
                                    onClick={() => externalInputRef.current?.click()}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            externalInputRef.current?.click();
                                        }
                                    }}
                                    className={cn(
                                        'flex min-h-[160px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                        isDragging
                                            ? 'border-accent bg-accent/10'
                                            : 'border-border hover:border-accent/50 hover:bg-accent/5'
                                    )}
                                >
                                    <Upload
                                        size={30}
                                        aria-hidden="true"
                                        className={cn(
                                            'mb-2.5',
                                            isDragging ? 'text-accent-text' : 'text-muted-foreground'
                                        )}
                                    />
                                    <p className="text-sm font-bold text-foreground">
                                        Suelta archivos .md, .markdown o .txt
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        o haz clic para seleccionar desde tu equipo
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Order, Output Config & Action */}
                <div className="flex min-w-0 flex-col bg-background md:w-1/2 md:overflow-hidden">
                    <div className="flex items-center justify-between border-b border-border bg-muted/10 px-4 py-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Orden de fusión
                        </span>
                        <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-bold text-accent-text">
                            {orderedItems.length} elemento(s)
                        </span>
                    </div>

                    <div className="max-h-60 overflow-y-auto p-4 md:max-h-none md:flex-1">
                        {orderedItems.length === 0 ? (
                            <div className="flex h-full min-h-[120px] flex-col items-center justify-center text-center text-muted-foreground">
                                <LinkIcon size={28} aria-hidden="true" className="mb-2 opacity-50" />
                                <p className="text-xs">
                                    Selecciona o carga archivos para ordenar la fusión.
                                </p>
                            </div>
                        ) : (
                            <Reorder.Group
                                axis="y"
                                values={orderedItems}
                                onReorder={(nextItems) =>
                                    setOrderedRefs(
                                        nextItems.map((item) => ({
                                            kind: item.type,
                                            id: item.id,
                                        }))
                                    )
                                }
                                className="space-y-2"
                            >
                                {orderedItems.map((item, index) => {
                                    const itemBytes = getUtf8ByteLength(item.content);
                                    return (
                                        <Reorder.Item
                                            key={`${item.type}-${item.id}`}
                                            value={item}
                                            className="flex items-center gap-2 rounded-xl border border-border bg-card p-2.5 shadow-xs transition-shadow hover:shadow-sm cursor-grab active:cursor-grabbing"
                                        >
                                            <GripVertical
                                                size={16}
                                                aria-hidden="true"
                                                className="shrink-0 text-muted-foreground"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-foreground">
                                                    {item.name}
                                                </p>
                                                <div className="mt-0.5 flex items-center gap-2">
                                                    <span
                                                        className={cn(
                                                            'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
                                                            item.type === 'file'
                                                                ? 'bg-accent/15 text-accent-text'
                                                                : 'bg-amber-500/15 text-amber-900 dark:text-amber-200'
                                                        )}
                                                    >
                                                        {item.type === 'file' ? 'Proyecto' : 'Externo'}
                                                    </span>
                                                    <span className="text-[11px] font-mono text-muted-foreground">
                                                        {formatBytes(itemBytes)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div
                                                className="flex shrink-0 items-center gap-0.5"
                                                onPointerDown={(event) => event.stopPropagation()}
                                            >
                                                <button
                                                    type="button"
                                                    disabled={index === 0}
                                                    onClick={() => moveItem(index, -1)}
                                                    aria-label={`Mover arriba ${item.name}`}
                                                    title="Mover arriba"
                                                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                                                >
                                                    <ArrowUp size={14} aria-hidden="true" />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={index === orderedItems.length - 1}
                                                    onClick={() => moveItem(index, 1)}
                                                    aria-label={`Mover abajo ${item.name}`}
                                                    title="Mover abajo"
                                                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                                                >
                                                    <ArrowDown size={14} aria-hidden="true" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(item.id, item.type)}
                                                    aria-label={`Quitar ${item.name} de la fusión`}
                                                    title="Quitar"
                                                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                                                >
                                                    <Trash2 size={14} aria-hidden="true" />
                                                </button>
                                            </div>
                                        </Reorder.Item>
                                    );
                                })}
                            </Reorder.Group>
                        )}
                    </div>

                    <div className="space-y-3 border-t border-border bg-muted/30 p-4">
                        <div className="space-y-1.5">
                            <label
                                htmlFor={outputNameId}
                                className="block text-xs font-bold text-foreground"
                            >
                                Nombre del documento resultante
                            </label>
                            <input
                                id={outputNameId}
                                type="text"
                                value={outputFileName}
                                onChange={(event) => setOutputFileName(event.target.value)}
                                placeholder="Documento_Unido.md"
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <fieldset className="space-y-1.5">
                            <legend className="text-xs font-bold text-foreground">
                                Separador entre archivos
                            </legend>
                            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                                {SEPARATOR_OPTIONS.map((option) => {
                                    const active = separator === option.id;
                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            aria-pressed={active}
                                            onClick={() => setSeparator(option.id)}
                                            title={option.hint}
                                            className={cn(
                                                'rounded-xl border px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer',
                                                active
                                                    ? 'border-accent bg-accent/15 text-foreground'
                                                    : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                                            )}
                                        >
                                            <span className="block text-[11px] font-bold leading-tight">
                                                {option.label}
                                            </span>
                                            <span className="mt-0.5 block text-[10px] opacity-80">
                                                {option.hint}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </fieldset>

                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs">
                            <span className="font-semibold text-muted-foreground">
                                Tamaño combinado UTF-8
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-foreground">
                                    {formatBytes(combinedBytes)}
                                </span>
                                {exceedsRecommended && (
                                    <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/35 bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-900 dark:text-amber-200">
                                        <AlertTriangle size={12} aria-hidden="true" />
                                        &gt; 2 MB
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={handleCreateMergedDocument}
                                disabled={orderedItems.length === 0}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-accent-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                            >
                                <LinkIcon size={17} aria-hidden="true" />
                                <span>Fusionar y Crear Documento</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleDownload}
                                disabled={orderedItems.length === 0}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 py-3 text-xs font-bold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                            >
                                <Download size={16} aria-hidden="true" />
                                <span>Descargar .md</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
