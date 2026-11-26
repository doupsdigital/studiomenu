'use client';

import React, { useState } from 'react';
import type { SelfServeOfferMode } from '@/lib/cakto-checkout';
import { trackFunnel } from './funnel';

interface SelfServeEmailCaptureProps {
  offer: SelfServeOfferMode;
}

/** "Quer pensar com calma?" (2026-11-26) — último bloco da página, pra quem
 *  viu a prévia, o vídeo, o preço e as dúvidas e mesmo assim não comprou.
 *  Ela recebe UM e-mail, na hora, com o link do menu e os botões de ativar
 *  (`/api/preview/email`) — sem lembretes. Só e-mail, sem WhatsApp (decisão
 *  da dona: não voltar pro X1). */
export const SelfServeEmailCapture: React.FC<SelfServeEmailCaptureProps> = ({ offer }) => {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) {
      setError('Confira o e-mail, parece que tem algo errado.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/preview/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clean, offer }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.message || 'Não conseguimos enviar agora. Tente de novo em instantes.');
        trackFunnel('email_capture_error', { code: json?.code || res.status });
        return;
      }
      setSentTo(clean);
      trackFunnel('email_capture_submit');
    } catch {
      setError('Sem conexão. Confira sua internet e tente de novo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="lp-ss-email" id="guardar">
      <div className="lp-container">
        <div className="lp-ss-email-card" data-reveal>
          {sentTo ? (
            <div className="lp-ss-email-done" role="status">
              <span className="lp-ss-email-icon" aria-hidden="true">✓</span>
              <strong>Pronto! Enviamos para {sentTo}</strong>
              <p>Se não aparecer em alguns minutos, confira a caixa de spam ou promoções.</p>
              <button type="button" className="lp-ss-text-link" onClick={() => setSentTo(null)}>
                Enviar para outro e-mail
              </button>
            </div>
          ) : (
            <>
              <span className="lp-ss-email-icon" aria-hidden="true">✉️</span>
              <h3 className="lp-ss-email-title">Quer pensar com calma?</h3>
              <p className="lp-ss-email-sub">
                Te mandamos o link do seu menu por e-mail, para você ativar quando quiser.
              </p>
              <form className="lp-ss-email-form" onSubmit={submit} noValidate>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Seu melhor e-mail"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  aria-label="Seu e-mail"
                  aria-invalid={Boolean(error)}
                  disabled={busy}
                />
                <button type="submit" className="lp-btn lp-btn--primary lp-ss-btn-block" disabled={busy}>
                  {busy ? 'Enviando…' : 'Enviar meu link'}
                </button>
              </form>
              {error && (
                <p className="lp-ss-email-error" role="alert">
                  {error}
                </p>
              )}
              <p className="lp-ss-email-note">Só usamos seu e-mail para enviar o seu menu. Nada de spam.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
