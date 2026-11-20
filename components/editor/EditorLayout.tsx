'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { useAppStore, type FileNode } from '@/lib/store';
import { cn, formatBytes, generateId, getUtf8ByteLength } from '@/lib/utils';
import UploadModal from '@/components/upload/UploadModal';
import NotificationSystem from '@/components/ui/NotificationSystem';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import ExportManager from '@/components/export/ExportManager';

const BindingModal = dynamic(() => import('@/components/binding/BindingModal'), { ssr: false });
const BinderPanel = dynamic(() => import('@/components/binder/BinderPanel'), { ssr: false });
const BinderModal = dynamic(() => import('@/components/binder/BinderModal'), { ssr: false });
const TemplatesModal = dynamic(() => import('@/components/ui/TemplatesModal'), { ssr: false });
const ShortcutsModal = dynamic(() => import('@/components/ui/ShortcutsModal'), { ssr: false });
const AboutModal = dynamic(() => import('@/components/ui/AboutModal'), { ssr: false });
const ConfirmDialog = dynamic(() => import('@/components/ui/ConfirmDialog'), { ssr: false });
import {
    X,
    Plus,
    FileText,
    PanelLeft,
    Upload,
    Download,
    Type,
    Focus,
    AlertTriangle,
    Trash2,
    Info,
    Pencil,
    Check,
    Layers,
    GitMerge,
    LayoutTemplate,
    ListTree,
    Keyboard,
    BookOpen,
} from 'lucide-react';

const HEAVY_FILE_BYTES = 2 * 1024 * 1024;

function subscribeDesktopQuery(onStoreChange: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const mq = window.matchMedia('(min-width: 768px)');
    mq.addEventListener('change', onStoreChange);
    return () => mq.removeEventListener('change', onStoreChange);
}

function getDesktopSnapshot(): boolean {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(min-width: 768px)').matches;
}

function getDesktopServerSnapshot(): boolean {
    return true;
}

interface SidebarContentProps {
    files: FileNode[];
    activeFileId: string | null;
    binderItems: string[];
    focusMode: boolean;
    typewriterMode: boolean;
    tocOpen: boolean;
    isDesktop: boolean;
    onCloseSidebar: () => void;
    onSelectFile: (id: string) => void;
    onRenameFile: (id: string, name: string) => void;
    onDownloadFile: (file: FileNode) => void;
    onRequestDeleteFile: (file: FileNode) => void;
    onRequestDeleteAll: () => void;
    onAddNewFile: () => void;
    onAddToBinder: (file: FileNode) => void;
    onOpenUpload: () => void;
    onOpenTemplates: () => void;
    onOpenBinding: () => void;
    onToggleFocusMode: () => void;
    onToggleTypewriterMode: () => void;
    onToggleToc: () => void;
    onOpenAbout: () => void;
    onOpenShortcuts: () => void;
}

