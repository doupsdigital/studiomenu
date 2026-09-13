import { notFound } from 'next/navigation';
import { getOrderForProfessionalApp } from '@/lib/professional-app-service';
import { getBusinessHours, getScheduleBlocks } from '@/lib/scheduling/config-service';
import { BusinessHoursEditor } from '@/components/config/BusinessHoursEditor';
import { ScheduleBlocksManager } from '@/components/config/ScheduleBlocksManager';
import { SubscriptionSection } from '@/components/config/SubscriptionSection';

interface ConfigPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ConfigPage({ params }: ConfigPageProps) {
  const { slug } = await params;
  const order = await getOrderForProfessionalApp(slug);

  if (!order) notFound();

  const [businessHours, scheduleBlocks] = await Promise.all([
    getBusinessHours(order.id),
    getScheduleBlocks(order.id),
  ]);

  return (
    <main className="max-w-md mx-auto px-5 pt-8 pb-6 flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-semibold tracking-widest uppercase text-rose-400 mb-1">Config</p>
        <h1 className="font-serif text-2xl font-bold">Configurações</h1>
      </div>

      <BusinessHoursEditor slug={slug} initialHours={businessHours} />
      <ScheduleBlocksManager slug={slug} blocks={scheduleBlocks} />

      <div id="assinatura">
        <SubscriptionSection
          slug={slug}
          planTier={order.plan_tier}
          subscriptionStatus={order.subscription_status}
          billingEmail={order.billing_email}
          billingCpfCnpj={order.billing_cpf_cnpj}
        />
      </div>
    </main>
  );
}
