'use client';

import React, { useState } from 'react';

interface AgendaPauseSectionProps {
  slug: string;
  initialPaused: boolean;
}

/** Toggle que liga/desliga `agenda_paused` (Fase 23) — pausa o agendamento
 *  automático temporariamente (férias, imprevisto) sem mexer na assinatura
 *  nem no acesso dela à própria Agenda. Otimista: muda o visual na hora e
 *  desfaz se o servidor recusar (mesmo padrão de UI de resposta imediata já
 *  usado no resto do app). */
export const AgendaPauseSection: React.FC<AgendaPauseSectionProps> = ({ slug, initialPaused }) => {
  const [paused, setPaused] = useState(initialPaused);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    const next = !paused;
    setPaused(next);
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/professional/agenda-pause', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, paused: next }),
      });
      const json = await res.json();
      if (!json.success) {
        setPaused(!next);
        setError(json.message || 'Não foi possível salvar. Tente de novo.');
      }
    } catch {
      setPaused(!next);
      setError('Falha na conexão. Tente de novo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[15px] text-ink-soft leading-relaxed">
        Pause o agendamento automático temporariamente. Suas clientes voltam a combinar horário com você pelo WhatsApp, como no
        StudioMenu Básico — útil pra férias, imprevistos ou qualquer folga. Você continua vendo e gerenciando sua agenda
        normalmente por aqui.
      </p>

      <button
        type="button"
        onClick={handleToggle}
        disabled={saving}
        className={`flex items-center justify-between gap-3 rounded-xl border p-4 transition-colors disabled:opacity-60 ${
          paused ? 'bg-amber-50 border-amber-200' : 'bg-surface border-linen'
        }`}
      >
        <span className={`text-[15px] font-bold ${paused ? 'text-amber-800' : 'text-ink'}`}>
          Agenda automática: {paused ? 'Pausada' : 'Ativa'}
        </span>
        <span
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
            paused ? 'bg-amber-500' : 'bg-rose-600'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
              paused ? 'translate-x-[22px]' : 'translate-x-1'
            }`}
          />
        </span>
      </button>

      {paused && (
        <p className="text-[13px] text-amber-700 leading-relaxed">
          Sua agenda está pausada — suas clientes não conseguem agendar sozinhas até você ativar de novo.
        </p>
      )}
      {error && <p className="text-[13px] text-rose-600">{error}</p>}
    </div>
  );
};
