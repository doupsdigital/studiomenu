'use client';

import { useEffect } from 'react';

/** Registra o service worker básico do PWA (`public/sw.js`) — sem UI própria.
 *  Só é montado dentro do layout de `/app/[slug]`, então a "instalabilidade"
 *  do PWA fica restrita a essas páginas (o navegador exige um worker ativo
 *  controlando a página pra oferecer "Adicionar à tela inicial"). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('[SW] Falha ao registrar service worker:', err);
      });
    }
  }, []);

  return null;
}
