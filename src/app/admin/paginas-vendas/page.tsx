'use client';

import { useState } from 'react';
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
    <main className="min-h-screen bg-slate-950 text-white p-5 md:p-10">
      <div className="max-w-4xl mx-auto space-y-7">
        <header className="pb-7 border-b border-slate-800">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 mb-2.5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Painel</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <Gem className="w-6 h-6" />
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold">Páginas de Vendas</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1.5">
            2 variantes de A/B test — mesmo conteúdo, temas de cor diferentes. Use pra tráfego de anúncios.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* LPB */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all space-y-3.5">
            <div className="flex items-center gap-2.5 text-rose-400">
              <Flower2 className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Versão Principal (A/B Test)</span>
            </div>
            <h2 className="font-bold text-white text-lg">Página de Vendas — LPB</h2>
            <p className="text-sm text-slate-400">Tema Glamour Rosé com foco em conversão.</p>
            <p className="text-xs font-mono text-slate-500 truncate">/vendas/lpb</p>
            <div className="flex items-center gap-2">
              <Link
                href="/vendas/lpb"
                target="_blank"
                className="flex-1 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Ver</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => copyLink('/vendas/lpb')}
                className="flex-1 px-3 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Copiar Link</span>
              </button>
            </div>
          </div>

          {/* LPA */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all space-y-3.5">
            <div className="flex items-center gap-2.5 text-amber-400">
              <Gem className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Versão Editorial (A/B Test)</span>
            </div>
            <h2 className="font-bold text-white text-lg">Página de Vendas — LPA</h2>
            <p className="text-sm text-slate-400">Tema Nude & Champagne de Alta Costura.</p>
            <p className="text-xs font-mono text-slate-500 truncate">/vendas/lpa</p>
            <div className="flex items-center gap-2">
              <Link
                href="/vendas/lpa"
                target="_blank"
                className="flex-1 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Ver</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => copyLink('/vendas/lpa')}
                className="flex-1 px-3 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Copiar Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white text-sm font-semibold shadow-2xl z-50">
          {toastMessage}
        </div>
      )}
    </main>
  );
}
