import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Impede que o painel admin seja embutido em iframe de terceiros
        // (clickjacking) — o "login" do admin não tem proteção server-side
        // suficiente pra depender só disso, mas é uma camada a mais.
        source: '/admin/:path*',
        headers: [{ key: 'X-Frame-Options', value: 'DENY' }],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Service worker do PWA (`/app/[slug]`) — headers recomendados pelo
        // guia oficial de PWA do Next.js.
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
