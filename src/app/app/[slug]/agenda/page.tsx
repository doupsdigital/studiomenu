import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getOrderForProfessionalApp } from '@/lib/professional-app-service';
import { getAppointmentsForDay, getPendingAppointments, getManualBookingServices } from '@/lib/scheduling/agenda-service';
import { getBusinessHours, getScheduleBlocks } from '@/lib/scheduling/config-service';
import { PlusUpsellCard } from '@/components/app-shell/PlusUpsellCard';
import { GradientHeader } from '@/components/app-shell/GradientHeader';
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

function formatDateLabel(dateStr: string): string {
  const label = new Date(`${dateStr}T12:00:00Z`).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    timeZone: 'America/Sao_Paulo',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
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
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <PlusUpsellCard variant="full" slug={slug} />
      </main>
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
    <main className="max-w-md mx-auto px-5 pt-6 pb-6 flex flex-col gap-5">
      <GradientHeader>
        <p className="font-serif-pro text-lg font-bold capitalize text-center leading-snug">{formatDateLabel(selectedDate)}</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <Link
            href={`/app/${slug}/agenda?date=${shiftDate(selectedDate, -1)}`}
            className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          {selectedDate !== todayInSaoPaulo() ? (
            <Link
              href={`/app/${slug}/agenda`}
              className="px-3 py-1.5 rounded-full bg-white/15 text-[11px] text-white font-bold uppercase tracking-wide"
            >
              Voltar pra hoje
            </Link>
          ) : (
            <span className="px-3 py-1.5 rounded-full bg-white/10 text-[11px] text-white/70 font-bold uppercase tracking-wide">
              Hoje
            </span>
          )}
          <Link
            href={`/app/${slug}/agenda?date=${shiftDate(selectedDate, 1)}`}
            className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
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
  );
}
