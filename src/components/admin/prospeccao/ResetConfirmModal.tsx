'use client';

import React from 'react';

interface ResetConfirmModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({ onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60]">
      <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-center">
        <h3 className="font-bold text-white text-sm">Resetar todo o progresso?</h3>
        <p className="text-xs text-slate-400">
          Isso vai apagar o status e as anotações de todos os leads. Essa ação não pode ser desfeita.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 text-xs font-bold"
          >
            Sim, Resetar
          </button>
        </div>
      </div>
    </div>
  );
};
