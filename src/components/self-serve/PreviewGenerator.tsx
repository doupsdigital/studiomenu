'use client';

import React, { forwardRef } from 'react';
import { firstName, formatHoursMinutes, useRemaining, type FunnelPreview } from './funnel';

interface PreviewGeneratorProps {
  preview: FunnelPreview | null;
  name: string;
  onNameChange: (value: string) => void;
  onSubmit: () => void;
  busy: boolean;
  error: string | null;
  onOpenPreview: () => void;
  onActivate: () => void;
  onStartOver: () => void;
}

const SparkleIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2zm7 11l.95 2.55L22.5 16.5l-2.55.95L19 20l-.95-2.55L15.5 16.5l2.55-.95L19 13z" />
  </svg>
);

/** Bloco "Veja o SEU menu pronto" da página `/lash` (2026-11-17). Dois
 *  estados: formulário (só o nome) e, depois de gerada, o card da prévia
 *  dela com o link e os 2 próximos passos. `ref` vai no input, pra outros
 *  CTAs da página poderem focar o campo. */
export const PreviewGenerator = forwardRef<HTMLInputElement, PreviewGeneratorProps>(function PreviewGenerator(
  { preview, name, onNameChange, onSubmit, busy, error, onOpenPreview, onActivate, onStartOver },
  inputRef
) {
  const remaining = useRemaining(preview?.expiresAt, 30_000);

  if (preview) {
    return (
      <div className="lp-ss-gen-card lp-ss-gen-card--dark lp-ss-gen-card--ready">
        <p className="lp-ss-gen-kicker">✨ Seu menu está pronto</p>
        <h2 className="lp-ss-gen-title">
          Ficou lindo, <em>{firstName(preview.name)}</em>!
        </h2>
        <div className="lp-ss-link-pill" aria-label="Seu link">
          <span className="lp-ss-link-dot" aria-hidden="true" />
          {preview.displayUrl}
        </div>
        {remaining !== null && remaining > 0 && (
          <p className="lp-ss-gen-timer">
            Prévia guardada por mais <strong>{formatHoursMinutes(remaining)}</strong>
          </p>
        )}
        <div className="lp-ss-gen-actions">
          <button type="button" className="lp-btn lp-btn--primary lp-ss-btn-block lp-tier-cta-pulse" onClick={onActivate}>
            Ativar meu menu
          </button>
          <button type="button" className="lp-ss-btn-ghost" onClick={onOpenPreview}>
            Ver meu menu de novo
          </button>
        </div>
        <button type="button" className="lp-ss-text-link" onClick={onStartOver}>
          Criar com outro nome
        </button>
      </div>
    );
  }

  return (
    <form
      className="lp-ss-gen-card lp-ss-gen-card--dark"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      <p className="lp-ss-gen-kicker">Grátis · Leva 10 segundos</p>
      <h2 className="lp-ss-gen-title">
        Veja o <em>seu</em> menu pronto agora
      </h2>
      <p className="lp-ss-gen-sub">É só digitar seu nome. A gente monta o resto e você vê na hora como fica.</p>

      <label className="lp-ss-field" htmlFor="lp-ss-name">
        <span className="lp-ss-field-label">Seu nome profissional</span>
        <input
          ref={inputRef}
          id="lp-ss-name"
          type="text"
          inputMode="text"
          autoComplete="name"
          autoCapitalize="words"
          enterKeyHint="go"
          maxLength={60}
          placeholder="Ex.: Fernanda Lima"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'lp-ss-name-error' : 'lp-ss-name-help'}
          disabled={busy}
        />
      </label>
      {error ? (
        <p id="lp-ss-name-error" className="lp-ss-field-error" role="alert">
          {error}
        </p>
      ) : (
        <p id="lp-ss-name-help" className="lp-ss-field-help">
          É assim que vai aparecer no seu menu. Dá pra mudar depois.
        </p>
      )}

      <button type="submit" className="lp-btn lp-btn--primary lp-ss-btn-block" disabled={busy}>
        {SparkleIcon}
        {busy ? 'Criando seu menu…' : 'Criar meu menu grátis'}
      </button>

      <ul className="lp-ss-trust" aria-label="Sem compromisso">
        <li>Sem cadastro</li>
        <li>Sem cartão</li>
        <li>Prévia por 24h</li>
      </ul>
    </form>
  );
});
