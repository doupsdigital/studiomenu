'use client';

import Link from 'next/link';
import { LayoutGrid, ArrowRight, Palette, MessageCircle, ClipboardList, Gem, Target, Clapperboard } from 'lucide-react';

export default function AdminHubPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <header className="pb-6 border-b border-slate-800">
          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
            Studio<span className="text-rose-400 font-normal italic">Menu</span>{' '}
            <span className="text-slate-500 font-sans font-normal text-lg">· Admin</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Painel central de operação.</p>
        </header>

        {/* Grid de Ferramentas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/catalogos"
            className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all flex items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Catálogos & Pedidos</span>
              </div>
              <h2 className="font-bold text-white text-base">Catálogos</h2>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Administração, criação e edição dos catálogos das clientes.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          <Link
            href="/admin/showroom"
            className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all flex items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                <Palette className="w-3.5 h-3.5" />
                <span>Modelos & Vitrines</span>
              </div>
              <h2 className="font-bold text-white text-base">Showroom & Modelos Oficiais</h2>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Ambiente de testes interno e links de vitrine por nicho para enviar às leads.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          <Link
            href="/admin/scripts"
            className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all flex items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Vendas X1 & Scripts</span>
              </div>
              <h2 className="font-bold text-white text-base">Playbook de Vendas X1 WhatsApp</h2>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Abordagens, contorno de objeções e mensagens de 1 clique para copiar.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          <Link
            href="/admin/formularios"
            className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all flex items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Onboarding</span>
              </div>
              <h2 className="font-bold text-white text-base">Formulários</h2>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Formulário com boas-vindas e formulário direto para WhatsApp/X1.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          <Link
            href="/admin/paginas-vendas"
            className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all flex items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                <Gem className="w-3.5 h-3.5" />
                <span>Tráfego & Anúncios</span>
              </div>
              <h2 className="font-bold text-white text-base">Páginas de Vendas</h2>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                2 variantes de A/B test (Rosé / Nude &amp; Champagne) para tráfego pago.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          {/* Prospecção & CRM — destaque, era o item featured no painel original */}
          <Link
            href="/admin/prospeccao"
            className="group p-5 rounded-2xl border transition-all flex items-center justify-between gap-3 sm:col-span-2"
            style={{
              background: 'rgba(255, 77, 141, 0.08)',
              borderColor: 'rgba(255, 77, 141, 0.4)',
            }}
          >
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#ff4d8d' }}>
                <Target className="w-3.5 h-3.5" />
                <span>🔥 Prospecção & CRM</span>
              </div>
              <h2 className="font-bold text-white text-base">🎯 Painel de Prospecção & CRM</h2>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Gestão de abordagens, 1-clique copy e controle de leads.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all flex-shrink-0" style={{ color: '#ff4d8d' }} />
          </Link>

          <Link
            href="/admin/estudio-videos"
            className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all flex items-center justify-between gap-3 sm:col-span-2"
          >
            <div>
              <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                <Clapperboard className="w-3.5 h-3.5" />
                <span>Gravação de Criativos</span>
              </div>
              <h2 className="font-bold text-white text-base">Estúdio de Vídeos de Anúncios</h2>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Simulador com mockup de iPhone e troca de nicho para gravar Reels/TikTok.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>
        </div>
      </div>
    </main>
  );
}
