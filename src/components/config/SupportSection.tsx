'use client';

import React from 'react';

/** Número de suporte da própria StudioMenu (fixo, não é por catálogo —
 *  diferente do WhatsApp da profissional, que é dela pras clientes dela). */
const SUPPORT_WHATSAPP = '5562991083435';

/** Seção "Suporte e dúvidas" da Config — leva direto pro WhatsApp da
 *  StudioMenu com uma mensagem pronta. De propósito só aqui dentro do
 *  acordeão (colapsado por padrão, mesmo padrão das outras seções), não um
 *  botão fixo/flutuante — pedido explícito da usuária pra não poluir o
 *  dia a dia do app com algo verde sempre visível. */
export const SupportSection: React.FC = () => {
  const text = encodeURIComponent('Olá! Estou com uma dúvida sobre o StudioMenu.');
  const whatsappUrl = `https://wa.me/${SUPPORT_WHATSAPP}?text=${text}`;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink-soft leading-relaxed">
        Alguma dúvida sobre como usar o app, ou precisa de ajuda com alguma coisa? Fala direto com a gente pelo WhatsApp.
      </p>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[15px] font-bold transition-colors"
      >
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.43 0-2.82-.37-4.05-1.08l-.29-.17-3.12.82.83-3.04-.19-.3a8.132 8.132 0 0 1-1.25-4.46c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.58c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.22-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.1-.22-.16-.47-.28z" />
        </svg>
        Falar no WhatsApp
      </a>
    </div>
  );
};
