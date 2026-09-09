'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Flower2, Gem, ExternalLink, Link2 } from 'lucide-react';

export default function AdminPaginasVendasPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyLink = (path: string) => {
    const url = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(url);
    showToast('🔗 Link copiado!');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="pb-6 border-b border-slate-800">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-slate-300 mb-2 transition-all"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Voltar ao Painel</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Gem className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold">Páginas de Vendas</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            2 variantes de A/B test — mesmo conteúdo, temas de cor diferentes. Use pra tráfego de anúncios.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* LPB */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all space-y-3">
            <div className="flex items-center gap-2 text-rose-400">
              <Flower2 className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Versão Principal (A/B Test)</span>
            </div>
            <h2 className="font-bold text-white text-base">Página de Vendas — LPB</h2>
            <p className="text-xs text-slate-400">Tema Glamour Rosé com foco em conversão.</p>
            <p className="text-[10px] font-mono text-slate-500 truncate">/vendas/lpb</p>
            <div className="flex items-center gap-1.5">
              <Link
                href="/vendas/lpb"
                target="_blank"
                className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-1 transition-all"
              >
                <span>Ver</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <button
                type="button"
                onClick={() => copyLink('/vendas/lpb')}
                className="flex-1 px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-1 transition-all"
              >
                <Link2 className="w-3 h-3" />
                <span>Copiar Link</span>
              </button>
            </div>
          </div>

          {/* LPA */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <Gem className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Versão Editorial (A/B Test)</span>
            </div>
            <h2 className="font-bold text-white text-base">Página de Vendas — LPA</h2>
            <p className="text-xs text-slate-400">Tema Nude & Champagne de Alta Costura.</p>
            <p className="text-[10px] font-mono text-slate-500 truncate">/vendas/lpa</p>
            <div className="flex items-center gap-1.5">
              <Link
                href="/vendas/lpa"
                target="_blank"
                className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-1 transition-all"
              >
                <span>Ver</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <button
                type="button"
                onClick={() => copyLink('/vendas/lpa')}
                className="flex-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1 transition-all"
              >
                <Link2 className="w-3 h-3" />
                <span>Copiar Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold shadow-2xl z-50">
          {toastMessage}
        </div>
      )}
    </main>
  );
}
