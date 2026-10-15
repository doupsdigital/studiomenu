interface Step {
  title: string;
  description: string;
}

/** Processo de aquisição do Menu Digital —
 *  simples, rápido e sem burocracia para qualquer nicho. */
const STEPS: Step[] = [
  {
    title: 'Escolha seu plano',
    description: 'Escolha o plano ideal abaixo e fale com a gente no WhatsApp — te atendemos de forma personalizada.',
  },
  {
    title: 'Envie seu Instagram',
    description: 'Você nos passa o @ do seu Studio e nós preparamos o seu Menu Digital com a identidade da sua marca.',
  },
  {
    title: 'Teste sem compromisso',
    description: 'Enviamos o link da prévia exclusiva no seu celular. Veja como fica lindo antes de qualquer decisão.',
  },
  {
    title: 'Seu Menu no ar!',
    description: 'Gostou do resultado? Seu link definitivo fica pronto para você colocar na Bio do Instagram e no WhatsApp.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="lp-steps-section">
      <div className="lp-container">
        <div className="lp-section-header">
          <p className="lp-section-kicker">Processo Simples e Sem Burocracia</p>
          <h2 className="lp-section-title">Como funciona para ter o seu Menu Digital</h2>
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
