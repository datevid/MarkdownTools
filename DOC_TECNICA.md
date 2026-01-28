# Documento Técnico: Markdown Tools 🏗️

Markdown Tools está construido sobre un stack moderno orientado al rendimiento y la experiencia de usuario (UX).

## Stack Tecnológico
- **Framework**: Next.js 16 (App Router) - Proporciona la base para el renderizado y la estructura del proyecto.
- **Estilos**: Tailwind CSS 4 - Para una interfaz rápida, premium y totalmente personalizada.
- **Estado**: Zustand - Gestión de estado global ligera para manejar archivos, notificaciones y configuraciones de vista.
- **Animaciones**: Framer Motion - Animaciones fluidas para transiciones de sidebar, modales y efectos de modo focus.

## Pipeline de Renderizado
El procesamiento de Markdown utiliza el ecosistema **Unified.js**:
1.  **remark-parse**: Convierte el String Markdown en un árbol sintáctico (Mdast).
2.  **remark-gfm/remark-math**: Extiende el soporte para tablas GitHub Flavored Markdown y LaTeX.
3.  **remark-rehype**: Transforma el árbol de Markdown a un árbol de HTML (Hast).
4.  **rehype-highlight/rehype-katex**: Aplica resaltado de sintaxis a bloques de código y procesa las fórmulas matemáticas.
5.  **rehypeMermaid (Custom)**: Detecta bloques de Mermaid y los prepara para su renderizado dinámico en el cliente.
6.  **rehype-stringify**: Genera el HTML final seguro para su inserción en el DOM.

## Componentes Críticos
- **HybridEditor**: Maneja la sincronización entre el textarea y la vista previa, incluyendo la lógica de modo máquina de escribir y modo foco. Utiliza el evento `afterprint` para recalcular diagramas tras la impresión.
- **ExportManager**: Orquestador de las funciones de exportación. Utiliza `html2pdf.js` para capturar el nodo del DOM y convertirlo a PDF directamente en el navegador.
- **Binding Tool**: Lógica recursiva para combinar contenidos de archivos y generar separadores semánticos durante la fusión.

## Optimización
- **Monitoreo de Carga**: Sistema de detección de archivos "pesados" (>2MB) para prevenir lags en el renderizado mediante advertencias visuales (`AlertCircle`).

## Despliegue y Mantenimiento
- **Entorno**: Compatible con cualquier entorno que soporte Node.js 20+.
- **CI/CD**: Se recomienda el uso de Vercel para despliegues automáticos via commits en la rama principal.
- **Build**: El proceso de build genera una aplicación Next.js altamente optimizada con renderizado estático y dinámico según se requiera.

---

El sistema está optimizado para ejecutarse enteramente en el cliente, garantizando privacidad y velocidad.
