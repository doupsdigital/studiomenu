'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarPlus, Lock, Clock, ChevronDown } from 'lucide-react';
import { AppointmentRow } from './AppointmentRow';
import { ManualBookingForm } from './ManualBookingForm';
import { BlockSlotForm } from './BlockSlotForm';
import { DayTimeGrid } from './DayTimeGrid';
import { MonthCalendar } from './MonthCalendar';
import { AppointmentDetailSheet } from './AppointmentDetailSheet';
import { ApproveModal } from './ApproveModal';
import { RejectModal } from './RejectModal';
import { SuccessModal, type SuccessModalRow } from './SuccessModal';
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

interface SuccessInfo {
  title: string;
  rows: SuccessModalRow[];
}

function buildSuccessSummary(appointment: AgendaAppointment, title: string): SuccessInfo {
  const dateStr = new Date(appointment.starts_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });
  const timeStr = new Date(appointment.starts_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
  return {
    title,
    rows: [
      { label: 'Cliente', value: appointment.client_name },
      { label: 'Procedimento(s)', value: appointment.service_title },
      { label: 'Data', value: dateStr },
      { label: 'Horário', value: timeStr },
    ],
  };
}

interface AgendaClientProps {
  slug: string;
  view: 'dia' | 'mes';
  selectedDate: string;
  todayStr: string;
  pendingAppointments: AgendaAppointment[];
  dayAppointments: AgendaAppointment[];
  monthDays: string[];
  monthAppointments: AgendaAppointment[];
  services: ManualBookingService[];
  businessHours: BusinessHoursConfigRow[];
  scheduleBlocks: ScheduleBlockConfigRow[];
}

