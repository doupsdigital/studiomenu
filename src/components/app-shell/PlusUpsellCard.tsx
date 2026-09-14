import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { PLUS_PRICE_LABEL } from '@/lib/pricing';

interface PlusUpsellCardProps {
  variant: 'card' | 'full';
  slug: string;
}

/** Conteúdo de upsell do StudioMenu+ — mesma peça usada bloqueada no Início
 *  (`variant="card"`) e como tela cheia na aba Agenda pra quem ainda não
 *  assina (`variant="full"`), duas portas de entrada pro mesmo fluxo, ambas
 *  levando pra "Minha Assinatura" na aba Config (Fase 5). */
export const PlusUpsellCard: React.FC<PlusUpsellCardProps> = ({ variant, slug }) => {
  const isFull = variant === 'full';

  return (
    <div
      className={
        isFull
          ? 'flex flex-col items-center justify-center text-center px-6 py-16'
          : 'rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 border border-rose-200 p-5 text-center'
      }
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
        <Sparkles className="w-6 h-6" />
      </div>
      <h3 className={isFull ? 'font-serif-pro text-xl font-bold text-ink mb-2' : 'font-serif-pro font-bold text-ink text-base mb-1'}>
        StudioMenu+
      </h3>
      <p className={isFull ? 'text-sm text-ink-soft max-w-xs mx-auto mb-6 leading-relaxed' : 'text-xs text-ink-soft mb-4 leading-relaxed'}>
        Agendamento automático com horários reais, agenda organizada e menos ida e volta no WhatsApp.
      </p>
      <Link
        href={`/app/${slug}/config#assinatura`}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
      >
        Assinar por {PLUS_PRICE_LABEL}
      </Link>
    </div>
  );
};
