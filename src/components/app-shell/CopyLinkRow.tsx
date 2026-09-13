'use client';

import React, { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyLinkRowProps {
  label: string;
  /** Caminho relativo (ex: `/c/slug`) — o domínio é resolvido no client via
   *  `window.location.origin` (mesmo padrão já usado em `admin/catalogos`),
   *  já que este componente roda dentro de uma página server-rendered. */
  path: string;
}

export const CopyLinkRow: React.FC<CopyLinkRowProps> = ({ label, path }) => {
  const [copied, setCopied] = useState(false);
  // Começa com o caminho relativo (igual ao SSR) e só resolve o domínio real
  // depois de montar no client, pra não dar mismatch de hidratação.
  const [displayUrl, setDisplayUrl] = useState(path);

  useEffect(() => {
    setDisplayUrl(`${window.location.origin}${path}`);
  }, [path]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard indisponível (ex. contexto não seguro) — sem fallback, ação
      // secundária que não bloqueia o uso do resto da tela.
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
      <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5">{label}</p>
      <div className="flex items-center gap-2">
        <p className="flex-1 min-w-0 truncate text-xs text-slate-300 font-mono">{displayUrl}</p>
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 transition-colors ${
            copied ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25'
          }`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  );
};
