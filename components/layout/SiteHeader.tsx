'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { NAV_LINKS, SITE_NAME } from '@/lib/siteConfig';
import { cn } from '@/lib/utils';

/**
 * Responsive navigation header for content, guide, and institutional pages.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-accent/10 p-1">
            <Image
              src="/logo.png"
              alt="Logotipo de Markdown Tools"
              width={28}
              height={28}
              className="h-full w-full object-contain"
              priority
            />
          </span>
          <span className="flex flex-col">
            <span className="whitespace-nowrap text-base font-extrabold tracking-tight text-foreground leading-none">
              {SITE_NAME}
            </span>
            <span className="mt-1 hidden whitespace-nowrap text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-none lg:block">
              Suite Técnica Markdown
            </span>
          </span>
        </Link>

        <nav aria-label="Navegación principal" className="hidden items-center gap-0.5 md:flex lg:gap-1">
          {NAV_LINKS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'whitespace-nowrap shrink-0 rounded-lg px-2 py-2 text-xs font-medium transition-colors lg:px-3 lg:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'bg-accent/15 text-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Link
            href="/"
            className="hidden whitespace-nowrap shrink-0 sm:inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span>Abrir Editor</span>
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={mobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          aria-label="Navegación móvil"
          className="border-t border-border bg-background px-4 py-3 md:hidden"
        >
          <ul className="space-y-1">
            {NAV_LINKS.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-accent/15 text-foreground font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
