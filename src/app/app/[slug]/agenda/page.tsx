import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getOrderForProfessionalApp } from '@/lib/professional-app-service';
import { getAppointmentsForDay, getPendingAppointments, getManualBookingServices } from '@/lib/scheduling/agenda-service';
import { getBusinessHours, getScheduleBlocks } from '@/lib/scheduling/config-service';
import { PlusUpsellCard } from '@/components/app-shell/PlusUpsellCard';
import { GradientHeader } from '@/components/app-shell/GradientHeader';
import { PageTitleBar } from '@/components/app-shell/PageTitleBar';
import { AgendaClient } from '@/components/agenda/AgendaClient';

interface AgendaPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string }>;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function todayInSaoPaulo(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

function shiftDate(dateStr: string, days: number): string {
  const anchor = new Date(`${dateStr}T12:00:00Z`);
  anchor.setUTCDate(anchor.getUTCDate() + days);
  return anchor.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

/** Versão curta (sem dia da semana) pro subtítulo do banner gradiente —
 *  "14 de setembro de 2026", igual ao layout de referência. O dia da semana
 *  por extenso já aparece no cabeçalho da própria grade, logo abaixo. */
function formatShortDateLabel(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  });
}

export default async function AgendaPage({ params, searchParams }: AgendaPageProps) {
  const { slug } = await params;
  const { date } = await searchParams;
  const order = await getOrderForProfessionalApp(slug);

  if (!order) notFound();

  // A Agenda é liberada por `booking_enabled` (o que de fato diz se o
  // agendamento automático está ligado pro cliente final), não pelo status
  // do Plus diretamente — o admin pode ligar `booking_enabled` manualmente
  // num catálogo que não é Plus (Fase 6, via de escape pra teste/período
  // promocional), e nesse caso a profissional precisa conseguir gerenciar
  // os agendamentos reais que os clientes estão criando, mesmo sem assinar.
  if (!order.booking_enabled) {
    return (
      <>
        <PageTitleBar title="Agenda" icon={Calendar} />
        <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <PlusUpsellCard variant="full" slug={slug} />
        </main>
      </>
    );
  }

  const selectedDate = date && DATE_RE.test(date) ? date : todayInSaoPaulo();

  const [pendingAppointments, dayAppointments, services, businessHours, scheduleBlocks] = await Promise.all([
    getPendingAppointments(order.id),
    getAppointmentsForDay(order.id, selectedDate),
    getManualBookingServices(order.id),
    getBusinessHours(order.id),
    getScheduleBlocks(order.id),
  ]);

  return (
    <>
      <PageTitleBar title="Agenda" icon={Calendar} />
      <main className="max-w-md mx-auto px-5 pt-6 pb-6 flex flex-col gap-5">
      <GradientHeader showSparkles={false}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-serif-pro font-bold text-2xl leading-tight">Agenda</h1>
            <p className="text-sm text-white/80 mt-0.5 truncate">{formatShortDateLabel(selectedDate)}</p>
          </div>
          <div className="flex items-center bg-white/15 backdrop-blur-sm rounded-lg p-0.5 border border-white/20 shrink-0">
            <Link
              href={`/app/${slug}/agenda?date=${shiftDate(selectedDate, -1)}`}
              className="p-2 hover:bg-white/20 rounded-md transition-colors text-white/80 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <Link
              href={`/app/${slug}/agenda`}
              className="px-3 py-1.5 text-xs font-semibold hover:bg-white/20 rounded-md transition-colors text-white/80 hover:text-white"
            >
              Hoje
            </Link>
            <Link
              href={`/app/${slug}/agenda?date=${shiftDate(selectedDate, 1)}`}
              className="p-2 hover:bg-white/20 rounded-md transition-colors text-white/80 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </GradientHeader>

      <AgendaClient
        slug={slug}
        selectedDate={selectedDate}
        pendingAppointments={pendingAppointments}
        dayAppointments={dayAppointments}
        services={services}
        businessHours={businessHours}
        scheduleBlocks={scheduleBlocks}
      />
      </main>
    </>
  );
}
