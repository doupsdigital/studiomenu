'use client';

import { useEffect } from 'react';
import { agendaVisitedKey } from '@/lib/onboarding-cards';

/** Marca no aparelho que ela já abriu a Agenda de verdade — alimenta o item
 *  "Conhecer sua agenda" do checklist do Início (não há dado no banco pra isso). */
export const MarkAgendaVisited: React.FC<{ slug: string }> = ({ slug }) => {
  useEffect(() => {
    try {
      window.localStorage.setItem(agendaVisitedKey(slug), '1');
    } catch {
      // localStorage indisponível — o item só não fica marcado.
    }
  }, [slug]);
  return null;
};
