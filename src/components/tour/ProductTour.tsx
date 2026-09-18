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
  /** `id` de um step (ver `Step.id`) pra começar o tour a partir dele em vez
   *  do primeiro — usado quando ela chega na tela por um link específico
   *  (ex: card "Criar acesso" leva pra `#conta`; sem isso, o tour começava
   *  do zero e "puxava" a tela de volta pro primeiro card, brigando com o
   *  scroll que o link já tinha feito). Ignorado se não bater com nenhum
   *  step. */
  initialStepId?: string;
}

const storageKey = (tourId: string, slug: string) => `sm_tour_seen_${tourId}_${slug}`;

/** Tour guiado (balões apontando elementos da tela, um por vez) — reaproveitável
 *  pelas telas do app (primeiro contato/Início/Agenda/Config, Fase 20).
 *  Dispara sozinho na primeira visita e nunca mais, seja completado ou
 *  pulado — mesmo padrão de persistência dos cards de onboarding
 *  dispensáveis (Fase 19), só que por tela em vez de por card.
 *
 *  Visual e comportamento calibrados a partir de teste real no celular
 *  (feedback: o "beacon" padrão do Joyride — uma bolinha que precisa de um
 *  toque extra antes do balão abrir — atrapalhava mais que ajudava, e o
 *  visual genérico destoava do resto do app): `skipBeacon` pula direto pro
 *  balão, cores/fontes batem com a paleta real do app
 *  (`tailwind.config.js`: rose-600 `#b04e6c`, `ink` `#2C1810`, fontes
 *  Fraunces/Jost de `globals.css`, não as `font-serif`/`font-sans` padrão
 *  do Tailwind que não estão carregadas aqui). */
export const ProductTour: React.FC<ProductTourProps> = ({ tourId, slug, steps, enabled, initialStepId }) => {
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

  const initialStepIndex = initialStepId ? Math.max(0, steps.findIndex((s) => s.id === initialStepId)) : undefined;

  return (
    <Joyride
      run={run}
      steps={steps}
      initialStepIndex={initialStepIndex}
      continuous
      onEvent={handleEvent}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Concluir',
        next: 'Próximo',
        nextWithProgress: 'Próximo ({current} de {total})',
        skip: 'Pular',
      }}
      options={{
        primaryColor: '#b04e6c',
        textColor: '#2C1810',
        backgroundColor: '#ffffff',
        arrowColor: '#ffffff',
        overlayColor: 'rgba(44, 24, 16, 0.55)',
        zIndex: 10000,
        showProgress: true,
        buttons: ['back', 'skip', 'primary'],
        skipBeacon: true,
        spotlightRadius: 16,
        spotlightPadding: 6,
      }}
      styles={{
        tooltip: {
          borderRadius: 20,
          padding: '20px 20px 12px',
          boxShadow: '0 12px 32px rgba(44, 24, 16, 0.18)',
        },
        tooltipTitle: {
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 700,
          fontSize: 19,
          color: '#2C1810',
          marginBottom: 6,
          textAlign: 'left',
        },
        tooltipContent: {
          fontFamily: "'Jost', system-ui, -apple-system, sans-serif",
          fontSize: 14,
          lineHeight: 1.5,
          color: '#6B5D53',
          padding: '0 0 8px',
          textAlign: 'left',
        },
        tooltipFooter: {
          marginTop: 8,
        },
        buttonPrimary: {
          fontFamily: "'Jost', system-ui, -apple-system, sans-serif",
          backgroundColor: '#b04e6c',
          color: '#ffffff',
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 14,
          padding: '10px 18px',
        },
        buttonBack: {
          fontFamily: "'Jost', system-ui, -apple-system, sans-serif",
          color: '#6B5D53',
          fontWeight: 700,
          fontSize: 13,
        },
        buttonSkip: {
          fontFamily: "'Jost', system-ui, -apple-system, sans-serif",
          color: '#A8998C',
          fontWeight: 600,
          fontSize: 13,
        },
      }}
    />
  );
};
