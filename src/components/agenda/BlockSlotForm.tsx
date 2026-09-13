'use client';

import React, { useState } from 'react';

interface BlockSlotFormProps {
  slug: string;
  defaultDate: string;
  onClose: () => void;
  onCreated: () => void;
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
      onCreated();
    } catch {
      setError('Falha na conexão.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-3">
      <p className="text-sm font-bold text-white">Bloquear horário</p>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="h-11 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-white"
      />

      <label className="flex items-center gap-2 text-xs text-slate-300">
        <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="w-4 h-4" />
        Bloquear o dia inteiro
      </label>

      {!allDay && (
        <div className="flex gap-2">
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="flex-1 h-11 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-white"
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="flex-1 h-11 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-white"
          />
        </div>
      )}

      <input
        type="text"
        placeholder="Motivo (opcional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="h-11 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-white placeholder:text-slate-600"
      />

      {error && <p className="text-xs text-rose-400">{error}</p>}

      <div className="flex gap-2">
        <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting || (!allDay && (!startTime || !endTime))}
          className="flex-1 h-10 rounded-xl bg-rose-500 text-white text-xs font-bold disabled:opacity-50"
        >
          {submitting ? 'Bloqueando...' : 'Bloquear'}
        </button>
      </div>
    </form>
  );
};
