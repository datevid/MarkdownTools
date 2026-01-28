'use client';

import React, { useState } from 'react';
import EditorLayout from '@/components/editor/EditorLayout';
import HybridEditor from '@/components/editor/HybridEditor';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const { files, activeFileId, updateFileContent } = useAppStore();
  const activeFile = files.find(f => f.id === activeFileId);

  return (
    <EditorLayout>
      {activeFile ? (
        <HybridEditor
          key={activeFile.id}
          initialValue={activeFile.content}
          onChange={(val) => updateFileContent(activeFile.id, val)}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center space-y-4 max-w-md px-6">
            <p className="text-lg font-medium">Bienvenido a Markdown Tools</p>
            <p className="text-sm leading-relaxed opacity-70">
              Selecciona un archivo en la barra lateral para empezar a escribir.
            </p>
          </div>
        </div>
      )}
    </EditorLayout>
  );
}
