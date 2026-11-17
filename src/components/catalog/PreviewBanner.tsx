'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface PreviewBannerProps {
  expiresAt: string;
  /** Pra onde o "Ativar" leva — a oferta da página `/lash`. */
  activateUrl: string;
}

function formatRemaining(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`;
  return `${m}min`;
}

/** Faixa fixa no topo do catálogo enquanto ele é uma prévia gratuita do funil
 *  `/lash` (2026-11-17). Contagem real até `preview_expires_at` — quando
 *  zera, recarrega a página (que passa a mostrar "prévia expirada"). Não
 *  aparece quando o catálogo está embutido na própria página de vendas
 *  (`?embed=1`), onde a contagem fica do lado de fora do celular. */
export const PreviewBanner: React.FC<PreviewBannerProps> = ({ expiresAt, activateUrl }) => {
  const target = new Date(expiresAt).getTime();
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const left = target - Date.now();
      setRemaining(left);
      if (left <= 0) window.location.reload();
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [target]);

  return (
    <div className="fixed top-0 inset-x-0 z-[999990] flex justify-center px-3 pt-[max(env(safe-area-inset-top),8px)] pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 max-w-md w-full rounded-full bg-neutral-950/80 backdrop-blur-md border border-white/15 shadow-lg pl-3 pr-1 py-1 text-white">
        <Sparkles className="w-4 h-4 shrink-0 text-rose-300" aria-hidden="true" />
        <p className="flex-1 min-w-0 text-[12px] leading-tight">
          <strong className="font-semibold">Prévia do seu menu</strong>
          <span className="text-white/70">
            {remaining === null ? '' : ` · expira em ${formatRemaining(remaining)}`}
          </span>
        </p>
        <a
          href={activateUrl}
          target="_top"
          className="shrink-0 rounded-full bg-rose-500 hover:bg-rose-600 px-3.5 py-1.5 text-[12px] font-bold text-white transition-colors"
        >
          Ativar
        </a>
      </div>
    </div>
  );
};
