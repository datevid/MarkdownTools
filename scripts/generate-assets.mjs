import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const svgLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d4ed8" />
      <stop offset="50%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#93c5fd" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.3" />
    </linearGradient>
    <linearGradient id="iconGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f1f5f9" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#0f172a" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Squircle Base with glow border -->
  <rect x="36" y="36" width="440" height="440" rx="100" ry="100" fill="url(#bgGrad)" filter="url(#shadow)" />
  <rect x="37" y="37" width="438" height="438" rx="99" ry="99" fill="none" stroke="url(#borderGrad)" stroke-width="4" />

  <!-- Markdown Badge Header Pill: subtle tech accent -->
  <rect x="196" y="74" width="120" height="20" rx="10" fill="#ffffff" fill-opacity="0.25" />

  <!-- Markdown Official Geometry: Stylized M + Technical Arrow -->
  <g fill="url(#iconGrad)">
    <!-- Modern bold M -->
    <path d="M 88 360 V 152 h 54 l 57 74 l 57 -74 h 54 v 208 h -46 V 230 l -65 82 h -2 l -65 -82 v 130 Z" />
    
    <!-- Bold technical Down Arrow -->
    <path d="M 370 152 h 46 v 122 h 44 l -67 86 l -67 -86 h 44 Z" />
  </g>
</svg>`;

// Also generate 1200x630 OpenGraph social card
const svgOgImage = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="ogBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" stop-opacity="0.7" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.9" />
    </linearGradient>
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#93c5fd" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#ogBg)" />

  <!-- Ambient Glow Circles -->
  <circle cx="200" cy="150" r="300" fill="#2563eb" opacity="0.18" filter="blur(80px)" />
  <circle cx="1000" cy="480" r="280" fill="#06b6d4" opacity="0.14" filter="blur(80px)" />

  <!-- Card Container -->
  <rect x="60" y="50" width="1080" height="530" rx="32" fill="url(#cardGrad)" stroke="#334155" stroke-width="2" />

  <!-- Left: Logo Squircle (160x160) -->
  <g transform="translate(110, 110)">
    <rect width="160" height="160" rx="38" fill="url(#badgeGrad)" stroke="#93c5fd" stroke-width="2" />
    <g fill="#ffffff" transform="scale(0.3125) translate(0, 0)">
      <path d="M 88 360 V 152 h 54 l 57 74 l 57 -74 h 54 v 208 h -46 V 230 l -65 82 h -2 l -65 -82 v 130 Z" />
      <path d="M 370 152 h 46 v 122 h 44 l -67 86 l -67 -86 h 44 Z" />
    </g>
  </g>

  <!-- Header Badge -->
  <g transform="translate(300, 115)">
    <rect width="260" height="36" rx="18" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
    <text x="130" y="23" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#60a5fa" text-anchor="middle">
      SUITE TÉCNICA 100% PRIVADA
    </text>
  </g>

  <!-- Main Title -->
  <text x="300" y="200" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" fill="url(#textGrad)" letter-spacing="-1">
    Markdown Tools
  </text>

  <!-- Tagline -->
  <text x="300" y="246" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="500" fill="#94a3b8">
    Editor Markdown Online con Vista Previa en Tiempo Real
  </text>

  <!-- Divider -->
  <line x1="110" y1="315" x2="1090" y2="315" stroke="#334155" stroke-width="1.5" />

  <!-- Features Grid -->
  <!-- Col 1 -->
  <g transform="translate(110, 355)">
    <rect width="210" height="170" rx="20" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
    <circle cx="45" cy="45" r="20" fill="#2563eb" fill-opacity="0.2" />
    <text x="45" y="52" font-family="system-ui, sans-serif" font-size="18" fill="#60a5fa" text-anchor="middle">📊</text>
    <text x="28" y="96" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#ffffff">Mermaid.js</text>
    <text x="28" y="125" font-family="system-ui, sans-serif" font-size="13" fill="#94a3b8">Diagramas de flujo, secuencia y Gantt en vivo</text>
  </g>

  <!-- Col 2 -->
  <g transform="translate(355, 355)">
    <rect width="210" height="170" rx="20" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
    <circle cx="45" cy="45" r="20" fill="#2563eb" fill-opacity="0.2" />
    <text x="45" y="52" font-family="system-ui, sans-serif" font-size="18" fill="#60a5fa" text-anchor="middle">∑</text>
    <text x="28" y="96" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#ffffff">KaTeX / LaTeX</text>
    <text x="28" y="125" font-family="system-ui, sans-serif" font-size="13" fill="#94a3b8">Ecuaciones matemáticas inline y en bloque</text>
  </g>

  <!-- Col 3 -->
  <g transform="translate(600, 355)">
    <rect width="210" height="170" rx="20" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
    <circle cx="45" cy="45" r="20" fill="#2563eb" fill-opacity="0.2" />
    <text x="45" y="52" font-family="system-ui, sans-serif" font-size="18" fill="#60a5fa" text-anchor="middle">🗂️</text>
    <text x="28" y="96" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#ffffff">Binding Tool</text>
    <text x="28" y="125" font-family="system-ui, sans-serif" font-size="13" fill="#94a3b8">Fusión inteligente de múltiples archivos .md</text>
  </g>

  <!-- Col 4 -->
  <g transform="translate(845, 355)">
    <rect width="210" height="170" rx="20" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
    <circle cx="45" cy="45" r="20" fill="#2563eb" fill-opacity="0.2" />
    <text x="45" y="52" font-family="system-ui, sans-serif" font-size="18" fill="#60a5fa" text-anchor="middle">⚡</text>
    <text x="28" y="96" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#ffffff">Exportación</text>
    <text x="28" y="125" font-family="system-ui, sans-serif" font-size="13" fill="#94a3b8">PDF editorial, HTML, Rich Text y Markdown</text>
  </g>
</svg>`;

async function main() {
  const publicDir = path.resolve('public');
  const appDir = path.resolve('app');

  // 1. Write vector SVG
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), svgLogo, 'utf8');
  console.log('✓ Wrote public/logo.svg');

  // 2. Generate high-res public/logo.png (512x512)
  await sharp(Buffer.from(svgLogo))
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'logo.png'));
  console.log('✓ Generated public/logo.png (512x512)');

  // 3. Generate app/icon.png (512x512) for Next.js App Router icon
  await sharp(Buffer.from(svgLogo))
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(appDir, 'icon.png'));
  console.log('✓ Generated app/icon.png (512x512)');

  // 4. Generate app/favicon.ico (48x48 PNG format supported by modern browsers)
  await sharp(Buffer.from(svgLogo))
    .resize(48, 48)
    .png()
    .toFile(path.join(appDir, 'favicon.ico'));
  console.log('✓ Generated app/favicon.ico (48x48)');

  // 5. Generate public/og-image.png (1200x630)
  fs.writeFileSync(path.join(publicDir, 'og-image.svg'), svgOgImage, 'utf8');
  await sharp(Buffer.from(svgOgImage))
    .resize(1200, 630)
    .png({ quality: 95, compressionLevel: 8 })
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('✓ Generated public/og-image.png (1200x630)');

  // 6. Generate icons for webmanifest
  await sharp(Buffer.from(svgLogo))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(Buffer.from(svgLogo))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('✓ Generated PWA icons (192, 512)');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