function SidebarContent({
    files,
    activeFileId,
    binderItems,
    focusMode,
    typewriterMode,
    tocOpen,
    isDesktop,
    onCloseSidebar,
    onSelectFile,
    onRenameFile,
    onDownloadFile,
    onRequestDeleteFile,
    onRequestDeleteAll,
    onAddNewFile,
    onAddToBinder,
    onOpenUpload,
    onOpenTemplates,
    onOpenBinding,
    onToggleFocusMode,
    onToggleTypewriterMode,
    onToggleToc,
    onOpenAbout,
    onOpenShortcuts,
}: SidebarContentProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftName, setDraftName] = useState('');
    const renameInputRef = useRef<HTMLInputElement>(null);

    const startRename = (file: FileNode) => {
        setEditingId(file.id);
        setDraftName(file.name);
        requestAnimationFrame(() => {
            renameInputRef.current?.focus();
            renameInputRef.current?.select();
        });
    };

    const commitRename = (fileId: string) => {
        const trimmed = draftName.trim();
        if (trimmed) {
            onRenameFile(fileId, trimmed);
        }
        setEditingId(null);
    };

    return (
        <div className="flex h-full w-full flex-col bg-card text-card-foreground overflow-hidden">
            {/* Brand Header */}
            <div className="flex items-center justify-between border-b border-border px-3.5 py-3 shrink-0">
                <Link
                    href="#workspace-editor"
                    className="flex items-center gap-2.5 min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-accent/10 p-1">
                        <Image
                            src="/logo.png"
                            alt="Logo de Markdown Tools"
                            width={28}
                            height={28}
                            className="h-full w-full object-contain"
                        />
                    </span>
                    <span className="flex flex-col min-w-0">
                        <span className="truncate text-sm font-extrabold tracking-tight text-foreground leading-none">
                            Markdown Tools
                        </span>
                        <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-accent-text leading-none">
                            Editor Técnico
                        </span>
                    </span>
                </Link>

                <button
                    type="button"
                    onClick={onCloseSidebar}
                    aria-label="Cerrar barra lateral"
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                >
                    <X size={16} />
                </button>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
                <div className="flex items-center justify-between px-1.5 py-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Archivos ({files.length})
                    </span>
                    {files.length > 0 && (
                        <button
                            type="button"
                            onClick={onRequestDeleteAll}
                            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                            title="Borrar todos los archivos"
                        >
                            <Trash2 size={11} aria-hidden="true" />
                            <span>Borrar todo</span>
                        </button>
                    )}
                </div>

                {files.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                        Sin documentos. Crea uno nuevo o sube un archivo <code>.md</code>.
                    </div>
                ) : (
                    files.map((file) => {
                        const byteSize = getUtf8ByteLength(file.content);
                        const isHeavy = byteSize > HEAVY_FILE_BYTES;
                        const isActive = activeFileId === file.id;
                        const inBinder = binderItems.includes(file.id);
                        const isRenaming = editingId === file.id;

                        return (
                            <div
                                key={file.id}
                                draggable={!isRenaming}
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('text/plain', file.id);
                                    e.dataTransfer.effectAllowed = 'copyMove';
                                }}
                                className={cn(
                                    'group relative rounded-xl border p-2 transition-colors',
                                    !isRenaming && 'cursor-pointer',
                                    isActive
                                        ? 'border-accent/40 bg-accent/10'
                                        : 'border-transparent hover:border-border hover:bg-muted/60'
                                )}
                            >
                                <div className="flex items-start gap-2">
                                    <FileText
                                        size={15}
                                        className={cn(
                                            'mt-0.5 shrink-0',
                                            isActive ? 'text-accent-text' : 'text-muted-foreground'
                                        )}
                                        aria-hidden="true"
                                    />

                                    <div className="flex-1 min-w-0">
                                        {isRenaming ? (
                                            <input
                                                ref={renameInputRef}
                                                type="text"
                                                value={draftName}
                                                onChange={(e) => setDraftName(e.target.value)}
                                                onBlur={() => commitRename(file.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        commitRename(file.id);
                                                    } else if (e.key === 'Escape') {
                                                        e.preventDefault();
                                                        setEditingId(null);
                                                    }
                                                }}
                                                aria-label="Nuevo nombre del archivo"
                                                className="relative z-10 w-full rounded border border-accent bg-background px-1.5 py-0.5 text-xs font-medium text-foreground focus:outline-none"
                                            />
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onSelectFile(file.id);
                                                    if (!isDesktop) onCloseSidebar();
                                                }}
                                                onDoubleClick={() => startRename(file)}
                                                aria-current={isActive ? 'true' : undefined}
                                                className="w-full text-left cursor-pointer focus-visible:outline-none after:absolute after:inset-0 after:z-[1] after:rounded-xl after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-ring"
                                                title="Clic para abrir · Doble clic para renombrar · Arrastra al Binder"
                                            >
                                                <span
                                                    className={cn(
                                                        'block truncate text-xs leading-tight',
                                                        isActive
                                                            ? 'font-semibold text-foreground'
                                                            : 'font-medium text-foreground/90'
                                                    )}
                                                >
                                                    {file.name}
                                                </span>
                                            </button>
                                        )}

                                        <div className="mt-1 flex items-center gap-1.5">
                                            <span className="text-[10px] text-muted-foreground tabular-nums">
                                                {formatBytes(byteSize)}
                                            </span>
                                            {isHeavy && (
                                                <span
                                                    className="inline-flex items-center gap-0.5 rounded bg-amber-500/15 px-1 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400"
                                                    title="Archivo superior a 2 MB"
                                                >
                                                    <AlertTriangle size={9} aria-hidden="true" />
                                                    <span>&gt; 2 MB</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Explicit Accessible Action Buttons */}
                                <div className="pointer-events-none relative z-10 mt-1.5 flex items-center justify-end gap-1 border-t border-border/50 pt-1.5 opacity-90 sm:opacity-70 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        onClick={() => startRename(file)}
                                        aria-label={`Renombrar ${file.name}`}
                                        title="Renombrar"
                                        className="pointer-events-auto rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground transition-colors cursor-pointer"
                                    >
                                        <Pencil size={12} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onAddToBinder(file)}
                                        aria-label={`Añadir ${file.name} al Binder`}
                                        title={inBinder ? 'Ya está en el Binder' : 'Añadir al Binder'}
                                        className={cn(
                                            'pointer-events-auto rounded p-1 transition-colors cursor-pointer',
                                            inBinder
                                                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                                                : 'text-muted-foreground hover:bg-background hover:text-accent-text'
                                        )}
                                    >
                                        {inBinder ? <Check size={12} /> : <Plus size={12} />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDownloadFile(file)}
                                        aria-label={`Descargar ${file.name}`}
                                        title="Descargar .md"
                                        className="pointer-events-auto rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground transition-colors cursor-pointer"
                                    >
                                        <Download size={12} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onRequestDeleteFile(file)}
                                        aria-label={`Eliminar ${file.name}`}
                                        title="Eliminar archivo"
                                        className="pointer-events-auto rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Workspace Actions */}
            <div className="border-t border-border bg-muted/20 p-2.5 space-y-1 shrink-0">
                <div className="px-1.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Herramientas
                </div>
                <button
                    type="button"
                    onClick={onAddNewFile}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                    <Plus size={14} className="text-accent-text" aria-hidden="true" />
                    <span>Nuevo archivo</span>
                </button>
                <button
                    type="button"
                    onClick={onOpenUpload}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                    <Upload size={14} className="text-muted-foreground" aria-hidden="true" />
                    <span>Cargar archivos (.md)</span>
                </button>
                <button
                    type="button"
                    onClick={onOpenTemplates}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                    <LayoutTemplate size={14} className="text-muted-foreground" aria-hidden="true" />
                    <span>Plantillas técnicas</span>
                </button>
                <button
                    type="button"
                    onClick={onOpenBinding}
                    className="flex w-full items-center gap-2 rounded-lg bg-accent/10 px-2.5 py-1.5 text-xs font-bold text-accent-text hover:bg-accent/15 transition-colors cursor-pointer"
                >
                    <GitMerge size={14} aria-hidden="true" />
                    <span>Fusión (Binding Tool)</span>
                </button>
            </div>

            {/* Writing Modes (accessible on mobile & desktop) */}
            <div className="border-t border-border p-2.5 space-y-1 shrink-0">
                <div className="px-1.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Modos de escritura
                </div>
                <button
                    type="button"
                    aria-pressed={focusMode}
                    onClick={onToggleFocusMode}
                    className={cn(
                        'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                        focusMode
                            ? 'bg-accent/15 text-accent-text font-semibold'
                            : 'text-foreground hover:bg-muted'
                    )}
                >
                    <span className="flex items-center gap-2">
                        <Focus size={14} aria-hidden="true" />
                        <span>Focus Mode</span>
                    </span>
                    <span className="text-[10px]">{focusMode ? 'ON' : 'OFF'}</span>
                </button>
                <button
                    type="button"
                    aria-pressed={typewriterMode}
                    onClick={onToggleTypewriterMode}
                    className={cn(
                        'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                        typewriterMode
                            ? 'bg-accent/15 text-accent-text font-semibold'
                            : 'text-foreground hover:bg-muted'
                    )}
                >
                    <span className="flex items-center gap-2">
                        <Type size={14} aria-hidden="true" />
                        <span>Typewriter Mode</span>
                    </span>
                    <span className="text-[10px]">{typewriterMode ? 'ON' : 'OFF'}</span>
                </button>
                <button
                    type="button"
                    aria-pressed={tocOpen}
                    onClick={onToggleToc}
                    className={cn(
                        'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                        tocOpen
                            ? 'bg-accent/15 text-accent-text font-semibold'
                            : 'text-foreground hover:bg-muted'
                    )}
                >
                    <span className="flex items-center gap-2">
                        <ListTree size={14} aria-hidden="true" />
                        <span>Tabla de Contenidos</span>
                    </span>
                    <span className="text-[10px]">{tocOpen ? 'ON' : 'OFF'}</span>
                </button>
            </div>

            {/* Sidebar Footer */}
            <div className="border-t border-border bg-muted/30 p-2.5 space-y-2 shrink-0">
                <Link
                    href="/guia-markdown-mermaid-katex"
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                    <BookOpen size={14} aria-hidden="true" />
                    <span>Guía Markdown, Mermaid &amp; KaTeX</span>
                </Link>
                <div className="flex items-center justify-between gap-1 px-1">
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={onOpenAbout}
                            aria-label="Info: acerca de Markdown Tools"
                            title="Sobre Markdown Tools"
                            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                        >
                            <Info size={14} aria-hidden="true" />
                            <span>Info</span>
                        </button>
                        <button
                            type="button"
                            onClick={onOpenShortcuts}
                            aria-label="Atajos de teclado"
                            title="Atajos de teclado (Ctrl+/)"
                            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                        >
                            <Keyboard size={14} aria-hidden="true" />
                            <span>Atajos</span>
                        </button>
                    </div>
                    <ThemeToggle />
                </div>
            </div>
        </div>
    );
}

