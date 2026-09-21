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
      background_color: '#F3F5F8',
      theme_color: '#a93259',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    { headers: { 'Content-Type': 'application/manifest+json' } }
  );
}
