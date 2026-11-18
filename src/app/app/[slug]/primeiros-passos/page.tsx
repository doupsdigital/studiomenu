import { notFound, redirect } from 'next/navigation';
import { ListChecks } from 'lucide-react';
import { getOrderForProfessionalApp } from '@/lib/professional-app-service';
import { PageTitleBar } from '@/components/app-shell/PageTitleBar';
import { SelfServeChecklist } from '@/components/app-shell/SelfServeChecklist';

interface PrimeirosPassosPageProps {
  params: Promise<{ slug: string }>;
}

/** Checklist guiado de quem comprou pelo funil `/lash` (Cakto, 2026-11-18).
 *  É a primeira tela depois do pagamento (`/ativando` leva pra cá). A
 *  sessão já foi conferida pelo `layout.tsx` de `/app/[slug]`. */
export default async function PrimeirosPassosPage({ params }: PrimeirosPassosPageProps) {
  const { slug } = await params;
  const order = await getOrderForProfessionalApp(slug);

  if (!order) notFound();
  // Ainda é prévia / nunca pagou: não tem o que configurar.
  if (order.plan_tier === 'catalog') redirect(`/app/${slug}/inicio`);

  return (
    <>
      <PageTitleBar title="Primeiros passos" icon={<ListChecks className="w-5 h-5 text-ink-soft" />} slug={slug} />
      <main className="max-w-md mx-auto px-5 pt-6 pb-6 flex flex-col gap-4">
        <SelfServeChecklist
          slug={order.slug}
          name={order.client_name || order.studio_name || ''}
          whatsapp={order.whatsapp_number}
          hasAccount={Boolean(order.auth_user_id)}
          initialSteps={order.onboarding_steps}
        />
      </main>
    </>
  );
}
