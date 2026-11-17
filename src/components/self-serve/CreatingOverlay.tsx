'use client';

import React, { useEffect, useState } from 'react';

interface CreatingOverlayProps {
  open: boolean;
  /** Link provável (`fernandalima.studiomenu.art`) — trocado pelo real
   *  assim que a API responde. */
  displayUrl: string;
  /** true quando a API já respondeu e o menu já carregou — o último passo
   *  só fica "pronto" depois disso. */
  ready: boolean;
  /** Chamado uma vez, quando os 3 passos ficam ✓. */
  onDone: () => void;
}

const STEP_MS = 900;

/** Tela cheia "Criando seu menu…" da página `/lash` (2026-11-17): 3 linhas
 *  que vão ganhando ✓ em sequência. Dura no mínimo ~3s mesmo que a API
 *  responda antes (sensação de que algo foi feito sob medida), e o último
 *  passo espera o menu dela realmente carregar. */
export const CreatingOverlay: React.FC<CreatingOverlayProps> = ({ open, displayUrl, ready, onDone }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!open) {
      setStep(0);
      return;
    }
    const timers = [1, 2].map((n) => window.setTimeout(() => setStep((s) => Math.max(s, n)), n * STEP_MS));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [open]);

  useEffect(() => {
    if (open && ready && step >= 2) {
      const t = window.setTimeout(() => setStep(3), STEP_MS);
      return () => window.clearTimeout(t);
    }
  }, [open, ready, step]);

  useEffect(() => {
    if (open && step === 3) {
      const t = window.setTimeout(onDone, 450);
      return () => window.clearTimeout(t);
    }
  }, [open, step, onDone]);

  const steps = [`Reservando ${displayUrl}`, 'Montando seus serviços de lash', 'Aplicando o tema Rosé'];

  return (
    <div className={`lp-ss-creating${open ? ' is-open' : ''}`} role="status" aria-live="polite" aria-hidden={!open}>
      <div className="lp-ss-creating-card">
        <div className="lp-ss-creating-spinner" aria-hidden="true" />
        <p className="lp-ss-creating-title">Criando seu menu…</p>
        <ul className="lp-ss-creating-steps">
          {steps.map((label, i) => {
            const done = step > i;
            const active = step === i;
            return (
              <li key={i} className={`${done ? 'is-done' : ''}${active ? ' is-active' : ''}`}>
                <span className="lp-ss-creating-check" aria-hidden="true">
                  {done ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : null}
                </span>
                <span>{label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
