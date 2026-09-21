'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { SuccessModalRow } from './SuccessModal';

interface BlockSlotFormProps {
  slug: string;
  defaultDate: string;
  onClose: () => void;
  onCreated: (summary: { title: string; rows: SuccessModalRow[] }) => void;
}

export const BlockSlotForm: React.FC<BlockSlotFormProps> = ({ slug, defaultDate, onClose, onCreated }) => {
  const [date, setDate] = useState(defaultDate);
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('13:00');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/professional/schedule-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          start_date: date,
          end_date: date,
          all_day: allDay,
          start_time: allDay ? undefined : `${startTime}:00`,
          end_time: allDay ? undefined : `${endTime}:00`,
          reason: reason.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message || 'Não foi possível criar o bloqueio.');
        return;
      }
      const dateLabel = new Date(`${date}T12:00:00Z`).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'America/Sao_Paulo',
      });
      onCreated({
        title: 'Horário Bloqueado!',
        rows: [
          { label: 'Data', value: dateLabel },
          { label: 'Período', value: allDay ? 'Dia inteiro' : `${startTime} às ${endTime}` },
          { label: 'Motivo', value: reason.trim() || '—' },
        ],
      });
    } catch {
      setError('Falha na conexão.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md max-h-[85vh] overflow-y-auto bg-surface rounded-t-3xl p-6 pb-8 shadow-2xl flex flex-col gap-3"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-linen text-ink-soft flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <p className="font-serif-pro font-bold text-lg text-ink pr-8">Bloquear horário</p>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-11 rounded-xl bg-surface border border-linen px-3 text-[15px] text-ink"
        />

        <label className="flex items-center gap-2 text-[15px] text-ink-soft">
          <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="w-4 h-4 accent-rose-600" />
          Bloquear o dia inteiro
        </label>

        {!allDay && (
          <div className="flex gap-2">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="flex-1 h-11 rounded-xl bg-surface border border-linen px-3 text-[15px] text-ink"
            />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="flex-1 h-11 rounded-xl bg-surface border border-linen px-3 text-[15px] text-ink"
            />
          </div>
        )}

        <input
          type="text"
          placeholder="Motivo (opcional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="h-12 rounded-xl bg-surface border border-linen px-3 text-base text-ink placeholder:text-ink-faint"
        />

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex gap-2 mt-1">
          <button type="button" onClick={onClose} className="flex-1 h-11 rounded-xl bg-linen text-ink-soft text-[15px] font-bold">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || (!allDay && (!startTime || !endTime))}
            className="flex-1 h-11 rounded-xl bg-rose-600 text-white text-[15px] font-bold disabled:opacity-50"
          >
            {submitting ? 'Bloqueando...' : 'Bloquear'}
          </button>
        </div>
      </form>
    </div>
  );
};
