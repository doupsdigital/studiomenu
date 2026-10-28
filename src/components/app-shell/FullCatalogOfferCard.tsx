'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Eye } from 'lucide-react';
import { PlanSubscribeCard } from '@/components/billing/PlanSubscribeCard';

interface FullCatalogOfferCardProps {
  slug: string;
  price: { price: number; label: string };
  /** `false` = tela de primeiro contato, ANTES de pagar qualquer coisa
   *  (preço cheio, "Quero esse" só marca a decisão e deixa o
   *  `PlanSubscribeCard` que já existe na tela cobrar o preço certo).
   *  `true` = ela já paga o Catálogo simples (preço é só a diferença,
   *  "Quero esse" abre um checkout avulso embutido aqui mesmo). */
  alreadyPaid: boolean;
  /** Chamado assim que ela decide (aceita OU recusa) — usado pelo
   *  `FirstContactScreen` pra abrir sozinho o acordeão "Pagamento" logo em
   *  seguida (pedido real, 2026-10-28: antes do card de pagamento virar
   *  acordeão, ele já aparecia aberto; decidir aqui não devia deixá-lo
   *  fechado). Opcional — `/inicio` (`alreadyPaid`) não tem esse acordeão. */
  onDecided?: () => void;
}

/** Card da oferta automática de upsell "Catálogo Completo" (2026-10-28) —
 *  mesmo componente nas 2 telas onde pode aparecer (`FirstContactScreen`,
 *  antes de pagar; `/app/[slug]/inicio`, depois de já pagar o Catálogo
 *  simples), só muda o preço/o que "Quero esse" dispara via `alreadyPaid`.
 *
 *  Sequência: teaser com link de preview (`/c/[slug]?preview=completo`,
 *  isolado — não muda o catálogo público real) → depois que ela clica, revela
 *  preço + decisão. Esse "já viu o preview" é só estado local, não persiste
 *  (recarregar a página mostra o teaser de novo — inofensivo, a decisão em
 *  si continua 'pending' no banco até ela de fato escolher). */
export const FullCatalogOfferCard: React.FC<FullCatalogOfferCardProps> = ({ slug, price, alreadyPaid, onDecided }) => {
  const router = useRouter();
  const [previewed, setPreviewed] = useState(false);
  const [wantsUpgrade, setWantsUpgrade] = useState(false);
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendDecision = async (decision: 'accepted' | 'declined') => {
    setLoading(decision === 'accepted' ? 'accept' : 'decline');
    setError(null);
    try {
      const res = await fetch('/api/professional/full-catalog-offer-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, decision }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message || 'Não foi possível salvar sua escolha.');
        return;
      }
      onDecided?.();
      router.refresh();
    } catch {
      setError('Falha na conexão.');
    } finally {
      setLoading(null);
    }
  };

  if (wantsUpgrade) {
    return <PlanSubscribeCard slug={slug} plan="basico" priceOverride={price} fullCatalogUpgrade />;
  }

  return (
    <div className="rounded-2xl p-6 bg-gradient-to-br from-rose-200 to-rose-100 border border-rose-200/60 relative overflow-hidden text-center">
      <Sparkles className="absolute -top-3 -right-3 w-24 h-24 text-rose-300/50 rotate-12 pointer-events-none select-none" strokeWidth={1.25} />
      <div className="relative z-10">
        <h2 className="font-serif-pro font-bold text-xl text-rose-800 mb-1.5">Catálogo Completo</h2>
        <p className="text-[15px] text-rose-800/70 mb-4 max-w-xs mx-auto">
          {alreadyPaid
            ? 'Você já tem o Catálogo — que tal adicionar Capa personalizada, Orientações e Links de Contato?'
            : 'Seu Studio pode ter Capa personalizada, Orientações e Links de Contato, além da grade de procedimentos.'}
        </p>

        {!previewed ? (
          <a
            href={`/c/${slug}?preview=completo`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setPreviewed(true)}
            className="inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-white text-rose-700 text-[15px] font-bold shadow-sm hover:bg-rose-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver como ficaria →
          </a>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-white border border-rose-200">
              <span className="font-serif-pro font-bold text-xl text-rose-700">
                {alreadyPaid ? `+ ${price.label}` : price.label}
              </span>
            </div>
            {error && <p className="text-sm text-rose-700">{error}</p>}
            <button
              type="button"
              disabled={loading !== null}
              onClick={() => (alreadyPaid ? setWantsUpgrade(true) : sendDecision('accepted'))}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-bold disabled:opacity-50 transition-colors"
            >
              Quero o Catálogo Completo
            </button>
            <button
              type="button"
              disabled={loading !== null}
              onClick={() => sendDecision('declined')}
              className="text-sm font-semibold text-rose-700 underline underline-offset-2 disabled:opacity-50"
            >
              {loading === 'decline' ? 'Salvando...' : alreadyPaid ? 'Prefiro ficar como está' : 'Prefiro ficar no Catálogo simples'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
