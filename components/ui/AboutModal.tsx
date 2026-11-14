'use client';

import React, { useId } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Code2, Cpu, Github, Heart, Linkedin, ShieldCheck, X, Zap } from 'lucide-react';
import ModalContainer from '@/components/ui/ModalContainer';
import { AUTHOR_INFO } from '@/lib/siteConfig';

/**
 * Props for the AboutModal application information dialog.
 */
export interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ENGINE_HIGHLIGHTS = [
    'Unified',
    'KaTeX',
    'Mermaid',
    'Web Worker',
    'LocalStorage',
] as const;

const INTERNAL_ROUTES = [
    { href: '/guia-markdown-mermaid-katex', label: 'Guía técnica' },
    { href: '/sobre-nosotros', label: 'Sobre nosotros' },
    { href: '/contacto', label: 'Contacto' },
    { href: '/aviso-legal', label: 'Privacidad y aviso legal' },
] as const;

/**
 * Accessible About dialog highlighting the Markdown Tools v2.0.0 architecture, author, and site routes.
 */
export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
    const titleId = useId();

    return (
        <ModalContainer
            isOpen={isOpen}
            onClose={onClose}
            ariaLabelledBy={titleId}
            maxWidthClassName="max-w-2xl"
            zIndexClassName="z-[100]"
        >
            <div className="flex items-center justify-between gap-3 border-b border-border bg-gradient-to-r from-accent/10 to-transparent p-4 sm:p-6">
                <div className="flex min-w-0 items-center gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background p-1">
                        <Image
                            src="/logo.png"
                            width={64}
                            height={64}
                            alt="Logo de Markdown Tools"
                            className="h-full w-full object-contain"
                        />
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 id={titleId} className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                Markdown Tools
                            </h2>
                            <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent-text">
                                v2.0.0
                            </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Editor Markdown Avanzado para Documentación Técnica, Fórmulas y Diagramas.
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar información de Markdown Tools"
                    className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                    <X size={20} aria-hidden="true" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-muted/40 p-4">
                        <div className="mb-2 flex items-center gap-2 text-accent-text">
                            <Zap size={18} aria-hidden="true" />
                            <span className="text-sm font-semibold">Misión</span>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Simplificar la creación de documentación técnica mediante edición fluida, vista previa instantánea y fusión modular de documentos sin salir del navegador.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-muted/40 p-4">
                        <div className="mb-2 flex items-center gap-2 text-accent-text">
                            <Cpu size={18} aria-hidden="true" />
                            <span className="text-sm font-semibold">Arquitectura</span>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Procesamiento local con aislamiento de renderizado, persistencia automática en el navegador y cero envío de tus borradores a servidores externos.
                        </p>
                    </div>
                </div>

                <div>
                    <div className="mb-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <ShieldCheck size={14} aria-hidden="true" />
                        <span>Motores y tecnologías integradas</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {ENGINE_HIGHLIGHTS.map((item) => (
                            <span
                                key={item}
                                className="rounded-lg border border-border bg-muted/60 px-2.5 py-1 font-mono text-xs font-semibold text-foreground"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 pt-1">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <Code2 size={14} aria-hidden="true" />
                        <span>Desarrollado por</span>
                    </div>
                    <div className="flex flex-col gap-4 rounded-2xl border border-accent/20 bg-accent/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3.5">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-text">
                                <Heart size={20} aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                                <div className="truncate text-base font-bold text-foreground">
                                    {AUTHOR_INFO.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {AUTHOR_INFO.role}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={AUTHOR_INFO.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Perfil de LinkedIn de David León Vilca"
                                title="Conectar en LinkedIn"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-accent-text shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <Linkedin size={18} aria-hidden="true" />
                            </a>
                            <a
                                href={AUTHOR_INFO.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Perfil de GitHub de David León Vilca"
                                title="Ver perfil en GitHub"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <Github size={18} aria-hidden="true" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-border bg-muted/30 px-4 py-3.5 sm:px-6">
                <nav
                    aria-label="Enlaces institucionales y documentación"
                    className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground"
                >
                    <span className="font-semibold text-foreground">Markdown Tools v2.0.0</span>
                    {INTERNAL_ROUTES.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            onClick={onClose}
                            className="font-medium underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                        >
                            {route.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </ModalContainer>
    );
}
