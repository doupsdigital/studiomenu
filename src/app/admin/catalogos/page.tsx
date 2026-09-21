'use client';

import { useEffect, useState } from 'react';
import { CatalogOrderData } from '@/types/catalog';
import { normalizeWhatsappBR } from '@/lib/format';
import Link from 'next/link';
import { ArrowLeft, Sparkles, ExternalLink, Search, RefreshCw, Scissors, Plus, Trash2, MessageCircle, Phone, Clock, Smartphone, CalendarClock, Globe } from 'lucide-react';
import { usesSubdomainRouting, PRODUCTION_DOMAIN } from '@/lib/public-url';

/** Campos de billing/agendamento não fazem parte do shape público do
 *  catálogo (`CatalogOrderData`) — extensão só local, pro admin. */
type AdminCatalog = CatalogOrderData & {
  plan_tier?: 'catalog' | 'basico' | 'plus';
  subscription_status?: 'none' | 'ativo' | 'suspenso' | 'cancelado';
};

export default function AdminCatalogosPage() {
  const [catalogs, setCatalogs] = useState<AdminCatalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [catalogToDelete, setCatalogToDelete] = useState<AdminCatalog | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchCatalogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/catalogs-list', {
        credentials: 'same-origin',
      });
      const result = await res.json();
      if (result.success) {
        setCatalogs(result.catalogs as AdminCatalog[]);
      } else {
        console.error('Erro ao buscar catálogos:', result.message);
        showToast('❌ Erro ao buscar catálogos.');
      }
    } catch (err) {
      console.error('Erro ao buscar catálogos:', err);
      showToast('❌ Erro ao buscar catálogos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogs();
  }, []);

  const filteredCatalogs = catalogs.filter(
    (c) =>
      c.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.studio_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteCatalog = async (id?: string) => {
    if (!id) return;
    try {
      const res = await fetch('/api/admin/catalog-actions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (!result.success) {
        showToast('❌ Erro ao excluir catálogo.');
        return;
      }
      fetchCatalogs();
    } catch (e) {
      console.error('Erro ao excluir catálogo:', e);
      showToast('❌ Erro ao excluir catálogo.');
    } finally {
      setCatalogToDelete(null);
    }
  };

  const approveAndDeliver = async (item: AdminCatalog) => {
    if (!item.id) return;
    try {
      const res = await fetch('/api/admin/catalog-actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id: item.id, status: 'aprovado' }),
      });
      const result = await res.json();
      if (!result.success) {
        console.error('Erro ao aprovar catálogo:', result.message);
        showToast('❌ Erro ao aprovar catálogo.');
        return;
      }
      fetchCatalogs();
    } catch (e) {
      console.error('Erro ao aprovar catálogo:', e);
      showToast('❌ Erro ao aprovar catálogo.');
    }
  };

  const buildDeliveryWhatsappUrl = (item: AdminCatalog) => {
    const cleanPhone = normalizeWhatsappBR(item.whatsapp_number);
    const firstName = (item.client_name || '').split(' ')[0];
    const links = buildProfessionalLinks(item);
    const message = `Olá, ${firstName}! ✨\n\nSeu catálogo digital oficial StudioMenu está pronto, calibrado e no ar! 🚀\n\n🔗 *Seu Link Exclusivo:*\n👉 ${links.official}\n\n📌 *O que fazer agora:*\n1. Abra o link no seu celular e confira seu catálogo completo.\n2. Coloque este link na bio do seu Instagram e no seu perfil do WhatsApp Business.\n3. Comece a enviar para suas clientes no momento do agendamento!\n\nQualquer dúvida ou ajuste que precisar, nossa equipe está à sua inteira disposição. Parabéns pelo seu novo posicionamento! 💖✨`;
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
  };

  /** Segunda mensagem, enviada separada da entrega do catálogo: apresenta o
   *  app dela (o Link do App abre a tela de primeiro contato, com dicas). */
  const buildAppWhatsappUrl = (item: AdminCatalog) => {
    const cleanPhone = normalizeWhatsappBR(item.whatsapp_number);
    const firstName = (item.client_name || '').split(' ')[0];
    const links = buildProfessionalLinks(item);
    const message = `Oi, ${firstName}! ✨\n\nAgora quero te apresentar o *app do seu StudioMenu* 📱\n\nÉ por ele que você:\n• vê e compartilha o link do seu catálogo\n• edita fotos, serviços e preços quando quiser, sem depender de ninguém\n• assina o plano pra manter tudo no ar\n\n👉 *Seu acesso ao app:*\n${links.app}\n\n📌 *Dicas:*\n1. Abra pelo celular. Ao abrir, aparecem umas dicas rápidas te mostrando cada parte.\n2. Esse link é só seu e já te deixa logada, então não compartilhe com ninguém.\n3. Dá pra instalar na tela inicial do celular, como um app de verdade.\n\nQualquer dúvida é só me chamar por aqui! 💖`;
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
  };

  /** Os 3 links que a profissional pode receber, todos no mesmo formato de
   *  subdomínio pessoal (`slug.studiomenu.art`) no domínio oficial — o
   *  roteamento por subdomínio (`src/proxy.ts`) só reescreve a raiz `/`
   *  pro catálogo, preservando querystring, e rotas `/api/...` não olham
   *  pro host, então tanto o link de edição (`?edit=`) quanto o do app
   *  (`/api/professional/login`) funcionam normalmente nesse formato. Em
   *  localhost/*.vercel.app (onde esse roteamento é propositalmente
   *  ignorado) cai pro caminho `/c/slug` de sempre. */
  const buildProfessionalLinks = (item: AdminCatalog) => {
    if (typeof window === 'undefined' || !item.slug) return { official: '', edit: '', app: '' };
    const { hostname, origin } = window.location;
    const subdomain = usesSubdomainRouting(hostname);
    const root = subdomain ? `https://${item.slug}.${PRODUCTION_DOMAIN}` : origin;
    const official = subdomain ? root : `${root}/c/${item.slug}`;
    const app = `${root}/api/professional/login?slug=${item.slug}&token=${item.edit_token}`;
    return { official, edit: `${official}?edit=${item.edit_token}`, app };
  };

  const toggleBookingEnabled = async (item: AdminCatalog) => {
    if (!item.id) return;
    try {
      const res = await fetch('/api/admin/catalog-actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id: item.id, booking_enabled: !item.booking_enabled }),
      });
      const result = await res.json();
      if (!result.success) {
        showToast('❌ Erro ao atualizar agendamento automático.');
        return;
      }
      showToast(item.booking_enabled ? '🔒 Agendamento automático desligado.' : '📅 Agendamento automático ligado!');
      fetchCatalogs();
    } catch (e) {
      console.error('Erro ao atualizar booking_enabled:', e);
      showToast('❌ Erro ao atualizar agendamento automático.');
    }
  };

  const PLAN_BADGE: Record<string, { label: string; className: string }> = {
    catalog: { label: 'Catálogo', className: 'bg-slate-800 text-slate-400 border-slate-700' },
    'basico-ativo': { label: 'Básico Ativo', className: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
    'basico-suspenso': { label: 'Básico Suspenso', className: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    'basico-cancelado': { label: 'Básico Cancelado', className: 'bg-slate-800 text-slate-500 border-slate-700' },
    'plus-ativo': { label: 'Plus Ativo', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    'plus-suspenso': { label: 'Plus Suspenso', className: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    'plus-cancelado': { label: 'Plus Cancelado', className: 'bg-slate-800 text-slate-500 border-slate-700' },
  };

  const getPlanBadge = (item: AdminCatalog) => {
    if (item.plan_tier !== 'basico' && item.plan_tier !== 'plus') return PLAN_BADGE.catalog;
    const key = `${item.plan_tier}-${item.subscription_status || 'none'}`;
    return PLAN_BADGE[key] || PLAN_BADGE[`${item.plan_tier}-cancelado`];
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-5 md:p-10">
      <div className="max-w-5xl mx-auto space-y-7">
        {/* Header Superior */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-7 border-b border-slate-800">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 mb-2.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Painel</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                <Sparkles className="w-6 h-6" />
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-bold">Catálogos</h1>
            </div>
            <p className="text-sm text-slate-400 mt-1.5">
              Administração, criação e edição dos catálogos do <span className="text-rose-400 font-semibold">StudioMenu</span>.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchCatalogs}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all text-sm font-semibold flex items-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
            <Link
              href="/form"
              className="px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold tracking-wider uppercase flex items-center gap-2 shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Novo Catálogo</span>
            </Link>
          </div>
        </header>

        {/* Campo de Busca */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por cliente, nome do studio ou slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
          />
        </div>

        {/* Tabela / Grid de Catálogos Registrados */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-500 text-sm animate-pulse">
            Carregando catálogos cadastrados no Supabase...
          </div>
        ) : filteredCatalogs.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 p-8 space-y-3">
            <p className="text-base font-semibold text-slate-300">Nenhum catálogo encontrado.</p>
            <p className="text-sm text-slate-500">Crie o primeiro catálogo clicando em Novo Catálogo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCatalogs.map((item) => {
              const isPending = item.status !== 'aprovado';
              const dateStr = item.created_at
                ? new Date(item.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : null;

              return (
                <div
                  key={item.id || item.slug}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
                        <Scissors className="w-3.5 h-3.5" />
                        <span>{item.niche || 'Lash'}</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getPlanBadge(item).className}`}
                        >
                          {getPlanBadge(item).label}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                            isPending
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {isPending ? 'Pendente' : 'Aprovado'}
                        </span>
                      </div>
                    </div>

                    <h2 className="font-serif text-2xl font-bold text-white leading-tight">
                      {item.studio_name || item.client_name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <p className="text-sm text-slate-400">Por {item.client_name}</p>
                      {dateStr && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          {dateStr}
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 flex items-center gap-2 text-sm text-slate-400">
                      <Phone className="w-4 h-4 text-slate-500" />
                      <span>{item.whatsapp_number || 'WhatsApp não informado'}</span>
                    </div>

                    <div className="mt-2.5 text-xs text-slate-500 uppercase font-mono">
                      {item.layout_model || 'mosaico'} / {item.theme_variant || 'rose'}
                    </div>

                    <div className="mt-3.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" />
                          Link Oficial do Catálogo
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(buildProfessionalLinks(item).official);
                            showToast('🌐 Link Oficial copiado!');
                          }}
                          className="text-xs text-rose-300 hover:text-rose-200 font-bold underline flex items-center gap-1"
                        >
                          Copiar Link
                        </button>
                      </div>
                      <p className="text-xs font-mono text-rose-200/80 truncate">
                        {item.slug}.{PRODUCTION_DOMAIN}
                      </p>
                      <p className="text-[11px] text-rose-300/60">É esse que ela divulga: bio, WhatsApp, etc.</p>
                    </div>

                    <div className="mt-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Link Mágico da Cliente</span>
                        {item.edit_token && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(buildProfessionalLinks(item).edit);
                              showToast('🔗 Link Mágico de Edição copiado!');
                            }}
                            className="text-xs text-rose-400 hover:text-rose-300 font-bold underline flex items-center gap-1"
                          >
                            Copiar Link
                          </button>
                        )}
                      </div>
                      <p className="text-xs font-mono text-slate-400 truncate">
                        {item.slug}.{PRODUCTION_DOMAIN}{item.edit_token ? `?edit=${item.edit_token.substring(0, 8)}...` : ''}
                      </p>
                    </div>

                    {item.edit_token && (
                      <div className="mt-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5" />
                            Link do App
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(buildProfessionalLinks(item).app);
                              showToast('📱 Link do App copiado!');
                            }}
                            className="text-xs text-rose-400 hover:text-rose-300 font-bold underline flex items-center gap-1"
                          >
                            Copiar Link
                          </button>
                        </div>
                        <p className="text-xs font-mono text-slate-400 truncate">
                          {item.slug}.{PRODUCTION_DOMAIN}/api/professional/login?slug={item.slug}&token={item.edit_token.substring(0, 8)}...
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => toggleBookingEnabled(item)}
                      className={`mt-2 w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                        item.booking_enabled
                          ? 'bg-rose-500/20 border-rose-500/60 text-rose-300'
                          : 'bg-white/5 border-slate-700 text-slate-400'
                      }`}
                    >
                      <CalendarClock className="w-3.5 h-3.5" />
                      Agendamento automático: {item.booking_enabled ? 'Ligado' : 'Desligado'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/c/${item.slug}`}
                        target="_blank"
                        className="flex-1 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white flex items-center justify-center gap-1.5 transition-all"
                      >
                        <span>Ver</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      {item.edit_token && (
                        <Link
                          href={`/c/${item.slug}?edit=${item.edit_token}`}
                          target="_blank"
                          className="flex-1 px-3 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <span>Editar</span>
                        </Link>
                      )}
                    </div>

                    <a
                      href={buildDeliveryWhatsappUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => approveAndDeliver(item)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-95 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Aprovar & Entregar</span>
                    </a>

                    {item.edit_token && (
                      <a
                        href={buildAppWhatsappUrl(item)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Enviar app por WhatsApp</span>
                      </a>
                    )}

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end">
                      <button
                        onClick={() => setCatalogToDelete(item)}
                        className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all flex items-center gap-1.5 text-xs font-semibold"
                        title="Excluir Catálogo"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Excluir Catálogo</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white text-sm font-semibold shadow-2xl z-50">
          {toastMessage}
        </div>
      )}

      {catalogToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60]">
          <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-2xl p-7 space-y-5 text-center">
            <h3 className="font-bold text-white text-lg">Excluir este catálogo?</h3>
            <p className="text-sm text-slate-400">
              Isso vai apagar permanentemente o catálogo de{' '}
              <span className="text-white font-semibold">
                {catalogToDelete.studio_name || catalogToDelete.client_name}
              </span>
              . Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setCatalogToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteCatalog(catalogToDelete.id)}
                className="flex-1 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 text-sm font-bold"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
