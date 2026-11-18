'use client';

import { useEffect, useState } from 'react';
import { capture } from '@/lib/analytics';
import { CAKTO_CHECKOUT_URLS } from '@/lib/cakto-checkout';

/** Utilitários do funil de autosserviço `/lash` (2026-11-17). */

export type CaktoPlanKey = 'mensal' | 'anual';

export interface FunnelPreview {
  name: string;
  slug: string;
  previewCode: string;
  expiresAt: string;
  displayUrl: string;
  publicUrl: string;
}

const STORAGE_KEY = 'sm_lash_preview_v1';

/** Lembra a prévia neste aparelho (pra ela voltar à página dentro das 24h e
 *  encontrar o menu dela). Tudo em try/catch: aba anônima/bloqueio de dados
 *  não pode quebrar a página. */
export function savePreview(preview: FunnelPreview) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preview));
  } catch {
    // sem armazenamento — segue sem lembrar
  }
}

export function loadPreview(): FunnelPreview | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as FunnelPreview;
    if (!p?.slug || !p.previewCode || new Date(p.expiresAt).getTime() <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

export function clearPreview() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignora
  }
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

/** Mesmo recorte do servidor (`resolveProfessionalSlug`: 2 primeiras
 *  palavras, sem acento) — só pra animação mostrar o link provável antes da
 *  resposta chegar; o link de verdade vem da API. */
export function guessSlug(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) =>
      w
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]/g, '')
    )
    .join('');
}

const PASSTHROUGH_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];

/** Link do checkout da Cakto com `sck=<código da prévia>` (o webhook usa
 *  pra saber de qual prévia é a compra) + UTMs/fbclid da visita, pra
 *  atribuição do anúncio continuar funcionando do lado da Cakto. */
export function buildCheckoutUrl(plan: CaktoPlanKey, previewCode: string | null): string {
  const url = new URL(CAKTO_CHECKOUT_URLS[plan]);
  if (previewCode) url.searchParams.set('sck', previewCode);
  if (typeof window !== 'undefined') {
    const current = new URLSearchParams(window.location.search);
    for (const key of PASSTHROUGH_PARAMS) {
      const value = current.get(key);
      if (value) url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

type Fbq = (action: 'track' | 'trackCustom', event: string, params?: Record<string, unknown>) => void;

/** Evento do Pixel da Meta (o script é carregado por `MetaPixelTracker`). */
export function trackPixel(event: string, params?: Record<string, unknown>) {
  try {
    const fbq = (window as unknown as { fbq?: Fbq }).fbq;
    fbq?.('track', event, params);
  } catch {
    // pixel bloqueado (adblock) — não interfere na página
  }
}

export function trackFunnel(event: string, properties?: Record<string, unknown>) {
  capture(event, { funnel: 'lash_self_serve', ...properties });
}

/** Tempo restante até `expiresAt`, atualizado a cada `intervalMs`. */
export function useRemaining(expiresAt: string | null | undefined, intervalMs = 1000): number | null {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    if (!expiresAt) {
      setRemaining(null);
      return;
    }
    const target = new Date(expiresAt).getTime();
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [expiresAt, intervalMs]);
  return remaining;
}

export function formatClock(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function formatHoursMinutes(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}min`;
  return `${h}h${m > 0 ? ` ${String(m).padStart(2, '0')}min` : ''}`;
}
