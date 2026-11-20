import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function resolveSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    return new URL("https://markdown-tools.vercel.app");
  }
  const normalized =
    raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : `https://${raw}`;
  return new URL(normalized);
}

const SITE_DESCRIPTION =
  "Suite gratuita de edición Markdown en tiempo real con vista dividida, diagramas Mermaid, fórmulas matemáticas LaTeX con KaTeX, resaltado de sintaxis, fusión inteligente de múltiples archivos y exportación a HTML, PDF y Rich Text.";

const SITE_TITLE =
  "Markdown Tools — Editor Markdown Online Gratis con Mermaid, KaTeX y Fusión";

export const metadata: Metadata = {
  metadataBase: resolveSiteUrl(),
  title: {
    default: SITE_TITLE,
    template: "%s | Markdown Tools",
  },
  description: SITE_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
  },
  keywords: [
    "editor markdown online",
    "herramientas markdown",
    "unir archivos markdown",
    "combinar markdown online",
    "markdown a pdf",
    "convertir markdown a pdf",
    "markdown mermaid online",
    "markdown katex latex",
    "vista previa markdown en tiempo real",
    "exportar markdown a pdf",
    "editor documentación técnica",
    "markdown binder",
    "markdown tools",
    "gfm preview online",
  ],
  authors: [{ name: "David León Vilca", url: "https://github.com/datevid" }],
  creator: "David León Vilca",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: "Markdown Tools",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Markdown Tools — Editor Markdown Online Gratis con Mermaid, KaTeX y Fusión",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

const isAnalyticsEnabled = Boolean(
  process.env.VERCEL || process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true"
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {isAnalyticsEnabled && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  );
}
