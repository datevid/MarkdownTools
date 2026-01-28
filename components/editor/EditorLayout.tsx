'use client';

import React, { useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { cn, formatBytes } from '@/lib/utils';
import {
    X, Plus, FileText, PanelLeft, Upload, Link,
    Download, Settings, Type, Focus, Columns, AlertCircle, Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import UploadModal from '@/components/upload/UploadModal';
import BindingModal from '@/components/binding/BindingModal';
import ExportManager from '@/components/export/ExportManager';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import NotificationSystem from '@/components/ui/NotificationSystem';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AboutModal from '@/components/ui/AboutModal';
import { Info } from 'lucide-react';

export default function EditorLayout({ children }: { children: React.ReactNode }) {
    const [uploadModalOpen, setUploadModalOpen] = React.useState(false);
    const [bindingModalOpen, setBindingModalOpen] = React.useState(false);
    const [deleteConfirm, setDeleteConfirm] = React.useState<{ open: boolean; fileId: string; fileName: string }>({
        open: false,
        fileId: '',
        fileName: ''
    });
    const [deleteAllConfirm, setDeleteAllConfirm] = React.useState(false);
    const [aboutModalOpen, setAboutModalOpen] = React.useState(false);

    const {
        sidebarOpen, setSidebarOpen,
        focusMode, setFocusMode,
        typewriterMode, setTypewriterMode,
        splitView, setSplitView,
        files, activeFileId, setActiveFileId,
        addFile, deleteFile, deleteAllFiles, addNotification
    } = useAppStore();

    const activeFile = files.find(f => f.id === activeFileId);

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 260 : 0, opacity: sidebarOpen ? 1 : 0 }}
                className={cn(
                    "flex flex-col border-r border-border bg-card/50 backdrop-blur-xl z-20 overflow-hidden",
                    !sidebarOpen && "border-none"
                )}
            >
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-3 group/logo cursor-pointer select-none">
                        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                            <span className="text-accent text-xl font-black italic tracking-tighter">M</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black tracking-tighter text-lg leading-none bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                Markdown Tools
                            </span>
                            <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-accent/80 leading-none mt-1">
                                Professional Editor
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1 hover:bg-muted rounded-md transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    <div className="px-2 py-1 flex items-center justify-between group/title">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Archivos</span>
                        {files.length > 0 && (
                            <button
                                onClick={() => setDeleteAllConfirm(true)}
                                className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 opacity-0 group-hover/title:opacity-100 transition-opacity cursor-pointer"
                                title="Borrar todos los archivos"
                            >
                                <Trash2 size={10} />
                                <span>Borrar todo</span>
                            </button>
                        )}
                    </div>
                    {files.map(file => (
                        <div key={file.id} className="relative group">
                            <button
                                onClick={() => setActiveFileId(file.id)}
                                className={cn(
                                    "flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md transition-colors text-left cursor-pointer",
                                    activeFileId === file.id ? "bg-accent/10 text-accent font-medium border border-accent/20" : "hover:bg-muted"
                                )}
                            >
                                <FileText size={16} />
                                <div className="flex-1 min-w-0">
                                    <p className="truncate block leading-tight">{file.name}</p>
                                    <span className="text-[9px] text-muted-foreground opacity-70">{formatBytes(file.content.length)}</span>
                                </div>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const fileToDownload = files.find(f => f.id === file.id);
                                    if (fileToDownload) {
                                        const blob = new Blob([fileToDownload.content], { type: 'text/markdown' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = fileToDownload.name;
                                        a.click();
                                        URL.revokeObjectURL(url);
                                        addNotification(`Descargando "${fileToDownload.name}"`, 'info');
                                    }
                                }}
                                className="absolute right-10 top-1 p-2 opacity-0 group-hover:opacity-100 hover:bg-accent/10 text-muted-foreground hover:text-accent rounded-full transition-all cursor-pointer"
                                title="Descargar MD"
                            >
                                <Download size={14} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirm({ open: true, fileId: file.id, fileName: file.name });
                                }}
                                className="absolute right-2 top-1 p-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-full transition-all cursor-pointer"
                                title="Eliminar archivo"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="p-2 border-t border-border bg-muted/20 space-y-1">
                    <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Herramientas</div>

                    <button
                        onClick={() => setUploadModalOpen(true)}
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                        <Upload size={14} />
                        <span>Cargar archivos</span>
                    </button>

                    <button
                        onClick={() => {
                            const newId = Date.now().toString();
                            const newFile = {
                                id: newId,
                                name: `Documento ${files.length + 1}.md`,
                                content: '# Nuevo Documento\n\nEmpieza a escribir aquí...',
                                type: 'file' as const,
                                parentId: null
                            };
                            addFile(newFile);
                            setActiveFileId(newId);
                            addNotification(`Creado: ${newFile.name}`, 'success');
                        }}
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-md"
                    >
                        <Plus size={14} />
                        <span>Nuevo archivo</span>
                    </button>

                    <button
                        onClick={() => setBindingModalOpen(true)}
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm font-bold text-accent hover:bg-accent/10 mt-2 transition-colors rounded-md border-2 border-accent/20 hover:border-accent"
                    >
                        <Link size={14} />
                        <span>Binding Tool</span>
                    </button>
                </div>

                {/* Mode Controls */}
                <div className="p-3 border-t border-border space-y-2">
                    <div className="text-[10px] px-2 uppercase tracking-widest text-muted-foreground font-bold mb-1">Visualización</div>
                    <button
                        onClick={() => setSplitView(!splitView)}
                        className={cn(
                            "flex items-center justify-between w-full px-2 py-1.5 text-xs rounded-md transition-colors",
                            splitView ? "bg-accent/10 text-accent" : "hover:bg-muted"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Columns size={14} />
                            <span>Vista Dividida</span>
                        </div>
                    </button>

                    <div className="text-[10px] px-2 uppercase tracking-widest text-muted-foreground font-bold mb-1 pt-2">Escritura</div>
                    <button
                        onClick={() => setFocusMode(!focusMode)}
                        className={cn(
                            "flex items-center justify-between w-full px-2 py-1.5 text-xs rounded-md transition-colors",
                            focusMode ? "bg-accent/10 text-accent" : "hover:bg-muted"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Focus size={14} />
                            <span>Focus Mode</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setTypewriterMode(!typewriterMode)}
                        className={cn(
                            "flex items-center justify-between w-full px-2 py-1.5 text-xs rounded-md transition-colors",
                            typewriterMode ? "bg-accent/10 text-accent" : "hover:bg-muted"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Type size={14} />
                            <span>Typewriter</span>
                        </div>
                    </button>
                </div>

                <div className="p-2 border-t border-border bg-muted/30 flex items-center justify-between">
                    <button
                        onClick={() => setAboutModalOpen(true)}
                        className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                        <Info size={16} />
                        <span>About</span>
                    </button>
                    <ThemeToggle />
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 relative bg-background">
                {/* Top Navbar */}
                <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-background/50 backdrop-blur-md z-10">
                    <div className="flex items-center gap-4">
                        {!sidebarOpen && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground"
                            >
                                <PanelLeft size={18} />
                            </button>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg border border-border">
                            <FileText size={14} className="text-muted-foreground" />
                            <span className="text-sm font-medium">{activeFile ? activeFile.name : 'Ningún archivo abierto'}</span>
                            {activeFile && activeFile.content.length > 2 * 1024 * 1024 && (
                                <div className="ml-2 flex items-center gap-1 text-[10px] text-orange-500 font-bold bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20" title="Archivo pesado: puede experimentar lag">
                                    <AlertCircle size={10} />
                                    <span>PESADO</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                                <Download size={16} />
                                <span>Export</span>
                            </button>
                            <div className="absolute right-0 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <ExportManager />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Workspace */}
                <div className="flex-1 relative overflow-hidden flex">
                    <div className="flex-1 relative overflow-y-auto">
                        {children}
                    </div>
                </div>
            </main>

            {/* Upload Modal */}
            <UploadModal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} />

            {/* Binding Modal */}
            <BindingModal isOpen={bindingModalOpen} onClose={() => setBindingModalOpen(false)} />

            {/* Global Notifications */}
            <NotificationSystem />

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ ...deleteConfirm, open: false })}
                onConfirm={() => {
                    deleteFile(deleteConfirm.fileId);
                    addNotification(`Eliminado: ${deleteConfirm.fileName}`, 'info');
                }}
                title="¿Eliminar archivo?"
                description={`Esta acción no se puede deshacer. El archivo "${deleteConfirm.fileName}" será borrado permanentemente.`}
                confirmText="Eliminar"
                variant="danger"
            />

            {/* Confirm Delete All */}
            <ConfirmDialog
                isOpen={deleteAllConfirm}
                onClose={() => setDeleteAllConfirm(false)}
                onConfirm={() => {
                    deleteAllFiles();
                    addNotification('Todos los archivos han sido eliminados', 'info');
                }}
                title="¿Borrar todos los archivos?"
                description="Esta acción eliminará permanentemente TODOS los documentos de tu listado. ¿Estás seguro?"
                confirmText="Borrar Todo"
                variant="danger"
            />

            {/* About Modal */}
            <AboutModal isOpen={aboutModalOpen} onClose={() => setAboutModalOpen(false)} />
        </div>
    );
}
