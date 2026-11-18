'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, Copy, LayoutGrid, MessageCircle, Share2, KeyRound, Instagram } from 'lucide-react';
import { AccountSection } from '@/components/config/AccountSection';
import { ConfettiBurst } from './ConfettiBurst';
import { formatPhoneBR } from '@/lib/format';
import { PRODUCTION_DOMAIN, usesSubdomainRouting } from '@/lib/public-url';
import {
  SELF_SERVE_STEP_ORDER,
  SELF_SERVE_STEP_VIDEOS,
  getSelfServeStepsDone,
  toYoutubeEmbed,
  type OnboardingSteps,
  type SelfServeStepId,
} from '@/lib/self-serve-onboarding';

interface SelfServeChecklistProps {
  slug: string;
  name: string;
  whatsapp: string;
  hasAccount: boolean;
  initialSteps: OnboardingSteps;
}

const STEP_META: Record<SelfServeStepId, { title: string; icon: React.ElementType }> = {
  whatsapp: { title: 'Confirme seu WhatsApp', icon: MessageCircle },
  menu: { title: 'Coloque seus serviços e preços', icon: LayoutGrid },
  acesso: { title: 'Crie seu acesso com senha', icon: KeyRound },
  compartilhar: { title: 'Divulgue seu menu', icon: Share2 },
};

/** Número salvo vem com 55 na frente; no campo ela vê só DDD + número. */
function toLocalDigits(value: string): string {
  const digits = (value || '').replace(/\D/g, '');
  return digits.startsWith('55') && digits.length >= 12 ? digits.slice(2) : digits;
}

