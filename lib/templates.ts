/**
 * Curated Markdown template metadata and starter content.
 */
export interface DocumentTemplate {
    id: string;
    title: string;
    description: string;
    category: 'Ingeniería' | 'Arquitectura' | 'Ciencia' | 'Gestión';
    fileName: string;
    content: string;
}

/**
 * Five curated Spanish Markdown templates covering GFM, Mermaid, KaTeX, tables, and checklists.
 */
export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
    {
        id: 'readme-pro',
        title: 'README Profesional',
        description: 'Documentación completa de repositorio con badges, instalación, arquitectura y checklist de despliegue.',
        category: 'Ingeniería',
        fileName: 'README.md',
        content: `## 🚀 Nombre del Proyecto

> Plataforma modular de procesamiento y visualización técnica construida para equipos de alto rendimiento.

| Atributo | Valor | Estado |
| :--- | :--- | :---: |
| Versión estable | \`v2.4.0\` | ✅ Activa |
| Cobertura de pruebas | \`94.2%\` | 🟢 Verde |
| Licencia | MIT | 📄 Pública |

### ✨ Características Principales

- **Renderizado instantáneo**: Pipeline basado en AST con soporte completo de GFM.
- **Diagramas integrados**: Flujos y secuencias declarativas con Mermaid.
- **Tipografía matemática**: Ecuaciones en línea como $O(n \\log n)$ y bloques con KaTeX.

### 📦 Instalación Rápida

\`\`\`bash
git clone https://github.com/organizacion/proyecto.git
cd proyecto
npm install
npm run dev
\`\`\`

\`\`\`typescript
export interface AppConfig {
  environment: 'development' | 'production';
  maxConcurrency: number;
}

export function bootstrap(config: AppConfig): string {
  return \`Servicio iniciado en modo \${config.environment} (\${config.maxConcurrency} workers)\`;
}
\`\`\`

### 🧭 Flujo de Contribución

\`\`\`mermaid
flowchart LR
    Fork["1. Fork del repo"] --> Branch["2. Rama feat/cambio"]
    Branch --> Test["3. Pruebas y Lint"]
    Test --> PR["4. Pull Request"]
    PR --> Merge["5. Revisión y Merge"]
\`\`\`

### ✅ Checklist antes de Publicar

- [x] Documentar variables de entorno en \`.env.example\`
- [x] Verificar build sin advertencias de TypeScript
- [ ] Actualizar notas de versión en \`CHANGELOG.md\`
`,
    },
    {
        id: 'api-rest',
        title: 'Especificación API REST',
        description: 'Contrato de endpoints con parámetros, respuestas JSON, códigos HTTP y diagrama de autenticación.',
        category: 'Ingeniería',
        fileName: 'api-rest-spec.md',
        content: `## 🔌 Especificación de API REST v1

Documentación técnica de los endpoints públicos para gestión de documentos y exportaciones.

### 🔐 Flujo de Autenticación

\`\`\`mermaid
sequenceDiagram
    participant Cliente
    participant Gateway as API Gateway
    participant Auth as Servicio Auth
    Cliente->>Gateway: POST /v1/auth/token
    Gateway->>Auth: Valida credenciales
    Auth-->>Gateway: JWT firmado (HS256)
    Gateway-->>Cliente: 200 OK { accessToken, expiresIn }
\`\`\`

### 📍 Endpoints Disponibles

| Método | Ruta | Descripción | Autenticación |
| :--- | :--- | :--- | :---: |
| \`GET\` | \`/v1/documents\` | Lista documentos paginados | Bearer JWT |
| \`POST\` | \`/v1/documents\` | Crea un nuevo documento Markdown | Bearer JWT |
| \`PATCH\` | \`/v1/documents/:id\` | Actualiza título o contenido | Bearer JWT |
| \`DELETE\` | \`/v1/documents/:id\` | Elimina el recurso de forma lógica | Bearer JWT |

### 📥 Ejemplo: Crear Documento (\`POST /v1/documents\`)

\`\`\`json
{
  "title": "Guía de Arquitectura",
  "format": "gfm",
  "tags": ["arquitectura", "backend"],
  "content": "## Resumen\\nDocumento inicial del sistema."
}
\`\`\`

#### Respuesta Exitosa (\`201 Created\`)

\`\`\`json
{
  "id": "doc_9f83a2",
  "createdAt": "2026-11-14T18:30:00Z",
  "byteSize": 64
}
\`\`\`

### ⚠️ Códigos de Error Estándar

| Código HTTP | Identificador | Causa probable |
| :---: | :--- | :--- |
| \`400\` | \`VALIDATION_ERROR\` | Campos obligatorios ausentes o inválidos |
| \`401\` | \`UNAUTHORIZED\` | Token expirado o ausente |
| \`429\` | \`RATE_LIMITED\` | Se superó el límite de $120\\text{ req/min}$ |

### ✅ Lista de Verificación del Contrato

- [x] Versionado explícito en la ruta (\`/v1\`)
- [x] Respuestas de error uniformes RFC 9457
- [ ] Configurar pruebas de contrato en CI
`,
    },
    {
        id: 'adr-mermaid',
        title: 'ADR — Decisión de Arquitectura',
        description: 'Registro de Decisión Arquitectónica (ADR) con contexto, alternativas evaluadas y diagramas de sistema.',
        category: 'Arquitectura',
        fileName: 'ADR-001-arquitectura.md',
        content: `## 🏗️ ADR-001: Procesamiento Offline en Web Worker

| Campo | Detalle |
| :--- | :--- |
| **Estado** | Aceptado |
| **Fecha** | 2026-11-14 |
| **Responsables** | Equipo Plataforma Frontend |
| **Impacto** | Rendimiento de edición y fluidez a 60 FPS |

### 📌 Contexto

Al editar documentos extensos ($> 50\\text{ KB}$) con múltiples fórmulas y bloques de código, el parseo síncrono en el hilo principal bloquea el refresco de fotogramas y degrada la latencia de escritura.

### 🧭 Decisión

Mover el pipeline de transformación \`Unified / Remark / Rehype\` a un **Web Worker dedicado** con correlación por identificador de solicitud, cancelación de tareas obsoletas y fallback automático al hilo principal.

\`\`\`mermaid
flowchart TD
    Editor["Textarea / Editor"] -->|Debounce + ID| Client["markdownClient.ts"]
    Client -->|postMessage| Worker["markdown.worker.ts"]
    Worker -->|HTML + ID| Client
    Client -->|Última petición válida| Preview["Vista Previa + Mermaid"]
    Client -.->|Timeout / Sin Worker| Fallback["Fallback hilo principal"]
    Fallback --> Preview
\`\`\`

### ⚖️ Comparativa de Alternativas

| Criterio | Hilo Principal | Web Worker + Fallback | Servidor Remoto |
| :--- | :---: | :---: | :---: |
| Latencia percibida | Media / Alta | **Muy baja** | Alta (red) |
| Privacidad de datos | Total | **Total (local)** | Requiere envío |
| Resiliencia offline | Completa | **Completa** | Nula |

### 📈 Modelo de Latencia Esperada

La latencia máxima percibida en el hilo de UI se reduce de $T_{\\text{UI}} = T_{\\text{parse}} + T_{\\text{paint}}$ a:

$$T_{\\text{UI}} \\approx T_{\\text{postMessage}} + T_{\\text{paint}} < 16\\text{ ms}$$

### ✅ Plan de Adopción

- [x] Crear worker tipado con correlación por \`id\`
- [x] Implementar estrategia *latest-wins* con \`AbortSignal\`
- [ ] Medir tiempos P95 con documentos de 2 MB
`,
    },
    {
        id: 'paper-katex',
        title: 'Nota Técnica / Paper con KaTeX',
        description: 'Artículo científico o informe técnico con ecuaciones LaTeX, teoremas, métricas experimentales y metodología.',
        category: 'Ciencia',
        fileName: 'informe-tecnico-katex.md',
        content: `## 📐 Análisis de Convergencia en Optimización Estocástica

**Resumen:** Este documento presenta la formulación matemática, el algoritmo de descenso estocástico con momento y un análisis comparativo de convergencia sobre funciones convexas suaves.

### 1. Formulación del Problema

Buscamos minimizar una función objetivo diferenciable $f: \\mathbb{R}^d \\to \\mathbb{R}$ expresada como promedio empírico sobre $N$ muestras:

$$\\min_{\\theta \\in \\mathbb{R}^d} \\mathcal{L}(\\theta) = \\frac{1}{N} \\sum_{i=1}^{N} \\ell(h_\\theta(x_i), y_i) + \\frac{\\lambda}{2} \\|\\theta\\|_2^2$$

Donde $\\lambda > 0$ controla la regularización $L_2$ y la norma euclidiana satisface $\\|\\nabla \\mathcal{L}(\\theta_1) - \\nabla \\mathcal{L}(\\theta_2)\\|_2 \\le L \\|\\theta_1 - \\theta_2\\|_2$.

### 2. Regla de Actualización

Con tasa de aprendizaje $\\eta_t > 0$ y factor de momento $\\beta \\in [0, 1)$, la iteración $t$ se define mediante:

$$v_t = \\beta v_{t-1} + (1 - \\beta) g_t, \\qquad \\theta_{t+1} = \\theta_t - \\eta_t v_t$$

### 3. Flujo Experimental

\`\`\`mermaid
flowchart LR
    Data["Dataset Normalizado"] --> Split["Validación Cruzada k=5"]
    Split --> Train["Entrenamiento Mini-Lote"]
    Train --> Eval["Cálculo de Pérdida y RMSE"]
    Eval --> Report["Informe Final"]
\`\`\`

### 4. Resultados Comparativos

| Optimizador | Épocas hasta $\\varepsilon < 10^{-3}$ | Pérdida Final | Varianza |
| :--- | :---: | :---: | :---: |
| SGD Clásico | $142$ | $0.0412$ | $0.0084$ |
| SGD + Momento | $86$ | $0.0295$ | $0.0041$ |
| AdamW | **$54$** | **$0.0189$** | **$0.0023$** |

\`\`\`python
def step_momentum(theta: float, grad: float, velocity: float, lr: float = 0.01, beta: float = 0.9) -> tuple[float, float]:
    next_velocity = beta * velocity + (1.0 - beta) * grad
    next_theta = theta - lr * next_velocity
    return next_theta, next_velocity
\`\`\`

### ✅ Checklist de Reproducibilidad

- [x] Fijar semilla aleatoria global (\`seed = 42\`)
- [x] Registrar hiperparámetros y versiones de librerías
- [ ] Adjuntar apéndice con demostración de cota $O(1/\\sqrt{T})$
`,
    },
    {
        id: 'minuta-reunion',
        title: 'Minuta de Reunión Ejecutiva',
        description: 'Acta estructurada con asistentes, acuerdos clave, matriz de responsables y hoja de ruta.',
        category: 'Gestión',
        fileName: 'minuta-reunion.md',
        content: `## 📝 Minuta de Sincronización Semanal

| Dato | Detalle |
| :--- | :--- |
| **Proyecto** | Lanzamiento Markdown Tools v2 |
| **Fecha** | 14 de noviembre de 2026 |
| **Facilitador** | David León |
| **Duración** | 45 minutos |

### 👥 Asistentes

- **Producto**: Ana Gómez (Product Lead)
- **Frontend**: Carlos Ruiz (Staff Engineer)
- **Diseño**: Sofía Paredes (UX/Accessibility)

### 🎯 Puntos Tratados y Acuerdos

1. **Accesibilidad WCAG AA**: Se aprobó el ajuste de contraste en acentos azules y textos secundarios tanto en tema claro como oscuro.
2. **Motor de Renderizado**: Migración completa de diagramas Mermaid y fórmulas KaTeX al flujo asíncrono sin bloqueos.
3. **Objetivo de Latencia**: Mantener el tiempo de respuesta en vista previa por debajo de $50\\text{ ms}$ en documentos estándar.

### 🗓️ Hoja de Ruta Inmediata

\`\`\`mermaid
flowchart LR
    W1["Ola 1: Motor, CSS y SEO"] --> W2["Ola 2: UX Responsiva y TOC"]
    W2 --> W3["Ola 3: Pruebas E2E y Lighthouse"]
    W3 --> Release["Despliegue Producción"]
\`\`\`

### 📌 Matriz de Acciones

| Acción | Responsable | Fecha límite | Prioridad |
| :--- | :--- | :---: | :---: |
| Validar tokens de color y contraste | Sofía Paredes | 16 nov | Alta |
| Implementar Worker con cancelación | Carlos Ruiz | 17 nov | Alta |
| Revisar copy de plantillas en español | Ana Gómez | 18 nov | Media |

### ✅ Compromisos de Cierre

- [x] Compartir enlaces del repositorio actualizado
- [ ] Confirmar fecha de pruebas con usuarios beta
- [ ] Publicar resumen en el canal del equipo
`,
    },
];
