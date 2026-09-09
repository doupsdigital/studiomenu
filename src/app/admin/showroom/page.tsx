'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Palette, ExternalLink, Link2, Scissors, Sparkles as SparklesIcon, Flower2, Building2 } from 'lucide-react';
import { NicheType } from '@/types/catalog';

const NICHE_CARDS: { niche: NicheType; label: string; icon: React.ReactNode }[] = [
  { niche: 'lash', label: 'Lash Designer', icon: <Scissors className="w-4 h-4" /> },
  { niche: 'nail', label: 'Nail Designer', icon: <SparklesIcon className="w-4 h-4" /> },
  { niche: 'estetica', label: 'Estética', icon: <Flower2 className="w-4 h-4" /> },
  { niche: 'studio', label: 'Studio de Beleza', icon: <Building2 className="w-4 h-4" /> },
];

export default function AdminShowroomPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyShowcaseLink = (niche: NicheType) => {
    const url = `${window.location.origin}/c/showcase/${niche}`;
    navigator.clipboard.writeText(url);
    showToast('🔗 Link de vitrine copiado!');
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
              <Palette className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold">Showroom & Modelos Oficiais</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Links prontos pra mandar pra leads no WhatsApp, e o ambiente interno de testes de UI/UX.
          </p>
        </header>

        {/* Ambiente de Testes Interno */}
        <section className="space-y-2">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ambiente de Testes Interno</h2>
          <Link
            href="/c/demo"
            target="_blank"
            className="group p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all flex items-center justify-between gap-3"
          >
            <div>
              <h3 className="font-bold text-white text-sm">Testes StudioMenu (todos os nichos)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Alterne nicho, modelo e tema livremente para aprovar melhorias de UI/UX.
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-all flex-shrink-0" />
          </Link>
        </section>

        {/* Vitrines por Nicho — links para leads */}
        <section className="space-y-2">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Vitrines por Nicho (links para leads)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {NICHE_CARDS.map(({ niche, label, icon }) => (
              <div
                key={niche}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all space-y-3"
              >
                <div className="flex items-center gap-2 text-rose-400">
                  {icon}
                  <h3 className="font-bold text-white text-sm">{label}</h3>
                </div>
                <p className="text-[10px] font-mono text-slate-500 truncate">/c/showcase/{niche}</p>
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/c/showcase/${niche}`}
                    target="_blank"
                    className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-1 transition-all"
                  >
                    <span>Ver</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => copyShowcaseLink(niche)}
                    className="flex-1 px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <Link2 className="w-3 h-3" />
                    <span>Copiar Link</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold shadow-2xl z-50">
          {toastMessage}
        </div>
      )}
    </main>
  );
}
