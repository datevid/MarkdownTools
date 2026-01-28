'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationSystem() {
    const { notifications, removeNotification } = useAppStore();

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {notifications.map((n) => (
                    <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
                        className={cn(
                            "pointer-events-auto p-4 rounded-xl shadow-lg border backdrop-blur-md flex items-start gap-3",
                            n.type === 'success' && "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400",
                            n.type === 'error' && "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
                            n.type === 'info' && "bg-accent/10 border-accent/20 text-accent"
                        )}
                    >
                        <div className="mt-0.5">
                            {n.type === 'success' && <CheckCircle size={18} />}
                            {n.type === 'error' && <AlertCircle size={18} />}
                            {n.type === 'info' && <Info size={18} />}
                        </div>
                        <div className="flex-1 text-sm font-medium leading-tight">
                            {n.message}
                        </div>
                        <button
                            onClick={() => removeNotification(n.id)}
                            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
