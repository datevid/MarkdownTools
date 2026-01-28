# Markdown Tools 🚀
### El Editor Markdown Avanzado para Documentación Técnica y Proyectos Multi-Archivo

Markdown Tools no es solo otro editor de Markdown. Es un entorno de escritura técnica y creativa diseñado para la máxima productividad, con una estética premium y un motor de renderizado ultra-fluido.

---

## ✨ Características Principales

### 🖋️ Experiencia de Escritura Inmersiva
- **Markdown Viewer & Editor**: Vista híbrida con edición en vivo.
- **Focus Mode**: Atenúa el resto del mundo y concéntrate solo en el bloque de texto actual.
- **Typewriter Mode**: Mantén tu línea de pensamiento siempre en el centro de la pantalla.
- **Doble Clic para Editar**: Cambia dinámicamente entre vista renderizada y edición de sintaxis.

### 📚 Gestión Documental Avanzada
- **The Binder (Herramienta de Unión)**: La joya de la corona. Fusiona múltiples archivos de proyecto o archivos externos (`.md`) en un solo documento maestro. Reordena tus capítulos con drag-and-drop antes de generar el manuscrito final.
- **Workspace Inteligente**: Sidebar integrada con gestión de archivos, visualización de tamaños en tiempo real y descarga rápida.
- **Carga Multi-Archivo**: Arrastra y suelta decenas de archivos simultáneamente a través de un modal dedicado.

### 🛠️ Herramientas de Exportación y UX
- **Notificaciones Premium**: Sistema propio de avisos y alertas diseñado para no interrumpir el flujo de trabajo.
- **Exportación Flexible**: 
  - **Generar PDF**: Descarga directa inmediata conservando estilos premium mediante `html2pdf.js`.
  - **Copia Rápida**: HTML o Rich Text para compatibilidad absoluta.
- **Gestión de Rendimiento**: Monitoreo de tamaño de archivos con advertencias inteligentes ("PESADO" en archivos > 2MB).
- **Temas Dinámicos**: Soporte completo para modo oscuro y claro con transiciones fluidas.
- **Mermaid & KaTeX**: Soporte nativo para diagramas técnicos y fórmulas matemáticas.

---

## 📐 Lineamientos del Proyecto

| Categoría | Especificación |
| :--- | :--- |
| **Arquitectura** | Next.js (App Router), Tailwind CSS, Zustand para estado global. |
| **Renderizado** | Motor basado en Web Workers para mantener 60 FPS. |
| **Componentización** | Componentes atómicos y modulares en `@/components`. |
| **Estética** | Glassmorphism, animaciones con Framer Motion y colores HSL curados. |
| **Límites Técnicos** | Optimizado para archivos de hasta 2MB; advertencias de "PESADO" en archivos >5MB. |

---

## 🚀 Guía de Inicio Rápido

### 1. Clonar e Instalar
Clona el repositorio y entra en la carpeta del proyecto para instalar las dependencias necesarias.
```bash
git clone <url-del-repositorio>
cd markdown-tools
npm install
```

### 2. Desarrollo
Inicia el servidor de desarrollo local para empezar a trabajar de inmediato.
```bash
npm run dev
```
Accede a `http://localhost:3000` en tu navegador.

### 3. Despliegue
Prepara el proyecto para producción o despliega directamente en la nube.
```bash
# Servidor local de producción
npm run build
npm run start
```
**Recomendado**: Despliega en **Vercel** simplemente conectando tu repositorio para una configuración automática y optimizada.

---

Desarrollado con ❤️ para escritores y desarrolladores que buscan la perfección en sus documentos.
