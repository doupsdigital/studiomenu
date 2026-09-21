'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, KeyRound, LogOut } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { GoogleIcon } from '@/components/auth/GoogleIcon';

interface AccountSectionProps {
  slug: string;
  /** Presente quando a profissional já vinculou um login (Supabase Auth) —
   *  a partir daí ela pode entrar direto por `/entrar`, sem link mágico. */
  hasAccount: boolean;
}

/** Vincula uma conta do Supabase Auth (recém criada/logada no client) ao
 *  catálogo atual, via a mesma rota que o callback do Google usa. */
async function claimAccount(slug: string, accessToken: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch('/api/professional/claim-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, access_token: accessToken }),
  });
  return res.json();
}

export const AccountSection: React.FC<AccountSectionProps> = ({ slug, hasAccount }) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<'password' | 'google' | null>(null);
  const [error, setError] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [done, setDone] = useState(hasAccount);
  const [justLinkedGoogle, setJustLinkedGoogle] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/professional/logout', { method: 'POST' });
      await supabaseBrowser.auth.signOut().catch(() => {});
    } finally {
      router.push('/entrar');
      router.refresh();
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('vinculado') === 'google') {
      setJustLinkedGoogle(true);
      setDone(true);
      params.delete('vinculado');
      const query = params.toString();
      window.history.replaceState(null, '', window.location.pathname + (query ? `?${query}` : ''));
    }
  }, []);

  const finishClaim = async (accessToken: string) => {
    const result = await claimAccount(slug, accessToken);
    if (!result.success) {
      setError(result.message || 'Não foi possível vincular sua conta.');
      return;
    }
    setDone(true);
    setNeedsConfirmation(false);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('password');
    setError('');

    try {
      const { data, error: authError } = await supabaseBrowser.auth.signUp({ email: email.trim(), password });
      if (authError) {
        setError(
          authError.message.includes('already registered')
            ? 'Já existe uma conta com esse e-mail. Se for sua, use "Já tenho conta" abaixo.'
            : 'Não foi possível criar a conta. Confira o e-mail e a senha (mínimo 6 caracteres).'
        );
        return;
      }

      if (data.session) {
        await finishClaim(data.session.access_token);
      } else {
        // Confirmação de e-mail ligada no projeto — a conta existe, mas só
        // tem sessão depois que a profissional confirmar pelo e-mail.
        setNeedsConfirmation(true);
      }
    } catch {
      setError('Falha na conexão. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  const handleAlreadyConfirmed = async () => {
    setLoading('password');
    setError('');
    try {
      const { data, error: authError } = await supabaseBrowser.auth.signInWithPassword({ email: email.trim(), password });
      if (authError || !data.session) {
        setError('Ainda não deu pra confirmar — confira seu e-mail e tente de novo.');
        return;
      }
      await finishClaim(data.session.access_token);
    } catch {
      setError('Falha na conexão. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleLink = async () => {
    setLoading('google');
    setError('');
    try {
      const redirectTo = `${window.location.origin}/entrar/callback?claim=1&slug=${slug}`;
      const { error: authError } = await supabaseBrowser.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (authError) {
        setError('Não foi possível iniciar o vínculo com Google.');
        setLoading(null);
      }
    } catch {
      setError('Falha na conexão. Tente novamente.');
      setLoading(null);
    }
  };

  const logoutButton = (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className="w-full h-11 mt-4 rounded-xl border border-linen text-ink-soft text-[15px] font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
    >
      <LogOut className="w-4 h-4" />
      {loggingOut ? 'Saindo...' : 'Sair desse dispositivo'}
    </button>
  );

  if (done) {
    return (
      <div>
        <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/60 border border-rose-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-600/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="font-serif-pro font-bold text-lg text-rose-800 leading-tight">Acesso configurado</p>
              <p className="text-sm text-rose-800/70 mt-0.5">
                {justLinkedGoogle && 'Conta Google vinculada com sucesso. '}
                Você não depende mais do link de acesso — entre quando quiser em studiomenu.art/entrar, com seu e-mail e senha (ou Google).
              </p>
            </div>
          </div>
        </div>
        {logoutButton}
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-cream border border-rose-200 p-5">
        <div className="text-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <p className="font-serif-pro font-bold text-lg text-ink">Crie um acesso com senha</p>
          <p className="text-[15px] text-ink-soft mt-0.5">Pra entrar direto, sem precisar do link mágico toda vez.</p>
        </div>

        {needsConfirmation ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-ink-soft text-center leading-relaxed">
              Enviamos um e-mail de confirmação pra <strong>{email}</strong>. Depois de confirmar, toque no botão
              abaixo.
            </p>
            {error && <p className="text-sm text-rose-600 text-center">{error}</p>}
            <button
              type="button"
              onClick={handleAlreadyConfirmed}
              disabled={loading !== null}
              className="h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-bold disabled:opacity-50 transition-colors"
            >
              {loading === 'password' ? 'Verificando...' : 'Já confirmei'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreateAccount} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl bg-surface border border-linen px-3 text-base text-ink placeholder:text-ink-faint"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Crie uma senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl bg-surface border border-linen px-3 text-base text-ink placeholder:text-ink-faint"
            />
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={loading !== null}
              className="h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-bold disabled:opacity-50 transition-colors"
            >
              {loading === 'password' ? 'Criando...' : 'Criar acesso'}
            </button>
          </form>
        )}

        <div className="flex items-center gap-3 my-4">
          <div className="h-px bg-rose-200 flex-1" />
          <span className="text-[13px] text-ink-faint">ou</span>
          <div className="h-px bg-rose-200 flex-1" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLink}
          disabled={loading !== null}
          className="w-full h-11 rounded-xl bg-surface border border-linen text-ink text-[15px] font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {loading === 'google' ? (
            'Redirecionando...'
          ) : (
            <>
              <GoogleIcon className="w-4 h-4" />
              Vincular com Google
            </>
          )}
        </button>
      </div>
      {logoutButton}
    </div>
  );
};
