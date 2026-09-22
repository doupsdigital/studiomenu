import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/** Manifest do PWA escopado pro catálogo — o manifest.ts na raiz do app
 *  (Next.js só suporta um por projeto via convenção de arquivo, não um por
 *  segmento de rota) tem `start_url: '/'`, então instalar o PWA a partir de
 *  qualquer tela de `/app/[slug]/**` abria a landing page de vendas depois
 *  de instalado, não o app da profissional. Esse manifest dinâmico corrige
 *  isso só pra essa árvore de rotas — linkado via `generateMetadata` em
 *  `layout.tsx`, que sobrescreve o manifest herdado da raiz só aqui. */
export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;

  return NextResponse.json(
    {
      name: 'StudioMenu',
      short_name: 'StudioMenu',
      description: 'App da profissional pra gerenciar catálogo e agendamentos.',
      start_url: `/app/${slug}`,
      scope: `/app/${slug}/`,
      display: 'standalone',
      // Cor média das bordas do ícone (icon-512.png) — não o cinza-claro do
      // app em si. É essa cor que aparece atrás do ícone na splash screen
      // que o Android monta sozinho ao abrir o app instalado; com o cinza
      // do app, dava pra ver a borda do ícone como um quadrado flutuando
      // (achado testando de verdade, Fase 21).
      background_color: '#F8E7E7',
      theme_color: '#a93259',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        // Silhueta branca sobre fundo transparente: no app instalado (WebAPK) o
        // Android usa esse ícone como o ícone pequeno das notificações — o
        // `badge` do service worker só vale pro navegador, não pro app
        // instalado (sem isso aparecia um quadrado genérico).
        { src: '/badge-96.png', sizes: '96x96', type: 'image/png', purpose: 'monochrome' },
      ],
    },
    { headers: { 'Content-Type': 'application/manifest+json' } }
  );
}
