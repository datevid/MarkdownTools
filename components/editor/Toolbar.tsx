'use client';

import React from 'react';
import {
    Bold, Italic, Strikethrough, Superscript, Subscript,
    List, ListOrdered, Quote, Code, Table, Link, Image as ImageIcon,
    Type, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolbarProps {
    onAction: (type: string) => void;
    className?: string;
}

export default function Toolbar({ onAction, className }: ToolbarProps) {
    const actions = [
        { id: 'h1', icon: <span className="font-bold text-xs">H1</span>, label: 'Heading 1' },
        { id: 'h2', icon: <span className="font-bold text-xs">H2</span>, label: 'Heading 2' },
        { id: 'h3', icon: <span className="font-bold text-xs">H3</span>, label: 'Heading 3' },
        { id: 'separator-1', type: 'separator' },
        { id: 'bold', icon: <Bold size={16} />, label: 'Negrita' },
        { id: 'italic', icon: <Italic size={16} />, label: 'Cursiva' },
        { id: 'strikethrough', icon: <Strikethrough size={16} />, label: 'Tachado' },
        { id: 'superscript', icon: <Superscript size={16} />, label: 'Superíndice' },
        { id: 'subscript', icon: <Subscript size={16} />, label: 'Subíndice' },
        { id: 'separator-2', type: 'separator' },
        { id: 'list-unordered', icon: <List size={16} />, label: 'Lista Desordenada' },
        { id: 'list-ordered', icon: <ListOrdered size={16} />, label: 'Lista Ordenada' },
        { id: 'blockquote', icon: <Quote size={16} />, label: 'Cita' },
        { id: 'code', icon: <Code size={16} />, label: 'Código' },
        { id: 'table', icon: <Table size={16} />, label: 'Tabla' },
        { id: 'separator-3', type: 'separator' },
        { id: 'link', icon: <Link size={16} />, label: 'Enlace' },
        { id: 'image', icon: <ImageIcon size={16} />, label: 'Imagen' },
    ];

    return (
        <div className={cn(
            "flex items-center gap-1 p-1.5 bg-background/50 backdrop-blur-md border border-border rounded-xl shadow-sm mb-2 overflow-x-auto no-scrollbar",
            className
        )}>
            {actions.map((action) => {
                if (action.type === 'separator') {
                    return <div key={action.id} className="w-px h-4 bg-border mx-1" />;
                }

                return (
                    <button
                        key={action.id}
                        onClick={() => onAction(action.id!)}
                        className="p-2 hover:bg-accent/10 hover:text-accent rounded-lg transition-all flex items-center justify-center cursor-pointer min-w-[36px] min-h-[36px]"
                        title={action.label}
                    >
                        {action.icon}
                    </button>
                );
            })}
        </div>
    );
}
