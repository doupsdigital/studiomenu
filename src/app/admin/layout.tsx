'use client';

import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';

const ADMIN_PASSWORD = '5669';
const ADMIN_AUTH_STORAGE_KEY = 'studiomenu_admin_auth';

function AdminLoginGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, 'true');
      setAuthError('');
      onAuthenticated();
    } else {
      setAuthError('Senha incorreta. Tente novamente.');
      setPasswordInput('');
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
          className="w-full text-center tracking-[0.5em] bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-rose-500 focus:outline-none"
        />

        {authError && <p className="text-rose-400 text-xs font-medium">{authError}</p>}

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:opacity-95 font-bold text-xs tracking-wider uppercase text-white shadow-lg transition-all"
        >
          Acessar Painel
        </button>
      </form>
    </main>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    if (saved === 'true') setIsAuthenticated(true);
    setAuthChecked(true);
  }, []);

  if (!authChecked) {
    return <main className="min-h-screen bg-slate-950" />;
  }

  if (!isAuthenticated) {
    return <AdminLoginGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return <>{children}</>;
}
