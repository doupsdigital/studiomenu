'use client';

import { useState, type CSSProperties } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

/** Quebra-objeção da assinatura (pedido real, 2026-10-15) — sempre a 1ª
 *  pergunta, em TODOS os nichos (não é nichada como `firstItem`), com
 *  destaque visual próprio (`lp-faq-item--highlight`). Retraída por padrão
 *  igual as outras (pedido real, 2026-10-19 — reverte a decisão anterior
 *  de abrir sozinha). Sem número no texto de propósito — ela não faz
 *  parte da sequência 1-6, é a exceção que chama atenção primeiro. */
const SUBSCRIPTION_FAQ_ITEM: FaqItem = {
  question: 'Por que é uma assinatura, e não um pagamento único?',
  answer: 'Diferente de um catálogo em PDF ou imagem, seu Menu Digital é um Site de verdade — precisa ficar hospedado, no ar, seguro e rápido 365 dias por ano. A assinatura garante exatamente isso: que ele nunca saia do ar, nunca fique lento e que suas clientes consigam acessar sempre através do seu link.',
};

const DEFAULT_FIRST_ITEM: FaqItem = {
  question: '1. Serve para o meu tipo de Studio / procedimento?',
  answer: 'Com certeza! O StudioMenu foi desenvolvido sob medida para Lash Designers, Nail Designers, Esteticistas, Micropigmentadoras, Cabeleireiras e Studios de Beleza em geral.',
};

/** Item #3 ("Tem fidelidade...") — texto varia conforme tem ou não o 2º
 *  plano Mensal pra comparar. O texto antigo (fixo) citava "plano
 *  Vitalício", que nem existe mais desde que o Anual tomou o lugar dele
 *  (2026-10-15) — bug real encontrado em produção, 2026-10-19, corrigido
 *  junto com a variante do teste de plano único. */
function buildFidelityItem(singlePlan: boolean): FaqItem {
  return {
    question: '3. Tem fidelidade ou contrato de permanência?',
    answer: singlePlan
      ? 'Nenhuma! Você não fica presa a nenhum contrato ou multa. Você paga uma vez e usa o Menu Digital o ano inteiro — sem mensalidade, sem fidelidade e sem multa de cancelamento.'
      : 'Nenhuma! Você não fica presa a nenhum contrato ou multa. No plano Mensal, você só continua se estiver usando e gostando — cancele quando quiser. Se escolher o Anual, você paga uma vez e usa o Menu Digital o ano inteiro, sem multa nem fidelidade.',
  };
}

const REST_OF_FAQ_ITEMS: FaqItem[] = [
  {
    question: '2. Consigo editar meu Menu Digital depois de pronto?',
    answer: 'Sim, é 100% editável! Pelo próprio celular você pode trocar fotos, atualizar preços, adicionar novos procedimentos, alterar o tema e cores a qualquer momento. É super rápido e simples.',
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
  /** Substitui a pergunta destacada (`SUBSCRIPTION_FAQ_ITEM` acima) — pedido
   *  real, 2026-10-19, pro teste de plano único anual: sem um 2º plano
   *  mensal pra comparar, não cabe mais falar em "assinatura" (ver
   *  `content.subscriptionFaqOverride` em `landing-niche-content.tsx`). */
  subscriptionItemOverride?: FaqItem;
  /** Teste de plano único anual (pedido real, 2026-10-19) — troca a
   *  resposta do item #3 (ver `buildFidelityItem` acima), que citava
   *  "plano mensal" e "plano Vitalício". */
  singlePlan?: boolean;
}

export function FaqSection({ firstItem, subscriptionItemOverride, singlePlan }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const FAQ_ITEMS: FaqItem[] = [
    subscriptionItemOverride ?? SUBSCRIPTION_FAQ_ITEM,
    firstItem ?? DEFAULT_FIRST_ITEM,
    REST_OF_FAQ_ITEMS[0],
    buildFidelityItem(Boolean(singlePlan)),
    ...REST_OF_FAQ_ITEMS.slice(1),
  ];

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="lp-faq-section" id="faq">
      <div className="lp-container">
        <div className="lp-section-header" data-reveal>
          <p className="lp-section-kicker">Tire Suas Dúvidas</p>
          <h2 className="lp-section-title">Perguntas Frequentes</h2>
        </div>

        <div className="lp-faq-list">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            const isHighlight = index === 0;
            return (
              <div
                key={index}
                className={`lp-faq-item ${isOpen ? 'is-open' : ''} ${isHighlight ? 'lp-faq-item--highlight' : ''}`}
                data-reveal
                style={{ '--reveal-delay': `${index * 0.08}s` } as CSSProperties}
              >
                {isHighlight && (
                  <div className="lp-faq-highlight-badge">
                    <span aria-hidden="true">💡</span> A dúvida mais comum
                  </div>
                )}
                <button
                  type="button"
                  className="lp-faq-question"
                  onClick={() => toggleItem(index)}
                  aria-expanded={isOpen}
                >
                  <span className="lp-faq-question-text">
                    {isHighlight && <span className="lp-faq-highlight-icon" aria-hidden="true">🌐</span>}
                    {item.question}
                  </span>
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
