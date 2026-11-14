'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

/**
 * Accessible Light/Dark theme toggle button safe against SSR hydration mismatch.
 */
export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const frameId = window.requestAnimationFrame(() => {
            setMounted(true);
        });
        return () => window.cancelAnimationFrame(frameId);
    }, []);

    if (!mounted) {
        return (
            <button
                type="button"
                disabled
                aria-label="Cargando selector de tema"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground opacity-60"
            >
                <span aria-hidden="true" className="h-4 w-4 rounded-full bg-muted-foreground/30" />
            </button>
        );
    }

    const isDark = resolvedTheme === 'dark';
    const label = isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';

    return (
        <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={label}
            title={label}
            className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 transition-colors cursor-pointer',
                'text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
        >
            {isDark ? (
                <Sun size={18} aria-hidden="true" />
            ) : (
                <Moon size={18} aria-hidden="true" />
            )}
        </button>
    );
}
