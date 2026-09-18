import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getOrderForProfessionalApp } from '@/lib/professional-app-service';
import { getAppointmentsForDay, getAppointmentsForRange, getPendingAppointments, getManualBookingServices } from '@/lib/scheduling/agenda-service';
import { getBusinessHours, getScheduleBlocks } from '@/lib/scheduling/config-service';
import { getWeekdayForDate } from '@/lib/scheduling/availability';
import { PlusUpsellCard } from '@/components/app-shell/PlusUpsellCard';
import { GradientHeader } from '@/components/app-shell/GradientHeader';
import { PageTitleBar } from '@/components/app-shell/PageTitleBar';
import { AgendaClient } from '@/components/agenda/AgendaClient';

interface AgendaPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string; view?: string }>;
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

function firstOfMonth(dateStr: string): string {
  return `${dateStr.slice(0, 7)}-01`;
}

/** Desloca `dateStr` (dia 1 de um mês) por `months` meses — sempre devolve
 *  o dia 1 do mês resultante, pra não ter que lidar com meses de tamanhos
 *  diferentes (a visão mensal só usa isso como âncora, nunca como data de
 *  agendamento de verdade). */
function shiftMonth(dateStr: string, months: number): string {
  const [year, month] = dateStr.split('-').map(Number);
  const anchor = new Date(Date.UTC(year, month - 1 + months, 1));
  return `${anchor.getUTCFullYear()}-${String(anchor.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

/** As 42 datas da grade mensal (6 semanas completas, domingo a sábado),
 *  incluindo os dias de borda dos meses vizinhos. */
function getMonthGridDays(monthDateStr: string): string[] {
  const start = firstOfMonth(monthDateStr);
  const startWeekday = getWeekdayForDate(start);
  const gridStart = shiftDate(start, -startWeekday);
  return Array.from({ length: 42 }, (_, i) => shiftDate(gridStart, i));
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

/** Dia da semana por extenso, capitalizado ("Terça-feira") — usado como
 *  título do banner na visão Dia, no lugar de repetir "Agenda" (já escrito
 *  na barra de título logo acima). */
function formatWeekdayLabel(dateStr: string): string {
  const label = new Date(`${dateStr}T12:00:00Z`).toLocaleDateString('pt-BR', {
    weekday: 'long',
    timeZone: 'America/Sao_Paulo',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatMonthLabel(dateStr: string): string {
  const label = new Date(`${dateStr}T12:00:00Z`).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default async function AgendaPage({ params, searchParams }: AgendaPageProps) {
  const { slug } = await params;
  const { date, view: viewParam } = await searchParams;
  const order = await getOrderForProfessionalApp(slug);

  if (!order) notFound();

  // A Agenda é liberada por `booking_enabled` (o que de fato diz se o
  // agendamento automático está ligado pro cliente final), não pelo status
  // do Plus diretamente — o admin pode ligar `booking_enabled` manualmente
  // num catálogo que não é Plus (Fase 6, via de escape pra teste/período
  // promocional), e nesse caso a profissional precisa conseguir gerenciar
  // os agendamentos reais que os clientes estão criando, mesmo sem assinar.
  //
  // Sem `booking_enabled`, a tela continua sendo montada por inteiro (dados
  // reais, geralmente vazios já que ninguém pôde agendar ainda) — só entra
  // desfocada/travada atrás do card de assinar, em vez de um upsell isolado
  // numa tela em branco (Fase 20, dá pra "ver" o produto antes de comprar).
  const bookingEnabled = order.booking_enabled;

  const view: 'dia' | 'mes' = viewParam === 'mes' ? 'mes' : 'dia';
  const rawDate = date && DATE_RE.test(date) ? date : todayInSaoPaulo();
  // Na visão mensal a data selecionada é sempre o dia 1 do mês exibido — só
  // serve de âncora pra grade e pra navegação de mês anterior/seguinte, não
  // é uma data de agendamento de verdade (isso os formulários resolvem com
  // `todayStr` como padrão nesse modo, ver AgendaClient).
  const selectedDate = view === 'mes' ? firstOfMonth(rawDate) : rawDate;
  const todayStr = todayInSaoPaulo();
  const monthDays = view === 'mes' ? getMonthGridDays(selectedDate) : [];

  // Uma única rodada com todas as 6 consultas em paralelo — antes eram 2
  // rodadas sequenciais (a segunda esperava a primeira terminar) sem
  // nenhuma dependência real entre elas (nenhuma usa o resultado da
  // outra, só `order.id`/`selectedDate`/`view`, já conhecidos aqui). Cada
  // rodada a mais custa uma ida-e-volta inteira ao banco — sensível com
  // Vercel (Virgínia) e Supabase (São Paulo) em regiões diferentes.
  const [pendingAppointments, services, businessHours, scheduleBlocks, dayAppointments, monthAppointments] =
    await Promise.all([
      getPendingAppointments(order.id),
      getManualBookingServices(order.id),
      getBusinessHours(order.id),
      getScheduleBlocks(order.id),
      view === 'dia' ? getAppointmentsForDay(order.id, selectedDate) : Promise.resolve([]),
      view === 'mes' ? getAppointmentsForRange(order.id, monthDays[0], shiftDate(monthDays[41], 1)) : Promise.resolve([]),
    ]);

  const prevHref =
    view === 'mes'
      ? `/app/${slug}/agenda?view=mes&date=${shiftMonth(selectedDate, -1)}`
      : `/app/${slug}/agenda?date=${shiftDate(selectedDate, -1)}`;
  const nextHref =
    view === 'mes'
      ? `/app/${slug}/agenda?view=mes&date=${shiftMonth(selectedDate, 1)}`
      : `/app/${slug}/agenda?date=${shiftDate(selectedDate, 1)}`;
  const todayHref = view === 'mes' ? `/app/${slug}/agenda?view=mes` : `/app/${slug}/agenda`;
  // Visão Mês: sem "Agenda" (redundante com a barra de título) nem subtítulo
  // — só o mês/ano, maior, no lugar do título. Visão Dia inalterada (dia da
  // semana + data completa embaixo).
  const headerTitle = view === 'mes' ? formatMonthLabel(selectedDate) : formatWeekdayLabel(selectedDate);
  const headerSubtitle = view === 'mes' ? null : formatShortDateLabel(selectedDate);

  return (
    <>
      <PageTitleBar title="Agenda" icon={<Calendar className="w-5 h-5 text-ink-soft" />} slug={slug} />
      <main className="relative max-w-md mx-auto px-5 pt-6 pb-6 flex flex-col gap-5">
      <div className={bookingEnabled ? 'flex flex-col gap-5' : 'flex flex-col gap-5 pointer-events-none select-none blur-sm opacity-60'}>
        <GradientHeader showSparkles={false}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-serif-pro font-bold text-2xl leading-tight">{headerTitle}</h1>
              {headerSubtitle && <p className="text-sm text-white/80 mt-0.5 truncate">{headerSubtitle}</p>}
            </div>
            <div data-tour="agenda-date-nav" className="flex items-center bg-white/15 backdrop-blur-sm rounded-lg p-0.5 border border-white/20 shrink-0">
              <Link
                href={prevHref}
                className="p-2 hover:bg-white/20 rounded-md transition-colors text-white/80 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <Link
                href={todayHref}
                className="px-3 py-1.5 text-[13px] font-semibold hover:bg-white/20 rounded-md transition-colors text-white/80 hover:text-white"
              >
                Hoje
              </Link>
              <Link
                href={nextHref}
                className="p-2 hover:bg-white/20 rounded-md transition-colors text-white/80 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </GradientHeader>

        <AgendaClient
          slug={slug}
          view={view}
          selectedDate={selectedDate}
          todayStr={todayStr}
          pendingAppointments={pendingAppointments}
          dayAppointments={dayAppointments}
          monthDays={monthDays}
          monthAppointments={monthAppointments}
          services={services}
          businessHours={businessHours}
          scheduleBlocks={scheduleBlocks}
          bookingEnabled={bookingEnabled}
        />
      </div>

      {!bookingEnabled && (
        // `fixed` (não `absolute`) de propósito — a grade de horários
        // desfocada atrás pode ficar bem mais alta que a tela (sem
        // expediente configurado ainda, a grade cai no intervalo padrão
        // 8h-20h inteiro), e `absolute inset-0` centralizava em relação a
        // essa altura toda, jogando o card pra baixo da área visível
        // (achado testando de verdade). `fixed` centraliza sempre na tela
        // que está à vista, e os insets de 60px/68px deixam o card livre da
        // barra de título e do menu inferior (ambos fixos também).
        <div className="fixed top-[60px] bottom-[68px] left-0 right-0 z-20 flex items-center justify-center px-5">
          <PlusUpsellCard variant="full" slug={slug} />
        </div>
      )}
      </main>
    </>
  );
}
