'use client';

import { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: '1. Serve para o meu tipo de Studio / procedimento?',
    answer: 'Com certeza! O StudioMenu foi feito sob medida para Lash Designers, Nail Designers, Esteticistas, Micropigmentadoras, Cabeleireiras e Studios de Beleza em geral.',
  },
  {
    question: '2. Consigo editar meu catálogo depois de pronto?',
    answer: 'Sim, é 100% editável! Pelo próprio celular você pode trocar a foto da capa, atualizar preços, adicionar novos procedimentos, alterar o tema e cores a qualquer momento. É super rápido e simples.',
  },
  {
    question: '3. Tem fidelidade ou contrato de permanência?',
    answer: 'Nenhuma! Você não fica presa a nenhum contrato ou multa. No plano mensal você só continua se estiver usando e gostando. Se escolher o plano Vitalício, você paga uma única vez e o catálogo é seu, livre de mensalidades.',
  },
  {
    question: '4. Vocês cobram para montar o meu catálogo inicial?',
    answer: 'Não! Nós preparamos a estrutura inicial do seu catálogo com serviços de exemplo. Você recebe o catálogo pronto para visualizar e pode personalizar com suas fotos, preços e dados no seu próprio ritmo.',
  },
  {
    question: '5. Como funciona o link do meu catálogo?',
    answer: 'O seu catálogo ganha um link exclusivo com o seu nome (ex: seunome.studiomenu.art). Ele abre instantaneamente em qualquer celular, como um site profissional, perfeito para colocar na Bio do Instagram e enviar no WhatsApp.',
  },
  {
    question: '6. Minha cliente precisa baixar algum aplicativo para ver o catálogo?',
    answer: 'Não! O catálogo abre direto no navegador do celular da sua cliente (no Safari ou Chrome) em menos de 1 segundo, sem precisar baixar nada nem criar conta.',
  },
];

/** Cópia de segurança de `FaqSection.tsx` — ver `SalesLandingPageClassica.tsx`. */
export function FaqSectionClassica() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Primeiro item aberto por padrão

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="lpc-faq-section" id="faq">
      <div className="lpc-container">
        <div className="lpc-section-header">
          <p className="lpc-section-kicker">Tire Suas Dúvidas</p>
          <h2 className="lpc-section-title">Perguntas Frequentes</h2>
        </div>

        <div className="lpc-faq-list">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`lpc-faq-item ${isOpen ? 'is-open' : ''}`}
              >
                <button
                  type="button"
                  className="lpc-faq-question"
                  onClick={() => toggleItem(index)}
                  aria-expanded={isOpen}
                >
                  <span className="lpc-faq-question-text">{item.question}</span>
                  <span className="lpc-faq-icon">
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
                <div className="lpc-faq-answer">
                  <div className="lpc-faq-answer-inner">
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
