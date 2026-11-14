import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { generateId } from './utils';

/**
 * Supported editor layout modes.
 */
export type ViewMode = 'split' | 'hybrid' | 'preview';

/**
 * File or folder entry stored in the workspace.
 */
export interface FileNode {
    id: string;
    name: string;
    content: string;
    type: 'file' | 'folder';
    parentId: string | null;
}

/**
 * Toast notification item displayed by NotificationSystem.
 */
export interface Notification {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

/**
 * Global Zustand state and actions for Markdown Tools.
 */
export interface AppState {
    files: FileNode[];
    activeFileId: string | null;
    sidebarOpen: boolean;
    binderOpen: boolean;
    templatesOpen: boolean;
    shortcutsOpen: boolean;
    tocOpen: boolean;
    uploadModalOpen: boolean;
    dontShowUploadOnStartup: boolean;
    binderItems: string[];
    focusMode: boolean;
    typewriterMode: boolean;
    splitView: boolean;
    splitRatio: number;
    viewMode: ViewMode;
    syncScroll: boolean;
    notifications: Notification[];
    _hasHydrated: boolean;
    setHasHydrated: (hydrated: boolean) => void;
    setSidebarOpen: (open: boolean) => void;
    setBinderOpen: (open: boolean) => void;
    setTemplatesOpen: (open: boolean) => void;
    setShortcutsOpen: (open: boolean) => void;
    setTocOpen: (open: boolean) => void;
    setUploadModalOpen: (open: boolean) => void;
    setDontShowUploadOnStartup: (dontShow: boolean) => void;
    setFocusMode: (enabled: boolean) => void;
    setTypewriterMode: (enabled: boolean) => void;
    setSplitView: (enabled: boolean) => void;
    setSplitRatio: (ratio: number) => void;
    setViewMode: (mode: ViewMode) => void;
    setSyncScroll: (enabled: boolean) => void;
    setBinderItems: (items: string[]) => void;
    addToBinder: (id: string) => void;
    removeFromBinder: (id: string) => void;
    setActiveFileId: (id: string | null) => void;
    updateFileContent: (id: string, content: string) => void;
    renameFile: (id: string, name: string) => void;
    addFile: (file: FileNode) => void;
    deleteFile: (id: string) => void;
    deleteAllFiles: () => void;
    addNotification: (message: string, type: Notification['type']) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
}

const DEFAULT_INTRODUCTION_CONTENT = `## ¡Bienvenido a Markdown Tools! 🚀

Bienvenido al editor Markdown avanzado diseñado para la excelencia en documentación técnica, notas matemáticas y diagramas de arquitectura.

### ✨ Inicio Rápido

1. **Escribe**: Usa sintaxis completa *GitHub Flavored Markdown* (tablas, listas de tareas y código).
2. **Visualiza**: Alterna entre *Vista Dividida*, *Híbrida* o *Solo Vista Previa* en tiempo real.
3. **Gestiona y Fusiona**: Organiza documentos en la barra lateral y combínalos con *Binding Tool*.

| Capacidad | Motor | Estado |
| :--- | :--- | :---: |
| Sintaxis GFM y tablas | \`remark-gfm\` | ✅ Activo |
| Resaltado de código | \`rehype-highlight\` | ✅ Activo |
| Fórmulas LaTeX | \`KaTeX\` | ✅ Activo |
| Diagramas técnicos | \`Mermaid\` | ✅ Activo |

- [x] Edición en tiempo real con guardado automático local
- [x] Soporte para temas claro y oscuro accesibles
- [ ] Crea o carga tu primer documento Markdown

### 💻 Ejemplo de Código

\`\`\`typescript
interface DocumentSummary {
  title: string;
  words: number;
}

function saludar(doc: DocumentSummary): string {
  return \`Documento "\${doc.title}" listo con \${doc.words} palabras.\`;
}

saludar({ title: 'Guía Técnica', words: 420 });
\`\`\`

### 📐 Matemáticas Integradas (KaTeX)

Soporta expresiones en línea como $E = mc^2$ o complejidad $O(n \\log n)$, además de bloques centrados:

$$\\int_{a}^{b} x^2 \\, dx = \\frac{b^3 - a^3}{3}$$

### 🧭 Diagramas con Mermaid

\`\`\`mermaid
flowchart LR
    Write["1. Escribe Markdown"] --> Parse["2. Pipeline Unified"]
    Parse --> Preview["3. Vista Previa + KaTeX + Mermaid"]
    Preview --> Export["4. Exporta a MD, HTML o PDF"]
\`\`\`

¡Empieza a crear algo increíble!`;

const DEFAULT_CHAPTER_CONTENT = `## Capítulo 1: Potencial de Markdown Tools

Markdown Tools no es solo un editor; es un entorno de autoría diseñado para eliminar la fricción entre tus pensamientos y el documento final.

### 🛠️ Ecosistema de Productividad Avanzada

#### 🔗 La Revolución del Binding (Fusión Inteligente)
¿Cansado de gestionar archivos de 5000 líneas? Markdown Tools te permite trabajar en fragmentos pequeños y modulares.

- **Fusión sin esfuerzo**: Selecciona tus capítulos en la herramienta *Binding Tool* y ordénalos con un clic.
- **Híbrido Local/Externo**: Combina archivos de tu proyecto actual con archivos subidos desde tu PC al instante.
- **Resultado Limpio**: Genera un único \`.md\` consolidado con separadores automáticos.

#### ✍️ Inmersión Total: Modos de Escritura
- **Focus Mode**: Al escribir, todo lo que no sea el bloque de edición se atenúa suavemente, eliminando distracciones visuales.
- **Typewriter Mode**: Mantiene tu línea activa siempre en el centro vertical de la pantalla.

#### 📦 Ingeniería de Rendimiento
- **Live Preview fluido**: Renderizado asíncrono fuera del hilo principal incluso con sintaxis compleja.
- **Monitor de Carga**: Vigila el tamaño exacto en UTF-8 para mantener tus proyectos ágiles.

---

### 📊 Galería de Diagramas

Markdown Tools soporta diagramas visuales impulsados por **Mermaid.js**.

#### 1. Diagramas de Flujo (Flowcharts)

\`\`\`mermaid
graph LR
    Start --> Input["Entrada de Datos"]
    Input --> Process{"¿Es válido?"}
    Process -- Sí --> Success["Éxito"]
    Process -- No --> Error["Reintentar"]
    Success --> Stop
    Error --> Input
\`\`\`

#### 2. Diagramas de Secuencia (Sequence)

\`\`\`mermaid
sequenceDiagram
    participant Usuario
    participant App as Markdown Tools
    participant DB as Almacenamiento Local

    Usuario->>App: Escribe Contenido
    App->>App: Procesa Markdown
    App->>DB: Guarda borrador
    DB-->>App: Confirmación
    App-->>Usuario: Actualiza Vista Previa
\`\`\`

---

### 🏗️ Arquitectura Técnica

- **Framework**: Next.js 16 (App Router) y React 19.
- **Estilos**: Tailwind CSS 4 con tokens accesibles Light/Dark.
- **Estado**: Zustand con persistencia local automática.
- **Pipeline**: Unified.js con \`remark\` y \`rehype\`, resaltado de sintaxis, KaTeX y Mermaid en el cliente.`;

const INITIAL_FILES: FileNode[] = [
    {
        id: '1',
        name: 'Introduction.md',
        content: DEFAULT_INTRODUCTION_CONTENT,
        type: 'file',
        parentId: null,
    },
    {
        id: '2',
        name: 'Chapter 1.md',
        content: DEFAULT_CHAPTER_CONTENT,
        type: 'file',
        parentId: null,
    },
];

const notificationTimers = new Map<string, ReturnType<typeof setTimeout>>();

function clearNotificationTimer(id: string): void {
    const timer = notificationTimers.get(id);
    if (timer !== undefined) {
        clearTimeout(timer);
        notificationTimers.delete(id);
    }
}

const MIN_SPLIT_RATIO = 20;
const MAX_SPLIT_RATIO = 80;

function clampSplitRatio(ratio: number): number {
    if (!Number.isFinite(ratio)) return 50;
    return Math.round(Math.min(MAX_SPLIT_RATIO, Math.max(MIN_SPLIT_RATIO, ratio)) * 10) / 10;
}

type PersistedAppState = Pick<
    AppState,
    | 'files'
    | 'activeFileId'
    | 'binderItems'
    | 'focusMode'
    | 'typewriterMode'
    | 'splitView'
    | 'splitRatio'
    | 'viewMode'
    | 'syncScroll'
    | 'dontShowUploadOnStartup'
>;

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            files: INITIAL_FILES,
            activeFileId: '1',
            sidebarOpen: true,
            binderOpen: false,
            templatesOpen: false,
            shortcutsOpen: false,
            tocOpen: false,
            uploadModalOpen: false,
            dontShowUploadOnStartup: false,
            binderItems: [],
            focusMode: false,
            typewriterMode: false,
            splitView: true,
            splitRatio: 50,
            viewMode: 'split',
            syncScroll: true,
            notifications: [],
            _hasHydrated: false,

            setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            setBinderOpen: (open) => set({ binderOpen: open }),
            setTemplatesOpen: (open) => set({ templatesOpen: open }),
            setShortcutsOpen: (open) => set({ shortcutsOpen: open }),
            setTocOpen: (open) => set({ tocOpen: open }),
            setUploadModalOpen: (open) => set({ uploadModalOpen: open }),
            setDontShowUploadOnStartup: (dontShow) => set({ dontShowUploadOnStartup: dontShow }),
            setFocusMode: (enabled) => set({ focusMode: enabled }),
            setTypewriterMode: (enabled) => set({ typewriterMode: enabled }),
            setSplitView: (enabled) =>
                set({
                    splitView: enabled,
                    viewMode: enabled ? 'split' : 'hybrid',
                }),
            setSplitRatio: (ratio) => set({ splitRatio: clampSplitRatio(ratio) }),
            setViewMode: (mode) =>
                set({
                    viewMode: mode,
                    splitView: mode === 'split',
                }),
            setSyncScroll: (enabled) => set({ syncScroll: enabled }),
            setBinderItems: (items) => set({ binderItems: items }),
            addToBinder: (id) =>
                set((state) => ({
                    binderItems: state.binderItems.includes(id)
                        ? state.binderItems
                        : [...state.binderItems, id],
                })),
            removeFromBinder: (id) =>
                set((state) => ({
                    binderItems: state.binderItems.filter((itemId) => itemId !== id),
                })),
            setActiveFileId: (id) => set({ activeFileId: id }),
            updateFileContent: (id, content) =>
                set((state) => ({
                    files: state.files.map((file) =>
                        file.id === id ? { ...file, content } : file
                    ),
                })),
            renameFile: (id, name) =>
                set((state) => {
                    const trimmed = name.trim();
                    if (!trimmed) return state;
                    return {
                        files: state.files.map((file) =>
                            file.id === id ? { ...file, name: trimmed } : file
                        ),
                    };
                }),
            addFile: (file) =>
                set((state) => ({
                    files: [...state.files, file],
                })),
            deleteFile: (id) =>
                set((state) => {
                    const remainingFiles = state.files.filter((file) => file.id !== id);
                    const nextActiveFileId =
                        state.activeFileId === id
                            ? remainingFiles[0]?.id ?? null
                            : state.activeFileId;

                    return {
                        files: remainingFiles,
                        binderItems: state.binderItems.filter((itemId) => itemId !== id),
                        activeFileId: nextActiveFileId,
                    };
                }),
            deleteAllFiles: () =>
                set({
                    files: [],
                    activeFileId: null,
                    binderItems: [],
                }),
            addNotification: (message, type) => {
                const id = generateId('toast');
                set((state) => ({
                    notifications: [...state.notifications, { id, message, type }],
                }));

                const timer = setTimeout(() => {
                    notificationTimers.delete(id);
                    set((state) => ({
                        notifications: state.notifications.filter((item) => item.id !== id),
                    }));
                }, 4000);

                notificationTimers.set(id, timer);
            },
            removeNotification: (id) => {
                clearNotificationTimer(id);
                set((state) => ({
                    notifications: state.notifications.filter((item) => item.id !== id),
                }));
            },
            clearNotifications: () => {
                for (const id of notificationTimers.keys()) {
                    clearNotificationTimer(id);
                }
                set({ notifications: [] });
            },
        }),
        {
            name: 'markdown-tools-workspace-v1',
            storage: createJSONStorage<PersistedAppState>(() => localStorage),
            partialize: (state): PersistedAppState => ({
                files: state.files,
                activeFileId: state.activeFileId,
                binderItems: state.binderItems,
                focusMode: state.focusMode,
                typewriterMode: state.typewriterMode,
                splitView: state.splitView,
                splitRatio: state.splitRatio,
                viewMode: state.viewMode,
                syncScroll: state.syncScroll,
                dontShowUploadOnStartup: state.dontShowUploadOnStartup,
            }),
            onRehydrateStorage: () => (state) => {
                if (!state) return;
                if (
                    state.activeFileId !== null &&
                    !state.files.some((file) => file.id === state.activeFileId)
                ) {
                    state.setActiveFileId(state.files[0]?.id ?? null);
                }
                const sanitizedRatio = clampSplitRatio(state.splitRatio);
                if (sanitizedRatio !== state.splitRatio) {
                    state.setSplitRatio(sanitizedRatio);
                }
                state.setHasHydrated(true);
            },
        }
    )
);
