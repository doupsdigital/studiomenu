'use client';

import React from 'react';

type LandingVariant = 'lpb' | 'lpa';

interface SalesLandingPageProps {
  variant: LandingVariant;
}

const WHATSAPP_NUMBER = '5562991083435';

const PALETTES: Record<
  LandingVariant,
  {
    bg: string;
    bgAlt: string;
    card: string;
    text: string;
    textMuted: string;
    accent: string;
    accentSoft: string;
    accentText: string;
    serif: string;
    badgeLabel: string;
  }
> = {
  lpb: {
    bg: '#faf8f5',
    bgAlt: '#f4f0ea',
    card: '#ffffff',
    text: '#1a1220',
    textMuted: '#7a6b78',
    accent: '#c84b72',
    accentSoft: '#fbedf2',
    accentText: '#ffffff',
    serif: "'Cormorant Garamond', Georgia, serif",
    badgeLabel: 'Versão Principal · Glamour Rosé',
  },
  lpa: {
    bg: '#f6f0e8',
    bgAlt: '#ece3d7',
    card: '#ffffff',
    text: '#221b16',
    textMuted: '#5e5147',
    accent: '#9c6c44',
    accentSoft: 'rgba(156, 108, 68, 0.12)',
    accentText: '#ffffff',
    serif: "'Cormorant Garamond', Georgia, serif",
    badgeLabel: 'Versão Editorial · Nude & Champagne',
  },
};

const TESTIMONIALS = [
  { name: 'Mariana A.', quote: 'Parei de mandar PDF no Canva. Minhas clientes amaram o link na bio!' },
  { name: 'Camila R.', quote: 'Ninguém mais pede desconto. Valorizou muito o meu estúdio!' },
  { name: 'Juliana S.', quote: 'Entregaram tudo pronto no meu WhatsApp em menos de 24 horas!' },
  { name: 'Fernanda M.', quote: 'As clientes leem os cuidados pós e já agendam muito mais rápido.' },
  { name: 'Beatriz K.', quote: 'Melhor investimento do ano pro meu estúdio. Pagou-se no 1º dia!' },
];

