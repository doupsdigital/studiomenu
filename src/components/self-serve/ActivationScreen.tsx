'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ConfettiBurst } from '@/components/app-shell/ConfettiBurst';
import { clearPreview, firstName, trackFunnel } from './funnel';

type Phase = 'checking' | 'active' | 'slow' | 'no_session';

const POLL_INTERVAL_MS = 2500;
/** Cartão aprova na hora; Pix normalmente em segundos. Passou disso, mostra
 *  a tela de "ainda confirmando" (com botão pra verificar de novo) em vez
 *  de deixar ela olhando um carregando infinito. */
const POLL_LIMIT_MS = 2 * 60 * 1000;
const REDIRECT_DELAY_MS = 2600;
const SUPPORT_WHATSAPP = '5562991083435';

const CHECKING_MESSAGES = [
  'Confirmando seu pagamento…',
  'Ativando o seu menu…',
  'Se foi no Pix, pode levar alguns segundinhos…',
];

function supportLink(text: string) {
  return `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(text)}`;
}

/** Tela `/ativando` (2026-11-18). Pergunta pro servidor a cada 2,5s se o
 *  pagamento já foi confirmado; quando sim, o servidor grava a sessão do app
 *  e ela é levada pra dentro com confete. Sem a prévia neste navegador
 *  (pagou em outro aparelho), explica que o acesso chega pelo e-mail. */
export const ActivationScreen: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('checking');
  const [name, setName] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const startedAtRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const poll = useCallback(async () => {
    let status = 'pending';
    try {
      const res = await fetch('/api/preview/activation-status', { cache: 'no-store' });
      const data = await res.json();
      status = data.status;
      if (data.name) setName(data.name);
      if (status === 'active' && data.redirectTo) {
        setRedirectTo(data.redirectTo);
        setPhase('active');
        clearPreview();
        trackFunnel('activation_success');
        return;
      }
    } catch {
      // Falha de rede pontual: só tenta de novo no próximo ciclo.
    }

    if (status === 'no_session' || status === 'not_found') {
      setPhase('no_session');
      trackFunnel('activation_no_session', { status });
      return;
    }
    if (Date.now() - startedAtRef.current > POLL_LIMIT_MS) {
      setPhase('slow');
      trackFunnel('activation_slow');
      return;
    }
    timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
  }, []);

  useEffect(() => {
    poll();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [poll]);

  useEffect(() => {
    if (phase !== 'checking') return;
    const id = setInterval(() => setMessageIndex((i) => Math.min(i + 1, CHECKING_MESSAGES.length - 1)), 4000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'active' || !redirectTo) return;
    const id = setTimeout(() => window.location.replace(redirectTo), REDIRECT_DELAY_MS);
    return () => clearTimeout(id);
  }, [phase, redirectTo]);

  function retry() {
    startedAtRef.current = Date.now();
    setMessageIndex(0);
    setPhase('checking');
    poll();
  }

  const greeting = name ? `, ${firstName(name)}` : '';

  return (
    <main className="min-h-[100dvh] flex items-center justify-center p-5 bg-cream text-ink">
      {phase === 'active' && <ConfettiBurst />}

      <div className="w-full max-w-sm p-7 rounded-3xl bg-surface border border-linen shadow-sm text-center">
        {phase === 'checking' && (
          <>
            <div className="mx-auto mb-5 w-14 h-14 rounded-full border-4 border-rose-100 border-t-rose-600 animate-spin" aria-hidden="true" />
            <h1 className="font-serif text-2xl font-bold mb-2">Quase lá{greeting}!</h1>
            <p className="text-[15px] text-ink-soft leading-relaxed" aria-live="polite">
              {CHECKING_MESSAGES[messageIndex]}
            </p>
            <p className="mt-5 text-[12px] text-ink-faint">Não feche esta tela.</p>
          </>
        )}

        {phase === 'active' && (
          <>
            <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center text-2xl" aria-hidden="true">
              ✓
            </div>
            <h1 className="font-serif text-2xl font-bold mb-2">Seu menu está no ar{greeting}! 🎉</h1>
            <p className="text-[15px] text-ink-soft leading-relaxed">Entrando no seu app…</p>
            {redirectTo && (
              <a
                href={redirectTo}
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-rose-600 px-5 py-3.5 text-[15px] font-bold text-white"
              >
                Entrar agora
              </a>
            )}
          </>
        )}

        {phase === 'slow' && (
          <>
            <div className="mx-auto mb-4 text-4xl" aria-hidden="true">⏳</div>
            <h1 className="font-serif text-2xl font-bold mb-2">Seu pagamento ainda está sendo confirmado</h1>
            <p className="text-[15px] text-ink-soft leading-relaxed">
              Às vezes o banco demora um pouquinho. Assim que confirmar, o link de acesso ao seu app chega no e-mail
              que você usou na compra.
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-6 w-full rounded-2xl bg-rose-600 px-5 py-3.5 text-[15px] font-bold text-white"
            >
              Verificar de novo
            </button>
            <a
              href={supportLink('Oi! Acabei de pagar o StudioMenu e meu menu ainda não ativou')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-[13px] font-semibold text-rose-600 underline underline-offset-2"
            >
              Precisa de ajuda? Fale com a gente
            </a>
          </>
        )}

        {phase === 'no_session' && (
          <>
            <div className="mx-auto mb-4 text-4xl" aria-hidden="true">💌</div>
            <h1 className="font-serif text-2xl font-bold mb-2">Obrigada pela compra!</h1>
            <p className="text-[15px] text-ink-soft leading-relaxed">
              Assim que o pagamento for confirmado, o link de acesso ao seu app chega no e-mail que você usou na compra.
              Confira também a caixa de spam.
            </p>
            <a
              href={supportLink('Oi! Acabei de pagar o StudioMenu e queria ajuda pra acessar meu menu')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border-2 border-rose-600 px-5 py-3 text-[15px] font-bold text-rose-600"
            >
              Falar com a gente no WhatsApp
            </a>
          </>
        )}
      </div>
    </main>
  );
};
