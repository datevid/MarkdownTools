'use client';

import React, { useId } from 'react';
import { Keyboard, X } from 'lucide-react';
import ModalContainer from '@/components/ui/ModalContainer';

/**
 * Props for the ShortcutsModal keyboard reference dialog.
 */
export interface ShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ShortcutEntry {
    keys: string[];
    description: string;
}

interface ShortcutSection {
    title: string;
    items: ShortcutEntry[];
}

const SHORTCUT_SECTIONS: readonly ShortcutSection[] = [
    {
        title: 'Formato de texto',
        items: [
            { keys: ['Ctrl / Cmd', 'B'], description: 'Aplicar o alternar negrita' },
            { keys: ['Ctrl / Cmd', 'I'], description: 'Aplicar o alternar cursiva' },
            { keys: ['Ctrl / Cmd', 'K'], description: 'Insertar enlace Markdown' },
            { keys: ['Ctrl / Cmd', 'E'], description: 'Formatear como código en línea' },
        ],
    },
    {
        title: 'Edición y búsqueda',
        items: [
            { keys: ['Ctrl / Cmd', 'Z'], description: 'Deshacer último cambio' },
            { keys: ['Ctrl / Cmd', 'Y / Shift+Z'], description: 'Rehacer cambio deshecho' },
            { keys: ['Ctrl / Cmd', 'F'], description: 'Abrir buscar y reemplazar' },
            { keys: ['Tab'], description: 'Indentar línea o selección' },
            { keys: ['Shift', 'Tab'], description: 'Reducir sangría de línea' },
        ],
    },
    {
        title: 'Modos y navegación',
        items: [
            { keys: ['Ctrl', 'Shift', 'M'], description: 'Alternar modo de vista del editor' },
            { keys: ['Ctrl', 'Shift', 'D'], description: 'Activar o desactivar Focus Mode' },
            { keys: ['Ctrl', '/'], description: 'Abrir guía de atajos de teclado' },
            { keys: ['Esc'], description: 'Cerrar modal, panel o buscador activo' },
        ],
    },
];

/**
 * Accessible keyboard shortcut cheat sheet dialog grouped by editing, formatting, and workspace navigation.
 */
export default function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
    const titleId = useId();

    return (
        <ModalContainer
            isOpen={isOpen}
            onClose={onClose}
            ariaLabelledBy={titleId}
            maxWidthClassName="max-w-2xl"
            zIndexClassName="z-50"
        >
            <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 p-4 sm:p-6">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-text">
                        <Keyboard size={20} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <h2 id={titleId} className="text-lg font-bold text-foreground sm:text-xl">
                            Atajos de Teclado
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Acelera tu flujo de escritura, edición y navegación
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar guía de atajos de teclado"
                    className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                    <X size={20} aria-hidden="true" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {SHORTCUT_SECTIONS.map((section) => (
                    <section key={section.title} aria-label={section.title}>
                        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {section.title}
                        </h3>
                        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                            {section.items.map((shortcut) => (
                                <div
                                    key={shortcut.description}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3.5 py-2.5"
                                >
                                    <span className="text-xs font-medium text-foreground sm:text-sm">
                                        {shortcut.description}
                                    </span>
                                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                                        {shortcut.keys.map((keyLabel, index) => (
                                            <React.Fragment key={`${shortcut.description}-${keyLabel}`}>
                                                {index > 0 && (
                                                    <span
                                                        aria-hidden="true"
                                                        className="text-[11px] text-muted-foreground"
                                                    >
                                                        +
                                                    </span>
                                                )}
                                                <kbd className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground shadow-xs">
                                                    {keyLabel}
                                                </kbd>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <div className="border-t border-border bg-muted/30 p-4 flex justify-end">
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full rounded-xl bg-accent px-5 py-2 text-sm font-bold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto cursor-pointer"
                >
                    Entendido
                </button>
            </div>
        </ModalContainer>
    );
}
