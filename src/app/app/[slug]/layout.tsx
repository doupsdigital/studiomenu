import React from 'react';
import type { Metadata } from 'next';
import { isProfessionalRequestAuthorized } from '@/lib/professional-session';
import { ServiceWorkerRegister } from '@/components/app-shell/ServiceWorkerRegister';
import { BottomNav } from '@/components/app-shell/BottomNav';

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
 *  manifest raiz (inofensivo, é o mesmo já usado pela home de vendas). */
export async function generateMetadata({ params }: AppLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const isAuthenticated = await isProfessionalRequestAuthorized(slug);
  if (!isAuthenticated) return {};
  return { manifest: `/app/${slug}/manifest.webmanifest` };
}

export default async function ProfessionalAppLayout({ children, params }: AppLayoutProps) {
  const { slug } = await params;
  const isAuthenticated = await isProfessionalRequestAuthorized(slug);

  if (!isAuthenticated) {
    return (
      <main className="pro-app-shell min-h-screen flex items-center justify-center p-6 bg-cream text-ink text-center">
        <div className="max-w-sm w-full p-8 rounded-3xl bg-surface border border-linen shadow-sm">
          <h1 className="font-serif-pro text-2xl font-bold mb-2">Link inválido ou expirado</h1>
          <p className="text-xs text-ink-soft leading-relaxed">
            Peça um novo link de acesso pra quem te enviou o catálogo.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="pro-app-shell min-h-screen bg-cream text-ink font-body-pro pb-20">
      <ServiceWorkerRegister />
      {children}
      <BottomNav slug={slug} />
    </div>
  );
}
