import { create } from 'zustand';

interface FileNode {
    id: string;
    name: string;
    content: string;
    type: 'file' | 'folder';
    parentId: string | null;
}

export interface Notification {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface AppState {
    files: FileNode[];
    activeFileId: string | null;
    sidebarOpen: boolean;
    binderOpen: boolean;
    binderItems: string[];
    focusMode: boolean;
    typewriterMode: boolean;
    splitView: boolean;
    notifications: Notification[];
    setSidebarOpen: (open: boolean) => void;
    setBinderOpen: (open: boolean) => void;
    setFocusMode: (enabled: boolean) => void;
    setTypewriterMode: (enabled: boolean) => void;
    setSplitView: (enabled: boolean) => void;
    setBinderItems: (items: string[]) => void;
    addToBinder: (id: string) => void;
    removeFromBinder: (id: string) => void;
    setActiveFileId: (id: string | null) => void;
    updateFileContent: (id: string, content: string) => void;
    addFile: (file: FileNode) => void;
    deleteFile: (id: string) => void;
    deleteAllFiles: () => void;
    addNotification: (message: string, type: Notification['type']) => void;
    removeNotification: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
    files: [
        {
            id: '1',
            name: 'Introduction.md',
            content: '# Markdown Tools 🚀\n\nBienvenido al editor Markdown avanzado diseñado para la excelencia en documentación técnica.\n\n## Inicio Rápido\n\n1. **Escribe**: Usa sintaxis GitHub Flavored Markdown.\n2. **Visualiza**: Activa la *Vista Dividida* para ver cambios en tiempo real.\n3. **Gestiona**: Organiza tus archivos desde la barra lateral izquierda.\n\n### 💻 Ejemplo de Código\nMarkdown Tools resalta tu código automáticamente:\n\n```typescript\nfunction saludar(nombre: string) {\n  console.log(`¡Hola, ${nombre}! Bienvenido a Markdown Tools.`);\n}\n\nsaludar("Desarrollador");\n```\n\n### Matemáticas Integradas\nMarkdown Tools soporta LaTeX nativo:\n\n$$\\int_{a}^{b} x^2 dx = \\frac{b^3 - a^3}{3}$$\n\n¡Empieza a crear algo increíble!',
            type: 'file',
            parentId: null
        },
        {
            id: '2',
            name: 'Chapter 1.md',
            content: '# Capítulo 1: Potencial de Markdown Tools\n\nMarkdown Tools no es solo un editor; es un entorno de autoría diseñado para eliminar la fricción entre tus pensamientos y el documento final.\n\n## 🛠️ Ecosistema de Productividad Avanzada\n\n### 🔗 La Revolución del Binding (Fusión Inteligente)\n¿Cansado de gestionar archivos de 5000 líneas? Markdown Tools te permite trabajar en fragmentos pequeños y modulares. \n- **Fusión sin esfuerzo**: Selecciona tus capítulos en la herramienta *Binding Tool* y ordénalos con un clic.\n- **Híbrido Local/Externo**: Combina archivos de tu proyecto actual con archivos subidos desde tu PC al instante.\n- **Resultado Limpio**: Genera un único `.md` consolidado con metadatos y separadores automáticos.\n\n### ✍️ Inmersión Total: Modos de Escritura\n- **Focus Mode**: Inspirado en los mejores editores minimalistas. Al escribir, todo lo que no sea el párrafo actual se atenúa suavemente, eliminando distracciones visuales.\n- **Typewriter Mode**: Mantiene tu línea activa siempre en el centro vertical de la pantalla. Tus ojos nunca tienen que bajar al fondo de la página.\n\n### 📦 Ingeniería de Rendimiento\n- **Live Preview 60FPS**: Previsualización instantánea incluso con sintaxis compleja.\n- **Monitor de Carga**: Markdown Tools vigila el tamaño de tus archivos. Si un documento supera los 2MB, verás un distintivo **"PESADO"**, invitándote a usar la arquitectura modular para mantener la fluidez.\n\n### 📤 Flujo de Exportación Multi-formato\nNo te limites al texto plano:\n1. **Rich Text**: Copia directamente a Word o Google Docs manteniendo el estilo.\n2. **HTML Semántico**: Listo para pegar en tu blog o CMS.\n3. **Markdown Limpio**: Descarga archivos optimizados y estandarizados.\n\n### 📊 Visualización de Datos\nCon soporte nativo para **Mermaid.js**, tus flujos de trabajo se convierten en arte. Explora el archivo `Diagrams.md` para ver ejemplos de diagramas de flujo, Gantt, ER y más.',
            type: 'file',
            parentId: null
        },
        {
            id: '3',
            name: 'Diagrams.md',
            content: '# 📊 Galería de Diagramas\n\nMarkdown Tools soporta una amplia variedad de diagramas visuales impulsados por **Mermaid.js**. Aquí tienes ejemplos de los tipos más comunes.\n\n## 1. Diagramas de Flujo (Flowcharts)\nIdeales para representar procesos y decisiones.\n\n```mermaid\ngraph LR\n    Start --> Input[Entrada de Datos]\n    Input --> Process{¿Es válido?}\n    Process -- Sí --> Success[Éxito]\n    Process -- No --> Error[Reintentar]\n    Success --> Stop\n    Error --> Input\n```\n\n## 2. Diagramas de Secuencia (Sequence)\nPerfectos para modelar interacciones entre componentes.\n\n```mermaid\nsequenceDiagram\n    participant Usuario\n    participant App as Markdown Tools\n    participant DB as Almacenamiento Local\n\n    Usuario->>App: Escribe Contenido\n    App->>App: Procesa Markdown\n    App->>DB: Guarda borrador\n    DB-->>App: Confirmación\n    App-->>Usuario: Actualiza Vista Previa\n```\n\n## 3. Diagramas de Gantt\nPlanificación de proyectos y líneas de tiempo.\n\n```mermaid\ngantt\n    title Lanzamiento de Markdown Tools\n    dateFormat  YYYY-MM-DD\n    section Desarrollo\n    Core Editor           :a1, 2026-01-01, 15d\n    Export System         :after a1, 10d\n    section Diseño\n    Branding & Logo       :2026-01-10, 12d\n    section Publicación\n    Vercel Deployment     :2026-01-25, 5d\n```\n\n## 4. Diagramas de Clase\nModelado de sistemas orientados a objetos.\n\n```mermaid\nclassDiagram\n    class Editor {\n        +String content\n        +render()\n        +save()\n    }\n    class File {\n        +String name\n        +Int size\n    }\n    Editor "1" --* "n" File : gestiona\n```\n\n## 5. Diagramas de Estado\nMáquinas de estado y ciclos de vida.\n\n```mermaid\nstateDiagram-v2\n    [*] --> Editando\n    Editando --> Renderizando: Cambio detectado\n    Renderizando --> Editando: OK\n    Editando --> Error: Sintaxis inválida\n    Error --> Editando: Corregir\n```\n\n## 6. Gráficos de Pastel (Pie Charts)\nVisualización rápida de proporciones.\n\n```mermaid\npie title Composición del Proyecto\n    "Frontend (Next.js)" : 45\n    "Markdown Logic" : 30\n    "Styles (Tailwind)" : 15\n    "Assets" : 10\n```\n\n## 7. Diagramas de Entidad Relación (ER)\nModelado de bases de datos.\n\n```mermaid\nerDiagram\n    USUARIO ||--o{ ARCHIVO : crea\n    ARCHIVO ||--|{ CONTENIDO : posee\n    USUARIO {\n        string nombre\n        string email\n    }\n    ARCHIVO {\n        string id\n        string titulo\n    }\n```',
            type: 'file',
            parentId: null
        },
        {
            id: '4',
            name: 'DOC_FUNCIONAL.md',
            content: '# Documento Funcional: Markdown Tools 🚀\n\nMarkdown Tools es una suite de edición de Markdown premium diseñada para la excelencia en la documentación técnica y la gestión de proyectos multi-archivo.\n\n## Características de Edición\n- **Vista Híbrida**: Permite editar y visualizar en tiempo real mediante una vista dividida sincronizada.\n- **Focus Mode**: Una experiencia inmersiva que atenúa el resto de la interfaz para centrarse exclusivamente en el bloque de texto actual.\n- **Typewriter Mode**: Mantiene la línea activa siempre en el centro vertical de la pantalla.\n\n## Gestión de Archivos (The Binder)\n- **Binding Tool**: Fusiona múltiples documentos del workspace o subidos externamente.\n- **Drag-and-Drop Order**: Reorganiza el orden de los capítulos antes de la fusión.\n\n## Visualización y Exportación\n- **Mermaid.js**: Renderizado nativo de diagramas.\n- **KaTeX**: Soporte para expresiones matemáticas.\n- **Exportación Multi-formato**: PDF Directo (descarga inmediata), HTML, Rich Text y Markdown.',
            type: 'file',
            parentId: null
        },
        {
            id: '5',
            name: 'DOC_TECNICA.md',
            content: '# Documento Técnico: Markdown Tools 🏗️\n\n## Stack Tecnológico\n- **Framework**: Next.js 16 (App Router).\n- **Estilos**: Tailwind CSS 4.\n- **Estado**: Zustand.\n- **Animaciones**: Framer Motion.\n\n## Pipeline de Renderizado\nUtiliza **Unified.js** con remark y rehype para la transformación de Markdown a HTML seguro, integrando resaltado de sintaxis y renderizado de diagramas Mermaid en el cliente.\n\n## Despliegue y Mantenimiento\n- **Entorno**: Compatible con Node.js 20+.\n- **Build**: Proceso optimizado vía `npm run build`.\n- **Recomendación**: Despliegue en Vercel para integración continua.',
            type: 'file',
            parentId: null
        }
    ],
    activeFileId: '1',
    sidebarOpen: true,
    binderOpen: false,
    binderItems: [],
    focusMode: false,
    typewriterMode: false,
    splitView: true,
    notifications: [],
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setBinderOpen: (open) => set({ binderOpen: open }),
    setFocusMode: (enabled) => set({ focusMode: enabled }),
    setTypewriterMode: (enabled) => set({ typewriterMode: enabled }),
    setSplitView: (enabled) => set({ splitView: enabled }),
    setBinderItems: (items) => set({ binderItems: items }),
    addToBinder: (id) => set((state) => {
        console.log('addToBinder called with id:', id);
        console.log('Current binderItems:', state.binderItems);
        const newBinderItems = state.binderItems.includes(id) ? state.binderItems : [...state.binderItems, id];
        console.log('New binderItems:', newBinderItems);
        return { binderItems: newBinderItems };
    }),
    removeFromBinder: (id) => set((state) => ({
        binderItems: state.binderItems.filter(i => i !== id)
    })),
    setActiveFileId: (id) => set({ activeFileId: id }),
    updateFileContent: (id, content) =>
        set((state) => ({
            files: state.files.map((f) => (f.id === id ? { ...f, content } : f)),
        })),
    addFile: (file) =>
        set((state) => ({
            files: [...state.files, file],
        })),
    deleteFile: (id) =>
        set((state) => ({
            files: state.files.filter((f) => f.id !== id),
            activeFileId: state.activeFileId === id ? null : state.activeFileId,
        })),
    deleteAllFiles: () =>
        set({ files: [], activeFileId: null, binderItems: [] }),
    addNotification: (message, type) => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({
            notifications: [...state.notifications, { id, message, type }]
        }));
        setTimeout(() => {
            set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id)
            }));
        }, 4000);
    },
    removeNotification: (id) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id)
        })),
}));
