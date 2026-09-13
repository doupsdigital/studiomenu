'use client';

import React, { useState } from 'react';
import { localDateTimeToUTC } from '@/lib/scheduling/availability';
import { formatPhoneBR } from '@/lib/format';
import type { ManualBookingService } from '@/lib/scheduling/agenda-service';

interface ManualBookingFormProps {
  slug: string;
  services: ManualBookingService[];
  defaultDate: string;
  onClose: () => void;
  onCreated: () => void;
}

export const ManualBookingForm: React.FC<ManualBookingFormProps> = ({ slug, services, defaultDate, onClose, onCreated }) => {
  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('09:00');
  const [clientName, setClientName] = useState('');
  const [clientWhatsapp, setClientWhatsapp] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !date || !time || !clientName.trim() || !clientWhatsapp.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const startsAt = localDateTimeToUTC(date, time).toISOString();
      const res = await fetch('/api/professional/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          service_id: serviceId,
          starts_at: startsAt,
          client_name: clientName.trim(),
          client_whatsapp: clientWhatsapp.trim(),
          client_notes: clientNotes.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message || 'Não foi possível criar o agendamento.');
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
      <p className="text-sm font-bold text-white">Novo agendamento manual</p>

      {services.length === 0 ? (
        <p className="text-xs text-amber-400">
          Nenhum serviço com duração configurada ainda. Adicione a duração no editor do catálogo primeiro.
        </p>
      ) : (
        <>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="h-11 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-white"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 h-11 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-white"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-28 h-11 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-white"
            />
          </div>

          <input
            type="text"
            placeholder="Nome da cliente"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="h-11 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-white placeholder:text-slate-600"
          />
          <input
            type="tel"
            placeholder="(11) 99999-9999"
            value={clientWhatsapp}
            onChange={(e) => setClientWhatsapp(formatPhoneBR(e.target.value))}
            className="h-11 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-white placeholder:text-slate-600"
          />
          <textarea
            placeholder="Observação (opcional)"
            value={clientNotes}
            onChange={(e) => setClientNotes(e.target.value)}
            className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-600 min-h-[60px]"
          />
        </>
      )}

      {error && <p className="text-xs text-rose-400">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-10 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting || services.length === 0}
          className="flex-1 h-10 rounded-xl bg-rose-500 text-white text-xs font-bold disabled:opacity-50"
        >
          {submitting ? 'Criando...' : 'Criar agendamento'}
        </button>
      </div>
    </form>
  );
};