async function postOnboarding(payload: Record<string, unknown>) {
  const res = await fetch('/api/professional/onboarding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await res.json()) as { success: boolean; message?: string; steps?: OnboardingSteps };
}

const StepVideo: React.FC<{ url: string }> = ({ url }) => {
  if (!url) return null;
  const embed = toYoutubeEmbed(url);
  return (
    <div className="rounded-xl overflow-hidden bg-ink/5 aspect-[9/16] max-h-[420px] mx-auto w-full max-w-[240px] mb-4">
      {embed ? (
        <iframe src={embed} title="Vídeo explicativo" className="w-full h-full" allow="encrypted-media; picture-in-picture" allowFullScreen />
      ) : (
        <video src={url} controls playsInline preload="metadata" className="w-full h-full object-cover" />
      )}
    </div>
  );
};

/** Checklist "Primeiros passos" (funil `/lash`, 2026-11-18). Um passo aberto
 *  por vez (o primeiro pendente); os feitos ficam riscados e podem ser
 *  reabertos. Cada passo tem espaço pra um vídeo curto
 *  (`SELF_SERVE_STEP_VIDEOS`), que só aparece quando houver link. */
export const SelfServeChecklist: React.FC<SelfServeChecklistProps> = ({ slug, name, whatsapp, hasAccount: initialHasAccount, initialSteps }) => {
  const [steps, setSteps] = useState<OnboardingSteps>(initialSteps);
  const [hasAccount, setHasAccount] = useState(initialHasAccount);
  const done = getSelfServeStepsDone(steps, hasAccount);
  const firstPending = SELF_SERVE_STEP_ORDER.find((id) => !done[id]) ?? null;
  const [open, setOpen] = useState<SelfServeStepId | null>(firstPending);
  const doneCount = SELF_SERVE_STEP_ORDER.filter((id) => done[id]).length;
  const total = SELF_SERVE_STEP_ORDER.length;
  const allDone = doneCount === total;
  const [celebrate, setCelebrate] = useState(false);

  // WhatsApp
  const [phone, setPhone] = useState(formatPhoneBR(toLocalDigits(whatsapp)));
  const [phoneError, setPhoneError] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);

  // Compartilhar
  const [publicUrl, setPublicUrl] = useState(`/c/${slug}`);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const { hostname, origin } = window.location;
    setPublicUrl(usesSubdomainRouting(hostname) ? `https://${slug}.${PRODUCTION_DOMAIN}` : `${origin}/c/${slug}`);
  }, [slug]);
  const displayUrl = useMemo(() => `${slug}.${PRODUCTION_DOMAIN}`, [slug]);

  /** Marca o passo e abre o próximo pendente. */
  function advance(nextSteps: OnboardingSteps, nextHasAccount = hasAccount) {
    const nextDone = getSelfServeStepsDone(nextSteps, nextHasAccount);
    const next = SELF_SERVE_STEP_ORDER.find((id) => !nextDone[id]) ?? null;
    setOpen(next);
    if (!next) setCelebrate(true);
  }

  async function mark(step: SelfServeStepId) {
    if (steps[step]) return;
    const optimistic = { ...steps, [step]: new Date().toISOString() };
    setSteps(optimistic);
    advance(optimistic);
    try {
      const res = await postOnboarding({ slug, action: 'mark', step });
      if (res.success && res.steps) setSteps(res.steps);
    } catch {
      // Marcação é só progresso visual; se falhar, volta a aparecer na próxima visita.
    }
  }

  async function saveWhatsapp(e: React.FormEvent) {
    e.preventDefault();
    setPhoneError('');
    setSavingPhone(true);
    try {
      const res = await postOnboarding({ slug, action: 'whatsapp', whatsapp: phone });
      if (!res.success || !res.steps) {
        setPhoneError(res.message || 'Não deu pra salvar agora. Tente de novo.');
        return;
      }
      setSteps(res.steps);
      advance(res.steps);
    } catch {
      setPhoneError('Falha na conexão. Tente de novo.');
    } finally {
      setSavingPhone(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard indisponível: o link continua visível pra ela copiar na mão.
    }
    mark('compartilhar');
  }

  const shareText = `Oi! Agora você pode ver todos os meus serviços e valores por aqui: ${publicUrl}`;
  const firstName = name.split(' ')[0];

  function renderBody(id: SelfServeStepId) {
    switch (id) {
      case 'whatsapp':
        return (
          <form onSubmit={saveWhatsapp} className="flex flex-col gap-3">
            <p className="text-[15px] text-ink-soft leading-relaxed">
              Quando uma cliente escolher um serviço no seu menu, ela vai chamar <strong className="text-ink">neste número</strong>. Confira se está certo.
            </p>
            <StepVideo url={SELF_SERVE_STEP_VIDEOS.whatsapp} />
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhoneBR(e.target.value))}
              placeholder="(62) 99999-9999"
              aria-label="Seu WhatsApp com DDD"
              className="h-12 rounded-xl border border-linen bg-cream px-4 text-[17px] font-semibold text-ink tracking-wide focus:outline-none focus:border-rose-400"
            />
            {phoneError && <p className="text-sm text-rose-600">{phoneError}</p>}
            <button
              type="submit"
              disabled={savingPhone}
              className="h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-bold disabled:opacity-50 transition-colors"
            >
              {savingPhone ? 'Salvando…' : done.whatsapp ? 'Salvar número' : 'Está certo, confirmar'}
            </button>
          </form>
        );
      case 'menu':
        return (
          <div className="flex flex-col gap-3">
            <p className="text-[15px] text-ink-soft leading-relaxed">
              Seu menu veio com serviços de exemplo. Troque a <strong className="text-ink">foto de capa</strong>, os{' '}
              <strong className="text-ink">serviços</strong> e os <strong className="text-ink">preços</strong> pelos seus. Um passo a passo mostra onde tocar.
            </p>
            <p className="text-[13px] text-ink-soft bg-cream rounded-xl px-3 py-2.5">
              💾 No final, toque em <strong className="text-ink">Salvar</strong> pra suas clientes verem as mudanças.
            </p>
            <StepVideo url={SELF_SERVE_STEP_VIDEOS.menu} />
            <Link
              href={`/app/${slug}/catalogo`}
              onClick={() => mark('menu')}
              className="h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <LayoutGrid className="w-4 h-4" />
              Abrir meu menu pra editar
            </Link>
          </div>
        );
      case 'acesso':
        return (
          <div className="flex flex-col gap-3">
            <p className="text-[15px] text-ink-soft leading-relaxed">
              Pra entrar no seu app de qualquer celular, sem depender de link. Leva 30 segundos.
            </p>
            <StepVideo url={SELF_SERVE_STEP_VIDEOS.acesso} />
            <AccountSection
              slug={slug}
              hasAccount={hasAccount}
              inOnboarding
              onDone={() => {
                setHasAccount(true);
                advance(steps, true);
              }}
            />
          </div>
        );
      case 'compartilhar':
        return (
          <div className="flex flex-col gap-3">
            <p className="text-[15px] text-ink-soft leading-relaxed">
              Seu menu já está no ar. Agora é só mostrar pras suas clientes:
            </p>
            <div className="flex items-center gap-2 rounded-xl bg-cream px-3 py-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
              <span className="text-[14px] font-semibold text-ink truncate">{displayUrl}</span>
            </div>
            <StepVideo url={SELF_SERVE_STEP_VIDEOS.compartilhar} />
            <button
              type="button"
              onClick={copyLink}
              className="h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-bold flex items-center justify-center gap-2 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Link copiado!' : 'Copiar meu link'}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => mark('compartilhar')}
              className="h-12 rounded-xl border-2 border-rose-600 text-rose-600 text-[15px] font-bold flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Enviar no WhatsApp
            </a>
            <div className="rounded-xl border border-linen p-3.5 mt-1">
              <p className="flex items-center gap-2 text-[14px] font-bold text-ink mb-1.5">
                <Instagram className="w-4 h-4 text-rose-600" />
                Colocar na bio do Instagram
              </p>
              <ol className="text-[13px] text-ink-soft leading-relaxed list-decimal pl-5 space-y-0.5">
                <li>Copie o seu link no botão acima</li>
                <li>No Instagram, toque em <strong className="text-ink">Editar perfil</strong></li>
                <li>Toque em <strong className="text-ink">Links</strong> → <strong className="text-ink">Adicionar link externo</strong></li>
                <li>Cole o link e toque em ✓</li>
              </ol>
            </div>
          </div>
        );
    }
  }

  return (
    <>
      {celebrate && <ConfettiBurst />}

      <div className="rounded-2xl p-5 bg-gradient-to-br from-rose-200 to-rose-100 border border-rose-200/60">
        <h1 className="font-serif-pro font-bold text-2xl text-rose-900 leading-tight">
          {allDone ? `Tudo pronto, ${firstName}! ✨` : `Vamos deixar seu menu pronto, ${firstName}`}
        </h1>
        <p className="text-[15px] text-rose-800/70 mt-1">
          {allDone ? 'Seu menu está configurado e no ar.' : 'São só 4 passos rápidos. Você pode parar e voltar quando quiser.'}
        </p>
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 h-2 rounded-full bg-white/70 overflow-hidden">
            <div className="h-full rounded-full bg-rose-600 transition-all duration-500" style={{ width: `${(doneCount / total) * 100}%` }} />
          </div>
          <span className="text-sm font-bold text-rose-800 shrink-0">
            {doneCount} de {total}
          </span>
        </div>
      </div>

      <ol className="flex flex-col gap-3">
        {SELF_SERVE_STEP_ORDER.map((id, index) => {
          const meta = STEP_META[id];
          const isDone = done[id];
          const isOpen = open === id;
          const Icon = meta.icon;
          return (
            <li key={id} className={`rounded-2xl bg-surface border ${isOpen ? 'border-rose-300 shadow-sm' : 'border-linen'}`}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : id)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <span
                  className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-[15px] font-bold ${
                    isDone ? 'bg-rose-600 text-white' : isOpen ? 'bg-rose-100 text-rose-700' : 'bg-cream text-ink-faint'
                  }`}
                >
                  {isDone ? <Check className="w-5 h-5" strokeWidth={3} /> : index + 1}
                </span>
                <span className={`flex-1 min-w-0 text-[16px] font-bold leading-snug ${isDone && !isOpen ? 'text-ink-faint line-through' : 'text-ink'}`}>
                  {meta.title}
                </span>
                {!isDone && !isOpen && <Icon className="w-5 h-5 text-ink-faint shrink-0" />}
                <ChevronDown className={`w-5 h-5 text-ink-faint shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && <div className="px-4 pb-5">{renderBody(id)}</div>}
            </li>
          );
        })}
      </ol>

      <Link
        href={`/app/${slug}/inicio`}
        className={`h-12 rounded-xl text-[15px] font-bold flex items-center justify-center transition-colors ${
          allDone ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'text-ink-soft'
        }`}
      >
        {allDone ? 'Ir para o início' : 'Fazer depois'}
      </Link>
    </>
  );
};