function whatsappLink(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function SalesLandingPage({ variant }: SalesLandingPageProps) {
  const p = PALETTES[variant];

  return (
    <div style={{ background: p.bg, color: p.text, fontFamily: "'Jost', system-ui, sans-serif" }} className="min-h-screen">
      {/* Barra de Anúncio / Prova Social */}
      <div className="py-2.5 text-center text-[11px] font-semibold" style={{ background: p.bgAlt, color: p.textMuted }}>
        <span style={{ color: p.accent }}>★★★★★</span>{' '}
        <strong style={{ color: p.text }}>4.9/5</strong> · Mais de{' '}
        <strong style={{ color: p.text }}>350+ Estúdios de Beleza</strong> já usam
      </div>

      <main>
        {/* 1. HERO */}
        <section className="max-w-5xl mx-auto px-5 py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="mb-4">
              <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: p.serif }}>
                Studio<em className="italic" style={{ color: p.accent }}>Menu</em>
              </h1>
              <p className="text-xs mt-1" style={{ color: p.textMuted }}>Catálogo Digital para Estúdios de Beleza</p>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold leading-snug mb-4" style={{ fontFamily: p.serif }}>
              Diga adeus ao PDF do Canva e transforme sua tabela de preços em um{' '}
              <span style={{ color: p.accent }}>Catálogo Digital Interativo.</span>
            </h2>

            <p className="text-sm leading-relaxed mb-6" style={{ color: p.textMuted }}>
              Chega de enviar tabelas em PDF pesadas que ninguém abre no celular ou digitar mensagens longas de preços. Entregamos seu catálogo 100% pronto com seu nome, fotos e valores em até 24h.
            </p>

            <a
              href="#oferta"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm shadow-lg transition-transform hover:scale-105"
              style={{ background: p.accent, color: p.accentText }}
            >
              Ver Oferta & Modelos
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14m-7-7 7 7-7 7" />
              </svg>
            </a>

            <p className="text-[11px] mt-4" style={{ color: p.textMuted }}>
              👇 Teste a experiência real do catálogo rolando a tela do celular ao lado:
            </p>
          </div>

          {/* Mockup: catálogo real embutido */}
          <div className="flex justify-center">
            <div
              className="rounded-[2.5rem] p-2 shadow-2xl"
              style={{ background: p.text, width: 260, height: 560 }}
            >
              <div className="w-full h-full rounded-[2rem] overflow-hidden bg-white">
                <iframe
                  src="/c/showcase/lash"
                  title="Prévia ao vivo do catálogo StudioMenu"
                  className="w-full h-full border-0"
                  style={{ colorScheme: 'normal' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. MARQUEE DE PROVA SOCIAL */}
        <section className="py-8 overflow-hidden" style={{ background: p.bgAlt }}>
          <div className="flex w-max animate-marquee">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div
                key={i}
                className="mx-2.5 w-64 flex-shrink-0 rounded-2xl p-4 shadow-sm"
                style={{ background: p.card }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold">{t.name}</span>
                  <span className="text-[10px]" style={{ color: p.accent }}>★★★★★</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: p.textMuted }}>&quot;{t.quote}&quot;</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. ANTES x DEPOIS */}
        <section className="max-w-4xl mx-auto px-5 py-14">
          <div className="text-center mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: p.accent }}>
              Evolução do Seu Atendimento
            </p>
            <h2 className="text-2xl font-bold" style={{ fontFamily: p.serif }}>
              Por que você deve parar de mandar PDF no Canva?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl p-5 border" style={{ borderColor: '#e5d9d9', background: p.card }}>
              <h3 className="font-bold text-sm mb-3">Antes: PDF do Canva / Mensagens Soltas</h3>
              <ul className="space-y-2.5 text-xs" style={{ color: p.textMuted }}>
                <li>✕ PDF pesado que demora para carregar no 4G do celular</li>
                <li>✕ Letras pequenas que obrigam a cliente a ficar dando zoom</li>
                <li>✕ Mensagens longas e repetitivas de preços no WhatsApp</li>
                <li>✕ Visual amador que abre margem para pedidos de desconto</li>
              </ul>
            </div>

            <div className="rounded-2xl p-5 border-2" style={{ borderColor: p.accent, background: p.accentSoft }}>
              <h3 className="font-bold text-sm mb-3">Depois: Seu StudioMenu Profissional</h3>
              <ul className="space-y-2.5 text-xs" style={{ color: p.text }}>
                <li>✓ Abre instantaneamente igual um aplicativo de luxo</li>
                <li>✓ Fotos grandes dos seus procedimentos em alta definição</li>
                <li>✓ Cliente escolhe a técnica e agenda em 1 segundo no WhatsApp</li>
                <li>✓ Transmite autoridade imediata e valoriza o seu preço</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. OFERTA */}
        <section id="oferta" className="max-w-3xl mx-auto px-5 py-14">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: p.serif }}>
              Escolha o Plano Ideal para o Seu Estúdio
            </h2>
            <p className="text-xs" style={{ color: p.textMuted }}>Sem mensalidade · Pagamento único com acesso vitalício</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Essencial */}
            <div className="rounded-2xl p-6 border" style={{ borderColor: '#e5d9d9', background: p.card }}>
              <span
                className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold mb-3"
                style={{ background: p.bgAlt, color: p.textMuted }}
              >
                📱 VOCÊ PERSONALIZA
              </span>
              <h3 className="text-lg font-bold mb-1">Plano Essencial</h3>
              <p className="text-xs mb-4" style={{ color: p.textMuted }}>
                Para quem quer liberdade para cadastrar e alterar seus preços no seu tempo pelo celular.
              </p>
              <div className="mb-4">
                <div className="text-[10px] line-through" style={{ color: p.textMuted }}>De R$ 197,00 por:</div>
                <div className="text-3xl font-bold">R$ 149<span className="text-base font-normal">,00</span></div>
                <div className="text-[10px]" style={{ color: p.textMuted }}>à vista no PIX ou parcelado no cartão</div>
              </div>
              <ul className="space-y-2 text-xs mb-5" style={{ color: p.text }}>
                <li>✓ Link exclusivo para a bio do seu Instagram</li>
                <li>✓ Gerador de Catálogo simples no celular</li>
                <li>✓ Altere preços e fotos sempre que quiser</li>
                <li>✓ Pagamento único sem nenhuma mensalidade</li>
              </ul>
              <a
                href={whatsappLink('Olá! Quero garantir o StudioMenu no Plano Essencial (R$ 149) 📱')}
                target="_blank"
                rel="noopener noreferrer"
                id="cta-essencial"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold text-xs text-white"
                style={{ background: '#25d366' }}
              >
                PLANO ESSENCIAL (R$ 149)
              </a>
            </div>

            {/* VIP */}
            <div className="rounded-2xl p-6 border-2 relative" style={{ borderColor: p.accent, background: p.accentSoft }}>
              <span
                className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold mb-3"
                style={{ background: p.accent, color: p.accentText }}
              >
                ⭐ MAIS POPULAR · ZERO TRABALHO
              </span>
              <h3 className="text-lg font-bold mb-1">VIP Feito por Nós</h3>
              <p className="text-xs mb-4" style={{ color: p.textMuted }}>
                Nossa equipe faz 100% da formatação e entrega seu catálogo pronto em 24h. Você não precisa fazer nada!
              </p>
              <div className="mb-4">
                <div className="text-[10px] line-through" style={{ color: p.textMuted }}>De R$ 297,00 por:</div>
                <div className="text-3xl font-bold">R$ 189<span className="text-base font-normal">,00</span></div>
                <div className="text-[10px]" style={{ color: p.textMuted }}>à vista no PIX ou parcelado no cartão</div>
              </div>
              <ul className="space-y-2 text-xs mb-5" style={{ color: p.text }}>
                <li>✓ <strong>Tudo do Plano Essencial incluso</strong></li>
                <li>✓ <strong>Formatação 100% feita por nossa equipe</strong></li>
                <li>✓ <strong>Entrega expressa pronta em até 24h</strong></li>
                <li>✓ Acesso liberado para você editar quando quiser</li>
              </ul>
              <a
                href={whatsappLink('Olá! Quero garantir o StudioMenu no Plano VIP Feito por Vocês (R$ 189) 👑')}
                target="_blank"
                rel="noopener noreferrer"
                id="cta-custom"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold text-xs text-white shadow-lg"
                style={{ background: '#25d366' }}
              >
                PLANO VIP (R$ 189)
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center border-t" style={{ borderColor: p.bgAlt, background: p.bgAlt }}>
        <span className="font-bold text-sm" style={{ fontFamily: p.serif }}>
          Studio<em style={{ color: p.accent }}>Menu</em>
        </span>
        <p className="text-[11px] mt-1" style={{ color: p.textMuted }}>Catálogo Digital Interativo para Estúdios de Beleza</p>
        <p className="text-[10px] mt-1" style={{ color: p.textMuted }}>© 2026 · Todos os direitos reservados</p>
      </footer>

      {/* Botão Flutuante de WhatsApp */}
      <a
        href={whatsappLink('Olá! Vi o StudioMenu no site e gostaria de saber mais informações! 😊')}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-full font-bold text-xs text-white shadow-2xl z-50"
        style={{ background: '#25d366' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.771.815 2.791.815 3.179 0 5.767-2.587 5.768-5.766.001-3.18-2.586-5.767-5.768-5.767zm9.969 5.766c-.002 5.519-4.49 9.998-10 9.998-1.758 0-3.414-.467-4.869-1.282l-5.131 1.346 1.374-5.011c-.91-1.503-1.374-3.238-1.374-5.051 0-5.52 4.488-10 10-10 5.514 0 10 4.48 10 10z" />
        </svg>
        TIRAR DÚVIDAS NO WHATSAPP
      </a>

      <div className="h-16" />
    </div>
  );
}
