import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Zap, Smartphone, Layers } from 'lucide-react';

export default function StudioMenuLandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-rose-500 selection:text-white font-sans">
      {/* Navbar Superior */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
            Studio<span className="text-rose-400 font-normal italic">Menu</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/c/demo"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-all hidden sm:block"
            >
              Ver Demonstração
            </Link>
            <Link
              href="/form"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:opacity-95 text-white text-xs font-bold tracking-wider uppercase shadow-lg shadow-rose-500/20 transition-all flex items-center gap-1.5"
            >
              <span>Criar Meu Catálogo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Principal */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        {/* Glow Effects no Fundo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>A Plataforma #1 de Catálogos Digitais de Alta Conversão</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-white max-w-3xl mx-auto">
            Transforme seus procedimentos em um{' '}
            <span className="bg-gradient-to-r from-rose-400 via-rose-300 to-amber-300 bg-clip-text text-transparent italic">
              Catálogo Digital Interativo
            </span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Feito sob medida para **Lash Designers, Nail Designers, Clínicas de Estética e Estúdios de Beleza**. Apresentação impecável, valores claros e agendamento direto pelo WhatsApp.
          </p>

          {/* Botões CTA Hero */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/form"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-rose-500 text-white font-bold text-sm tracking-wider uppercase shadow-xl shadow-rose-500/25 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <span>PERSONALIZAR MEU CATÁLOGO AGORA</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/c/demo"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-rose-400" />
              <span>Testar Demonstração ao Vivo</span>
            </Link>
          </div>

          {/* Selos de Confiança */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-slate-400 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Pronto em 5 minutos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Sem mensalidades ocultas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Link exclusivo de alta conversão</span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Recursos e Benefícios */}
      <section className="py-16 bg-slate-900/60 border-t border-b border-slate-800/80 relative">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-serif text-3xl font-bold text-white mb-2">
              Por que os melhores estúdios usam o StudioMenu?
            </h2>
            <p className="text-xs text-slate-400">
              Tudo o que seu negócio precisa para transmitir autoridade e converter seguidores em clientes pagantes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white">Multi-Nicho & Flexível</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Adapta-se perfeitamente a Lash, Nails, Estética Facial/Corporal ou estúdios com múltiplos procedimentos.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white">Preview Perfeito no WhatsApp</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ao enviar seu link pelo WhatsApp, sua foto de capa e nome aparecem automaticamente na prévia do link.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white">Agendamento Direto em 1 Clique</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A cliente escolhe o procedimento no catálogo e vai direto para o seu WhatsApp com a mensagem pronta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Simples */}
      <footer className="py-8 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>© 2026 StudioMenu (`studiomenu.art`). Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
