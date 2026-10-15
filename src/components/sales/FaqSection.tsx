'use client';

import { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

const DEFAULT_FIRST_ITEM: FaqItem = {
  question: '1. Serve para o meu tipo de Studio / procedimento?',
  answer: 'Com certeza! O StudioMenu foi desenvolvido sob medida para Lash Designers, Nail Designers, Esteticistas, Micropigmentadoras, Cabeleireiras e Studios de Beleza em geral.',
};

const REST_OF_FAQ_ITEMS: FaqItem[] = [
  {
    question: '2. Consigo editar meu Menu Digital depois de pronto?',
    answer: 'Sim, é 100% editável! Pelo próprio celular você pode trocar fotos, atualizar preços, adicionar novos procedimentos, alterar o tema e cores a qualquer momento. É super rápido e simples.',
  },
  {
    question: '3. Tem fidelidade ou contrato de permanência?',
    answer: 'Nenhuma! Você não fica presa a nenhum contrato ou multa. No plano mensal você só continua se estiver usando e gostando. Se escolher o plano Vitalício, você paga uma única vez e o Menu Digital é seu para sempre, livre de mensalidades.',
  },
  {
    question: '4. Vocês cobram para montar o meu Menu Digital inicial?',
    answer: 'Não! Nós preparamos a estrutura inicial do seu Menu Digital com procedimentos do seu nicho. Você recebe o link pronto para visualizar e pode personalizar fotos, preços e dados com facilidade.',
  },
  {
    question: '5. Como funciona o link do meu Menu Digital?',
    answer: 'O seu studio ganha um link exclusivo com o seu nome (ex: seunome.studiomenu.art). Ele abre instantaneamente em qualquer celular como um site moderno, perfeito para colocar na Bio do Instagram e enviar no WhatsApp.',
  },
  {
    question: '6. Minha cliente precisa baixar algum aplicativo para ver o Menu Digital?',
    answer: 'Não! O Menu Digital abre direto no navegador do celular da sua cliente (Safari, Chrome ou direto no Instagram) em menos de 1 segundo, sem precisar baixar nada nem criar conta.',
  },
];

interface FaqSectionProps {
  /** Substitui a 1ª pergunta por uma versão nichada — ver `src/data/landing-niche-content.tsx`. */
  firstItem?: FaqItem;
}

export function FaqSection({ firstItem }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const FAQ_ITEMS: FaqItem[] = [firstItem ?? DEFAULT_FIRST_ITEM, ...REST_OF_FAQ_ITEMS];

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="lp-faq-section" id="faq">
      <div className="lp-container">
        <div className="lp-section-header">
          <p className="lp-section-kicker">Tire Suas Dúvidas</p>
          <h2 className="lp-section-title">Perguntas Frequentes</h2>
        </div>

        <div className="lp-faq-list">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`lp-faq-item ${isOpen ? 'is-open' : ''}`}
              >
                <button
                  type="button"
                  className="lp-faq-question"
                  onClick={() => toggleItem(index)}
                  aria-expanded={isOpen}
                >
                  <span className="lp-faq-question-text">{item.question}</span>
                  <span className="lp-faq-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>
                <div className="lp-faq-answer">
                  <div className="lp-faq-answer-inner">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
