'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, Mail } from 'lucide-react';
import { AUTHOR_INFO } from '@/lib/siteConfig';

/**
 * Accessible contact form providing instant feedback and mailto fallback.
 */
export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Sugerencia de funcionalidad');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Por favor completa tu nombre, correo electrónico y mensaje.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  if (submitted) {
    const mailtoHref = `mailto:${AUTHOR_INFO.email}?subject=${encodeURIComponent(
      `[Markdown Tools] ${topic} - ${name}`
    )}&body=${encodeURIComponent(`${message}\n\nResponder a: ${email}`)}`;

    return (
      <div
        role="status"
        className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6 space-y-4"
      >
        <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
          <CheckCircle2 size={24} aria-hidden="true" />
          <h2 className="text-lg font-bold">Mensaje preparado correctamente</h2>
        </div>
        <p className="text-sm leading-relaxed text-foreground">
          Gracias por escribirnos, <strong>{name}</strong>. Como Markdown Tools funciona 100% del
          lado del cliente sin servidores de rastreo, puedes enviar este mensaje directamente desde
          tu cliente de correo o abrir una incidencia en GitHub.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={mailtoHref}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
          >
            <Mail size={16} aria-hidden="true" />
            <span>Enviar por correo</span>
          </a>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setName('');
              setEmail('');
              setMessage('');
            }}
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
          >
            Enviar otro mensaje
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-semibold text-foreground mb-1.5">
            Nombre completo
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Ana Martínez"
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-sm font-semibold text-foreground mb-1.5">
            Correo electrónico
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-topic" className="block text-sm font-semibold text-foreground mb-1.5">
          Motivo de contacto
        </label>
        <select
          id="contact-topic"
          name="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="Sugerencia de funcionalidad">Sugerencia de funcionalidad</option>
          <option value="Reporte de error técnico">Reporte de error técnico</option>
          <option value="Colaboración / Open Source">Colaboración / Open Source</option>
          <option value="Consulta general">Consulta general</option>
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-semibold text-foreground mb-1.5">
          Mensaje
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Cuéntanos cómo podemos mejorar Markdown Tools o describe el caso que deseas reportar..."
          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-accent-foreground shadow-sm transition-opacity hover:opacity-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Send size={16} aria-hidden="true" />
        <span>Preparar mensaje</span>
      </button>
    </form>
  );
}