export const AgendaClient: React.FC<AgendaClientProps> = ({
  slug,
  view,
  selectedDate,
  todayStr,
  pendingAppointments,
  dayAppointments,
  monthDays,
  monthAppointments,
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
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);
  // Recolhida por padrão — igual ao layout de referência (só o cabeçalho com
  // a contagem, expande ao tocar) — exceto quando a URL chega com
  // `#pendentes` (link do card "Aguardando confirmação" do Início), mesmo
  // padrão do `#assinatura` da Config.
  const [pendingOpen, setPendingOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);

  useEffect(() => {
    if (window.location.hash === '#pendentes') {
      setPendingOpen(true);
      document.getElementById('pendentes')?.scrollIntoView({ block: 'start' });
    }
  }, []);
  // Formulários abertos a partir da visão mensal não têm uma data óbvia
  // (`selectedDate` ali é só o dia 1 do mês, âncora da grade) — usam hoje
  // como padrão, que ela pode trocar no próprio formulário.
  const formDefaultDate = view === 'mes' ? todayStr : selectedDate;

  const patchStatus = async (appointment: AgendaAppointment, status: 'confirmed' | 'cancelled' | 'completed' | 'no_show') => {
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
      setSuccessInfo(buildSuccessSummary(appointment, 'Agendamento Cancelado'));
      router.refresh();
    } catch {
      setActionError('Falha na conexão.');
    } finally {
      setBusy(false);
    }
  };

  const handleComplete = async (appointment: AgendaAppointment) => {
    setBusy(true);
    setActionError(null);
    try {
      const json = await patchStatus(appointment, 'completed');
      if (!json.success) {
        setActionError(json.message || 'Não foi possível concluir o agendamento.');
        return;
      }
      setDetailAppointment(null);
      setSuccessInfo(buildSuccessSummary(appointment, 'Agendamento Concluído!'));
      router.refresh();
    } catch {
      setActionError('Falha na conexão.');
    } finally {
      setBusy(false);
    }
  };

  const handleNoShow = async (appointment: AgendaAppointment) => {
    setBusy(true);
    setActionError(null);
    try {
      const json = await patchStatus(appointment, 'no_show');
      if (!json.success) {
        setActionError(json.message || 'Não foi possível marcar a falta.');
        return;
      }
      setDetailAppointment(null);
      setSuccessInfo(buildSuccessSummary(appointment, 'Falta registrada'));
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
       *  seletor de visualização (Dia ou Mês, Fase 11 — sem semana, decisão
       *  já tomada antes). */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setManualPrefillTime(undefined);
            setShowManualForm((v) => !v);
            setShowBlockForm(false);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-sm font-bold shadow-sm transition-colors"
        >
          <CalendarPlus className="w-4 h-4" /> Novo
        </button>
        <button
          type="button"
          onClick={() => {
            setShowBlockForm((v) => !v);
            setShowManualForm(false);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-sm font-bold shadow-sm transition-colors"
        >
          <Lock className="w-4 h-4" /> Trancar
        </button>
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => setViewMenuOpen((v) => !v)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-sm font-bold shadow-sm transition-colors"
          >
            {view === 'mes' ? 'Mês' : 'Dia'}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${viewMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {viewMenuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setViewMenuOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-32 bg-surface rounded-lg shadow-lg border border-linen overflow-hidden z-30">
                <button
                  type="button"
                  onClick={() => {
                    setViewMenuOpen(false);
                    router.push(`/app/${slug}/agenda`);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                    view === 'dia' ? 'bg-rose-50 text-rose-600' : 'text-ink-soft hover:bg-cream'
                  }`}
                >
                  Dia
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMenuOpen(false);
                    router.push(`/app/${slug}/agenda?view=mes`);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                    view === 'mes' ? 'bg-rose-50 text-rose-600' : 'text-ink-soft hover:bg-cream'
                  }`}
                >
                  Mês
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Diferente do LashAgenda (que esconde o painel inteiro quando zera),
       *  aqui ele fica sempre visível com o contador em 0 — decisão do
       *  usuário, pra não sumir da tela sem explicação (Fase 9). */}
      <div id="pendentes" className="bg-surface border border-amber-200 rounded-2xl shadow-sm overflow-hidden">
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
            {pendingAppointments.length > 0 ? (
              pendingAppointments.map((a) => (
                <AppointmentRow key={a.id} appointment={a} onApprove={setApproveAppointment} onReject={setRejectAppointment} />
              ))
            ) : (
              <p className="px-5 py-4 text-[13px] text-ink-faint">Nenhum agendamento aguardando confirmação no momento.</p>
            )}
          </div>
        )}
      </div>

      {actionError && <p className="text-[13px] text-rose-600">{actionError}</p>}

      {showManualForm && (
        <ManualBookingForm
          slug={slug}
          services={services}
          defaultDate={formDefaultDate}
          defaultTime={manualPrefillTime}
          onClose={() => setShowManualForm(false)}
          onCreated={(summary) => {
            setShowManualForm(false);
            setSuccessInfo(summary);
            router.refresh();
          }}
        />
      )}

      {showBlockForm && (
        <BlockSlotForm
          slug={slug}
          defaultDate={formDefaultDate}
          onClose={() => setShowBlockForm(false)}
          onCreated={(summary) => {
            setShowBlockForm(false);
            setSuccessInfo(summary);
            router.refresh();
          }}
        />
      )}

      {view === 'mes' ? (
        <MonthCalendar
          monthDateStr={selectedDate}
          days={monthDays}
          todayStr={todayStr}
          appointments={monthAppointments}
          businessHours={businessHours}
          scheduleBlocks={scheduleBlocks}
          onDayClick={(dateStr) => router.push(`/app/${slug}/agenda?date=${dateStr}`)}
        />
      ) : (
        <DayTimeGrid
          dateStr={selectedDate}
          appointments={dayAppointments}
          businessHours={businessHours}
          scheduleBlocks={scheduleBlocks}
          onSlotClick={handleSlotClick}
          onAppointmentClick={setDetailAppointment}
        />
      )}

      {detailAppointment && (
        <AppointmentDetailSheet
          appointment={detailAppointment}
          busy={busy}
          onClose={() => setDetailAppointment(null)}
          onApprove={setApproveAppointment}
          onReject={setRejectAppointment}
          onCancelConfirmed={handleCancelConfirmed}
          onComplete={handleComplete}
          onNoShow={handleNoShow}
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
