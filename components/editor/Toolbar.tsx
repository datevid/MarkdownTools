'use client';

import React from 'react';
import {
    Bold,
    Code,
    FileCode2,
    Italic,
    Keyboard,
    LayoutTemplate,
    Link as LinkIcon,
    Image as ImageIcon,
    List,
    ListOrdered,
    ListTodo,
    Minus,
    Quote,
    Redo2,
    Search,
    Sigma,
    Strikethrough,
    Subscript,
    Superscript,
    Table,
    Undo2,
    Workflow,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Supported toolbar actions emitted by the Markdown editor toolbar.
 */
export type ToolbarAction =
    | 'undo'
    | 'redo'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'bold'
    | 'italic'
    | 'strike'
    | 'code-inline'
    | 'sup'
    | 'sub'
    | 'ul'
    | 'ol'
    | 'checklist'
    | 'quote'
    | 'code'
    | 'table'
    | 'hr'
    | 'link'
    | 'image'
    | 'math-inline'
    | 'math-block'
    | 'mermaid'
    | 'templates'
    | 'find'
    | 'shortcuts';

/**
 * Props for the responsive Markdown formatting Toolbar component.
 */
export interface ToolbarProps {
    onAction: (action: ToolbarAction) => void;
    canUndo?: boolean;
    canRedo?: boolean;
    className?: string;
}

interface ToolbarItem {
    id: ToolbarAction;
    label: string;
    shortcut?: string;
    icon: React.ReactNode;
}

const TOOLBAR_GROUPS: ReadonlyArray<ReadonlyArray<ToolbarItem>> = [
    [
        {
            id: 'undo',
            label: 'Deshacer',
            shortcut: 'Ctrl+Z',
            icon: <Undo2 size={15} aria-hidden="true" />,
        },
        {
            id: 'redo',
            label: 'Rehacer',
            shortcut: 'Ctrl+Y',
            icon: <Redo2 size={15} aria-hidden="true" />,
        },
    ],
    [
        {
            id: 'h1',
            label: 'Título H1',
            icon: <span className="font-mono text-[11px] font-bold leading-none">H1</span>,
        },
        {
            id: 'h2',
            label: 'Título H2',
            icon: <span className="font-mono text-[11px] font-bold leading-none">H2</span>,
        },
        {
            id: 'h3',
            label: 'Título H3',
            icon: <span className="font-mono text-[11px] font-bold leading-none">H3</span>,
        },
    ],
    [
        {
            id: 'bold',
            label: 'Negrita',
            shortcut: 'Ctrl+B',
            icon: <Bold size={15} aria-hidden="true" />,
        },
        {
            id: 'italic',
            label: 'Cursiva',
            shortcut: 'Ctrl+I',
            icon: <Italic size={15} aria-hidden="true" />,
        },
        {
            id: 'strike',
            label: 'Tachado',
            icon: <Strikethrough size={15} aria-hidden="true" />,
        },
        {
            id: 'code-inline',
            label: 'Código en línea',
            shortcut: 'Ctrl+E',
            icon: <Code size={15} aria-hidden="true" />,
        },
        {
            id: 'sup',
            label: 'Superíndice',
            icon: <Superscript size={15} aria-hidden="true" />,
        },
        {
            id: 'sub',
            label: 'Subíndice',
            icon: <Subscript size={15} aria-hidden="true" />,
        },
    ],
    [
        {
            id: 'ul',
            label: 'Lista con viñetas',
            icon: <List size={15} aria-hidden="true" />,
        },
        {
            id: 'ol',
            label: 'Lista numerada',
            icon: <ListOrdered size={15} aria-hidden="true" />,
        },
        {
            id: 'checklist',
            label: 'Lista de tareas',
            icon: <ListTodo size={15} aria-hidden="true" />,
        },
        {
            id: 'quote',
            label: 'Cita',
            icon: <Quote size={15} aria-hidden="true" />,
        },
        {
            id: 'code',
            label: 'Bloque de código',
            icon: <FileCode2 size={15} aria-hidden="true" />,
        },
        {
            id: 'table',
            label: 'Insertar tabla',
            icon: <Table size={15} aria-hidden="true" />,
        },
        {
            id: 'hr',
            label: 'Línea horizontal',
            icon: <Minus size={15} aria-hidden="true" />,
        },
    ],
    [
        {
            id: 'link',
            label: 'Insertar enlace',
            shortcut: 'Ctrl+K',
            icon: <LinkIcon size={15} aria-hidden="true" />,
        },
        {
            id: 'image',
            label: 'Insertar imagen',
            icon: <ImageIcon size={15} aria-hidden="true" />,
        },
    ],
    [
        {
            id: 'math-inline',
            label: 'Fórmula en línea',
            icon: (
                <svg
                    viewBox="0 0 22 14"
                    width="20"
                    height="13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M4 2v10" />
                    <path d="M5.6 4.2c0-.8-.7-1.2-1.6-1.2s-1.6.4-1.6 1.2c0 1.4 3.2 1.3 3.2 2.8 0 .8-.7 1.3-1.6 1.3s-1.6-.5-1.6-1.3" />
                    <path d="M9.2 4.4l3.6 5.2M12.8 4.4l-3.6 5.2" />
                    <path d="M18 2v10" />
                    <path d="M19.6 4.2c0-.8-.7-1.2-1.6-1.2s-1.6.4-1.6 1.2c0 1.4 3.2 1.3 3.2 2.8 0 .8-.7 1.3-1.6 1.3s-1.6-.5-1.6-1.3" />
                </svg>
            ),
        },
        {
            id: 'math-block',
            label: 'Bloque matemático KaTeX',
            icon: <Sigma size={15} aria-hidden="true" />,
        },
        {
            id: 'mermaid',
            label: 'Diagrama Mermaid',
            icon: <Workflow size={15} aria-hidden="true" />,
        },
    ],
    [
        {
            id: 'templates',
            label: 'Plantillas',
            icon: <LayoutTemplate size={15} aria-hidden="true" />,
        },
        {
            id: 'find',
            label: 'Buscar y reemplazar',
            shortcut: 'Ctrl+F',
            icon: <Search size={15} aria-hidden="true" />,
        },
        {
            id: 'shortcuts',
            label: 'Atajos de teclado',
            shortcut: 'Ctrl+/',
            icon: <Keyboard size={15} aria-hidden="true" />,
        },
    ],
];

/**
 * Responsive Markdown editor formatting toolbar that preserves active textarea focus and selection.
 */
export function Toolbar({
    onAction,
    canUndo = false,
    canRedo = false,
    className,
}: ToolbarProps) {
    return (
        <div
            role="toolbar"
            aria-label="Barra de herramientas de formato Markdown"
            data-toolbar="true"
            className={cn(
                'flex flex-wrap items-center gap-1 rounded-xl border border-border bg-card/85 p-1.5 shadow-sm backdrop-blur-md',
                className
            )}
        >
            {TOOLBAR_GROUPS.map((group, groupIndex) => (
                <React.Fragment key={group[0].id}>
                    {groupIndex > 0 && (
                        <span
                            aria-hidden="true"
                            className="mx-0.5 hidden h-5 w-px bg-border sm:inline-block"
                        />
                    )}
                    <div className="flex flex-wrap items-center gap-0.5">
                        {group.map((item) => {
                            const disabled =
                                (item.id === 'undo' && !canUndo) ||
                                (item.id === 'redo' && !canRedo);
                            const fullLabel = item.shortcut
                                ? `${item.label} (${item.shortcut})`
                                : item.label;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    disabled={disabled}
                                    aria-label={fullLabel}
                                    title={fullLabel}
                                    onMouseDown={(event) => {
                                        // Preserve active textarea focus & text selection across clicks
                                        event.preventDefault();
                                    }}
                                    onClick={() => {
                                        if (!disabled) {
                                            onAction(item.id);
                                        }
                                    }}
                                    className={cn(
                                        'inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg px-1.5 text-foreground transition-colors',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                        disabled
                                            ? 'cursor-not-allowed opacity-35'
                                            : 'cursor-pointer hover:bg-accent/15 hover:text-accent-text active:bg-accent/20'
                                    )}
                                >
                                    {item.icon}
                                </button>
                            );
                        })}
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
}

export default Toolbar;
