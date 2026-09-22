import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StudioMenu',
    short_name: 'StudioMenu',
    description: 'App da profissional pra gerenciar catálogo e agendamentos.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    // Cor média das bordas do ícone (icon-512.png) — é essa cor que aparece
    // atrás do ícone na splash screen que o Android monta sozinho, não a cor
    // de fundo do app em si (ver app/[slug]/manifest.webmanifest/route.ts).
    background_color: '#F8E7E7',
    theme_color: '#a93259',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
