'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary';
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'primary'
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="bg-background border-2 border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6">
                        <div className="flex items-start gap-4">
                            <div className={cn(
                                "p-3 rounded-xl",
                                variant === 'danger' ? "bg-red-500/10 text-red-500" : "bg-accent/10 text-accent"
                            )}>
                                <AlertTriangle size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold">{title}</h3>
                                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                                    {description}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold hover:bg-muted rounded-lg transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={cn(
                                "px-6 py-2 text-sm font-bold text-white rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]",
                                variant === 'danger' ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20" : "bg-accent hover:opacity-90 shadow-lg shadow-accent/20"
                            )}
                        >
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
