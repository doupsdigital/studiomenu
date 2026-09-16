'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { GoogleIcon } from './GoogleIcon';

/** Troca uma sessão do Supabase Auth (já estabelecida no client) pelo cookie
 *  de sessão do app (`sm_pro_session`) e redireciona pro Início do catálogo
 *  vinculado. Usado tanto pelo login por e-mail/senha quanto pelo retorno
 *  do Google em `/entrar/callback`. */
async function completeLogin(accessToken: string): Promise<{ success: boolean; message?: string; slug?: string }> {
  const res = await fetch('/api/professional/session-from-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: accessToken }),
  });
  return res.json();
}

export function ProfessionalLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<'password' | 'google' | null>(null);
  const [error, setError] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('password');
    setError('');

    try {
      const { data, error: authError } = await supabaseBrowser.auth.signInWithPassword({ email: email.trim(), password });
      if (authError || !data.session) {
        setError('E-mail ou senha incorretos.');
        return;
      }

      const result = await completeLogin(data.session.access_token);
      if (!result.success || !result.slug) {
        setError(result.message || 'Não foi possível entrar.');
        return;
      }

      router.push(`/app/${result.slug}/inicio`);
    } catch {
      setError('Falha na conexão. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading('google');
    setError('');
    try {
      const { error: authError } = await supabaseBrowser.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/entrar/callback` },
      });
      if (authError) {
        setError('Não foi possível iniciar o login com Google.');
        setLoading(null);
      }
      // Em caso de sucesso o navegador é redirecionado pro Google — não há
      // mais nada a fazer aqui.
    } catch {
      setError('Falha na conexão. Tente novamente.');
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-cream text-ink flex items-center justify-center p-6">
      <div className="max-w-sm w-full p-8 rounded-3xl bg-surface border border-linen shadow-sm space-y-5">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="font-serif-pro font-bold text-2xl text-ink">Entrar</h1>
          <p className="text-xs text-ink-soft mt-1">Acesse o painel do seu catálogo StudioMenu</p>
        </div>

        <form onSubmit={handlePasswordLogin} className="flex flex-col gap-3">
          <div className="relative">
            <Mail className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              autoFocus
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 rounded-xl bg-cream border border-linen pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint"
            />
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 rounded-xl bg-cream border border-linen pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint"
            />
          </div>

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={loading !== null}
            className="h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold disabled:opacity-50 transition-colors"
          >
            {loading === 'password' ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px bg-linen flex-1" />
          <span className="text-[11px] text-ink-faint">ou</span>
          <div className="h-px bg-linen flex-1" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading !== null}
          className="w-full h-11 rounded-xl bg-cream border border-linen text-ink text-sm font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {loading === 'google' ? (
            'Redirecionando...'
          ) : (
            <>
              <GoogleIcon className="w-4 h-4" />
              Entrar com Google
            </>
          )}
        </button>

        <p className="text-[11px] text-ink-faint text-center leading-relaxed">
          Ainda não tem login? Peça o link mágico de acesso pra quem te enviou o catálogo e ative o login em
          Configurações.
        </p>
      </div>
    </main>
  );
}
