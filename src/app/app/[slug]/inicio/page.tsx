import React from 'react';
import { notFound } from 'next/navigation';
import { getOrderForProfessionalApp } from '@/lib/professional-app-service';
import { CopyLinkRow } from '@/components/app-shell/CopyLinkRow';
import { PlusUpsellCard } from '@/components/app-shell/PlusUpsellCard';
import { CheckCircle2 } from 'lucide-react';

interface InicioPageProps {
  params: Promise<{ slug: string }>;
}

export default async function InicioPage({ params }: InicioPageProps) {
  const { slug } = await params;
  const order = await getOrderForProfessionalApp(slug);

  if (!order) notFound();

  const isPlusAtivo = order.plan_tier === 'plus' && order.subscription_status === 'ativo';

  return (
    <main className="max-w-md mx-auto px-5 pt-8 pb-6">
      <p className="text-[10px] font-semibold tracking-widest uppercase text-rose-400 mb-1">Início</p>
      <h1 className="font-serif text-2xl font-bold mb-6">Olá, {order.client_name.split(' ')[0]}</h1>

      <div className="flex flex-col gap-3 mb-6">
        <CopyLinkRow label="Link de produção (pra cliente final)" path={`/c/${order.slug}`} />
        <CopyLinkRow label="Link de edição (só pra você)" path={`/c/${order.slug}?edit=${order.edit_token}`} />
      </div>

      {isPlusAtivo ? (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs text-emerald-300">
            StudioMenu+ ativo — sua agenda com horários reais está na aba <strong>Agenda</strong>.
          </p>
        </div>
      ) : (
        <PlusUpsellCard variant="card" />
      )}
    </main>
  );
}
