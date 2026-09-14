'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarPlus, Lock, Clock, ChevronDown } from 'lucide-react';
import { AppointmentRow } from './AppointmentRow';
import { ManualBookingForm } from './ManualBookingForm';
import { BlockSlotForm } from './BlockSlotForm';
import { DayTimeGrid } from './DayTimeGrid';
import { AppointmentDetailSheet } from './AppointmentDetailSheet';
import { ApproveModal } from './ApproveModal';
import { RejectModal } from './RejectModal';
import { SuccessModal } from './SuccessModal';
import type { AgendaAppointment, ManualBookingService } from '@/lib/scheduling/agenda-service';
import type { BusinessHoursConfigRow, ScheduleBlockConfigRow } from '@/lib/scheduling/config-service';

/** Link do WhatsApp pra avisar a cliente — mesmo texto (com emojis) que o
 *  LashAgenda usa nas duas situações. */
function buildWhatsappLink(appointment: AgendaAppointment, tipo: 'aprovado' | 'recusado', motivo?: string): string {
  const dateStr = new Date(appointment.starts_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });
  const timeStr = new Date(appointment.starts_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
  const firstName = appointment.client_name.split(' ')[0];

  const msg =
    tipo === 'aprovado'
      ? `Olá ${firstName}! 🎉 Seu agendamento foi *confirmado*!\n\n📅 *Data:* ${dateStr}\n🕐 *Horário:* ${timeStr}\n💆 *Serviço:* ${appointment.service_title}\n\nTe esperamos! 😊`
      : `Olá ${firstName}! Infelizmente precisamos recusar seu agendamento de *${dateStr} às ${timeStr}*.${motivo?.trim() ? `\n\n_${motivo.trim()}_` : ''}\n\nEntre em contato para reagendarmos. 💗`;

  return `https://wa.me/${appointment.client_whatsapp}?text=${encodeURIComponent(msg)}`;
}

function buildSuccessSummary(appointment: AgendaAppointment, title: string) {
  return {
    title,
    clientName: appointment.client_name,
    services: appointment.service_title,
    dateStr: new Date(appointment.starts_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' }),
    timeStr: new Date(appointment.starts_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }),
  };
}

interface AgendaClientProps {
  slug: string;
  selectedDate: string;
  pendingAppointments: AgendaAppointment[];
  dayAppointments: AgendaAppointment[];
  services: ManualBookingService[];
  businessHours: BusinessHoursConfigRow[];
  scheduleBlocks: ScheduleBlockConfigRow[];
}

