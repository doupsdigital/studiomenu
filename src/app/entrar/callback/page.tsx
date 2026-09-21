'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Status = 'loading' | 'error';

function CallbackFallback() {
  return (
    <main className="min-h-screen bg-cream text-ink flex items-center justify-center p-6">
      <div className="max-w-sm w-full p-8 rounded-3xl bg-surface border border-linen shadow-sm text-center space-y-3">
        <Loader2 className="w-8 h-8 text-rose-600 animate-spin mx-auto" />
        <p className="text-[15px] text-ink-soft">Confirmando login com Google...</p>
      </div>
    </main>
  );
}

/** Ponto de volta único do Google OAuth — tanto pro login normal (`/entrar`)
 *  quanto pra vinculação feita de dentro de Config (`?claim=1&slug=X`).
 *  O supabase-js já consome os tokens da URL sozinho (`detectSessionInUrl`);
 *  aqui só resta ler a sessão resultante e trocar pelo cookie do app (login)
 *  ou gravar o vínculo (claim). `useSearchParams` exige um Suspense boundary
 *  (senão o build de produção falha), daí o wrapper abaixo. */
export default function EntrarCallbackPage() {
  return (
    <Suspense fallback={<CallbackFallback />}>
      <EntrarCallbackContent />
    </Suspense>
  );
}

function EntrarCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const claimSlug = searchParams.get('slug');
      const isClaim = searchParams.get('claim') === '1' && Boolean(claimSlug);

      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      if (cancelled) return;

      if (!session) {
        setStatus('error');
        setMessage('Não foi possível confirmar o login com Google. Tente novamente.');
        return;
      }

      if (isClaim && claimSlug) {
        const res = await fetch('/api/professional/claim-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: claimSlug, access_token: session.access_token }),
        });
        const json = await res.json();
        if (cancelled) return;

        if (!json.success) {
          setStatus('error');
          setMessage(json.message || 'Não foi possível vincular sua conta Google.');
          return;
        }

        router.replace(`/app/${claimSlug}/config?vinculado=google`);
        return;
      }

      const res = await fetch('/api/professional/session-from-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: session.access_token }),
      });
      const json = await res.json();
      if (cancelled) return;

      if (!json.success || !json.slug) {
        setStatus('error');
        setMessage(json.message || 'Essa conta Google ainda não está vinculada a nenhum catálogo.');
        return;
      }

      router.replace(`/app/${json.slug}/inicio`);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-cream text-ink flex items-center justify-center p-6">
      <div className="max-w-sm w-full p-8 rounded-3xl bg-surface border border-linen shadow-sm text-center space-y-3">
        {status === 'loading' ? (
          <>
            <Loader2 className="w-8 h-8 text-rose-600 animate-spin mx-auto" />
            <p className="text-[15px] text-ink-soft">Confirmando login com Google...</p>
          </>
        ) : (
          <>
            <XCircle className="w-8 h-8 text-rose-600 mx-auto" />
            <p className="text-[15px] text-ink-soft leading-relaxed">{message}</p>
            <a href="/entrar" className="inline-flex items-center gap-1 text-[13px] font-bold text-rose-600 mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Voltar pra tela de entrar
            </a>
          </>
        )}
      </div>
    </main>
  );
}
