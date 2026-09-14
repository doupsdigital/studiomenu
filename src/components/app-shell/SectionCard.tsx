'use client';

import React from 'react';
import { LucideIcon, ChevronDown } from 'lucide-react';

interface SectionCardProps {
  icon: LucideIcon;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

/** Cartão de acordeão — cabeçalho em gradiente rose (ícone + título +
 *  chevron), corpo branco revelado ao abrir. Mesmo padrão do acordeão de
 *  Configurações do LashAgenda (`SectionCard` de lá), usado aqui pras 3
 *  seções da aba Config. Sem lógica própria além de abrir/fechar — o
 *  conteúdo de cada seção continua sendo o componente que já existia. */
export const SectionCard: React.FC<SectionCardProps> = ({ icon: Icon, title, isOpen, onToggle, children }) => {
  return (
    <div className="bg-surface border border-linen rounded-2xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-5 cursor-pointer select-none text-left bg-gradient-to-br from-rose-700 to-rose-500"
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-serif-pro font-bold text-lg text-white flex items-center gap-2 min-w-0">
            <Icon className="w-5 h-5 text-white shrink-0" />
            <span className="truncate">{title}</span>
          </h3>
          <ChevronDown className={`w-5 h-5 text-white/80 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && <div className="p-5">{children}</div>}
    </div>
  );
};
