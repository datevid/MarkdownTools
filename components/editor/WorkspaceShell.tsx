'use client';

import React, { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import 'katex/dist/katex.min.css';
import { useAppStore, type FileNode } from '@/lib/store';
import { generateId } from '@/lib/utils';
import EditorLayout from '@/components/editor/EditorLayout';
import HybridEditor from '@/components/editor/HybridEditor';
import { FileText, Plus, Upload, LayoutTemplate } from 'lucide-react';

function TemplateDeepLinkSync() {
    const searchParams = useSearchParams();
    const templateParam = searchParams.get('template');
    const actionParam = searchParams.get('action');
    const appliedTemplateRef = useRef<string | null>(null);
    const appliedActionRef = useRef<string | null>(null);
    const hasHydrated = useAppStore((state) => state._hasHydrated);

    useEffect(() => {
        if (!hasHydrated) return;

        if (actionParam && appliedActionRef.current !== actionParam) {
            appliedActionRef.current = actionParam;
            const state = useAppStore.getState();
            if (actionParam === 'binding') {
                state.setBindingModalOpen(true);
            } else if (actionParam === 'upload') {
                state.setUploadModalOpen(true);
            } else if (actionParam === 'templates') {
                state.setTemplatesOpen(true);
            }
        }

        if (!templateParam) return;
        if (appliedTemplateRef.current === templateParam) return;
        appliedTemplateRef.current = templateParam;

        void import('@/lib/templates').then(({ DOCUMENT_TEMPLATES }) => {
            const matchedTemplate = DOCUMENT_TEMPLATES.find((tpl) => tpl.id === templateParam);
            if (!matchedTemplate) return;

            const state = useAppStore.getState();
            const existingExact = state.files.find(
                (file) =>
                    file.name === matchedTemplate.fileName &&
                    file.content === matchedTemplate.content
            );

            if (existingExact) {
                state.setActiveFileId(existingExact.id);
                state.addNotification(`Plantilla "${matchedTemplate.title}" abierta`, 'info');
                return;
            }

            const nameExists = state.files.some((file) => file.name === matchedTemplate.fileName);
            const targetName = nameExists
                ? matchedTemplate.fileName.replace(/\.md$/i, `-${state.files.length + 1}.md`)
                : matchedTemplate.fileName;

            const newId = generateId('tpl');
            const newFile: FileNode = {
                id: newId,
                name: targetName,
                content: matchedTemplate.content,
                type: 'file',
                parentId: null,
            };
            state.addFile(newFile);
            state.setActiveFileId(newId);
            state.addNotification(`Plantilla "${matchedTemplate.title}" cargada`, 'success');
        });
    }, [hasHydrated, templateParam, actionParam]);

    return null;
}

/**
 * Interactive client shell hosting the full-viewport editor workspace,
 * handling `?template=<id>` deep-linking and providing the empty workspace state.
 */
export default function WorkspaceShell() {
    const {
        files,
        activeFileId,
        updateFileContent,
        addFile,
        setActiveFileId,
        setTemplatesOpen,
        setUploadModalOpen,
        addNotification,
    } = useAppStore();

    const activeFile = files.find((f) => f.id === activeFileId);

    const handleCreateEmptyDocument = () => {
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

    return (
        <section
            id="workspace-editor"
            aria-label="Editor Markdown Interactivo"
            className="h-dvh min-h-[580px] flex flex-col overflow-hidden border-b border-border"
        >
            <Suspense fallback={null}>
                <TemplateDeepLinkSync />
            </Suspense>
            <EditorLayout>
                {activeFile ? (
                    <HybridEditor
                        key={activeFile.id}
                        fileId={activeFile.id}
                        fileName={activeFile.name}
                        initialValue={activeFile.content}
                        onChange={(val) => updateFileContent(activeFile.id, val)}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center p-6 bg-background text-foreground">
                        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-6 sm:p-8 text-center space-y-5 shadow-sm">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-accent/10 text-accent-text">
                                <FileText size={24} aria-hidden="true" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-lg font-bold tracking-tight text-foreground">
                                    No hay ningún documento abierto
                                </h2>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Crea un documento nuevo desde cero, sube tus archivos <code>.md</code> o
                                    arranca al instante con una plantilla técnica.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2.5 pt-1">
                                <button
                                    type="button"
                                    onClick={handleCreateEmptyDocument}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer"
                                >
                                    <Plus size={16} aria-hidden="true" />
                                    <span>Crear documento</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUploadModalOpen(true)}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                                >
                                    <Upload size={16} aria-hidden="true" />
                                    <span>Subir Markdown</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTemplatesOpen(true)}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                                >
                                    <LayoutTemplate size={16} aria-hidden="true" />
                                    <span>Explorar Plantillas</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </EditorLayout>
        </section>
    );
}
