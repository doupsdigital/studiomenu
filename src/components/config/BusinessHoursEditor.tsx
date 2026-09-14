'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BusinessHoursConfigRow } from '@/lib/scheduling/config-service';

interface BusinessHoursEditorProps {
  slug: string;
  initialHours: BusinessHoursConfigRow[];
}

const WEEKDAY_LABELS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

interface DayState {
  open: boolean;
  start_time: string;
  end_time: string;
}

function buildInitialState(initialHours: BusinessHoursConfigRow[]): DayState[] {
  return Array.from({ length: 7 }, (_, weekday) => {
    const existing = initialHours.find((h) => h.weekday === weekday);
    return {
      open: !!existing,
      start_time: existing ? existing.start_time.slice(0, 5) : '09:00',
      end_time: existing ? existing.end_time.slice(0, 5) : '18:00',
    };
  });
}

export const BusinessHoursEditor: React.FC<BusinessHoursEditorProps> = ({ slug, initialHours }) => {
  const router = useRouter();
  const [days, setDays] = useState<DayState[]>(() => buildInitialState(initialHours));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const updateDay = (weekday: number, patch: Partial<DayState>) => {
    setDays((prev) => prev.map((d, idx) => (idx === weekday ? { ...d, ...patch } : d)));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const hours = days
        .map((d, weekday) => ({ weekday, ...d }))
        .filter((d) => d.open)
        .map((d) => ({ weekday: d.weekday, start_time: d.start_time, end_time: d.end_time }));

      const res = await fetch('/api/professional/business-hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, hours }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message || 'Não foi possível salvar.');
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError('Falha na conexão.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {days.map((day, weekday) => (
        <div key={weekday} className="flex items-center gap-3">
          <label className="flex items-center gap-2 w-28 shrink-0 text-xs text-ink-soft">
            <input
              type="checkbox"
              checked={day.open}
              onChange={(e) => updateDay(weekday, { open: e.target.checked })}
              className="w-4 h-4 accent-rose-600"
            />
            {WEEKDAY_LABELS[weekday]}
          </label>
          {day.open ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="time"
                value={day.start_time}
                onChange={(e) => updateDay(weekday, { start_time: e.target.value })}
                className="flex-1 h-9 rounded-lg bg-cream border border-linen px-2 text-xs text-ink"
              />
              <span className="text-ink-faint text-xs">até</span>
              <input
                type="time"
                value={day.end_time}
                onChange={(e) => updateDay(weekday, { end_time: e.target.value })}
                className="flex-1 h-9 rounded-lg bg-cream border border-linen px-2 text-xs text-ink"
              />
            </div>
          ) : (
            <span className="flex-1 text-xs text-ink-faint">Fechado</span>
          )}
        </div>
      ))}

      {error && <p className="text-xs text-rose-600">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-1 h-10 rounded-xl bg-rose-600 text-white text-xs font-bold disabled:opacity-50"
      >
        {saving ? 'Salvando...' : saved ? 'Salvo ✓' : 'Salvar horários'}
      </button>
    </div>
  );
};