export const AgendaClient: React.FC<AgendaClientProps> = ({
  slug,
  selectedDate,
  pendingAppointments,
  dayAppointments,
  services,
  businessHours,
  scheduleBlocks,
}) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualPrefillTime, setManualPrefillTime] = useState<string | undefined>(undefined);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [detailAppointment, setDetailAppointment] = useState<AgendaAppointment | null>(null);
  const [approveAppointment, setApproveAppointment] = useState<AgendaAppointment | null>(null);
  const [rejectAppointment, setRejectAppointment] = useState<AgendaAppointment | null>(null);
  const [successInfo, setSuccessInfo] = useState<ReturnType<typeof buildSuccessSummary> | null>(null);
  // Recolhida por padrão — igual ao layout de referência (só o cabeçalho com
  // a contagem, expande ao tocar).
  const [pendingOpen, setPendingOpen] = useState(false);

  const patchStatus = async (appointment: AgendaAppointment, status: 'confirmed' | 'cancelled') => {
    const res = await fetch(`/api/professional/appointments/${appointment.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  };

  const handleApproveConfirm = async (sendWhatsApp: boolean) => {
    if (!approveAppointment || busy) return;
    // window.open ANTES de qualquer await — só assim funciona no Safari iOS
    // (mesmo cuidado do LashAgenda).
    if (sendWhatsApp) window.open(buildWhatsappLink(approveAppointment, 'aprovado'), '_blank');

    setBusy(true);
    setActionError(null);
    try {
      const json = await patchStatus(approveAppointment, 'confirmed');
      if (!json.success) {
        setActionError(json.message || 'Não foi possível confirmar o agendamento.');
        return;
      }
      const appt = approveAppointment;
      setApproveAppointment(null);
      setDetailAppointment(null);
      setSuccessInfo(buildSuccessSummary(appt, 'Agendamento Confirmado!'));
      router.refresh();
    } catch {
      setActionError('Falha na conexão.');
    } finally {
      setBusy(false);
    }
  };

  const handleRejectConfirm = async (sendWhatsApp: boolean, motivo: string) => {
    if (!rejectAppointment || busy) return;
    if (sendWhatsApp) window.open(buildWhatsappLink(rejectAppointment, 'recusado', motivo), '_blank');

    setBusy(true);
    setActionError(null);
    try {
      const json = await patchStatus(rejectAppointment, 'cancelled');
      if (!json.success) {
        setActionError(json.message || 'Não foi possível recusar o agendamento.');
        return;
      }
      const appt = rejectAppointment;
      setRejectAppointment(null);
      setDetailAppointment(null);
      setSuccessInfo(buildSuccessSummary(appt, 'Agendamento Recusado'));
      router.refresh();
    } catch {
      setActionError('Falha na conexão.');
    } finally {
      setBusy(false);
    }
  };

  const handleCancelConfirmed = async (appointment: AgendaAppointment) => {
    setBusy(true);
    setActionError(null);
    try {
      const json = await patchStatus(appointment, 'cancelled');
      if (!json.success) {
        setActionError(json.message || 'Não foi possível cancelar o agendamento.');
        return;
      }
      setDetailAppointment(null);
      router.refresh();
    } catch {
      setActionError('Falha na conexão.');
    } finally {
      setBusy(false);
    }
  };

  const handleSlotClick = (time: string) => {
    setManualPrefillTime(time);
    setShowManualForm(true);
    setShowBlockForm(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de ações rápidas — Novo agendamento / Trancar horário /
       *  seletor de visualização (só "Dia" por enquanto, sem semana/mês). */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setManualPrefillTime(undefined);
            setShowManualForm((v) => !v);
            setShowBlockForm(false);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold shadow-sm transition-colors"
        >
          <CalendarPlus className="w-4 h-4" /> Novo
        </button>
        <button
          type="button"
          onClick={() => {
            setShowBlockForm((v) => !v);
            setShowManualForm(false);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold shadow-sm transition-colors"
        >
          <Lock className="w-4 h-4" /> Trancar
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold shadow-sm transition-colors"
          title="Só a visualização diária por enquanto"
        >
          Dia <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {pendingAppointments.length > 0 && (
        <div className="bg-surface border border-amber-200 rounded-2xl shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setPendingOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-amber-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="font-serif-pro font-semibold text-base text-ink">Aguardando confirmação</span>
              <span className="bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingAppointments.length}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-ink-soft transition-transform ${pendingOpen ? 'rotate-180' : ''}`} />
          </button>

          {pendingOpen && (
            <div className="border-t border-amber-100 divide-y divide-linen">
              {pendingAppointments.map((a) => (
                <AppointmentRow key={a.id} appointment={a} onApprove={setApproveAppointment} onReject={setRejectAppointment} />
              ))}
            </div>
          )}
        </div>
      )}

      {actionError && <p className="text-xs text-rose-600">{actionError}</p>}

      {showManualForm && (
        <ManualBookingForm
          slug={slug}
          services={services}
          defaultDate={selectedDate}
          defaultTime={manualPrefillTime}
          onClose={() => setShowManualForm(false)}
          onCreated={() => {
            setShowManualForm(false);
            router.refresh();
          }}
        />
      )}

      {showBlockForm && (
        <BlockSlotForm
          slug={slug}
          defaultDate={selectedDate}
          onClose={() => setShowBlockForm(false)}
          onCreated={() => {
            setShowBlockForm(false);
            router.refresh();
          }}
        />
      )}

      <DayTimeGrid
        dateStr={selectedDate}
        appointments={dayAppointments}
        businessHours={businessHours}
        scheduleBlocks={scheduleBlocks}
        onSlotClick={handleSlotClick}
        onAppointmentClick={setDetailAppointment}
      />

      {detailAppointment && (
        <AppointmentDetailSheet
          appointment={detailAppointment}
          busy={busy}
          onClose={() => setDetailAppointment(null)}
          onApprove={setApproveAppointment}
          onReject={setRejectAppointment}
          onCancelConfirmed={handleCancelConfirmed}
        />
      )}

      {approveAppointment && (
        <ApproveModal
          appointment={approveAppointment}
          busy={busy}
          onClose={() => setApproveAppointment(null)}
          onConfirm={handleApproveConfirm}
        />
      )}

      {rejectAppointment && (
        <RejectModal
          appointment={rejectAppointment}
          busy={busy}
          onClose={() => setRejectAppointment(null)}
          onConfirm={handleRejectConfirm}
        />
      )}

      {successInfo && <SuccessModal {...successInfo} onClose={() => setSuccessInfo(null)} />}
    </div>
  );
};
