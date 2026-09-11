'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Palette, ExternalLink, Link2, Scissors, Sparkles as SparklesIcon, Flower2, Building2 } from 'lucide-react';
import { NicheType } from '@/types/catalog';
import { NICHE_OPTIONS } from '@/data/niche-options';

const NICHE_ICONS: Record<NicheType, React.ReactNode> = {
  lash: <Scissors className="w-5 h-5" />,
  nail: <SparklesIcon className="w-5 h-5" />,
  estetica: <Flower2 className="w-5 h-5" />,
  studio: <Building2 className="w-5 h-5" />,
};

const NICHE_CARDS: { niche: NicheType; label: string; icon: React.ReactNode }[] = NICHE_OPTIONS.map((o) => ({
  niche: o.value,
  label: o.label,
  icon: NICHE_ICONS[o.value],
}));

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
              <Palette className="w-6 h-6" />
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold">Showroom & Modelos Oficiais</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1.5">
            Links prontos pra mandar pra leads no WhatsApp, e o ambiente interno de testes de UI/UX.
          </p>
        </header>

        {/* Ambiente de Testes Interno */}
        <section className="space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Ambiente de Testes Interno</h2>
          <Link
            href="/c/demo"
            target="_blank"
            className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all flex items-center justify-between gap-3"
          >
            <div>
              <h3 className="font-bold text-white text-base">Testes StudioMenu (todos os nichos)</h3>
              <p className="text-sm text-slate-400 mt-1">
                Alterne nicho, modelo e tema livremente para aprovar melhorias de UI/UX.
              </p>
            </div>
            <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-rose-400 transition-all flex-shrink-0" />
          </Link>
        </section>

        {/* Vitrines por Nicho — links para leads */}
        <section className="space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Vitrines por Nicho (links para leads)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {NICHE_CARDS.map(({ niche, label, icon }) => (
              <div
                key={niche}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all space-y-3.5"
              >
                <div className="flex items-center gap-2.5 text-rose-400">
                  {icon}
                  <h3 className="font-bold text-white text-base">{label}</h3>
                </div>
                <p className="text-xs font-mono text-slate-500 truncate">/c/showcase/{niche}</p>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/c/showcase/${niche}`}
                    target="_blank"
                    className="flex-1 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Ver</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => copyShowcaseLink(niche)}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Copiar Link</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white text-sm font-semibold shadow-2xl z-50">
          {toastMessage}
        </div>
      )}
    </main>
  );
}
