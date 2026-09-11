'use client';

import React from 'react';
import { Copy, MapPin, Star, Phone, ChevronDown, MessageCircle } from 'lucide-react';
import { ProspectLead, LeadStatus } from '@/types/prospeccao';

const STATUS_LABELS: Record<LeadStatus, string> = {
  pendente: '⚪ Pendente',
  abordado: '🟡 Abordado',
  negociacao: '🟣 Em Negociação',
  fechado: '💎 Venda Fechada',
  recusado: '🔴 Sem Resposta',
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  pendente: 'text-slate-400 border-slate-700',
  abordado: 'text-amber-400 border-amber-500/40',
  negociacao: 'text-purple-400 border-purple-500/40',
  fechado: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  recusado: 'text-red-400 border-red-500/40',
};

function getStepText(lead: ProspectLead, step: 1 | 2 | 3, varNum: number): string {
  const prefix = step === 1 ? 'Abordagem_1_Variação_' : step === 2 ? 'Resposta_2_Variação_' : 'Fechamento_3_Variação_';
  const fallback =
    step === 1 ? lead.Abordagem_1_Inicial : step === 2 ? lead.Resposta_2_Demonstracao_SIM : lead.Fechamento_3_Oferta_Preco_Pix;
  const varValue = lead[`${prefix}${varNum}`];
  return (typeof varValue === 'string' ? varValue : undefined) || fallback || '';
}

interface LeadCardProps {
  lead: ProspectLead;
  status: LeadStatus;
  isExpanded: boolean;
  notes: string;
  getVariation: (step: number) => number;
  onToggleExpand: () => void;
  onStatusChange: (status: LeadStatus) => void;
  onNotesBlur: (notes: string) => void;
  onSetVariation: (step: number, varIdx: number) => void;
  onCopy: (text: string) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  status,
  isExpanded,
  notes,
  getVariation,
  onToggleExpand,
  onStatusChange,
  onNotesBlur,
  onSetVariation,
  onCopy,
}) => {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/30 transition-all overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={onToggleExpand}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onToggleExpand();
        }}
        className="w-full p-5 flex items-center justify-between gap-3 text-left cursor-pointer"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <span className="px-2.5 py-1.5 rounded-lg bg-white/5 text-amber-400 font-bold text-sm flex-shrink-0">#{lead.Rank}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-base truncate">{lead.Nome_Estudio}</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-bold flex-shrink-0">
                ⭐ {lead.Score_Potencial} pts
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{lead.Bairro}</span>
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" />{lead.Avaliação_Google} ({lead.Total_Avaliações})</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{lead.Telefone || 'Sem tel'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span
            onClick={(e) => e.stopPropagation()}
            className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border ${STATUS_COLORS[status]}`}
          >
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value as LeadStatus)}
              className="bg-transparent outline-none cursor-pointer"
            >
              {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => (
                <option key={s} value={s} className="bg-slate-900 text-white">
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </span>
          <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 border-t border-slate-800 pt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm text-slate-400">
            <div><strong className="text-slate-300">Endereço:</strong> {lead.Endereço || 'N/A'}</div>
            <div>
              <strong className="text-slate-300">Instagram:</strong>{' '}
              {lead.Instagram ? (
                <a href={`https://instagram.com/${lead.Instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:underline">
                  {lead.Instagram}
                </a>
              ) : (
                'Não informado'
              )}
            </div>
            {lead.Link_GoogleMaps && (
              <div>
                <strong className="text-slate-300">Google Maps:</strong>{' '}
                <a href={lead.Link_GoogleMaps} target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:underline">
                  Ver Perfil
                </a>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">📝 Anotações Rápidas</label>
            <textarea
              defaultValue={notes}
              onBlur={(e) => onNotesBlur(e.target.value)}
              placeholder="Ex: Pediu para ligar amanhã às 14h..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-rose-500 focus:outline-none resize-y"
            />
          </div>

          {[1, 2, 3].map((step) => {
            const titles = ['💬 1. Abordagem Inicial', '✅ 2. Resposta / Oferta de Vídeo', '💰 3. Fechamento & Oferta Pix'];
            const varIdx = getVariation(step);
            const text = getStepText(lead, step as 1 | 2 | 3, varIdx + 1);
            return (
              <div key={step} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-sm font-bold text-amber-400">{titles[step - 1]}</span>
                  <button
                    onClick={() => onCopy(text)}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar
                  </button>
                </div>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <button
                      key={i}
                      onClick={() => onSetVariation(step, i)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                        varIdx === i ? 'bg-rose-500/20 border-rose-500/60 text-rose-200' : 'bg-white/5 border-slate-700 text-slate-500'
                      }`}
                    >
                      Var {i + 1}
                    </button>
                  ))}
                </div>
                <div className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed bg-black/30 rounded-lg p-3">
                  {text}
                </div>
                {step === 1 && lead.Link_WhatsApp && (
                  <a
                    href={lead.Link_WhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#25D366] text-black text-xs font-bold"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Abrir no WhatsApp Direct
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
