'use client';

import React from 'react';
import { X, SquarePlus } from 'lucide-react';

interface IosInstallSheetProps {
  onClose: () => void;
}

/** Ícone de Compartilhar do iOS (quadrado com seta saindo por cima) — não
 *  existe pronto no lucide-react, e é o que a profissional precisa reconhecer
 *  na barra do navegador (é sempre esse ícone, em qualquer app no iPhone —
 *  Safari, Chrome, etc. — porque "Adicionar à Tela de Início" abre o mesmo
 *  menu do sistema operacional, não algo específico de cada navegador). */
const IosShareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 16V4" />
    <path d="M8 8l4-4 4 4" />
    <rect x="5" y="10" width="14" height="10" rx="2" />
  </svg>
);

const STEPS = [
  {
    icon: IosShareIcon,
    title: 'Toque em Compartilhar',
    desc: 'O ícone do quadrado com a seta pra cima, na barra do navegador.',
  },
  {
    icon: SquarePlus,
    title: 'Adicionar à Tela de Início',
    desc: 'Role a lista de opções até encontrar essa opção e toque nela.',
  },
];

/** Passo a passo manual de instalação pro iPhone/iPad — a Apple não oferece
 *  um diálogo nativo de instalação como o Chrome (`beforeinstallprompt`),
 *  então esse é o jeito real de instalar um PWA no iOS: só o próprio gesto
 *  da usuária pelo menu de Compartilhar do sistema. Prática padrão de
 *  mercado pra contornar essa ausência (não é um bug/limitação nossa
 *  específica — é assim pra qualquer PWA no iOS). Aberto pelo mesmo botão
 *  "Instalar" do `PageTitleBar`, no lugar do diálogo nativo do Android. */
export const IosInstallSheet: React.FC<IosInstallSheetProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface rounded-t-3xl p-6 pb-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-linen text-ink-soft flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-serif-pro text-xl font-bold text-ink mb-1 pr-8">Instalar o app</h3>
        <p className="text-[15px] text-ink-soft mb-5">
          No iPhone, a instalação é feita direto pelo seu navegador — são só 2 passos:
        </p>

        <div className="flex flex-col gap-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex items-center gap-3.5 rounded-xl bg-cream p-3.5">
              <div className="shrink-0 w-9 h-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-sm font-bold">
                {i + 1}
              </div>
              <step.icon className="shrink-0 w-6 h-6 text-rose-600" />
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-ink">{step.title}</p>
                <p className="text-sm text-ink-soft">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 mt-5 rounded-xl bg-rose-600 text-white text-[15px] font-bold"
        >
          Entendi
        </button>
      </div>
    </div>
  );
};
