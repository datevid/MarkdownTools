'use client';

import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useAppStore, type Notification } from '@/lib/store';
import { cn } from '@/lib/utils';

const TOAST_VARIANTS: Record<
    Notification['type'],
    { container: string; icon: React.ReactNode }
> = {
    success: {
        container:
            'border-emerald-600/35 bg-emerald-50/95 text-emerald-950 dark:border-emerald-400/35 dark:bg-emerald-950/95 dark:text-emerald-100',
        icon: <CheckCircle size={18} aria-hidden="true" className="text-emerald-700 dark:text-emerald-300" />,
    },
    error: {
        container:
            'border-red-600/35 bg-red-50/95 text-red-950 dark:border-red-400/35 dark:bg-red-950/95 dark:text-red-100',
        icon: <AlertCircle size={18} aria-hidden="true" className="text-red-700 dark:text-red-300" />,
    },
    info: {
        container:
            'border-blue-600/35 bg-blue-50/95 text-blue-950 dark:border-blue-400/35 dark:bg-blue-950/95 dark:text-blue-100',
        icon: <Info size={18} aria-hidden="true" className="text-blue-700 dark:text-blue-300" />,
    },
};

/**
 * Accessible live toast notification stack powered by the global Zustand store.
 */
export default function NotificationSystem() {
    const { notifications, removeNotification } = useAppStore();

    return (
        <div
            aria-live="polite"
            aria-atomic="false"
            className="pointer-events-none fixed top-4 right-4 left-4 z-50 flex flex-col gap-2 sm:left-auto sm:w-96"
        >
            {notifications.map((notification) => {
                const variant = TOAST_VARIANTS[notification.type];
                return (
                    <div
                        key={notification.id}
                        role="status"
                        className={cn(
                            'animate-toast-in pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-lg backdrop-blur-md',
                            variant.container
                        )}
                    >
                        <div className="mt-0.5 shrink-0">{variant.icon}</div>
                        <p className="flex-1 text-sm font-medium leading-snug break-words">
                            {notification.message}
                        </p>
                        <button
                            type="button"
                            onClick={() => removeNotification(notification.id)}
                            aria-label="Cerrar notificación"
                            className="shrink-0 rounded-md p-1 transition-colors hover:bg-black/10 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                        >
                            <X size={15} aria-hidden="true" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
