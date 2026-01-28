'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Linkedin, Github, ExternalLink, Heart, Code2, Cpu, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-3xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-accent/10 to-transparent">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center">
                                    <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight">Markdown Tools</h2>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        El Editor Markdown Avanzado para Documentación Técnica.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-muted/50 rounded-2xl border border-border/50">
                                    <div className="flex items-center gap-2 text-accent mb-2">
                                        <Zap size={18} />
                                        <span className="font-semibold">Misión</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Simplificar la creación de documentación compleja mediante herramientas de unión de archivos y un entorno de escritura sin distracciones.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-2xl border border-border/50">
                                    <div className="flex items-center gap-2 text-accent mb-2">
                                        <Cpu size={18} />
                                        <span className="font-semibold">Tecnología</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Construido con Next.js, Framer Motion y un motor de renderizado optimizado para el máximo rendimiento.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                                    <Code2 size={14} />
                                    <span>Desarrollado por</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-accent/5 rounded-2xl border border-accent/10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                                            <Heart size={24} className="text-accent fill-accent/20" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg">David León Vilca</div>
                                            <div className="text-sm text-muted-foreground">Software Developer & Tech Enthusiast</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <a
                                            href="https://www.linkedin.com/in/datevid/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 bg-white hover:bg-white/90 text-[#0077b5] rounded-xl transition-all shadow-sm hover:scale-110 cursor-pointer"
                                            title="Conectar en LinkedIn"
                                        >
                                            <Linkedin size={20} fill="currentColor" />
                                        </a>
                                        <a
                                            href="https://github.com/datevid"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 bg-[#181717] hover:bg-[#181717]/90 text-white rounded-xl transition-all shadow-sm hover:scale-110 cursor-pointer"
                                            title="Ver GitHub"
                                        >
                                            <Github size={20} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted/30 p-4 border-t border-border flex items-center justify-center gap-4 text-xs text-muted-foreground">
                            <span>Markdown Tools v1.0.0</span>
                            <span className="opacity-20">|</span>
                            <a href="#" className="hover:text-foreground underline underline-offset-4">Privacidad</a>
                            <span className="opacity-20">|</span>
                            <a href="#" className="hover:text-foreground underline underline-offset-4">Contacto</a>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
