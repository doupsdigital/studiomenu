'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Crown, Sparkles } from 'lucide-react';
import { CatalogOrderData } from '@/types/catalog';
import { PlusOnboardingModal } from './plus-onboarding/PlusOnboardingModal';

interface PlusUpsellCardProps {
  variant: 'card' | 'full';
  slug: string;
  /** Catálogo real da profissional, usado pra demonstrar o agendamento
   *  automático com os serviços/fotos dela mesma no onboarding (2026-09-24).
   *  `null` só quando a busca falha — nesse caso o CTA volta a ser o link
   *  antigo direto pra `/config`, sem quebrar a tela. */
  catalog: CatalogOrderData | null;
}

/** Conteúdo de upsell do StudioMenu+ — mesma peça usada bloqueada no Início
 *  (`variant="card"`) e como tela cheia na aba Agenda pra quem ainda não
 *  assina (`variant="full"`), duas portas de entrada pro mesmo onboarding.
 *
 *  Fundo sólido em gradiente + botão branco de alto contraste — é o
 *  principal gatilho de conversão da tela, não deveria parecer o elemento
 *  menos importante dela (Fase 13, feedback depois do teste do Bloco 11).
 *
 *  CTA único "Conheça" (sem preço no card, 2026-09-24) — abre um onboarding
 *  em tela cheia que demonstra o agendamento automático funcionando de
 *  verdade com o catálogo dela, terminando no formulário de assinar. */
export const PlusUpsellCard: React.FC<PlusUpsellCardProps> = ({ variant, slug, catalog }) => {
  const isFull = variant === 'full';
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

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
        <p className="text-[13px] font-bold tracking-widest uppercase text-white/70 mb-1">Conheça</p>
        <h3 className="font-serif-pro font-bold text-2xl mb-2">StudioMenu+</h3>
        <p className="text-[15px] text-white/85 leading-snug mb-5 max-w-[280px] mx-auto">
          Imagine suas clientes agendando sozinhas, sem trocar uma mensagem no WhatsApp.
        </p>

        {catalog ? (
          <button
            type="button"
            onClick={() => setIsOnboardingOpen(true)}
            className="block w-full py-3 rounded-xl bg-white text-rose-700 text-[15px] font-bold shadow-sm hover:bg-rose-50 transition-colors"
          >
            Conheça o StudioMenu+ →
          </button>
        ) : (
          <Link
            href={`/app/${slug}/config#upgrade-plus`}
            className="block w-full py-3 rounded-xl bg-white text-rose-700 text-[15px] font-bold shadow-sm hover:bg-rose-50 transition-colors"
          >
            Conheça o StudioMenu+ →
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {isFull ? <div className="flex items-center justify-center w-full px-2 py-6">{card}</div> : card}
      {isOnboardingOpen && catalog && (
        <PlusOnboardingModal slug={slug} catalog={catalog} onClose={() => setIsOnboardingOpen(false)} />
      )}
    </>
  );
};
