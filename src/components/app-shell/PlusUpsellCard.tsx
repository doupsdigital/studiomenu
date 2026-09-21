import React from 'react';
import Link from 'next/link';
import { Crown, Check, Sparkles } from 'lucide-react';
import { PLUS_PRICE_LABEL } from '@/lib/pricing';

interface PlusUpsellCardProps {
  variant: 'card' | 'full';
  slug: string;
}

const BENEFITS = [
  'Clientes agendam sozinhas, a qualquer hora',
  'Agenda organizada com horários reais',
  'Menos ida e volta pelo WhatsApp',
];

/** Conteúdo de upsell do StudioMenu+ — mesma peça usada bloqueada no Início
 *  (`variant="card"`) e como tela cheia na aba Agenda pra quem ainda não
 *  assina (`variant="full"`), duas portas de entrada pro mesmo fluxo, ambas
 *  levando pra "Minha Assinatura" na aba Config (Fase 5).
 *
 *  Fundo sólido em gradiente (em vez do rosé bem clarinho da primeira
 *  versão) + lista de benefícios + botão branco de alto contraste — é o
 *  principal gatilho de conversão da tela, não deveria parecer o elemento
 *  menos importante dela (Fase 13, feedback depois do teste do Bloco 11). */
export const PlusUpsellCard: React.FC<PlusUpsellCardProps> = ({ variant, slug }) => {
  const isFull = variant === 'full';

  const card = (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-700 via-rose-600 to-rose-500 text-white text-center shadow-lg shadow-rose-600/25 ${
        isFull ? 'w-full max-w-sm p-7' : 'p-6'
      }`}
    >
      <Sparkles className="absolute -top-3 -right-3 w-24 h-24 text-white/10 rotate-12 pointer-events-none select-none" strokeWidth={1} />
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
          <Crown className="w-7 h-7" />
        </div>
        <p className="text-[11px] font-bold tracking-widest uppercase text-white/70 mb-1">Desbloqueie</p>
        <h3 className="font-serif-pro font-bold text-2xl mb-3">StudioMenu+</h3>

        <ul className="text-left mx-auto max-w-[290px] flex flex-col gap-2.5 mb-5">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2.5 text-base text-white leading-snug">
              <Check className="w-4 h-4 mt-1 shrink-0 text-emerald-300" strokeWidth={3} />
              {benefit}
            </li>
          ))}
        </ul>

        <Link
          href={`/app/${slug}/config#upgrade-plus`}
          className="block w-full py-3 rounded-xl bg-white text-rose-700 text-sm font-bold shadow-sm hover:bg-rose-50 transition-colors"
        >
          Assinar por {PLUS_PRICE_LABEL}
        </Link>
      </div>
    </div>
  );

  if (!isFull) return card;

  return <div className="flex items-center justify-center w-full px-2 py-6">{card}</div>;
};
