import { notFound } from 'next/navigation';
import { getOrderForProfessionalApp } from '@/lib/professional-app-service';
import { PlusUpsellCard } from '@/components/app-shell/PlusUpsellCard';
import { CalendarClock } from 'lucide-react';

interface AgendaPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AgendaPage({ params }: AgendaPageProps) {
  const { slug } = await params;
  const order = await getOrderForProfessionalApp(slug);

  if (!order) notFound();

  const isPlusAtivo = order.plan_tier === 'plus' && order.subscription_status === 'ativo';

  if (!isPlusAtivo) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <PlusUpsellCard variant="full" />
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-5 pt-8 pb-6 flex flex-col items-center text-center min-h-[calc(100vh-8rem)] justify-center">
      <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-3">
        <CalendarClock className="w-6 h-6" />
      </div>
      <h1 className="font-serif text-xl font-bold mb-2">Agenda chega na próxima etapa</h1>
      <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
        A visão do dia, a fila de agendamentos aguardando confirmação e o bloqueio de horários estão em construção.
      </p>
    </main>
  );
}
