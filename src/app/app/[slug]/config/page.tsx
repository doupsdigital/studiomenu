import { notFound } from 'next/navigation';
import { getOrderForProfessionalApp } from '@/lib/professional-app-service';
import { getBusinessHours, getScheduleBlocks } from '@/lib/scheduling/config-service';
import { ConfigAccordion } from '@/components/config/ConfigAccordion';

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
    <main className="max-w-md mx-auto px-5 pt-6 pb-6 flex flex-col gap-5">
      <h1 className="font-serif-pro text-2xl font-bold text-ink">Configurações</h1>

      <ConfigAccordion
        slug={slug}
        businessHours={businessHours}
        scheduleBlocks={scheduleBlocks}
        planTier={order.plan_tier}
        subscriptionStatus={order.subscription_status}
        billingEmail={order.billing_email}
        billingCpfCnpj={order.billing_cpf_cnpj}
      />
    </main>
  );
}
