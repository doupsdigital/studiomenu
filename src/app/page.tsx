import React from 'react';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="glass-panel-rose max-w-md w-full p-8 rounded-3xl shadow-glass border border-rose-200/60">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-sm">
          ✨
        </div>
        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
          StudioMenu
        </h1>
        <p className="text-rose-600 font-medium text-sm mb-4 tracking-wide uppercase">
          Infraestrutura Next.js + Tailwind Ativa
        </p>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          Plataforma de catálogos digitais para Lash, Nail, Estética e Estúdios de Beleza.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 text-xs font-semibold rounded-full border border-rose-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Etapa 1 — Setup Concluído com Sucesso
        </div>
      </div>
    </main>
  );
}
