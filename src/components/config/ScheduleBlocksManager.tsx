'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus } from 'lucide-react';
import type { ScheduleBlockConfigRow } from '@/lib/scheduling/config-service';

interface ScheduleBlocksManagerProps {
  slug: string;
  blocks: ScheduleBlockConfigRow[];
}

function formatBlockLabel(b: ScheduleBlockConfigRow): string {
  const start = new Date(`${b.start_date}T12:00:00Z`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
  const end = new Date(`${b.end_date}T12:00:00Z`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
  const dateLabel = b.start_date === b.end_date ? start : `${start} a ${end}`;
  const timeLabel = b.all_day ? 'Dia inteiro' : `${b.start_time?.slice(0, 5)}–${b.end_time?.slice(0, 5)}`;
  return `${dateLabel} · ${timeLabel}`;
}

export const ScheduleBlocksManager: React.FC<ScheduleBlocksManagerProps> = ({ slug, blocks }) => {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('13:00');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/professional/schedule-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          start_date: startDate,
          end_date: endDate,
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
      setShowForm(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      router.refresh();
    } catch {
      setError('Falha na conexão.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/professional/schedule-blocks/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) {
        setError(json.message || 'Não foi possível apagar o bloqueio.');
        return;
      }
      router.refresh();
    } catch {
      setError('Falha na conexão.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[10px] font-semibold tracking-widest uppercase text-slate-500">Bloqueios e folgas</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/15 text-rose-400 text-[11px] font-bold"
        >
          <Plus className="w-3.5 h-3.5" /> Novo bloqueio
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-3 mb-3">
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Início"
              className="flex-1 h-11 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-white"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Fim"
              className="flex-1 h-11 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-white"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="w-4 h-4" />
            Dia(s) inteiro(s)
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

          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 h-10 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !startDate || !endDate}
              className="flex-1 h-10 rounded-xl bg-rose-500 text-white text-xs font-bold disabled:opacity-50"
            >
              {submitting ? 'Criando...' : 'Criar bloqueio'}
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-xs text-rose-400 mb-2">{error}</p>}

      {blocks.length === 0 ? (
        <p className="text-xs text-slate-500 py-4 text-center">Nenhum bloqueio cadastrado.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {blocks.map((b) => (
            <div key={b.id} className="rounded-2xl bg-slate-900 border border-slate-800 p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-white">{formatBlockLabel(b)}</p>
                {b.reason && <p className="text-[11px] text-slate-500 truncate mt-0.5">{b.reason}</p>}
              </div>
              <button
                type="button"
                disabled={deletingId === b.id}
                onClick={() => handleDelete(b.id)}
                className="shrink-0 w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center disabled:opacity-50"
                aria-label="Apagar bloqueio"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
