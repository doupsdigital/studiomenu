// Service worker básico do StudioMenu — só o necessário pra tornar o app de
// /app/[slug] instalável (Chrome exige um worker ativo controlando a página).
// Sem cache offline nesta versão: o guia oficial do Next 16 não cobre cache
// offline nativo, só menciona a lib de terceiros Serwist pra isso — fora do
// escopo de "PWA básico" desta fase.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Bug real, 2026-10-22: isso aqui tinha um handler de 'fetch' que não
// chamava `event.respondWith(...)` nenhuma — o "passthrough implícito"
// (deixar sem responder) é tecnicamente válido pela spec, mas é frágil na
// prática: junto com o dev server recarregando o worker toda hora, isso
// derrubava o POST de `/api/catalog/save` com "falha de rede" (sem log
// nenhum no servidor, porque a requisição nem chegava lá). Responde de
// verdade, sem nenhuma estratégia de cache — passthrough explícito.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});

// Push notifications (docs/PLANO_PRODUCAO_V1.md, Fase 18) — recebe o payload
// JSON enviado por src/lib/push-notifications.ts e mostra a notificação do
// sistema; ao clicar, foca uma aba já aberta na URL certa ou abre uma nova.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }

  const title = data.title || 'StudioMenu';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/badge-96.png', // silhueta branca com fundo transparente (o Android pinta o ícone da barra de status só com o alfa; um PNG opaco vira quadrado)
    data: { url: data.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
