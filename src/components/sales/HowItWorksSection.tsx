interface Step {
  title: string;
  description: string;
}

/** Processo de aquisição, igual pra qualquer nicho (não entra em
 *  `landing-niche-content.tsx` de propósito) — reduz a fricção de "como
 *  funciona pra ter o meu catálogo" antes da seção de planos, pedido real
 *  2026-10-14. */
const STEPS: Step[] = [
  {
    title: 'Escolha seu plano',
    description: 'Escolha o plano ideal abaixo e fale com a gente no WhatsApp — te atendemos com todo cuidado.',
  },
  {
    title: 'Envie seu Instagram',
    description: 'Pedimos o @ do Instagram do seu Studio pra criar um Catálogo com a sua cara.',
  },
  {
    title: 'Teste sem compromisso',
    description: 'Mandamos o link da prévia, sem pagar nada. Edite à vontade e veja como vai ficar.',
  },
  {
    title: 'O catálogo é seu!',
    description: 'Gostou? Finalize o pagamento na plataforma e o catálogo é definitivamente seu.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="lp-steps-section">
      <div className="lp-container">
        <div className="lp-section-header">
          <p className="lp-section-kicker">Processo Simples e Sem Compromisso</p>
          <h2 className="lp-section-title">Como funciona pra ter o seu catálogo</h2>
        </div>

        <ol className="lp-steps-list">
          {STEPS.map((step, i) => (
            <li key={i} className="lp-step-item">
              <div className="lp-step-marker">
                <span className="lp-step-number">{i + 1}</span>
                {i < STEPS.length - 1 && <span className="lp-step-connector" aria-hidden="true" />}
              </div>
              <div className="lp-step-content">
                <h3 className="lp-step-title">{step.title}</h3>
                <p className="lp-step-desc">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
