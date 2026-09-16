'use client';

import React, { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface ShareLinkButtonProps {
  slug: string;
}

const PRODUCTION_DOMAIN = 'studiomenu.art';

/** Botão pill "Copiar Link Público" do cartão "Compartilhe sua Agenda" do
 *  Início. No domínio oficial, compartilha o link no formato de subdomínio
 *  por profissional (`slug.studiomenu.art`, `src/proxy.ts`) — mais curto e
 *  pessoal que `studiomenu.art/c/slug`. Em `localhost`/`*.vercel.app`
 *  (onde esse roteamento por subdomínio é propositalmente ignorado, ver
 *  `proxy.ts`), continua usando o caminho `/c/slug` de sempre. */
export const ShareLinkButton: React.FC<ShareLinkButtonProps> = ({ slug }) => {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(`/c/${slug}`);

  useEffect(() => {
    const { hostname, origin } = window.location;
    const usesSubdomainRouting = hostname !== 'localhost' && !hostname.endsWith('.vercel.app');
    setUrl(usesSubdomainRouting ? `https://${slug}.${PRODUCTION_DOMAIN}` : `${origin}/c/${slug}`);
  }, [slug]);

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
