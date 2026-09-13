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

self.addEventListener('fetch', () => {
  // Passthrough — sem estratégia de cache por enquanto.
});
