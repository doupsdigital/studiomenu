'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ClipboardList, ExternalLink, Link2, PartyPopper, Zap } from 'lucide-react';

export default function AdminFormulariosPage() {
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
              <ClipboardList className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold">Formulários</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Os 2 formulários de onboarding do StudioMenu — escolha qual link enviar de acordo com o canal.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {/* Com Boas-Vindas */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all space-y-3">
            <div className="flex items-center gap-2 text-rose-400">
              <PartyPopper className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Pós-Venda / Com Boas-Vindas</span>
            </div>
            <h2 className="font-bold text-white text-base">Formulário (Com Tela de Boas-Vindas)</h2>
            <p className="text-xs text-slate-400">Para clientes que acabaram de comprar (ex: checkout, Cakto/Kiwify).</p>
            <p className="text-[10px] font-mono text-slate-500 truncate">/form/boas-vindas</p>
            <div className="flex items-center gap-1.5">
              <Link
                href="/form/boas-vindas"
                target="_blank"
                className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-1 transition-all"
              >
                <span>Ver</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <button
                type="button"
                onClick={() => copyLink('/form/boas-vindas')}
                className="flex-1 px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-1 transition-all"
              >
                <Link2 className="w-3 h-3" />
                <span>Copiar Link</span>
              </button>
            </div>
          </div>

          {/* Direto (Sem Boas-Vindas) */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all space-y-3">
            <div className="flex items-center gap-2 text-rose-400">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Formulário Direto (Etapa 1)</span>
            </div>
            <h2 className="font-bold text-white text-base">Formulário Direto (Sem Boas-Vindas)</h2>
            <p className="text-xs text-slate-400">Abre direto no preenchimento dos dados — ideal para enviar no WhatsApp/X1.</p>
            <p className="text-[10px] font-mono text-slate-500 truncate">/form</p>
            <div className="flex items-center gap-1.5">
              <Link
                href="/form"
                target="_blank"
                className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-1 transition-all"
              >
                <span>Ver</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <button
                type="button"
                onClick={() => copyLink('/form')}
                className="flex-1 px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-1 transition-all"
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
