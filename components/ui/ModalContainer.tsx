'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Props for the accessible ModalContainer dialog shell.
 */
export interface ModalContainerProps {
    isOpen: boolean;
    onClose: () => void;
    role?: 'dialog' | 'alertdialog';
    ariaLabelledBy: string;
    ariaDescribedBy?: string;
    maxWidthClassName?: string;
    zIndexClassName?: string;
    panelClassName?: string;
    children: React.ReactNode;
}

/**
 * Accessible modal dialog frame providing Escape handling, backdrop dismiss,
 * focus management, ARIA dialog attributes, and lightweight CSS entrance transitions.
 */
export default function ModalContainer({
    isOpen,
    onClose,
    role = 'dialog',
    ariaLabelledBy,
    ariaDescribedBy,
    maxWidthClassName = 'max-w-lg',
    zIndexClassName = 'z-50',
    panelClassName,
    children,
}: ModalContainerProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        previousFocusRef.current =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;

        const frameId = window.requestAnimationFrame(() => {
            const panel = panelRef.current;
            if (panel && !panel.contains(document.activeElement)) {
                panel.focus({ preventScroll: true });
            }
        });

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.stopPropagation();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener('keydown', handleKeyDown);
            if (previousFocusRef.current?.isConnected) {
                previousFocusRef.current.focus({ preventScroll: true });
            }
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className={cn(
                'fixed inset-0 flex items-center justify-center p-3 sm:p-4',
                zIndexClassName
            )}
        >
            <div
                aria-hidden="true"
                onClick={onClose}
                className="animate-modal-backdrop absolute inset-0 bg-black/75 sm:bg-black/60 sm:backdrop-blur-sm"
            />
            <div
                ref={panelRef}
                role={role}
                aria-modal="true"
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                tabIndex={-1}
                onClick={(event) => event.stopPropagation()}
                className={cn(
                    'animate-modal-panel relative w-full max-h-[90dvh] flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl focus:outline-none',
                    maxWidthClassName,
                    panelClassName
                )}
            >
                {children}
            </div>
        </div>
    );
}
