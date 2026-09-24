import type { Metadata, Viewport } from "next";
import "./globals.css";
import { InstallPromptProvider } from "@/components/app-shell/InstallPromptProvider";

// Splash screen do iOS (`Add to Home Screen`) — diferente do Android, que
// gera a splash sozinho a partir do manifest (`background_color` + ícone),
// o Safari não lê o manifest pra isso: exige uma tag
// `apple-touch-startup-image` por combinação exata de resolução física +
// device-pixel-ratio do aparelho, cada uma apontando pra um PNG estático
// (bug real reportado no iPhone, 2026-09-23 — sem isso o iOS mostra tela
// branca até carregar). PNGs gerados em `public/splash/` (fundo
// `#F8E7E7`, mesmo `background_color` do manifest, com o ícone
// centralizado) — cobre as gerações de iPhone de uso comum em 2026 (a
// partir do SE 2ª geração/6s; aparelhos mais antigos ficam sem splash mas
// continuam funcionando normalmente, só sem o visual). Só retrato — o app
// não foi desenhado pra paisagem.
//
// Pegadinha real (reproduzida num iPhone 11 em Modo Escuro, 2026-09-23): o
// Safari ignora qualquer `apple-touch-startup-image` cujo media query não
// declare `prefers-color-scheme` explicitamente quando o aparelho está no
// Modo Escuro — mesmo a imagem batendo em tamanho, ele cai no preto padrão
// dele em vez de usá-la. Por isso cada tamanho abaixo gera DUAS tags (claro
// e escuro) apontando pra mesma imagem — o app não tem tema escuro próprio,
// então a splash é sempre a mesma independente do Modo Escuro do sistema.
const APPLE_SPLASH_DEVICES = [
  { cssW: 375, cssH: 667, dpr: 2, file: '750x1334' }, // iPhone SE 2/3ª, 6/6s/7/8
  { cssW: 414, cssH: 896, dpr: 2, file: '828x1792' }, // iPhone 11, XR
  { cssW: 375, cssH: 812, dpr: 3, file: '1125x2436' }, // X/XS/11 Pro, 12/13 mini
  { cssW: 390, cssH: 844, dpr: 3, file: '1170x2532' }, // 12/12 Pro/13/13 Pro/14
  { cssW: 393, cssH: 852, dpr: 3, file: '1179x2556' }, // 14 Pro/15/15 Pro/16
  { cssW: 414, cssH: 896, dpr: 3, file: '1242x2688' }, // 11 Pro Max, XS Max
  { cssW: 402, cssH: 874, dpr: 3, file: '1206x2622' }, // 16 Pro
  { cssW: 428, cssH: 926, dpr: 3, file: '1284x2778' }, // 12/13 Pro Max, 14 Plus
  { cssW: 430, cssH: 932, dpr: 3, file: '1290x2796' }, // 14 Pro Max/15 Pro Max/15+/16+
  { cssW: 440, cssH: 956, dpr: 3, file: '1320x2868' }, // 16 Pro Max
];

export const metadata: Metadata = {
  title: "StudioMenu — Catálogos Digitais de Alta Conversão",
  description: "Plataforma de catálogos digitais e interativos para Lash Designers, Nail Designers, Clínicas de Estética e Studios de Beleza.",
  appleWebApp: {
    capable: true,
    title: 'StudioMenu',
    statusBarStyle: 'default',
    startupImage: APPLE_SPLASH_DEVICES.flatMap((d) => {
      const base = `(device-width: ${d.cssW}px) and (device-height: ${d.cssH}px) and (-webkit-device-pixel-ratio: ${d.dpr}) and (orientation: portrait)`;
      const url = `/splash/apple-splash-${d.file}.png`;
      return [
        { url, media: `${base} and (prefers-color-scheme: light)` },
        { url, media: `${base} and (prefers-color-scheme: dark)` },
      ];
    }),
  },
  // O Next 16 só gera a tag nova `mobile-web-app-capable` — a Safari
  // reconhece essa há bem menos tempo que a antiga, específica da Apple
  // (`apple-mobile-web-app-capable`), que existe desde que "Adicionar à
  // Tela de Início" existe. Sem ela, a Safari pode não tratar o app como
  // "capaz" de tela cheia/splash em versões de iOS mais antigas — mantendo
  // as duas cobre tanto o padrão novo quanto o comportamento histórico.
  other: {
    'apple-mobile-web-app-capable': 'yes',
  },
};

// Substitui a tag <meta name="viewport"> que estava escrita à mão no `<head>`
// abaixo — tínhamos as DUAS ao mesmo tempo (a nossa + a que o Next gera
// sozinho por padrão quando não existe esse export), o que é um bug real:
// com duas tags de viewport, qual delas cada navegador usa não é garantido
// pela spec, e a Safari é conhecida por ser sensível a isso justamente no
// algoritmo que casa a splash screen com o aparelho (investigando o bug de
// splash preta no iPhone 11, 2026-09-23). Esse export é o jeito correto do
// Next App Router declarar viewport — gera uma única tag, sem duplicidade.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400;1,9..144,500&family=Italiana&family=Jost:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-rose-200 selection:text-rose-900">
        <InstallPromptProvider>{children}</InstallPromptProvider>
      </body>
    </html>
  );
}

