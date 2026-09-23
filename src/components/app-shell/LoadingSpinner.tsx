import React from 'react';
import { Loader2 } from 'lucide-react';

/** Spinner centralizado pro corpo de uma tela enquanto os dados carregam —
 *  usado pelos `loading.tsx` de cada aba do app da profissional (Início/
 *  Agenda/Config). Sozinho não é o que resolve a demora sentida ao trocar
 *  de aba (bug real reportado, 2026-09-23 — "não sei se cliquei") — o que
 *  resolve é o PRÓPRIO `loading.tsx` existir (o Next troca a tela na hora
 *  por essa aqui, via Suspense, em vez de ficar com a tela antiga parada
 *  até os dados —chegarem do servidor). Esse componente só é o visual.
 *
 *  `min-h-[calc(100dvh-60px)]` (não `flex-1`) de propósito: reportado que
 *  o spinner ficava colado perto do topo em vez de no meio da tela — o
 *  pai (`.pro-app-shell` em layout.tsx) não é flex, então `flex-1` não
 *  tinha em relação a quê crescer, e a div só ocupava a própria altura de
 *  conteúdo. Com uma altura mínima própria (tela toda menos os 60px do
 *  cabeçalho, que é fixo em `PageTitleBarSkeleton`), a centralização não
 *  depende do pai ser flex ou não. */
export const LoadingSpinner: React.FC = () => (
  <div className="min-h-[calc(100dvh-60px)] flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-rose-600 animate-spin" aria-label="Carregando" />
  </div>
);
