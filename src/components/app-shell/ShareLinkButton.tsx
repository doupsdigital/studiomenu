'use client';

import React, { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface ShareLinkButtonProps {
  /** Caminho relativo (ex: `/c/slug`) — o domínio é resolvido no client via
   *  `window.location.origin`, mesmo padrão do `CopyLinkRow`. */
  path: string;
}

/** Botão pill "Copiar Link Público" do cartão "Compartilhe sua Agenda" do
 *  Início — mesma lógica de cópia do `CopyLinkRow`, só com o visual de
 *  botão em destaque (branco/rose) em vez do card neutro. */
export const ShareLinkButton: React.FC<ShareLinkButtonProps> = ({ path }) => {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(path);

  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
  }, [path]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard indisponível — ação secundária, não bloqueia o resto da tela.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-sm font-bold shadow-sm transition-colors"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? 'Link copiado!' : 'Copiar Link Público'}
    </button>
  );
};
