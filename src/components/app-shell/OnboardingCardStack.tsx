'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { agendaVisitedKey, getOnboardingChecklistItems } from '@/lib/onboarding-cards';

interface OnboardingCardStackProps {
  slug: string;
  planTier: 'catalog' | 'basico' | 'plus';
  subscriptionStatus: 'none' | 'ativo' | 'suspenso' | 'cancelado';
  hasAccount: boolean;
  hoursDone: boolean;
}

const doneSeenKey = (slug: string) => `sm_onboarding_done_seen_${slug}`;

interface ClientState {
  agendaVisited: boolean;
  celebrate: boolean;
}

/** Checklist "Deixe seu studio pronto" (substitui os cards soltos de "próximo
 *  passo"): itens marcáveis + barra de progresso. Aparece só depois que ela
 *  assinou algo (mesmo critério de antes). Cada item some do "pendente" sozinho
 *  quando é feito — horários e acesso vêm do banco; "conhecer a agenda" é uma
 *  marca no aparelho (`localStorage`, sem dado no banco pra isso). Quando tudo
 *  está marcado, mostra "Tudo pronto" numa única visita e depois some. A lista
 *  vem de `getOnboardingChecklistItems`, a mesma fonte do tour do Início. */
export const OnboardingCardStack: React.FC<OnboardingCardStackProps> = ({ slug, planTier, subscriptionStatus, hasAccount, hoursDone }) => {
  const [client, setClient] = useState<ClientState | null>(null);

  const items = getOnboardingChecklistItems({ slug, planTier, subscriptionStatus, hasAccount, hoursDone });
  const signature = items.map((i) => `${i.id}:${i.done}`).join('|');

  useEffect(() => {
    let agendaVisited = false;
    let seen = false;
    try {
      agendaVisited = window.localStorage.getItem(agendaVisitedKey(slug)) === '1';
      seen = window.localStorage.getItem(doneSeenKey(slug)) === '1';
    } catch {
      // localStorage indisponível (modo privado, etc.) — cai no estado só do servidor.
    }
    const allDone = items.length > 0 && items.every((i) => i.done || (i.clientTracked && agendaVisited));
    if (allDone && !seen) {
      try {
        window.localStorage.setItem(doneSeenKey(slug), '1');
      } catch {
        // só não persiste entre sessões.
      }
    }
    setClient({ agendaVisited, celebrate: allDone && !seen });
    // `items` muda de referência a cada render; `signature` cobre o conteúdo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, signature]);

  if (!client || items.length === 0) return null;

  const resolved = items.map((i) => ({ ...i, done: i.done || Boolean(i.clientTracked && client.agendaVisited) }));
  const allDone = resolved.every((i) => i.done);
  if (allDone && !client.celebrate) return null;

  // +1: "Catálogo publicado" sempre conta como feito.
  const total = resolved.length + 1;
  const doneCount = resolved.filter((i) => i.done).length + 1;

  const rows = [{ id: 'catalogo', label: 'Catálogo publicado', href: '', done: true }, ...resolved];

  return (
    <div data-tour="onboarding-checklist" className="rounded-2xl bg-surface border border-linen p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-bold text-lg text-ink leading-snug">{allDone ? 'Tudo pronto! ✨' : 'Deixe seu studio pronto'}</p>
        <span className="text-sm text-ink-faint shrink-0">
          {doneCount} de {total}
        </span>
      </div>
      <div className="h-2 rounded-full bg-linen mt-3 mb-4 overflow-hidden">
        <div className="h-full rounded-full bg-rose-600 transition-all" style={{ width: `${(doneCount / total) * 100}%` }} />
      </div>
      <ul className="flex flex-col gap-1">
        {rows.map((row) => {
          const box = (
            <span
              className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center ${
                row.done ? 'bg-rose-600 text-white' : 'border-2 border-linen bg-surface'
              }`}
            >
              {row.done && <Check className="w-4 h-4" strokeWidth={3} />}
            </span>
          );
          if (row.done) {
            return (
              <li key={row.id} className="flex items-center gap-3 py-2.5">
                {box}
                <span className="text-base text-ink-faint line-through">{row.label}</span>
              </li>
            );
          }
          return (
            <li key={row.id}>
              <Link href={row.href} className="flex items-center gap-3 py-2.5">
                {box}
                <span className="flex-1 min-w-0 text-base font-semibold text-ink leading-snug">{row.label}</span>
                <span className="text-sm font-bold text-rose-600 shrink-0">Abrir</span>
              </Link>
            </li>
          );
        })}
      </ul>
      {allDone && <p className="text-sm text-ink-soft mt-2">Seu studio está configurado. Bom trabalho!</p>}
    </div>
  );
};
