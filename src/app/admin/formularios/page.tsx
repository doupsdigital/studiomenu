'use client';

import { useState } from 'react';
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
              <ClipboardList className="w-6 h-6" />
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold">Formulários</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1.5">
            Os 2 formulários de onboarding do StudioMenu — escolha qual link enviar de acordo com o canal.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {/* Com Boas-Vindas */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all space-y-3.5">
            <div className="flex items-center gap-2.5 text-rose-400">
              <PartyPopper className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Pós-Venda / Com Boas-Vindas</span>
            </div>
            <h2 className="font-bold text-white text-lg">Formulário (Com Tela de Boas-Vindas)</h2>
            <p className="text-sm text-slate-400">Para clientes que acabaram de comprar (ex: checkout, Cakto/Kiwify).</p>
            <p className="text-xs font-mono text-slate-500 truncate">/form/boas-vindas</p>
            <div className="flex items-center gap-2">
              <Link
                href="/form/boas-vindas"
                target="_blank"
                className="flex-1 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Ver</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => copyLink('/form/boas-vindas')}
                className="flex-1 px-3 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Copiar Link</span>
              </button>
            </div>
          </div>

          {/* Direto (Sem Boas-Vindas) */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all space-y-3.5">
            <div className="flex items-center gap-2.5 text-rose-400">
              <Zap className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Formulário Direto (Etapa 1)</span>
            </div>
            <h2 className="font-bold text-white text-lg">Formulário Direto (Sem Boas-Vindas)</h2>
            <p className="text-sm text-slate-400">Abre direto no preenchimento dos dados — ideal para enviar no WhatsApp/X1.</p>
            <p className="text-xs font-mono text-slate-500 truncate">/form</p>
            <div className="flex items-center gap-2">
              <Link
                href="/form"
                target="_blank"
                className="flex-1 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Ver</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => copyLink('/form')}
                className="flex-1 px-3 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
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
