'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';

export interface SuccessModalRow {
  label: string;
  value: string;
}

interface SuccessModalProps {
  title: string;
  /** Linhas rótulo/valor do resumo — genérico o bastante pra servir tanto
   *  pra um agendamento (Cliente/Procedimento/Data/Horário) quanto pra um
   *  bloqueio de horário (Data/Período/Motivo), sem forçar campos que não
   *  fazem sentido em cada caso. */
  rows: SuccessModalRow[];
  onClose: () => void;
}

/** Modal de sucesso — mesma estrutura exata do LashAgenda (ícone de check,
 *  resumo em linhas rótulo/valor, botão único "Concluir e Fechar"). Usado
 *  depois de confirmar/recusar um agendamento, criar um agendamento manual
 *  ou bloquear um horário. */
export const SuccessModal: React.FC<SuccessModalProps> = ({ title, rows, onClose }) => {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-surface rounded-2xl border border-linen shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 pt-6 pb-2 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600 mb-3">
            <CheckCircle className="w-9 h-9" />
          </div>
          <h3 className="font-serif-pro font-bold text-2xl text-ink">{title}</h3>
          <p className="text-xs text-ink-soft mt-1">Os dados foram registrados com sucesso no sistema.</p>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="bg-cream border border-linen rounded-xl p-4 text-xs space-y-2.5">
            {rows.map((row, i) => (
              <div
                key={row.label}
                className={`flex justify-between ${i < rows.length - 1 ? 'border-b border-linen pb-1.5' : ''}`}
              >
                <span className="font-bold text-ink-soft uppercase text-[10px] tracking-wider">{row.label}</span>
                <span className="font-semibold text-ink max-w-[200px] truncate text-right">{row.value}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-800 text-white transition-colors"
          >
            Concluir e Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
