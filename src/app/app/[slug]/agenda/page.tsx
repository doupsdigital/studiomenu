import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getOrderForProfessionalApp } from '@/lib/professional-app-service';
import { getAppointmentsForDay, getPendingAppointments, getManualBookingServices } from '@/lib/scheduling/agenda-service';
import { PlusUpsellCard } from '@/components/app-shell/PlusUpsellCard';
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

  const [pendingAppointments, dayAppointmentsRaw, services] = await Promise.all([
    getPendingAppointments(order.id),
    getAppointmentsForDay(order.id, selectedDate),
    getManualBookingServices(order.id),
  ]);

  // "Aguardando confirmação" já mostra os pendentes (de qualquer dia) no topo
  // da tela — se um deles cair no dia visualizado, `getAppointmentsForDay`
  // também o devolve (só exclui cancelados), e ele apareceria duplicado.
  // Tira da lista do dia qualquer item que já esteja na fila de pendentes.
  const pendingIds = new Set(pendingAppointments.map((a) => a.id));
  const dayAppointments = dayAppointmentsRaw.filter((a) => !pendingIds.has(a.id));

  return (
    <main className="max-w-md mx-auto px-5 pt-8 pb-6">
      <p className="text-[10px] font-semibold tracking-widest uppercase text-rose-400 mb-1">Agenda</p>

      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/app/${slug}/agenda?date=${shiftDate(selectedDate, -1)}`}
          className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div className="text-center">
          <h1 className="font-serif text-lg font-bold">{formatDateLabel(selectedDate)}</h1>
          {selectedDate !== todayInSaoPaulo() && (
            <Link href={`/app/${slug}/agenda`} className="text-[10px] text-rose-400 font-bold uppercase tracking-wide">
              Voltar pra hoje
            </Link>
          )}
        </div>
        <Link
          href={`/app/${slug}/agenda?date=${shiftDate(selectedDate, 1)}`}
          className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <AgendaClient
        slug={slug}
        selectedDate={selectedDate}
        pendingAppointments={pendingAppointments}
        dayAppointments={dayAppointments}
        services={services}
      />
    </main>
  );
}
