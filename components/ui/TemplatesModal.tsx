'use client';

import React, { useId, useMemo, useState } from 'react';
import { FilePlus2, LayoutTemplate, Plus, Sparkles, X } from 'lucide-react';
import ModalContainer from '@/components/ui/ModalContainer';
import { createUniqueFileName } from '@/components/ui/fileHelpers';
import { useAppStore, type FileNode } from '@/lib/store';
import { DOCUMENT_TEMPLATES, type DocumentTemplate } from '@/lib/templates';
import { cn, generateId } from '@/lib/utils';

/**
 * Props for the TemplatesModal dialog component.
 */
export interface TemplatesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type CategoryFilter = 'Todas' | DocumentTemplate['category'];

const CATEGORY_TABS: readonly CategoryFilter[] = [
    'Todas',
    'Ingeniería',
    'Arquitectura',
    'Ciencia',
    'Gestión',
];

function getTemplatePreview(content: string): string {
    const lines = content
        .split('\n')
        .map((line) => line.trimEnd())
        .filter((line) => line.length > 0)
        .slice(0, 5);
    return lines.join('\n');
}

/**
 * Modal gallery of curated Spanish Markdown templates supporting new file creation or active insertion.
 */
export default function TemplatesModal({ isOpen, onClose }: TemplatesModalProps) {
    const titleId = useId();

    return (
        <ModalContainer
            isOpen={isOpen}
            onClose={onClose}
            ariaLabelledBy={titleId}
            maxWidthClassName="max-w-4xl"
            zIndexClassName="z-50"
        >
            <TemplatesModalBody titleId={titleId} onClose={onClose} />
        </ModalContainer>
    );
}

function TemplatesModalBody({
    titleId,
    onClose,
}: {
    titleId: string;
    onClose: () => void;
}) {
    const {
        files,
        activeFileId,
        addFile,
        setActiveFileId,
        updateFileContent,
        addNotification,
    } = useAppStore();
    const [activeCategory, setActiveCategory] = useState<CategoryFilter>('Todas');

    const filteredTemplates = useMemo(() => {
        if (activeCategory === 'Todas') {
            return DOCUMENT_TEMPLATES;
        }
        return DOCUMENT_TEMPLATES.filter((template) => template.category === activeCategory);
    }, [activeCategory]);

    const handleCreateFile = (template: DocumentTemplate) => {
        const uniqueName = createUniqueFileName(
            template.fileName,
            files.map((file) => file.name)
        );
        const newFile: FileNode = {
            id: generateId('file'),
            name: uniqueName,
            content: template.content,
            type: 'file',
            parentId: null,
        };

        addFile(newFile);
        setActiveFileId(newFile.id);
        addNotification(`Archivo "${uniqueName}" creado desde plantilla.`, 'success');
        onClose();
    };

    const handleInsertIntoCurrent = (template: DocumentTemplate) => {
        const activeFile = activeFileId
            ? files.find((file) => file.id === activeFileId && file.type === 'file')
            : undefined;

        if (activeFile) {
            const trimmedExisting = activeFile.content.replace(/\s+$/, '');
            const nextContent = trimmedExisting
                ? `${trimmedExisting}\n\n${template.content}`
                : template.content;
            updateFileContent(activeFile.id, nextContent);
            addNotification(
                `Plantilla "${template.title}" insertada en "${activeFile.name}".`,
                'success'
            );
            onClose();
            return;
        }

        const uniqueName = createUniqueFileName(
            template.fileName,
            files.map((file) => file.name)
        );
        const newFile: FileNode = {
            id: generateId('file'),
            name: uniqueName,
            content: template.content,
            type: 'file',
            parentId: null,
        };

        addFile(newFile);
        setActiveFileId(newFile.id);
        addNotification(
            `No había documento activo; se creó "${uniqueName}".`,
            'success'
        );
        onClose();
    };

    return (
        <>
            <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 p-4 sm:p-6">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-text">
                        <LayoutTemplate size={20} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <h2 id={titleId} className="text-lg font-bold text-foreground sm:text-xl">
                            Plantillas de Documentación
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Inicia con estructuras listas para GFM, tablas, KaTeX y Mermaid
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar modal de plantillas"
                    className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                    <X size={20} aria-hidden="true" />
                </button>
            </div>

            <div className="border-b border-border bg-background px-4 py-3 sm:px-6">
                <div
                    role="tablist"
                    aria-label="Filtrar plantillas por categoría"
                    className="flex flex-wrap items-center gap-1.5"
                >
                    {CATEGORY_TABS.map((category) => {
                        const selected = activeCategory === category;
                        return (
                            <button
                                key={category}
                                type="button"
                                role="tab"
                                aria-selected={selected}
                                onClick={() => setActiveCategory(category)}
                                className={cn(
                                    'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer',
                                    selected
                                        ? 'bg-accent text-accent-foreground shadow-sm'
                                        : 'border border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                                )}
                            >
                                {category}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {filteredTemplates.map((template) => (
                        <article
                            key={template.id}
                            className="flex flex-col justify-between rounded-2xl border border-border bg-background p-4 shadow-sm transition-colors hover:border-accent/50"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-full border border-accent/25 bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent-text">
                                        <Sparkles size={11} aria-hidden="true" />
                                        {template.category}
                                    </span>
                                    <span className="truncate text-[11px] font-mono text-muted-foreground">
                                        {template.fileName}
                                    </span>
                                </div>

                                <h3 className="mt-2.5 text-base font-bold text-foreground">
                                    {template.title}
                                </h3>
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                    {template.description}
                                </p>

                                <pre
                                    aria-label={`Vista previa de ${template.title}`}
                                    className="mt-3 max-h-28 overflow-hidden rounded-xl border border-border bg-muted/60 p-3 font-mono text-[11px] leading-relaxed text-foreground/90 whitespace-pre-wrap break-words"
                                >
                                    {getTemplatePreview(template.content)}
                                </pre>
                            </div>

                            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => handleCreateFile(template)}
                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                                >
                                    <FilePlus2 size={14} aria-hidden="true" />
                                    Crear archivo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleInsertIntoCurrent(template)}
                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                                >
                                    <Plus size={14} aria-hidden="true" />
                                    Insertar en actual
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </>
    );
}
