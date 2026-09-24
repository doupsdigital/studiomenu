'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Home, Settings, CalendarCheck } from 'lucide-react';

interface WelcomeOnboardingProps {
  slug: string;
  planTier: 'catalog' | 'basico' | 'plus';
}

interface Slide {
  preview: React.ReactNode;
  title: string;
  subtitle: string;
}

const storageKey = (slug: string) => `sm_welcome_seen_v1_${slug}`;

/** Mini "print" da tela Início — mesmo header em gradiente + cards de
 *  estatística de `inicio/page.tsx`, só ilustrativo (dados fixos), não
 *  precisa dos dados reais dela pra passar a ideia. */
const InicioPreview: React.FC = () => (
  <div className="rounded-xl overflow-hidden border border-linen bg-cream">
    <div className="bg-gradient-to-br from-rose-700 via-rose-600 to-rose-500 text-white px-4 pt-4 pb-5">
      <p className="font-serif-pro font-bold text-base">Boa tarde, Ana!</p>
      <p className="text-[11px] text-white/70 italic mt-0.5">Bem-vinda ao seu Studio! ✨</p>
    </div>
    <div className="grid grid-cols-2 gap-2 p-3">
      <div className="rounded-lg bg-surface border border-linen px-2.5 py-2">
        <p className="text-[10px] text-ink-faint">Agendamentos hoje</p>
        <p className="text-base font-bold text-ink">3</p>
      </div>
      <div className="rounded-lg bg-surface border border-linen px-2.5 py-2">
        <p className="text-[10px] text-ink-faint">Aguardando</p>
        <p className="text-base font-bold text-ink">1</p>
      </div>
    </div>
  </div>
);

/** Mini "print" da grade do catálogo — mesmo visual `.tile` (foto + título
 *  serifado itálico + preço) do `ProcedureCard.tsx` real. */
const CatalogoPreview: React.FC = () => (
  <div className="rounded-xl overflow-hidden border border-linen bg-cream p-3">
    <div className="grid grid-cols-2 gap-2">
      {[
        { title: 'Volume Brasileiro', price: 'R$ 160' },
        { title: 'Volume Egípcio', price: 'R$ 180' },
      ].map((item) => (
        <div
          key={item.title}
          className="rounded-lg overflow-hidden aspect-[3/4] bg-gradient-to-br from-[#3a2126] to-[#1c1013] flex items-end p-2"
        >
          <div>
            <p className="font-serif-pro italic text-white text-[12px] leading-tight">{item.title}</p>
            <p className="text-white/80 text-[10px] mt-0.5">{item.price}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/** Mini "print" de um cartão de agendamento confirmado na Agenda — mesmo
 *  visual (borda colorida à esquerda) do `DayTimeline.tsx` real. */
const AgendaPreview: React.FC = () => (
  <div className="rounded-xl overflow-hidden border border-linen bg-cream p-3">
    <div className="flex gap-2.5">
      <div className="w-10 shrink-0 pt-1 text-[12px] font-semibold text-ink">14:00</div>
      <div className="flex-1 rounded-lg border border-l-4 bg-surface border-linen border-l-rose-600 px-3 py-2.5">
        <p className="text-[13px] font-semibold text-ink">Maria Cliente</p>
        <p className="text-[12px] text-ink-soft mt-0.5">Manicure</p>
      </div>
    </div>
  </div>
);

/** Mini "print" do menu inferior — mesmos 3 ícones do `BottomNav.tsx` real,
 *  pra quem ainda não tem agendamento automático (Básico/Catálogo). */
const MenuPreview: React.FC = () => (
  <div className="rounded-xl overflow-hidden border border-linen bg-surface p-4 flex items-center justify-around">
    {[
      { label: 'Início', icon: Home, active: true },
      { label: 'Agenda', icon: CalendarCheck, active: false },
      { label: 'Config', icon: Settings, active: false },
    ].map(({ label, icon: Icon, active }) => (
      <div key={label} className={`flex flex-col items-center gap-1 ${active ? 'text-rose-600' : 'text-ink-faint'}`}>
        <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.75} />
        <span className="text-[10px] font-semibold">{label}</span>
      </div>
    ))}
  </div>
);

/** Onboarding de boas-vindas do app da profissional — 3 telas bem enxutas
 *  (clima/contexto, não mecânica) na primeira vez que ela abre o app,
 *  complementando (não substituindo) o tour de tooltips já existente
 *  (`ProductTour`). Pedido dela, 2026-09-24: como é um PWA aberto direto
 *  pelo link (sem a "ficha técnica" de uma app store), esse primeiro
 *  contato importa mais do que num app nativo comum. Cada tela mostra um
 *  mini "print" ilustrativo da tela real que ela referencia (não é uma
 *  captura de verdade nem dado real da profissional — 2026-09-24: "tente
 *  colocar prints das telas que o card referencia, igual é nos apps do
 *  mercado, quero uma experiência visual"), reaproveitando exatamente o
 *  mesmo visual dos componentes reais (`.tile`, cartão de agendamento,
 *  header em gradiente, menu inferior).
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
        preview: <InicioPreview />,
        title: 'Bem-vinda ao seu StudioMenu!',
        subtitle: 'Esse é o app onde você cuida do seu catálogo e da sua agenda, tudo num só lugar.',
      },
      {
        preview: <CatalogoPreview />,
        title: 'Seu catálogo, sempre atualizado',
        subtitle: 'Edite fotos, preços e serviços quando quiser — e compartilhe o link com suas clientes.',
      },
      planTier === 'plus'
        ? {
            preview: <AgendaPreview />,
            title: 'Suas clientes agendam sozinhas',
            subtitle: 'Com o agendamento automático ativo, é só acompanhar tudo na sua Agenda.',
          }
        : {
            preview: <MenuPreview />,
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
        <div className="w-full rounded-2xl bg-white border border-rose-100 shadow-sm p-5">
          <div className="mb-5">{slide.preview}</div>
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
