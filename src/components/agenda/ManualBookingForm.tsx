'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { localDateTimeToUTC } from '@/lib/scheduling/availability';
import { formatPhoneBR } from '@/lib/format';
import type { ManualBookingService } from '@/lib/scheduling/agenda-service';
import type { SuccessModalRow } from './SuccessModal';

interface ManualBookingFormProps {
  slug: string;
  services: ManualBookingService[];
  defaultDate: string;
  /** Horário pré-preenchido quando o formulário é aberto a partir de um
   *  clique numa célula livre da grade de horário (Fase 4). */
  defaultTime?: string;
  onClose: () => void;
  onCreated: (summary: { title: string; rows: SuccessModalRow[] }) => void;
}

export const ManualBookingForm: React.FC<ManualBookingFormProps> = ({
  slug,
  services,
  defaultDate,
  defaultTime,
  onClose,
  onCreated,
}) => {
  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime || '09:00');
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
      const serviceTitle = services.find((s) => s.id === serviceId)?.title || '';
      const dateLabel = localDateTimeToUTC(date, time).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'America/Sao_Paulo',
      });
      onCreated({
        title: 'Agendamento Criado!',
        rows: [
          { label: 'Cliente', value: clientName.trim() },
          { label: 'Procedimento(s)', value: serviceTitle },
          { label: 'Data', value: dateLabel },
          { label: 'Horário', value: time },
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

        <p className="font-serif-pro font-bold text-lg text-ink pr-8">Novo agendamento manual</p>

        {services.length === 0 ? (
          <p className="text-xs text-amber-700">
            Nenhum serviço com duração configurada ainda. Adicione a duração no editor do catálogo primeiro.
          </p>
        ) : (
          <>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="h-11 rounded-xl bg-surface border border-linen px-3 text-sm text-ink"
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
                className="flex-1 h-11 rounded-xl bg-surface border border-linen px-3 text-sm text-ink"
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-28 h-11 rounded-xl bg-surface border border-linen px-3 text-sm text-ink"
              />
            </div>

            <input
              type="text"
              placeholder="Nome da cliente"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="h-11 rounded-xl bg-surface border border-linen px-3 text-sm text-ink placeholder:text-ink-faint"
            />
            <input
              type="tel"
              placeholder="(11) 99999-9999"
              value={clientWhatsapp}
              onChange={(e) => setClientWhatsapp(formatPhoneBR(e.target.value))}
              className="h-11 rounded-xl bg-surface border border-linen px-3 text-sm text-ink placeholder:text-ink-faint"
            />
            <textarea
              placeholder="Observação (opcional)"
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              className="rounded-xl bg-surface border border-linen px-3 py-2 text-sm text-ink placeholder:text-ink-faint min-h-[60px]"
            />
          </>
        )}

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl bg-linen text-ink-soft text-sm font-bold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || services.length === 0}
            className="flex-1 h-11 rounded-xl bg-rose-600 text-white text-sm font-bold disabled:opacity-50"
          >
            {submitting ? 'Criando...' : 'Criar agendamento'}
          </button>
        </div>
      </form>
    </div>
  );
};
