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
    <div>
      <div className="flex items-center justify-end mb-3">
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-100 text-rose-600 text-sm font-bold"
        >
          <Plus className="w-4 h-4" /> Novo bloqueio
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl bg-cream border border-linen p-4 flex flex-col gap-3 mb-3">
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Início"
              className="flex-1 min-w-0 h-11 rounded-xl bg-surface border border-linen px-3 text-sm text-ink"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Fim"
              className="flex-1 min-w-0 h-11 rounded-xl bg-surface border border-linen px-3 text-sm text-ink"
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm text-ink-soft">
            <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="w-5 h-5 accent-rose-600" />
            Dia(s) inteiro(s)
          </label>

          {!allDay && (
            <div className="flex gap-2">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="flex-1 min-w-0 h-11 rounded-xl bg-surface border border-linen px-3 text-sm text-ink"
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="flex-1 min-w-0 h-11 rounded-xl bg-surface border border-linen px-3 text-sm text-ink"
              />
            </div>
          )}

          <input
            type="text"
            placeholder="Motivo (opcional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-11 rounded-xl bg-surface border border-linen px-3 text-sm text-ink placeholder:text-ink-faint"
          />

          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 h-11 rounded-xl bg-linen text-ink-soft text-sm font-bold">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !startDate || !endDate}
              className="flex-1 h-11 rounded-xl bg-rose-600 text-white text-sm font-bold disabled:opacity-50"
            >
              {submitting ? 'Criando...' : 'Criar bloqueio'}
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-[13px] text-rose-600 mb-2">{error}</p>}

      {blocks.length === 0 ? (
        <p className="text-sm text-ink-faint py-4 text-center">Nenhum bloqueio cadastrado.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {blocks.map((b) => (
            <div key={b.id} className="rounded-2xl bg-cream border border-linen p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink">{formatBlockLabel(b)}</p>
                {b.reason && <p className="text-[13px] text-ink-faint truncate mt-1">{b.reason}</p>}
              </div>
              <button
                type="button"
                disabled={deletingId === b.id}
                onClick={() => handleDelete(b.id)}
                className="shrink-0 w-9 h-9 rounded-full bg-linen text-ink-soft flex items-center justify-center disabled:opacity-50"
                aria-label="Apagar bloqueio"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
