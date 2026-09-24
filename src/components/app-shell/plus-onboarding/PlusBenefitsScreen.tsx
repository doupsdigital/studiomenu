import React from 'react';
import { Crown, Check } from 'lucide-react';

interface PlusBenefitsScreenProps {
  onNext: () => void;
}

const BENEFITS = [
  'Clientes agendam sozinhas, a qualquer hora',
  'Agenda organizada com horários reais',
  'Menos ida e volta pelo WhatsApp',
];

export const PlusBenefitsScreen: React.FC<PlusBenefitsScreenProps> = ({ onNext }) => {
  return (
    <div className="flex flex-col items-center text-center px-6 pt-6 pb-8 max-w-sm mx-auto w-full">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-700 via-rose-600 to-rose-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-rose-600/25">
        <Crown className="w-8 h-8" />
      </div>
      <p className="text-[13px] font-bold tracking-widest uppercase text-rose-600 mb-1.5">StudioMenu+</p>
      <h2 className="font-serif-pro font-bold text-2xl text-ink leading-snug mb-3">
        Imagine suas clientes agendando sozinhas, sem trocar uma mensagem no WhatsApp
      </h2>
      <p className="text-[15px] text-ink-soft leading-snug mb-6">
        Chega de perder tempo combinando horário por mensagem. Sua cliente escolhe o dia e o
        horário direto no seu catálogo — e sua agenda já aparece organizada, sempre atualizada.
      </p>

      <ul className="text-left w-full flex flex-col gap-3 mb-8">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-start gap-3 text-[15px] text-ink leading-snug bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
            <Check className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" strokeWidth={3} />
            {benefit}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onNext}
        className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-bold shadow-sm transition-colors"
      >
        Ver como funciona →
      </button>
    </div>
  );
};