/**
 * Responsive shell layout providing the collapsible file sidebar (mobile drawer + desktop panel),
 * accessible header toolbar, Binder integration, heavy-file warning, and global workspace modals.
 */
export default function EditorLayout({ children }: { children: React.ReactNode }) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [aboutModalOpen, setAboutModalOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{
        open: boolean;
        fileId: string;
        fileName: string;
    }>({
        open: false,
        fileId: '',
        fileName: '',
    });
    const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
    const hasCheckedStartupUploadRef = useRef(false);

    const {
        sidebarOpen,
        setSidebarOpen,
        binderOpen,
        setBinderOpen,
        templatesOpen,
        setTemplatesOpen,
        shortcutsOpen,
        setShortcutsOpen,
        tocOpen,
        setTocOpen,
        uploadModalOpen,
        setUploadModalOpen,
        bindingModalOpen,
        setBindingModalOpen,
        dontShowUploadOnStartup,
        _hasHydrated,
        binderItems,
        addToBinder,
        focusMode,
        setFocusMode,
        typewriterMode,
        setTypewriterMode,
        files,
        activeFileId,
        setActiveFileId,
        addFile,
        renameFile,
        deleteFile,
        deleteAllFiles,
        addNotification,
    } = useAppStore();

    const isDesktop = useSyncExternalStore(
        subscribeDesktopQuery,
        getDesktopSnapshot,
        getDesktopServerSnapshot
    );

    const effectiveSidebarOpen = isDesktop ? sidebarOpen : mobileSidebarOpen;

    // Open UploadModal on startup awaiting a file unless user opted out ("No mostrarme otra vez")
    useEffect(() => {
        if (!_hasHydrated || hasCheckedStartupUploadRef.current) return;
        hasCheckedStartupUploadRef.current = true;
        const hasTemplateParam =
            typeof window !== 'undefined' &&
            Boolean(new URLSearchParams(window.location.search).get('template'));
        if (!dontShowUploadOnStartup && !hasTemplateParam) {
            setUploadModalOpen(true);
        }
    }, [_hasHydrated, dontShowUploadOnStartup, setUploadModalOpen]);

    // Close mobile sidebar drawer on Escape
    useEffect(() => {
        if (isDesktop || !mobileSidebarOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                setMobileSidebarOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDesktop, mobileSidebarOpen]);

    const activeFile = files.find((f) => f.id === activeFileId);
    const activeBytes = activeFile ? getUtf8ByteLength(activeFile.content) : 0;
    const isActiveHeavy = activeBytes > HEAVY_FILE_BYTES;

    const handleCreateNewFile = () => {
        const newId = generateId('doc');
        const newFile: FileNode = {
            id: newId,
            name: `Documento ${files.length + 1}.md`,
            content: '# Nuevo Documento\n\nEmpieza a escribir aquí...',
            type: 'file',
            parentId: null,
        };
        addFile(newFile);
        setActiveFileId(newId);
        addNotification(`Creado: "${newFile.name}"`, 'success');
    };

    const handleDownloadFile = (file: FileNode) => {
        const blob = new Blob([file.content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(url);
        addNotification(`Descargando "${file.name}"`, 'info');
    };

    const handleAddToBinder = (file: FileNode) => {
        addToBinder(file.id);
        addNotification(`"${file.name}" añadido al Binder`, 'success');
    };

    const closeMobileDrawerIfNeeded = () => {
        if (!isDesktop) {
            setMobileSidebarOpen(false);
        }
    };

    const closeActiveSidebar = () => {
        if (isDesktop) {
            setSidebarOpen(false);
        } else {
            setMobileSidebarOpen(false);
        }
    };

    const sidebarProps: SidebarContentProps = {
        files,
        activeFileId,
        binderItems,
        focusMode,
        typewriterMode,
        tocOpen,
        isDesktop,
        onCloseSidebar: closeActiveSidebar,
        onSelectFile: (id) => setActiveFileId(id),
        onRenameFile: (id, name) => renameFile(id, name),
        onDownloadFile: handleDownloadFile,
        onRequestDeleteFile: (file) =>
            setDeleteConfirm({ open: true, fileId: file.id, fileName: file.name }),
        onRequestDeleteAll: () => setDeleteAllConfirm(true),
        onAddNewFile: () => {
            handleCreateNewFile();
            closeMobileDrawerIfNeeded();
        },
        onAddToBinder: handleAddToBinder,
        onOpenUpload: () => {
            closeMobileDrawerIfNeeded();
            setUploadModalOpen(true);
        },
        onOpenTemplates: () => {
            closeMobileDrawerIfNeeded();
            setTemplatesOpen(true);
        },
        onOpenBinding: () => {
            closeMobileDrawerIfNeeded();
            setBindingModalOpen(true);
        },
        onToggleFocusMode: () => setFocusMode(!focusMode),
        onToggleTypewriterMode: () => setTypewriterMode(!typewriterMode),
        onToggleToc: () => setTocOpen(!tocOpen),
        onOpenAbout: () => {
            closeMobileDrawerIfNeeded();
            setAboutModalOpen(true);
        },
        onOpenShortcuts: () => {
            closeMobileDrawerIfNeeded();
            setShortcutsOpen(true);
        },
    };

    return (
        <div className="flex flex-col h-full w-full max-w-full overflow-hidden bg-background text-foreground">
            {/* Top Header Bar */}
            <header
                className={cn(
                    'flex h-13 w-full max-w-full shrink-0 items-center justify-between gap-2 border-b border-border bg-background/90 px-2.5 sm:px-4 backdrop-blur-md z-20 transition-opacity duration-300 overflow-x-clip',
                    focusMode && 'opacity-45 hover:opacity-100 focus-within:opacity-100'
                )}
            >
                {/* Left Group: Sidebar Toggle + Brand + Active File */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
                    <button
                        type="button"
                        onClick={() => {
                            if (isDesktop) {
                                setSidebarOpen(!sidebarOpen);
                            } else {
                                setMobileSidebarOpen((prev) => !prev);
                            }
                        }}
                        aria-expanded={effectiveSidebarOpen}
                        aria-label={effectiveSidebarOpen ? 'Ocultar barra lateral' : 'Mostrar barra lateral'}
                        title={effectiveSidebarOpen ? 'Ocultar barra lateral' : 'Mostrar barra lateral'}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <PanelLeft size={16} aria-hidden="true" />
                    </button>

                    {!effectiveSidebarOpen && (
                        <Link
                            href="#workspace-editor"
                            className="hidden sm:inline-flex items-center gap-2 shrink-0 rounded-lg px-1.5 py-1 text-sm font-extrabold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-accent/10 p-0.5">
                                <Image
                                    src="/logo.png"
                                    alt="Logo de Markdown Tools"
                                    width={22}
                                    height={22}
                                    className="h-full w-full object-contain"
                                    priority
                                />
                            </span>
                            <span className="hidden md:inline">Markdown Tools</span>
                        </Link>
                    )}

                    <div className="flex items-center gap-1.5 min-w-0 rounded-lg border border-border bg-muted/50 px-2 sm:px-2.5 py-1">
                        <FileText size={13} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                        <span className="truncate text-xs sm:text-sm font-medium text-foreground max-w-[125px] sm:max-w-[220px]">
                            {activeFile ? activeFile.name : 'Sin documento'}
                        </span>
                        {isActiveHeavy && (
                            <span
                                className="inline-flex shrink-0 items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400"
                                title="Archivo superior a 2 MB: se recomienda dividir con Binder"
                            >
                                <AlertTriangle size={10} aria-hidden="true" />
                                <span className="hidden sm:inline">&gt; 2 MB</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Right Group: Compact Responsive Actions */}
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    <button
                        type="button"
                        onClick={() => setTemplatesOpen(true)}
                        aria-label="Abrir galería de plantillas"
                        title="Plantillas Markdown"
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                        <LayoutTemplate size={14} aria-hidden="true" />
                        <span className="hidden xl:inline">Plantillas</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setBinderOpen(!binderOpen)}
                        aria-pressed={binderOpen}
                        aria-label="Abrir panel Binder"
                        title="Binder rápido (organizar capítulos)"
                        className={cn(
                            'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2 text-xs font-medium transition-colors cursor-pointer',
                            binderOpen
                                ? 'border-accent/50 bg-accent/15 text-accent-text'
                                : 'border-border bg-background text-foreground hover:bg-muted'
                        )}
                    >
                        <Layers size={14} aria-hidden="true" />
                        <span className="hidden lg:inline">Binder</span>
                        {binderItems.length > 0 && (
                            <span className="rounded-full bg-accent px-1.5 py-0.2 text-[10px] font-bold text-accent-foreground tabular-nums">
                                {binderItems.length}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setBindingModalOpen(true)}
                        aria-label="Fusión: abrir Binding Tool para fusionar archivos"
                        title="Fusión multi-archivo (Binding Tool)"
                        className="hidden sm:inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                        <GitMerge size={14} aria-hidden="true" />
                        <span className="hidden xl:inline">Fusión</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setTocOpen(!tocOpen)}
                        aria-pressed={tocOpen}
                        aria-label="TOC: alternar tabla de contenidos"
                        title="Tabla de Contenidos (TOC)"
                        className={cn(
                            'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2 text-xs font-medium transition-colors cursor-pointer',
                            tocOpen
                                ? 'border-accent/50 bg-accent/15 text-accent-text'
                                : 'border-border bg-background text-foreground hover:bg-muted'
                        )}
                    >
                        <ListTree size={14} aria-hidden="true" />
                        <span className="hidden xl:inline">TOC</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setFocusMode(!focusMode)}
                        aria-pressed={focusMode}
                        aria-label="Alternar Focus Mode"
                        title="Focus Mode"
                        className={cn(
                            'hidden md:inline-flex h-8 items-center gap-1.5 rounded-lg border px-2 text-xs font-medium transition-colors cursor-pointer',
                            focusMode
                                ? 'border-accent/50 bg-accent/15 text-accent-text'
                                : 'border-border bg-background text-foreground hover:bg-muted'
                        )}
                    >
                        <Focus size={14} aria-hidden="true" />
                        <span className="hidden 2xl:inline">Focus</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setTypewriterMode(!typewriterMode)}
                        aria-pressed={typewriterMode}
                        aria-label="Alternar Typewriter Mode"
                        title="Typewriter Mode"
                        className={cn(
                            'hidden md:inline-flex h-8 items-center gap-1.5 rounded-lg border px-2 text-xs font-medium transition-colors cursor-pointer',
                            typewriterMode
                                ? 'border-accent/50 bg-accent/15 text-accent-text'
                                : 'border-border bg-background text-foreground hover:bg-muted'
                        )}
                    >
                        <Type size={14} aria-hidden="true" />
                        <span className="hidden 2xl:inline">Typewriter</span>
                    </button>

                    <Link
                        href="/guia-markdown-mermaid-katex"
                        className="hidden sm:inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                        title="Guía de Markdown, Mermaid y KaTeX"
                    >
                        <BookOpen size={14} aria-hidden="true" />
                        <span className="hidden lg:inline">Guía</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setAboutModalOpen(true)}
                        aria-label="Acerca de Markdown Tools"
                        title="Sobre Markdown Tools"
                        className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                    >
                        <Info size={14} />
                    </button>

                    <button
                        type="button"
                        onClick={() => setShortcutsOpen(true)}
                        aria-label="Atajos de teclado"
                        title="Atajos de teclado (Ctrl+/)"
                        className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                    >
                        <Keyboard size={14} />
                    </button>

                    <ThemeToggle />

                    <ExportManager />
                </div>
            </header>

            {/* Heavy File Recommendation Banner */}
            {isActiveHeavy && activeFile && (
                <div
                    role="status"
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs text-amber-800 dark:text-amber-200 shrink-0"
                >
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={14} className="shrink-0" aria-hidden="true" />
                        <span>
                            <strong>{activeFile.name}</strong> supera los 2 MB ({formatBytes(activeBytes)}). Te
                            recomendamos dividirlo en capítulos y unirlos con Binder / Binding Tool.
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setBindingModalOpen(true)}
                        className="rounded-md border border-amber-500/40 bg-background/80 px-2.5 py-1 text-[11px] font-semibold hover:bg-background transition-colors cursor-pointer"
                    >
                        Abrir Binding Tool
                    </button>
                </div>
            )}

            {/* Main Workspace Row */}
            <div className="flex-1 flex min-w-0 min-h-0 relative overflow-hidden">
                {/* Desktop Collapsible Inline Sidebar */}
                {isDesktop && (
                    <aside
                        aria-label="Explorador de archivos"
                        aria-hidden={!sidebarOpen}
                        className={cn(
                            'hidden md:flex shrink-0 border-r border-border transition-all duration-200 overflow-hidden',
                            sidebarOpen ? 'w-[264px]' : 'w-0 border-r-0 pointer-events-none',
                            focusMode && sidebarOpen && 'opacity-55 hover:opacity-100 focus-within:opacity-100'
                        )}
                    >
                        {sidebarOpen && <SidebarContent {...sidebarProps} />}
                    </aside>
                )}

                {/* Mobile Sidebar Overlay Drawer */}
                {!isDesktop && mobileSidebarOpen && (
                    <div className="fixed inset-0 z-40 flex md:hidden">
                        <div
                            onClick={() => setMobileSidebarOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
                            aria-hidden="true"
                        />
                        <aside
                            role="dialog"
                            aria-modal="true"
                            aria-label="Explorador de archivos"
                            className="relative z-50 h-full w-72 max-w-[85vw] border-r border-border bg-card shadow-2xl"
                        >
                            <SidebarContent {...sidebarProps} />
                        </aside>
                    </div>
                )}

                {/* Active Editor Column */}
                <div className="flex-1 flex flex-col min-w-0 min-h-0 relative overflow-hidden">
                    {children}
                </div>

                {/* Desktop Binder Side Panel */}
                {isDesktop && binderOpen && (
                    <BinderPanel
                        className="hidden md:flex shrink-0"
                        onOpenBinding={() => {
                            setBinderOpen(false);
                            setBindingModalOpen(true);
                        }}
                    />
                )}
            </div>

            {/* Mobile Binder Modal */}
            {!isDesktop && binderOpen && (
                <BinderModal
                    isOpen
                    onClose={() => setBinderOpen(false)}
                    onOpenBinding={() => {
                        setBinderOpen(false);
                        setBindingModalOpen(true);
                    }}
                />
            )}

            {/* Global Workspace Modals */}
            <UploadModal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} />
            {bindingModalOpen && (
                <BindingModal isOpen onClose={() => setBindingModalOpen(false)} />
            )}
            {templatesOpen && (
                <TemplatesModal isOpen onClose={() => setTemplatesOpen(false)} />
            )}
            {shortcutsOpen && (
                <ShortcutsModal isOpen onClose={() => setShortcutsOpen(false)} />
            )}
            {aboutModalOpen && (
                <AboutModal isOpen onClose={() => setAboutModalOpen(false)} />
            )}

            {deleteConfirm.open && (
                <ConfirmDialog
                    isOpen
                    onClose={() => setDeleteConfirm((prev) => ({ ...prev, open: false }))}
                    onConfirm={() => {
                        deleteFile(deleteConfirm.fileId);
                        addNotification(`Eliminado: "${deleteConfirm.fileName}"`, 'info');
                    }}
                    title="¿Eliminar archivo?"
                    description={`Esta acción no se puede deshacer. El archivo "${deleteConfirm.fileName}" será borrado permanentemente.`}
                    confirmText="Eliminar"
                    variant="danger"
                />
            )}

            {deleteAllConfirm && (
                <ConfirmDialog
                    isOpen
                    onClose={() => setDeleteAllConfirm(false)}
                    onConfirm={() => {
                        deleteAllFiles();
                        addNotification('Todos los archivos han sido eliminados', 'info');
                    }}
                    title="¿Borrar todos los archivos?"
                    description="Esta acción eliminará permanentemente todos los documentos de tu listado. ¿Estás seguro?"
                    confirmText="Borrar Todo"
                    variant="danger"
                />
            )}

            <NotificationSystem />
        </div>
    );
}
