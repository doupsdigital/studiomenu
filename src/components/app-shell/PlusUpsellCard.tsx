import React from 'react';
import { Sparkles } from 'lucide-react';

interface PlusUpsellCardProps {
  variant: 'card' | 'full';
}

/** Conteúdo de upsell do StudioMenu+ — mesma peça usada bloqueada no Início
 *  (`variant="card"`) e como tela cheia na aba Agenda pra quem ainda não
 *  assina (`variant="full"`), duas portas de entrada pro mesmo fluxo. Sem
 *  checkout de verdade ainda — isso é Fase 5 (Asaas). */
export const PlusUpsellCard: React.FC<PlusUpsellCardProps> = ({ variant }) => {
  const isFull = variant === 'full';

  return (
    <div
      className={
        isFull
          ? 'flex flex-col items-center justify-center text-center px-6 py-16'
          : 'rounded-2xl bg-gradient-to-br from-rose-950 to-slate-900 border border-rose-500/30 p-5'
      }
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto mb-3">
        <Sparkles className="w-6 h-6" />
      </div>
      <h3 className={isFull ? 'font-serif text-xl font-bold text-white mb-2' : 'font-bold text-white text-sm mb-1'}>
        StudioMenu+
      </h3>
      <p className={isFull ? 'text-sm text-slate-400 max-w-xs mb-6 leading-relaxed' : 'text-xs text-slate-400 mb-4 leading-relaxed'}>
        Agendamento automático com horários reais, agenda organizada e menos ida e volta no WhatsApp.
      </p>
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/40 text-white text-xs font-bold cursor-not-allowed opacity-70"
        title="Assinatura chega em breve"
      >
        Assinar (em breve)
      </button>
    </div>
  );
};
