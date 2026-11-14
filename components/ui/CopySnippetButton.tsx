'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopySnippetButtonProps {
  code: string;
  label?: string;
  className?: string;
}

/**
 * Client button that copies a Markdown/Mermaid/KaTeX snippet to clipboard with visual confirmation.
 */
export function CopySnippetButton({ code, label = 'Copiar ejemplo', className }: CopySnippetButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      aria-label={copied ? 'Ejemplo copiado' : label}
    >
      {copied ? (
        <>
          <Check size={14} className="text-green-600 dark:text-green-400" aria-hidden="true" />
          <span>Copiado</span>
        </>
      ) : (
        <>
          <Copy size={14} aria-hidden="true" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
