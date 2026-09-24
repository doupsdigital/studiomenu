'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Home, BookOpen, CalendarClock, CalendarCheck, type LucideIcon } from 'lucide-react';

interface WelcomeOnboardingProps {
  slug: string;
  planTier: 'catalog' | 'basico' | 'plus';
}

interface Slide {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

const storageKey = (slug: string) => `sm_welcome_seen_v1_${slug}`;

/** Onboarding de boas-vindas do app da profissional — 3 telas bem enxutas
 *  (clima/contexto, não mecânica) na primeira vez que ela abre o app,
 *  complementando (não substituindo) o tour de tooltips já existente
 *  (`ProductTour`). Pedido dela, 2026-09-24: como é um PWA aberto direto
 *  pelo link (sem a "ficha técnica" de uma app store), esse primeiro
 *  contato importa mais do que num app nativo comum. Ícone de cada tela
 *  "compatível" com o que ela referencia (Início/Catálogo/Agenda), não
 *  genérico — pedido dela depois de testar um primeiro rascunho com mini
 *  prints das telas, que não agradou ("pode voltar como estava, mas com
 *  ícone temático e um pouco maior").
 *
 *  Mesmo padrão de "já visto" dos tours (`sm_tour_seen_*`) e do checklist
 *  (`sm_onboarding_done_seen_*`): só localStorage, sem campo novo no banco.
 *  `z-[10050]` fica acima do zIndex do Joyride (10000) — cobre a tela
 *  inteira enquanto aberto, então o tour da página por baixo (que já
 *  disparou seu próprio efeito, independente deste) só fica visível depois
 *  que ela fechar aqui. */
export const WelcomeOnboarding: React.FC<WelcomeOnboardingProps> = ({ slug, planTier }) => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(storageKey(slug))) setVisible(true);
    } catch {
      // Modo privado/localStorage bloqueado: mostra mesmo assim (fail-open,
      // mesma filosofia do ProductTour) em vez de travar a tela.
      setVisible(true);
    }
  }, [slug]);

  const slides = useMemo<Slide[]>(
    () => [
      {
        icon: Home,
        title: 'Bem-vinda ao seu StudioMenu!',
        subtitle:
          planTier === 'plus'
            ? 'Esse é o app onde você cuida do seu catálogo e da sua agenda, tudo num só lugar.'
            : 'Esse é o app onde você cuida do seu catálogo, sempre prontinho pra compartilhar com suas clientes.',
      },
      {
        icon: BookOpen,
        title: 'Seu catálogo, sempre atualizado',
        subtitle: 'Edite fotos, preços e serviços quando quiser — e compartilhe o link com suas clientes.',
      },
      planTier === 'plus'
        ? {
            icon: CalendarClock,
            title: 'Suas clientes agendam sozinhas',
            subtitle: 'Com o agendamento automático ativo, é só acompanhar tudo na sua Agenda.',
          }
        : {
            icon: CalendarCheck,
            title: 'Acompanhe tudo por aqui',
            subtitle: 'Início, Agenda e Configurações — sempre à mão, no menu abaixo.',
          },
    ],
    [planTier]
  );

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(storageKey(slug), '1');
    } catch {
      // Sem localStorage, só fecha — vai aparecer de novo na próxima visita
      // (mesmo comportamento de fallback do ProductTour).
    }
    setVisible(false);
  };

  const isLast = step === slides.length - 1;
  const slide = slides[step];

  return (
    <div
      className="fixed inset-0 z-[10050] flex flex-col bg-rose-200"
      role="dialog"
      aria-modal="true"
      aria-label="Bem-vinda ao StudioMenu"
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-rose-600' : 'w-1.5 bg-white/70'}`}
            />
          ))}
        </div>
        <button type="button" onClick={dismiss} className="text-sm font-semibold text-rose-700">
          Pular
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 max-w-sm mx-auto w-full text-center">
        <div className="w-full rounded-2xl bg-white border border-rose-100 shadow-sm px-6 py-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-700 via-rose-600 to-rose-500 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-rose-600/25">
            <slide.icon className="w-10 h-10" />
          </div>
          <p className="font-serif-pro font-bold text-2xl text-ink mb-2 leading-snug">{slide.title}</p>
          <p className="text-base text-ink-soft leading-relaxed">{slide.subtitle}</p>
        </div>
      </div>

      <div className="px-6 pb-8 max-w-sm mx-auto w-full">
        <button
          type="button"
          onClick={() => (isLast ? dismiss() : setStep((s) => s + 1))}
          className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-bold shadow-sm transition-colors"
        >
          {isLast ? 'Começar →' : 'Próximo →'}
        </button>
      </div>
    </div>
  );
};
