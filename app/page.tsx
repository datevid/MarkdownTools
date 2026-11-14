import React from 'react';
import WorkspaceShell from '@/components/editor/WorkspaceShell';
import { HomeSeoSection } from '@/components/seo/HomeSeoSection';

/**
 * Home route rendering the interactive Markdown workspace above the fold
 * and server-rendered documentation, JSON-LD, FAQ, and footer below.
 */
export default function HomePage() {
    return (
        <main className="min-h-screen flex flex-col bg-background text-foreground">
            <WorkspaceShell />
            <HomeSeoSection />
        </main>
    );
}
