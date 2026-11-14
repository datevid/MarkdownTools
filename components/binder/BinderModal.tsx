'use client';

import React, { useId } from 'react';
import BinderPanel from '@/components/binder/BinderPanel';
import ModalContainer from '@/components/ui/ModalContainer';

/**
 * Props for the BinderModal dialog component.
 */
export interface BinderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenBinding?: () => void;
}

/**
 * Accessible modal wrapper around BinderPanel for chapter ordering and compilation.
 */
export default function BinderModal({
    isOpen,
    onClose,
    onOpenBinding,
}: BinderModalProps) {
    const titleId = useId();

    return (
        <ModalContainer
            isOpen={isOpen}
            onClose={onClose}
            ariaLabelledBy={titleId}
            maxWidthClassName="max-w-2xl"
            zIndexClassName="z-50"
        >
            <BinderPanel
                isModal
                titleId={titleId}
                onClose={onClose}
                onOpenBinding={
                    onOpenBinding
                        ? () => {
                              onClose();
                              onOpenBinding();
                          }
                        : undefined
                }
                className="w-full border-l-0 shadow-none"
            />
        </ModalContainer>
    );
}
