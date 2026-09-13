'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarPlus, Lock } from 'lucide-react';
import { AppointmentRow } from './AppointmentRow';
import { ManualBookingForm } from './ManualBookingForm';
import { BlockSlotForm } from './BlockSlotForm';
import type { AgendaAppointment, ManualBookingService } from '@/lib/scheduling/agenda-service';

interface AgendaClientProps {
  slug: string;
  selectedDate: string;
  pendingAppointments: AgendaAppointment[];
  dayAppointments: AgendaAppointment[];
  services: ManualBookingService[];
}

export const AgendaClient: React.FC<AgendaClientProps> = ({
  slug,
  selectedDate,
  pendingAppointments,
  dayAppointments,
  services,
}) => {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showBlockForm, setShowBlockForm] = useState(false);

  const handleUpdateStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    setBusyId(id);
    setActionError(null);
    try {
      const res = await fetch(`/api/professional/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) {
        setActionError(json.message || 'Não foi possível atualizar o agendamento.');
        return;
      }
      router.refresh();
    } catch {
      setActionError('Falha na conexão.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {pendingAppointments.length > 0 && (
        <section>
          <h2 className="text-[10px] font-semibold tracking-widest uppercase text-amber-400 mb-2">
            Aguardando confirmação ({pendingAppointments.length})
          </h2>
          <div className="flex flex-col gap-2">
            {pendingAppointments.map((a) => (
              <AppointmentRow key={a.id} appointment={a} onUpdateStatus={handleUpdateStatus} busy={busyId === a.id} />
            ))}
          </div>
        </section>
      )}

      {actionError && <p className="text-xs text-rose-400">{actionError}</p>}

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[10px] font-semibold tracking-widest uppercase text-slate-500">Agendamentos do dia</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowManualForm((v) => !v);
                setShowBlockForm(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/15 text-rose-400 text-[11px] font-bold"
            >
              <CalendarPlus className="w-3.5 h-3.5" /> Agendamento
            </button>
            <button
              type="button"
              onClick={() => {
                setShowBlockForm((v) => !v);
                setShowManualForm(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-bold"
            >
              <Lock className="w-3.5 h-3.5" /> Bloquear
            </button>
          </div>
        </div>

        {showManualForm && (
          <div className="mb-3">
            <ManualBookingForm
              slug={slug}
              services={services}
              defaultDate={selectedDate}
              onClose={() => setShowManualForm(false)}
              onCreated={() => {
                setShowManualForm(false);
                router.refresh();
              }}
            />
          </div>
        )}

        {showBlockForm && (
          <div className="mb-3">
            <BlockSlotForm
              slug={slug}
              defaultDate={selectedDate}
              onClose={() => setShowBlockForm(false)}
              onCreated={() => {
                setShowBlockForm(false);
                router.refresh();
              }}
            />
          </div>
        )}

        {dayAppointments.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">Nenhum agendamento nesse dia.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {dayAppointments.map((a) => (
              <AppointmentRow key={a.id} appointment={a} onUpdateStatus={handleUpdateStatus} busy={busyId === a.id} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
