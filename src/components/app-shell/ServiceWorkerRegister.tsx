'use client';

import { useEffect } from 'react';

/** Registra o service worker básico do PWA (`public/sw.js`) — sem UI própria.
 *  Montado dentro do layout de `/app/[slug]`, mas isso sozinho NÃO restringe
 *  o alcance do worker a essas páginas — o alcance é definido pelo caminho
 *  do SCRIPT (`/sw.js`, na raiz = alcance `/` por padrão, o site inteiro),
 *  não por qual componente chamou `.register()`. `scope: '/app/'` restringe
 *  de verdade — o editor do catálogo (`/c/[slug]`) nunca mais passa pelas
 *  mãos desse worker.
 *
 *  Incidente real em produção, 2026-10-22: a 1ª versão deste fix só trocava
 *  o `scope` do registro NOVO, sem aposentar o registro ANTIGO (alcance `/`,
 *  de antes deste fix) — esse continua instalado pra sempre em quem já
 *  visitou `/app/` alguma vez (ex: a própria profissional), controlando o
 *  site inteiro e recebendo qualquer atualização futura deste MESMO script
 *  (`/sw.js`), mesmo sem o navegador chamar `.register()` de novo pra esse
 *  alcance antigo. Combinado com uma troca no handler de `fetch` desse
 *  mesmo deploy (desfeita depois), isso derrubou o carregamento de páginas
 *  inteiras (não só o editor) pra quem tinha o worker antigo — por isso
 *  agora aposenta qualquer registro de alcance diferente de `/app/` antes
 *  de registrar o novo. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    (async () => {
      try {
        const existing = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          existing
            .filter((reg) => new URL(reg.scope).pathname !== '/app/')
            .map((reg) => reg.unregister())
        );

        await navigator.serviceWorker.register('/sw.js', { scope: '/app/' });
      } catch (err) {
        console.error('[SW] Falha ao registrar service worker:', err);
      }
    })();
  }, []);

  return null;
}
