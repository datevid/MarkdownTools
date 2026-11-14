'use client';

import React, { useId } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import ModalContainer from '@/components/ui/ModalContainer';
import { cn } from '@/lib/utils';

/**
 * Props for the accessible ConfirmDialog alert dialog component.
 */
export interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'info';
}

/**
 * Accessible confirmation alert dialog with Escape dismissal, backdrop click, and semantic variants.
 */
export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'info',
}: ConfirmDialogProps) {
    const titleId = useId();
    const descriptionId = useId();

    const isDanger = variant === 'danger';

    return (
        <ModalContainer
            isOpen={isOpen}
            onClose={onClose}
            role="alertdialog"
            ariaLabelledBy={titleId}
            ariaDescribedBy={descriptionId}
            maxWidthClassName="max-w-md"
            zIndexClassName="z-[110]"
        >
            <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                    <div
                        className={cn(
                            'shrink-0 rounded-xl p-3',
                            isDanger
                                ? 'bg-destructive/15 text-destructive'
                                : 'bg-accent/15 text-accent-text'
                        )}
                    >
                        {isDanger ? (
                            <AlertTriangle size={22} aria-hidden="true" />
                        ) : (
                            <Info size={22} aria-hidden="true" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 id={titleId} className="text-lg font-bold text-foreground">
                            {title}
                        </h3>
                        <p
                            id={descriptionId}
                            className="mt-2 text-sm leading-relaxed text-muted-foreground"
                        >
                            {description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto cursor-pointer"
                >
                    {cancelText}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                    className={cn(
                        'w-full rounded-xl px-5 py-2.5 text-sm font-bold shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto cursor-pointer',
                        isDanger
                            ? 'bg-destructive text-destructive-foreground'
                            : 'bg-accent text-accent-foreground'
                    )}
                >
                    {confirmText}
                </button>
            </div>
        </ModalContainer>
    );
}
