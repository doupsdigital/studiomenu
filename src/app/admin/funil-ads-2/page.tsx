'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Megaphone, Copy, Target, Clock, ShieldAlert, Lightbulb, ChevronDown } from 'lucide-react';
import { FUNIL_ADS_V2_DATA, FunilV2Kind } from '@/data/funil-ads-v2-scripts';

const KIND_ICON: Record<FunilV2Kind, typeof Target> = {
  funnel: Target,
  followup: Clock,
  objection: ShieldAlert,
  strategy: Lightbulb,
};

const KIND_COLOR: Record<FunilV2Kind, string> = {
  funnel: 'bg-emerald-500/20 text-emerald-300',
  followup: 'bg-sky-500/20 text-sky-300',
  objection: 'bg-rose-500/20 text-rose-300',
  strategy: 'bg-purple-500/20 text-purple-300',
};

export default function AdminFunilAdsV2Page() {
  // Mesmo comportamento do Funil ADS original: cada grupo abre/fecha independente, nenhum
  // aberto por padrão (uso real é no celular, escolher rápido qual roteiro é da vez).
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copiedStepId, setCopiedStepId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyStepText = (text: string, stepKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStepId(stepKey);
    setTimeout(() => setCopiedStepId(null), 2500);
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
                Funil - <em className="not-italic text-amber-400">ADS 2.0</em>
              </h1>
            </div>
          </div>
        </header>

        {/* Grupos — 1 card retrátil por funil/bloco, empilhados */}
        <div className="space-y-3">
          {FUNIL_ADS_V2_DATA.map((group) => {
            const isExpanded = expandedIds.has(group.id);
            const Icon = KIND_ICON[group.kind];

            return (
              <div
                key={group.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isExpanded ? 'border-amber-400/60 bg-slate-900' : 'border-slate-800 bg-slate-900/50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleExpanded(group.id)}
                  className="w-full p-5 flex items-center gap-3 text-left"
                >
                  <span className={`p-2 rounded-xl flex-shrink-0 ${KIND_COLOR[group.kind]}`}>
                    <Icon className="w-5 h-5" />
                  </span>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-base">{group.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{group.subtitle}</p>
                  </div>

                  <ChevronDown
                    className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-800 p-5 pt-4 space-y-5">
                    {group.steps.map((step) => {
                      const stepKey = `${group.id}-${step.title}`;
                      const isCopied = copiedStepId === stepKey;

                      return (
                        <div key={stepKey} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
                              {step.badge}
                            </span>
                            <h4 className="font-bold text-white text-sm">{step.title}</h4>
                          </div>

                          {step.tip && (
                            <p className="text-xs text-slate-500 italic leading-relaxed">💡 {step.tip}</p>
                          )}

                          <div className="bg-slate-900 border border-dashed border-slate-700 rounded-xl p-3.5 text-sm text-slate-200 whitespace-pre-wrap break-words leading-relaxed font-sans">
                            {step.content}
                          </div>

                          <button
                            type="button"
                            onClick={() => copyStepText(step.content, stepKey)}
                            className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
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
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
