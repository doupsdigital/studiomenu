'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export function AdminLoginForm() {
  const router = useRouter();
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password: passwordInput }),
      });
      const result = await res.json();

      if (!result.success) {
        setAuthError('Senha incorreta. Tente novamente.');
        setPasswordInput('');
        setIsSubmitting(false);
        return;
      }

      router.refresh();
    } catch (err) {
      console.error('Erro ao autenticar:', err);
      setAuthError('Erro ao autenticar. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <form
        onSubmit={handleLogin}
        className="max-w-sm w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
            Studio<span className="text-rose-400 font-normal italic">Menu</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Digite a senha para acessar o Painel</p>
        </div>

        <input
          type="password"
          autoFocus
          value={passwordInput}
          onChange={(e) => {
            setPasswordInput(e.target.value);
            setAuthError('');
          }}
          placeholder="••••"
          disabled={isSubmitting}
          className="w-full text-center tracking-[0.5em] bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-rose-500 focus:outline-none"
        />

        {authError && <p className="text-rose-400 text-xs font-medium">{authError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:opacity-95 font-bold text-xs tracking-wider uppercase text-white shadow-lg transition-all disabled:opacity-60"
        >
          {isSubmitting ? 'Verificando...' : 'Acessar Painel'}
        </button>
      </form>
    </main>
  );
}
