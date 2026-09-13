import React from 'react';
import { isProfessionalRequestAuthorized } from '@/lib/professional-session';
import { ServiceWorkerRegister } from '@/components/app-shell/ServiceWorkerRegister';
import { BottomNav } from '@/components/app-shell/BottomNav';

interface AppLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function ProfessionalAppLayout({ children, params }: AppLayoutProps) {
  const { slug } = await params;
  const isAuthenticated = await isProfessionalRequestAuthorized(slug);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-white text-center">
        <div className="max-w-sm w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
          <h1 className="font-serif text-2xl font-bold mb-2">Link inválido ou expirado</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Peça um novo link de acesso pra quem te enviou o catálogo.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <ServiceWorkerRegister />
      {children}
      <BottomNav slug={slug} />
    </div>
  );
}
