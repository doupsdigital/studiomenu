import React from 'react';
import type { Metadata } from 'next';
import { isProfessionalRequestAuthorized } from '@/lib/professional-session';
import { getOrderForProfessionalApp } from '@/lib/professional-app-service';
import { getCatalogBySlug } from '@/lib/catalog-service';
import { PRODUCTION_DOMAIN } from '@/lib/public-url';
import { ServiceWorkerRegister } from '@/components/app-shell/ServiceWorkerRegister';
import { BottomNav } from '@/components/app-shell/BottomNav';
import { WelcomeOnboarding } from '@/components/app-shell/WelcomeOnboarding';

interface AppLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

/** Sobrescreve o manifest herdado da raiz (`start_url: '/'`, a landing page
 *  de vendas) pelo manifest dinâmico escopado desse catálogo — sem isso,
 *  instalar o PWA a partir de qualquer tela daqui abria a home de vendas
 *  depois de instalado, não o app da profissional.
 *
 *  Só devolve esse manifest quando a sessão é válida: sem isso, o Chrome
 *  considerava a tela de "link inválido" instalável e oferecia o app antes
 *  do login (achado testando no celular) — sem sessão, cai de volta no
 *  manifest raiz (inofensivo, é o mesmo já usado pela home de vendas).
 *
 *  Título/descrição/OG também precisam de override próprio aqui — sem isso,
 *  herdava o texto genérico da home de vendas ("StudioMenu — Catálogos
 *  Digitais de Alta Conversão..."), que é o que aparecia no preview do
 *  WhatsApp quando ela mandava o link do app pra cliente (bug real
 *  reportado, 2026-09-28). Não depende de sessão — o crawler do WhatsApp
 *  não necessariamente carrega o cookie ao seguir o redirect do link de
 *  login, e o nome do studio/foto de capa já são públicos mesmo (mesmos
 *  dados que aparecem no catálogo público dela). */
export async function generateMetadata({ params }: AppLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const [isAuthenticated, catalog] = await Promise.all([
    isProfessionalRequestAuthorized(slug),
    getCatalogBySlug(slug),
  ]);

  const base: Metadata = catalog
    ? {
        title: `${catalog.studio_name || catalog.client_name} — App StudioMenu`,
        description: 'Acesse seu catálogo digital e faça as edições que quiser, direto pelo celular.',
        openGraph: {
          title: `${catalog.studio_name || catalog.client_name} — App StudioMenu`,
          description: 'Acesse seu catálogo digital e faça as edições que quiser, direto pelo celular.',
          images: [
            {
              url: `https://${PRODUCTION_DOMAIN}/api/og/catalog/${slug}`,
              width: 1200,
              height: 630,
            },
          ],
          type: 'website',
        },
      }
    : {};

  if (!isAuthenticated) return base;
  return { ...base, manifest: `/app/${slug}/manifest.webmanifest` };
}

export default async function ProfessionalAppLayout({ children, params }: AppLayoutProps) {
  const { slug } = await params;
  const isAuthenticated = await isProfessionalRequestAuthorized(slug);

  if (!isAuthenticated) {
    return (
      <main className="pro-app-shell min-h-screen flex items-center justify-center p-6 bg-cream text-ink text-center">
        <div className="max-w-sm w-full p-8 rounded-3xl bg-surface border border-linen shadow-sm">
          <h1 className="font-serif-pro text-2xl font-bold mb-2">Link inválido ou expirado</h1>
          <p className="text-[13px] text-ink-soft leading-relaxed">
            Peça um novo link de acesso pra quem te enviou o catálogo.
          </p>
        </div>
      </main>
    );
  }

  // Sem BottomNav enquanto ela nunca assinou nada (`plan_tier === 'catalog'`)
  // — tela de primeiro contato deliberadamente simples, sem navegação pra
  // outras abas (Fase 19). Mesma leitura repetida que `config/page.tsx`/
  // `inicio/page.tsx` já fazem cada um pra si, custo desprezível.
  const order = await getOrderForProfessionalApp(slug);
  const showNav = order?.plan_tier !== 'catalog';

  return (
    <div className={`pro-app-shell min-h-screen bg-cream text-ink font-body-pro ${showNav ? 'pb-20' : ''}`}>
      <ServiceWorkerRegister />
      {/* Mesma condição do `showNav`: sem BottomNav (`plan_tier === 'catalog'`),
       *  não tem Agenda/Config pra esse boas-vindas citar — quem tá no
       *  `FirstContactScreen` só vê a tela de assinar mesmo. Checado direto
       *  em `order.plan_tier` (não via `showNav`) pro TS estreitar o tipo. */}
      {order && order.plan_tier !== 'catalog' && <WelcomeOnboarding slug={slug} planTier={order.plan_tier} />}
      {children}
      {showNav && <BottomNav slug={slug} />}
    </div>
  );
}
