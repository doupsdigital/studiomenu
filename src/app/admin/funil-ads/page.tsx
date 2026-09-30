'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Megaphone, Copy, Lightbulb, CheckCircle2, Video, Image as ImageIcon, Sparkles } from 'lucide-react';
import { FUNIL_ADS_DATA, FunnelData } from '@/data/funil-ads-scripts';

export default function AdminFunilAdsPage() {
  const [activeFunnelId, setActiveFunnelId] = useState<string>('funil-video');
  const [copiedStepId, setCopiedStepId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const currentFunnel: FunnelData =
    FUNIL_ADS_DATA.find((f) => f.id === activeFunnelId) || FUNIL_ADS_DATA[0];

  const copyStepText = (text: string, stepKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStepId(stepKey);
    setTimeout(() => setCopiedStepId(null), 2500);
  };

  const toggleStepDone = (stepKey: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-5 md:p-10">
      <div className="max-w-4xl mx-auto space-y-7">
        {/* Header */}
        <header className="pb-7 border-b border-slate-800">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 mb-3 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Painel</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Megaphone className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  Tráfego Pago
                </span>
                <span className="text-xs text-slate-400">• StudioMenu Ads</span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold mt-1">
                Funil - <em className="not-italic text-amber-400">ADS</em>
              </h1>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">
            Funis de conversão WhatsApp X1 desenhados sob medida para os leads que chegam dos Anúncios do Meta Ads.
          </p>
        </header>

        {/* Seleção de Funis (Vídeo vs Imagem) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FUNIL_ADS_DATA.map((funnel) => {
            const isActive = funnel.id === activeFunnelId;
            const isVideo = funnel.id === 'funil-video';
            return (
              <button
                key={funnel.id}
                type="button"
                onClick={() => setActiveFunnelId(funnel.id)}
                className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  isActive
                    ? 'bg-slate-900 border-amber-400 shadow-xl shadow-amber-500/10'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <span
                    className={`p-2 rounded-xl ${
                      isVideo ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {isVideo ? <Video className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                  </span>
                  <h3 className="font-bold text-white text-base">{funnel.title}</h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed pl-1">{funnel.subtitle}</p>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Gatilho do Lead:</span>
                  <span className="font-mono text-amber-300 truncate max-w-[200px]" title={funnel.triggerMessage}>
                    &quot;{funnel.triggerMessage}&quot;
                  </span>
                </div>

                {isActive && (
                  <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    Ativo
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Info do Funil Selecionado */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="font-bold text-white text-lg">{currentFunnel.title}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Origem: <strong className="text-slate-300">{currentFunnel.adOrigin}</strong> | Sequência de {currentFunnel.steps.length} passos
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-amber-300 font-mono w-full sm:w-auto">
            💬 Lead: &quot;{currentFunnel.triggerMessage}&quot;
          </div>
        </div>

        {/* Lista de Passos do Funil */}
        <div className="space-y-5">
          {currentFunnel.steps.map((step) => {
            const stepKey = `${currentFunnel.id}-${step.stepNumber}`;
            const isCopied = copiedStepId === stepKey;
            const isDone = completedSteps[stepKey];

            return (
              <div
                key={stepKey}
                className={`bg-slate-900 border rounded-2xl p-5 space-y-3.5 transition-all ${
                  isDone
                    ? 'border-emerald-500/30 opacity-70 bg-slate-900/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header do Passo */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
                      {step.badge}
                    </span>
                    <h3 className="font-bold text-white text-base">{step.title}</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleStepDone(stepKey)}
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg border transition-all ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isDone ? 'Enviado' : 'Marcar como enviado'}</span>
                  </button>
                </div>

                {/* Dica de Uso */}
                {step.tip && (
                  <div className="flex items-start gap-2.5 bg-amber-400/5 border-l-2 border-amber-400 rounded-r-lg px-3.5 py-2.5 text-xs text-slate-300">
                    <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-amber-400">Como usar:</strong> {step.tip}
                    </span>
                  </div>
                )}

                {/* Conteúdo Copiável */}
                <div className="bg-slate-950 border border-dashed border-slate-700 rounded-xl p-4 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                  {step.content}
                </div>

                {/* Botão Copiar */}
                <button
                  type="button"
                  onClick={() => copyStepText(step.content, stepKey)}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isCopied
                      ? 'bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/10'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  <span>{isCopied ? '✅ Script Copiado!' : 'Copiar Mensagem (1 Clique)'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
