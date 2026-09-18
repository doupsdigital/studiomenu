'use client';

import { useEffect, useState } from 'react';
import { Joyride, STATUS, type Step, type EventData } from 'react-joyride';

interface ProductTourProps {
  /** Identifica o tour pra guardar "já viu" separado por tela (inicio/agenda/config). */
  tourId: string;
  slug: string;
  steps: Step[];
  /** Quando false, não roda (ex: Agenda sem agendamento automático ligado —
   *  nada relevante pra apontar ainda). */
  enabled: boolean;
}

const storageKey = (tourId: string, slug: string) => `sm_tour_seen_${tourId}_${slug}`;

/** Tour guiado (balões apontando elementos da tela, um por vez) — reaproveitável
 *  pelas 3 telas do app (Início/Agenda/Config, Fase 20). Dispara sozinho na
 *  primeira visita (nada gravado em `localStorage` pra esse tour+slug ainda) e
 *  nunca mais, seja completado ou pulado — mesmo padrão de persistência dos
 *  cards de onboarding dispensáveis (Fase 19), só que por tela em vez de por
 *  card. */
export const ProductTour: React.FC<ProductTourProps> = ({ tourId, slug, steps, enabled }) => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!enabled || steps.length === 0) return;
    try {
      const seen = window.localStorage.getItem(storageKey(tourId, slug));
      if (!seen) setRun(true);
    } catch {
      setRun(true);
    }
  }, [enabled, tourId, slug, steps.length]);

  const handleEvent = (data: EventData) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      setRun(false);
      try {
        window.localStorage.setItem(storageKey(tourId, slug), '1');
      } catch {
        // localStorage indisponível (modo privado, etc.) — só não persiste entre sessões.
      }
    }
  };

  if (!enabled || steps.length === 0) return null;

  return (
    <Joyride
      run={run}
      steps={steps}
      continuous
      onEvent={handleEvent}
      locale={{ back: 'Voltar', close: 'Fechar', last: 'Concluir', next: 'Próximo', skip: 'Pular' }}
      options={{
        primaryColor: '#e11d48',
        textColor: '#1c1917',
        backgroundColor: '#ffffff',
        arrowColor: '#ffffff',
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10000,
        showProgress: true,
        buttons: ['back', 'skip', 'primary'],
      }}
    />
  );
};
