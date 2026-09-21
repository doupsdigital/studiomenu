'use client';

import React from 'react';
import { LucideIcon, ChevronDown, Lock } from 'lucide-react';

interface SectionCardProps {
  icon: LucideIcon;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  /** Quando true, a seção fica travada — não expande, o chevron vira um
   *  cadeado, e aparece uma legenda curta explicando o porquê. Usado pras
   *  seções que só fazem sentido com o agendamento automático ligado
   *  (Horários/Bloqueios), pra quem ainda não é Plus. */
  locked?: boolean;
  /** Legenda mostrada abaixo do cabeçalho só quando `locked`. */
  lockedHint?: string;
  /** Alvo do tour guiado (Fase 20) — fica no cabeçalho, não no card inteiro:
   *  o cabeçalho tem altura fixa (não cresce quando a seção abre), então o
   *  balão sempre aponta pro mesmo lugar de forma previsível, mesmo em
   *  cards grandes como "Horários de atendimento" (achado testando de
   *  verdade: apontar pro card inteiro fazia o balão pular de cima pra
   *  baixo dependendo do tanto de conteúdo aberto). */
  dataTour?: string;
}

/** Cartão de acordeão — cabeçalho em gradiente rose (ícone + título +
 *  chevron), corpo branco revelado ao abrir. Mesmo padrão do acordeão de
 *  Configurações do LashAgenda (`SectionCard` de lá), usado aqui pras 3
 *  seções da aba Config. Sem lógica própria além de abrir/fechar — o
 *  conteúdo de cada seção continua sendo o componente que já existia. */
export const SectionCard: React.FC<SectionCardProps> = ({ icon: Icon, title, isOpen, onToggle, children, locked, lockedHint, dataTour }) => {
  return (
    <div className="bg-surface border border-linen rounded-2xl shadow-sm overflow-hidden">
      <button
        type="button"
        data-tour={dataTour}
        onClick={locked ? undefined : onToggle}
        aria-disabled={locked}
        className={`w-full px-5 py-5 select-none text-left bg-gradient-to-br from-rose-700 to-rose-500 ${
          locked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-serif-pro font-bold text-lg text-white flex items-center gap-2 min-w-0">
            <Icon className="w-5 h-5 text-white shrink-0" />
            <span className="truncate">{title}</span>
          </h3>
          {locked ? (
            <Lock className="w-5 h-5 text-white/80 shrink-0" />
          ) : (
            <ChevronDown className={`w-5 h-5 text-white/80 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </div>
      </button>

      {locked && lockedHint && <p className="px-5 py-3 text-sm text-ink-faint">{lockedHint}</p>}

      {!locked && isOpen && <div className="p-5">{children}</div>}
    </div>
  );
};
