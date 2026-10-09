'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutGrid, ArrowRight, Palette, MessageCircle, ClipboardList, Gem, Target, Clapperboard, Sparkles, LogOut, Megaphone } from 'lucide-react';

export default function AdminHubPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' });
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-5 md:p-10">
      <div className="max-w-4xl mx-auto space-y-7">
        {/* Header */}
        <header className="pb-7 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">
              Studio<span className="text-rose-400 font-normal italic">Menu</span>{' '}
              <span className="text-slate-500 font-sans font-normal text-xl">· Admin</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1.5">Painel central de operação.</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all flex-shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </header>

        {/* Grid de Ferramentas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/catalogos"
            className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all flex items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
                <LayoutGrid className="w-4 h-4" />
                <span>Catálogos & Pedidos</span>
              </div>
              <h2 className="font-bold text-white text-xl">Catálogos</h2>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Administração, criação e edição dos catálogos das clientes.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          <Link
            href="/admin/criar-com-ia"
            className="group p-6 rounded-2xl border transition-all flex items-center justify-between gap-3"
            style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.35)' }}
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#10b981' }}>
                <Sparkles className="w-4 h-4" />
                <span>Criação Automática</span>
              </div>
              <h2 className="font-bold text-white text-xl">🤖 Criar Catálogo com IA</h2>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Envie a foto de capa e o print/PDF de preços — a IA monta o catálogo pra você revisar.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-all flex-shrink-0" style={{ color: '#10b981' }} />
          </Link>

          <Link
            href="/admin/showroom"
            className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all flex items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Palette className="w-4 h-4" />
                <span>Modelos & Vitrines</span>
              </div>
              <h2 className="font-bold text-white text-xl">Showroom & Modelos Oficiais</h2>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Ambiente de testes interno e links de vitrine por nicho para enviar às leads.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          <Link
            href="/admin/scripts"
            className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all flex items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <MessageCircle className="w-4 h-4" />
                <span>Vendas X1 & Scripts</span>
              </div>
              <h2 className="font-bold text-white text-xl">Playbook de Vendas X1 WhatsApp</h2>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Abordagens, contorno de objeções e mensagens de 1 clique para copiar.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          {/* Destaque para Funil - ADS */}
          <Link
            href="/admin/funil-ads"
            className="group p-6 rounded-2xl border transition-all flex items-center justify-between gap-3 sm:col-span-2"
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              borderColor: 'rgba(245, 158, 11, 0.35)',
            }}
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2 text-amber-400">
                <Megaphone className="w-4 h-4" />
                <span>Tráfego Pago · Meta Ads</span>
              </div>
              <h2 className="font-bold text-white text-xl">🚀 Funil - ADS</h2>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Funis de conversão WhatsApp X1 completos de 1 clique para os leads que chegam dos Anúncios de Vídeo e Imagem.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          {/* Destaque para Funil - ADS 2.0 (nova estratégia, mensagens revisadas) */}
          <Link
            href="/admin/funil-ads-2"
            className="group p-6 rounded-2xl border transition-all flex items-center justify-between gap-3 sm:col-span-2"
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              borderColor: 'rgba(245, 158, 11, 0.35)',
            }}
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2 text-amber-400">
                <Megaphone className="w-4 h-4" />
                <span>Tráfego Pago · Meta Ads</span>
              </div>
              <h2 className="font-bold text-white text-xl">🚀 Funil - ADS 2.0</h2>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Nova estratégia com funis (Principal, PDF, Criar Desejo) e respostas prontas para objeções.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          {/* Destaque para Funil - ADS 3.0 (lead já chega pela Landing Page pedindo o plano) */}
          <Link
            href="/admin/funil-ads-3"
            className="group p-6 rounded-2xl border transition-all flex items-center justify-between gap-3 sm:col-span-2"
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              borderColor: 'rgba(245, 158, 11, 0.35)',
            }}
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2 text-amber-400">
                <Megaphone className="w-4 h-4" />
                <span>Tráfego Pago · Meta Ads</span>
              </div>
              <h2 className="font-bold text-white text-xl">🚀 Funil - ADS 3.0</h2>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Lead já chega pela Landing Page pedindo o plano: 4 funis de entrega + mensagem pra lead morna
                (catálogo pronto sem ela pedir) + 5 abordagens frias pra quem já usa catálogo informal.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          <Link
            href="/admin/formularios"
            className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all flex items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
                <ClipboardList className="w-4 h-4" />
                <span>Onboarding</span>
              </div>
              <h2 className="font-bold text-white text-xl">Formulários</h2>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Formulário com boas-vindas e formulário direto para WhatsApp/X1.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          <Link
            href="/admin/paginas-vendas"
            className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all flex items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Gem className="w-4 h-4" />
                <span>Tráfego & Anúncios</span>
              </div>
              <h2 className="font-bold text-white text-xl">Páginas de Vendas</h2>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                2 variantes de A/B test (Rosé / Nude &amp; Champagne) para tráfego pago.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          {/* Prospecção & CRM */}
          <Link
            href="/admin/prospeccao"
            className="group p-6 rounded-2xl border transition-all flex items-center justify-between gap-3 sm:col-span-2"
            style={{
              background: 'rgba(255, 77, 141, 0.08)',
              borderColor: 'rgba(255, 77, 141, 0.4)',
            }}
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#ff4d8d' }}>
                <Target className="w-4 h-4" />
                <span>🔥 Prospecção & CRM</span>
              </div>
              <h2 className="font-bold text-white text-xl">🎯 Painel de Prospecção & CRM</h2>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Gestão de abordagens, 1-clique copy e controle de leads.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-all flex-shrink-0" style={{ color: '#ff4d8d' }} />
          </Link>

          <Link
            href="/admin/estudio-videos"
            className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all flex items-center justify-between gap-3 sm:col-span-2"
          >
            <div>
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Clapperboard className="w-4 h-4" />
                <span>Gravação de Criativos</span>
              </div>
              <h2 className="font-bold text-white text-xl">Estúdio de Vídeos de Anúncios</h2>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Simulador com mockup de iPhone e troca de nicho para gravar Reels/TikTok.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>
        </div>
      </div>
    </main>
  );
}
