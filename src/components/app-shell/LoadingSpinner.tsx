import React from 'react';
import { Loader2 } from 'lucide-react';

/** Spinner centralizado pro corpo de uma tela enquanto os dados carregam —
 *  usado pelos `loading.tsx` de cada aba do app da profissional (Início/
 *  Agenda/Config). Sozinho não é o que resolve a demora sentida ao trocar
 *  de aba (bug real reportado, 2026-09-23 — "não sei se cliquei") — o que
 *  resolve é o PRÓPRIO `loading.tsx` existir (o Next troca a tela na hora
 *  por essa aqui, via Suspense, em vez de ficar com a tela antiga parada
 *  até os dados —chegarem do servidor). Esse componente só é o visual. */
export const LoadingSpinner: React.FC = () => (
  <div className="flex-1 flex items-center justify-center py-24">
    <Loader2 className="w-8 h-8 text-rose-600 animate-spin" aria-label="Carregando" />
  </div>
);
