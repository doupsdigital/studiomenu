'use client';

import React, { useState, type CSSProperties } from 'react';

const ITEMS = [
  {
    q: 'Como eu edito o meu menu?',
    a: 'Pelo próprio celular. Depois de ativar, você entra no seu app e toca em qualquer texto, foto ou preço para trocar. Um passo a passo guiado mostra onde tocar na primeira vez.',
  },
  {
    q: 'Como eu cancelo o plano mensal?',
    a: 'Quando quiser, sem multa e sem fidelidade. Você mesma cancela pelo seu app (ou no portal de assinaturas da Cakto, com o e-mail da compra), e seu menu continua no ar até o fim do mês que você já pagou.',
  },
  {
    q: 'E se eu não ativar a prévia?',
    a: 'Ela fica disponível por 24 horas e depois é apagada. Você pode criar outra quando quiser, de graça.',
  },
  {
    q: 'O link muda depois que eu ativo?',
    a: 'Não. O link que você viu na prévia (seunome.studiomenu.art) é o mesmo que você vai colocar na bio e mandar para as clientes.',
  },
  {
    q: 'Qual a diferença entre o anual e o mensal?',
    a: 'Os dois têm tudo. No anual você paga uma vez no Pix e sai mais barato por mês. No mensal você paga no cartão todo mês e pode cancelar quando quiser.',
  },
  {
    q: 'Minha cliente precisa baixar algum aplicativo?',
    a: 'Não. O menu abre direto no navegador do celular dela, pelo link, em menos de 1 segundo.',
  },
];

/** Dúvidas da página `/lash` (2026-11-17), focadas no autosserviço. Mesmas
 *  classes visuais do `FaqSection` da página `/`, conteúdo próprio. */
export const SelfServeFaq: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="lp-faq-section" id="faq">
      <div className="lp-faq-header-band">
        <div className="lp-container">
          <div className="lp-section-header" data-reveal>
            <p className="lp-section-kicker">Tire Suas Dúvidas</p>
            <h2 className="lp-section-title">Perguntas Frequentes</h2>
          </div>
        </div>
      </div>
      <div className="lp-container">
        <div className="lp-faq-list">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`lp-faq-item ${isOpen ? 'is-open' : ''}`}
                data-reveal
                style={{ '--reveal-delay': `${i * 0.06}s` } as CSSProperties}
              >
                <button type="button" className="lp-faq-question" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                  <span className="lp-faq-question-text">{item.q}</span>
                  <span className="lp-faq-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>
                <div className="lp-faq-answer">
                  <div className="lp-faq-answer-inner">
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
