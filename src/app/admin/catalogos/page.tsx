'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { CatalogOrderData, ProcedureItem } from '@/types/catalog';
import { normalizeWhatsappBR } from '@/lib/format';
import { compressImageFiles } from '@/lib/image-compress-client';
import Link from 'next/link';
import { ArrowLeft, Sparkles, ExternalLink, Search, RefreshCw, Plus, Trash2, MessageCircle, Phone, Smartphone, CalendarClock, Globe, Crown, ChevronDown, PauseCircle, PlayCircle, Gift, Bot, Upload, FileText, X, Wallet, Settings2, AlertTriangle, type LucideIcon } from 'lucide-react';
import { usesSubdomainRouting, PRODUCTION_DOMAIN } from '@/lib/public-url';
import { CATALOGO_PRICE_LABEL, CATALOGO_VITALICIO_PRICE_LABEL } from '@/lib/pricing';

/** `res.json()` direto quebra quando o corpo não é JSON de verdade (ex: erro
 *  413 da Vercel antes mesmo da rota rodar) — mesmo utilitário já usado em
 *  /admin/criar-com-ia. */
async function readJsonSafely(res: Response): Promise<{ success: boolean; message?: string; [key: string]: any }> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    if (res.status === 413) {
      return { success: false, message: 'Arquivos grandes demais mesmo após compressão. Tente enviar menos fotos por vez.' };
    }
    return { success: false, message: `Erro inesperado do servidor (status ${res.status}).` };
  }
}

/** Campos de billing/agendamento não fazem parte do shape público do
 *  catálogo (`CatalogOrderData`) — extensão só local, pro admin. */
type AdminCatalog = CatalogOrderData & {
  plan_tier?: 'catalog' | 'basico' | 'plus';
  subscription_status?: 'none' | 'ativo' | 'suspenso' | 'cancelado';
  first_offer_tier?: 'basico' | 'plus';
  app_short_code?: string | null;
  /** Plano concedido manualmente pelo admin, fora do Asaas (Fase 26) —
   *  caso de borda tipo cliente pagando uma vez só, fora do sistema. */
  manual_plan?: boolean;
  /** Preço customizado do Plano Catálogo pra essa cliente — `null`/ausente
   *  usa o padrão (`CATALOGO_PRICE`, src/lib/pricing.ts). */
  billing_price_override?: number | null;
  /** Se o Plano Catálogo dessa cliente é vendido avulso (padrão), como
   *  assinatura mensal (Fase 27) ou anual (2026-10-15) — só tem efeito antes
   *  de ela pagar. */
  catalog_billing_mode?: 'avulso' | 'recorrente' | 'anual';
  /** Preço customizado da conversão de Catálogo recorrente pra vitalício
   *  (Fase 28) — `null`/ausente usa o padrão (`CATALOGO_VITALICIO_PRICE`,
   *  src/lib/pricing.ts). */
  lifetime_price_override?: number | null;
};

type SectionTone = 'rose' | 'sky' | 'amber' | 'red';

/** Mesma linguagem visual do Funil ADS 3.0 (pedido real, 2026-10-13: "está
 *  boa, use ela como referência") — ícone num selo colorido + título em
 *  branco; a borda de destaque ao abrir é sempre dourada (igual lá, onde
 *  todo bloco expandido usa a mesma borda âmbar independente da categoria),
 *  só o ícone muda de cor por seção pra ficar diferenciável. */
const SECTION_TONE: Record<SectionTone, { badge: string }> = {
  rose: { badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' },
  sky: { badge: 'bg-sky-500/10 text-sky-400 border border-sky-500/20' },
  amber: { badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
  red: { badge: 'bg-red-500/10 text-red-400 border border-red-500/20' },
};

/** Sub-bloco expansível dentro do card já expandido de um catálogo (pedido
 *  real, 2026-10-13) — organiza as ações em 4 grupos (Principal/Links/Ações
 *  raras/Desativação) em vez de tudo solto numa lista só. "Principal" abre
 *  por padrão (é o que ela mexe no dia-a-dia); os outros 3 começam
 *  fechados. */
function AdminCardSection({
  label,
  subtitle,
  icon: Icon,
  tone,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  subtitle: string;
  icon: LucideIcon;
  tone: SectionTone;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const { badge } = SECTION_TONE[tone];
  return (
    <div className={`rounded-2xl border transition-all overflow-hidden ${isOpen ? 'border-amber-400/60 bg-slate-900' : 'border-slate-800 bg-slate-900/50'}`}>
      <button type="button" onClick={onToggle} className="w-full p-3.5 flex items-center gap-3 text-left">
        <span className={`p-2 rounded-xl flex-shrink-0 ${badge}`}>
          <Icon className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm">{label}</h3>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="border-t border-slate-800 p-3 space-y-3">{children}</div>}
    </div>
  );
}

export default function AdminCatalogosPage() {
  const [catalogs, setCatalogs] = useState<AdminCatalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [catalogToDelete, setCatalogToDelete] = useState<AdminCatalog | null>(null);
  // Card começa "fechado" (só o essencial pro dia-a-dia) — links e ações
  // raras (copiar link mágico/app, oferta inicial, excluir) ficam atrás
  // desse toggle. Pedido pra reduzir a poluição visual, 2026-09-23.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  // Sub-blocos dentro do card já expandido (Principal/Links/Ações raras/
  // Desativação) — guarda só as mudanças EM RELAÇÃO ao padrão de cada um
  // ("Principal" abre sozinho, os outros 3 começam fechados), não o estado
  // em si, pra não precisar de uma entrada por seção por catálogo de cara.
  const [toggledSections, setToggledSections] = useState<Set<string>>(new Set());
  const isSectionOpen = (cardKey: string, section: string, defaultOpen: boolean) => {
    const isToggled = toggledSections.has(`${cardKey}::${section}`);
    return isToggled ? !defaultOpen : defaultOpen;
  };
  const toggleSection = (cardKey: string, section: string) => {
    const key = `${cardKey}::${section}`;
    setToggledSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // "Cadastrar Serviços com IA" (2026-10-01) — exclusivo do admin: extrai
  // serviços de um print/PDF enviado pelo lead e SUBSTITUI os serviços atuais
  // de um catálogo já publicado (ex: os 4 de exemplo criados na prévia
  // rápida). Pedido explícito da usuária: sempre substituir, nunca somar, e
  // sempre mostrar uma tela de revisão antes de salvar de verdade.
  const [servicesModalItem, setServicesModalItem] = useState<AdminCatalog | null>(null);
  const [servicesModalStep, setServicesModalStep] = useState<'upload' | 'review'>('upload');
  const [servicesFiles, setServicesFiles] = useState<File[]>([]);
  const [extractedProcedures, setExtractedProcedures] = useState<ProcedureItem[]>([]);
  const [isExtractingServices, setIsExtractingServices] = useState(false);
  const [isSavingServices, setIsSavingServices] = useState(false);
  const [servicesErrorMsg, setServicesErrorMsg] = useState('');

  const openServicesModal = (item: AdminCatalog) => {
    setServicesModalItem(item);
    setServicesModalStep('upload');
    setServicesFiles([]);
    setExtractedProcedures([]);
    setServicesErrorMsg('');
  };

  const closeServicesModal = () => {
    setServicesModalItem(null);
    setServicesFiles([]);
    setExtractedProcedures([]);
    setServicesErrorMsg('');
  };

  const handleExtractServices = async () => {
    if (!servicesModalItem || !servicesFiles.length) return;
    setIsExtractingServices(true);
    setServicesErrorMsg('');

    try {
      const compressedFiles = await compressImageFiles(servicesFiles);
      const fd = new FormData();
      compressedFiles.forEach((f) => fd.append('files', f));
      fd.append('niche', servicesModalItem.niche || 'lash');

      const res = await fetch('/api/admin/extract-catalog', {
        method: 'POST',
        credentials: 'same-origin',
        body: fd,
      });
      const json = await readJsonSafely(res);

      if (!json.success) {
        setServicesErrorMsg(json.message || 'Não foi possível extrair os procedimentos.');
        return;
      }

      // Soma com o que já estava na revisão em vez de substituir — permite
      // extrair em mais de uma leva (ex: catálogo da lead com mais de 5
      // produtos, acima do limite por chamada em /api/admin/extract-catalog).
      setExtractedProcedures((prev) => [...prev, ...json.procedures]);
      setServicesFiles([]);
      setServicesModalStep('review');
    } catch {
      setServicesErrorMsg('Falha de conexão ao extrair os procedimentos.');
    } finally {
      setIsExtractingServices(false);
    }
  };

  const updateExtractedProcedure = (id: string, field: keyof ProcedureItem, value: any) => {
    setExtractedProcedures((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const removeExtractedProcedure = (id: string) => {
    setExtractedProcedures((prev) => prev.filter((p) => p.id !== id));
  };

  const addExtractedProcedure = () => {
    setExtractedProcedures((prev) => [
      ...prev,
      { id: `manual-${Date.now()}`, title: '', price: '', duration: '', category: 'Geral', description: '' },
    ]);
  };

  const handleSaveServices = async () => {
    if (!servicesModalItem?.id || !extractedProcedures.length) return;
    setIsSavingServices(true);
    setServicesErrorMsg('');

    try {
      const res = await fetch('/api/admin/replace-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ orderId: servicesModalItem.id, procedures: extractedProcedures }),
      });
      const json = await readJsonSafely(res);

      if (!json.success) {
        setServicesErrorMsg(json.message || 'Erro ao salvar os serviços.');
        return;
      }

      showToast('🤖 Serviços substituídos com sucesso!');
      closeServicesModal();
      fetchCatalogs();
    } catch {
      setServicesErrorMsg('Falha de conexão ao salvar os serviços.');
    } finally {
      setIsSavingServices(false);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
    const message = `Prontinho ${firstName}! Seu catálogo já está no ar.🎉\n\n👉 ${links.app}\n\nLá dentro, toque em *"Visualizar catálogo"* pra ver como ficou. Se quiser mudar algo, é só tocar em *"Editar meu catálogo"* 💕\n\nOs serviços que estão aí agora são só exemplos, pra você já ver tudo funcionando de verdade — você troca pelos seus quando quiser, no seu ritmo. ✨\n\nQuando você fizer o pagamento esse link vira um App exclusivo seu. E dentro dele você tem acesso a todos os recursos do seu Catálogo.📲\n\nQualquer dúvida é só nos chamar aqui. ☺️`;
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
  };

  /** Os 3 links que a profissional pode receber, todos no mesmo formato de
   *  subdomínio pessoal (`slug.studiomenu.art`) no domínio oficial — o
   *  roteamento por subdomínio (`src/proxy.ts`) só reescreve a raiz `/`
   *  pro catálogo, preservando querystring, e rotas `/api/...` não olham
   *  pro host, então tanto o link de edição (`?edit=`) quanto o do app
   *  (`/api/professional/login`) funcionam normalmente nesse formato. Em
   *  localhost/*.vercel.app (onde esse roteamento é propositalmente
   *  ignorado) cai pro caminho `/c/slug` de sempre.
   *
   *  Link do app usa o alias curto `/a/[code]` (Fase 25) em vez do login
   *  direto com o token de 32 caracteres cru — pedido real, 2026-09-28: o
   *  link completo tinha "muita informação" pra mandar no primeiro
   *  contato. Sempre no domínio raiz (nunca no subdomínio), fica mais
   *  curto ainda. Sem `app_short_code` ainda (`catalogs-list` deveria
   *  sempre preencher, mas por segurança) cai pro link longo de sempre. */
  const buildProfessionalLinks = (item: AdminCatalog) => {
    if (typeof window === 'undefined' || !item.slug) return { official: '', edit: '', app: '' };
    const { hostname, origin } = window.location;
    const subdomain = usesSubdomainRouting(hostname);
    const root = subdomain ? `https://${item.slug}.${PRODUCTION_DOMAIN}` : origin;
    const official = subdomain ? root : `${root}/c/${item.slug}`;
    const rootDomainOrigin = subdomain ? `https://${PRODUCTION_DOMAIN}` : origin;
    const app = item.app_short_code
      ? `${rootDomainOrigin}/a/${item.app_short_code}`
      : `${root}/api/professional/login?slug=${item.slug}&token=${item.edit_token}`;
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

  /** Fase 22: qual plano aparece em destaque na tela de primeiro contato
   *  dela — 'plus' pra venda focada em agendamento. Não ativa nada sozinho,
   *  só muda o que a tela oferece antes de ela assinar. */
  const toggleFirstOfferTier = async (item: AdminCatalog) => {
    if (!item.id) return;
    const next = item.first_offer_tier === 'plus' ? 'basico' : 'plus';
    try {
      const res = await fetch('/api/admin/catalog-actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id: item.id, first_offer_tier: next }),
      });
      const result = await res.json();
      if (!result.success) {
        showToast('❌ Erro ao atualizar a oferta inicial.');
        return;
      }
      showToast(next === 'plus' ? '👑 Vai oferecer o Agenda direto agora.' : '📋 Voltou a oferecer o Catálogo primeiro.');
      fetchCatalogs();
    } catch (e) {
      console.error('Erro ao atualizar first_offer_tier:', e);
      showToast('❌ Erro ao atualizar a oferta inicial.');
    }
  };

  /** Fase 27 (+ anual em 2026-10-15): pagamento único (padrão), assinatura
   *  mensal ou anual pro Plano Catálogo dessa cliente — só muda o que o
   *  checkout oferece antes de ela pagar (igual ao toggle de oferta inicial,
   *  acima). */
  const toggleCatalogBillingMode = async (item: AdminCatalog, next: 'avulso' | 'recorrente' | 'anual') => {
    if (!item.id || item.catalog_billing_mode === next) return;
    try {
      const res = await fetch('/api/admin/catalog-actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id: item.id, catalog_billing_mode: next }),
      });
      const result = await res.json();
      if (!result.success) {
        showToast('❌ Erro ao atualizar a cobrança do Catálogo.');
        return;
      }
      showToast(
        next === 'recorrente'
          ? '🔁 Catálogo vai virar assinatura mensal.'
          : next === 'anual'
            ? '🗓️ Catálogo vai virar assinatura anual.'
            : '💳 Catálogo volta a ser pagamento único.'
      );
      fetchCatalogs();
    } catch (e) {
      console.error('Erro ao atualizar catalog_billing_mode:', e);
      showToast('❌ Erro ao atualizar a cobrança do Catálogo.');
    }
  };

  // Preço customizado do Plano Catálogo (admin define livremente por
  // cliente, sem teto — `billing_price_override`, reaproveitado da Fase 21).
  // Rascunho de input mantido por id pra não perder o que ela digitou antes
  // de clicar em Salvar, mesmo com re-render vindo de `fetchCatalogs`.
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});

  const getPriceDraft = (item: AdminCatalog) => {
    const id = item.id || '';
    if (priceDrafts[id] !== undefined) return priceDrafts[id];
    return item.billing_price_override != null ? item.billing_price_override.toFixed(2).replace('.', ',') : '';
  };

  const savePriceOverride = async (item: AdminCatalog) => {
    if (!item.id) return;
    const raw = (priceDrafts[item.id] ?? '').trim();
    const value = raw === '' ? null : Number(raw.replace(',', '.'));
    if (value !== null && (!Number.isFinite(value) || value < 5)) {
      showToast('❌ Preço inválido (mínimo R$5).');
      return;
    }
    try {
      const res = await fetch('/api/admin/catalog-actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id: item.id, billing_price_override: value }),
      });
      const result = await res.json();
      if (!result.success) {
        showToast('❌ Erro ao salvar o preço.');
        return;
      }
      showToast(value === null ? '🔄 Preço do Catálogo voltou ao padrão.' : '💰 Preço do Catálogo atualizado!');
      setPriceDrafts((prev) => {
        const next = { ...prev };
        delete next[item.id!];
        return next;
      });
      fetchCatalogs();
    } catch (e) {
      console.error('Erro ao salvar billing_price_override:', e);
      showToast('❌ Erro ao salvar o preço.');
    }
  };

  // Preço customizado da conversão de Catálogo recorrente pra vitalício
  // (Fase 28) — mesmo padrão do preço do Catálogo acima, campo PRÓPRIO
  // (`lifetime_price_override`), já que é uma oferta diferente.
  const [lifetimePriceDrafts, setLifetimePriceDrafts] = useState<Record<string, string>>({});

  const getLifetimePriceDraft = (item: AdminCatalog) => {
    const id = item.id || '';
    if (lifetimePriceDrafts[id] !== undefined) return lifetimePriceDrafts[id];
    return item.lifetime_price_override != null ? item.lifetime_price_override.toFixed(2).replace('.', ',') : '';
  };

  const saveLifetimePriceOverride = async (item: AdminCatalog) => {
    if (!item.id) return;
    const raw = (lifetimePriceDrafts[item.id] ?? '').trim();
    const value = raw === '' ? null : Number(raw.replace(',', '.'));
    if (value !== null && (!Number.isFinite(value) || value < 5)) {
      showToast('❌ Preço inválido (mínimo R$5).');
      return;
    }
    try {
      const res = await fetch('/api/admin/catalog-actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id: item.id, lifetime_price_override: value }),
      });
      const result = await res.json();
      if (!result.success) {
        showToast('❌ Erro ao salvar o preço.');
        return;
      }
      showToast(value === null ? '🔄 Preço do vitalício voltou ao padrão.' : '💰 Preço do vitalício atualizado!');
      setLifetimePriceDrafts((prev) => {
        const next = { ...prev };
        delete next[item.id!];
        return next;
      });
      fetchCatalogs();
    } catch (e) {
      console.error('Erro ao salvar lifetime_price_override:', e);
      showToast('❌ Erro ao salvar o preço.');
    }
  };

  const toggleCatalogDisabled = async (item: AdminCatalog) => {
    if (!item.id) return;
    try {
      const res = await fetch('/api/admin/catalog-actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id: item.id, catalog_disabled: !item.catalog_disabled }),
      });
      const result = await res.json();
      if (!result.success) {
        showToast('❌ Erro ao atualizar o catálogo.');
        return;
      }
      showToast(item.catalog_disabled ? '▶️ Catálogo reativado!' : '⏸️ Catálogo desativado.');
      fetchCatalogs();
    } catch (e) {
      console.error('Erro ao atualizar catalog_disabled:', e);
      showToast('❌ Erro ao atualizar o catálogo.');
    }
  };

  /** Fase 26: caso de borda — cliente pagando fora do sistema (ex: uma
   *  vez só, via Pix direto), sem assinatura Asaas de verdade por trás.
   *  Libera o acesso ao app dela igual a uma assinatura real (mesmo
   *  plan_tier/subscription_status), só marcando `manual_plan` pra tela
   *  "Minha assinatura" não mostrar cobrança recorrente nem um botão de
   *  cancelar que nunca vai funcionar. */
  const grantManualPlan = async (item: AdminCatalog, tier: 'basico' | 'plus') => {
    if (!item.id) return;
    try {
      const res = await fetch('/api/admin/catalog-actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id: item.id, plan_tier: tier, subscription_status: 'ativo', manual_plan: true, booking_enabled: tier === 'plus' }),
      });
      const result = await res.json();
      if (!result.success) {
        showToast('❌ Erro ao conceder o plano manual.');
        return;
      }
      showToast(`🎁 Plano ${tier === 'plus' ? 'Agenda' : 'Catálogo'} concedido manualmente!`);
      fetchCatalogs();
    } catch (e) {
      console.error('Erro ao conceder plano manual:', e);
      showToast('❌ Erro ao conceder o plano manual.');
    }
  };

  const revokeManualPlan = async (item: AdminCatalog) => {
    if (!item.id) return;
    try {
      const res = await fetch('/api/admin/catalog-actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id: item.id, plan_tier: 'catalog', subscription_status: 'none', manual_plan: false, booking_enabled: false }),
      });
      const result = await res.json();
      if (!result.success) {
        showToast('❌ Erro ao revogar o plano manual.');
        return;
      }
      showToast('🔄 Plano manual revogado.');
      fetchCatalogs();
    } catch (e) {
      console.error('Erro ao revogar plano manual:', e);
      showToast('❌ Erro ao revogar o plano manual.');
    }
  };

  const PLAN_BADGE: Record<string, { label: string; className: string }> = {
    catalog: { label: 'Sem plano', className: 'bg-slate-800 text-slate-400 border-slate-700' },
    'basico-ativo': { label: 'Catálogo Ativo', className: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
    'basico-suspenso': { label: 'Catálogo Suspenso', className: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    'basico-cancelado': { label: 'Catálogo Cancelado', className: 'bg-slate-800 text-slate-500 border-slate-700' },
    'plus-ativo': { label: 'Agenda Ativo', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    'plus-suspenso': { label: 'Agenda Suspenso', className: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    'plus-cancelado': { label: 'Agenda Cancelado', className: 'bg-slate-800 text-slate-500 border-slate-700' },
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
              const cardKey = item.id || item.slug || '';
              const isExpanded = expandedIds.has(cardKey);

              return (
                <div
                  key={cardKey}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all shadow-xl"
                >
                  {/* Card inteiro agora é retrátil (pedido real, 2026-10-02:
                   *  rolar a tela procurando um catálogo específico, numa
                   *  lista comprida, era ruim no celular) — só esse cabeçalho
                   *  fica sempre visível; tudo mais (ações, links, toggles)
                   *  mora dentro do corpo expansível logo abaixo. Mesmo
                   *  padrão inline-expand já usado em /admin/funil-ads. */}
                  <button
                    type="button"
                    onClick={() => toggleExpanded(cardKey)}
                    className="w-full text-left p-5 flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-start gap-2 flex-wrap">
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
                        {item.catalog_disabled && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border bg-amber-500/10 text-amber-400 border-amber-500/30">
                            Desativado
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-serif text-2xl font-bold text-white leading-tight truncate">
                          {item.studio_name || item.client_name}
                        </h2>
                        <div className="mt-1.5 flex items-center gap-2 text-sm text-slate-200">
                          <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{item.whatsapp_number || 'WhatsApp não informado'}</span>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-500 flex-shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 space-y-3 border-t border-slate-800/80">
                      {/* 4 sub-blocos expansíveis (pedido real, 2026-10-13), na ordem de
                       *  uso real: Principal (aberto por padrão) → Links → Ações raras
                       *  → Desativação (esses 3 últimos começam fechados). */}
                      <AdminCardSection
                        label="Principal"
                        subtitle="Ver, editar, cadastrar serviços e aprovar a entrega"
                        icon={Sparkles}
                        tone="rose"
                        isOpen={isSectionOpen(cardKey, 'principal', true)}
                        onToggle={() => toggleSection(cardKey, 'principal')}
                      >
                      <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 divide-y divide-slate-800 overflow-hidden">
                        <div className="p-3 flex items-center gap-2">
                          <Link
                            href={`/c/${item.slug}`}
                            target="_blank"
                            className="flex-1 px-3 py-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-slate-700 text-sm font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition-all"
                          >
                            <span>Ver</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {item.edit_token && (
                            <Link
                              href={`/c/${item.slug}?edit=${item.edit_token}`}
                              target="_blank"
                              className="flex-1 px-3 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-amber-400/30"
                            >
                              <span>Editar</span>
                            </Link>
                          )}
                        </div>

                        {/* Admin-only (2026-10-01): extrai serviços de um print/PDF que
                         *  a cliente mandou e SUBSTITUI os serviços atuais do catálogo
                         *  dela — nunca exposto no self-edit da profissional. */}
                        <div className="p-3">
                          <button
                            onClick={() => openServicesModal(item)}
                            className="w-full py-3 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/40 text-violet-200 text-sm font-bold flex items-center justify-center gap-2 transition-all"
                          >
                            <Bot className="w-4 h-4" />
                            <span>Cadastrar Serviços com IA</span>
                          </button>
                        </div>

                        {/* Só faz sentido enquanto ela ainda não assinou nada — depois
                         *  disso a tela de primeiro contato nem existe mais pro link
                         *  dela, então o toggle não teria efeito nenhum. */}
                        {(!item.plan_tier || item.plan_tier === 'catalog') && (
                          <div className="p-4 space-y-3 bg-slate-950/40">
                            <div>
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
                                <RefreshCw className="w-3.5 h-3.5" />
                                Cobrança do Catálogo
                              </span>
                              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
                                <button
                                  onClick={() => toggleCatalogBillingMode(item, 'avulso')}
                                  className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
                                    (item.catalog_billing_mode || 'avulso') === 'avulso'
                                      ? 'bg-rose-500 text-white shadow-sm'
                                      : 'text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  Único
                                </button>
                                <button
                                  onClick={() => toggleCatalogBillingMode(item, 'recorrente')}
                                  className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
                                    item.catalog_billing_mode === 'recorrente'
                                      ? 'bg-sky-500 text-white shadow-sm'
                                      : 'text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  Mensal
                                </button>
                                <button
                                  onClick={() => toggleCatalogBillingMode(item, 'anual')}
                                  className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
                                    item.catalog_billing_mode === 'anual'
                                      ? 'bg-emerald-500 text-white shadow-sm'
                                      : 'text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  Anual
                                </button>
                              </div>
                            </div>

                            <div>
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
                                <Wallet className="w-3.5 h-3.5" />
                                Preço
                              </span>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-base pointer-events-none">
                                    R$
                                  </span>
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder={CATALOGO_PRICE_LABEL.replace('R$ ', '')}
                                    value={getPriceDraft(item)}
                                    onChange={(e) =>
                                      setPriceDrafts((prev) => ({ ...prev, [item.id || '']: e.target.value }))
                                    }
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-3 text-base font-semibold text-white placeholder-slate-400 focus:border-rose-500 focus:outline-none"
                                  />
                                </div>
                                <button
                                  onClick={() => savePriceOverride(item)}
                                  className="px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-bold transition-all"
                                >
                                  Salvar
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Some depois de aprovado — o badge "Aprovado" já confirma
                         *  a entrega; reenviar o app (se precisar) continua
                         *  disponível logo abaixo, entre as outras ações. */}
                        {isPending && (
                          <div className="p-3">
                            <a
                              href={buildDeliveryWhatsappUrl(item)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => approveAndDeliver(item)}
                              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-95 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>Aprovar & Entregar</span>
                            </a>
                          </div>
                        )}
                      </div>
                      </AdminCardSection>

                      <AdminCardSection
                        label="Links"
                        subtitle="Link oficial, link do app e preço do vitalício"
                        icon={Globe}
                        tone="sky"
                        isOpen={isSectionOpen(cardKey, 'links', false)}
                        onToggle={() => toggleSection(cardKey, 'links')}
                      >
                      <div className="text-xs text-slate-400 uppercase font-mono">
                        {item.layout_model || 'mosaico'} / {item.theme_variant || 'rose'}
                      </div>

                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1.5">
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

                        {item.edit_token && (
                          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
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
                            <p className="text-xs font-mono text-slate-300 truncate">{buildProfessionalLinks(item).app}</p>
                          </div>
                        )}

                        {/* Fase 28 (+ anual em 2026-10-15): só faz sentido pra
                         *  quem JÁ é recorrente (mensal ou anual) — é o preço
                         *  de "parar de pagar mensalidade", oferecido pela
                         *  própria cliente dentro do app dela. Ao contrário do
                         *  preço do Catálogo acima, continua editável depois
                         *  de ela já estar pagando (a admin pode negociar a
                         *  qualquer momento). */}
                        {(item.catalog_billing_mode === 'recorrente' || item.catalog_billing_mode === 'anual') && (
                          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/70 flex items-center gap-2">
                            <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
                              <Wallet className="w-3.5 h-3.5" />
                              Vitalício:
                            </span>
                            <div className="relative flex-1">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">
                                R$
                              </span>
                              <input
                                type="text"
                                inputMode="decimal"
                                placeholder={CATALOGO_VITALICIO_PRICE_LABEL.replace('R$ ', '')}
                                value={getLifetimePriceDraft(item)}
                                onChange={(e) =>
                                  setLifetimePriceDrafts((prev) => ({ ...prev, [item.id || '']: e.target.value }))
                                }
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-7 pr-2 py-2 text-sm text-white placeholder-slate-400 focus:border-rose-500 focus:outline-none"
                              />
                            </div>
                            <button
                              onClick={() => saveLifetimePriceOverride(item)}
                              className="px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shrink-0"
                            >
                              Salvar
                            </button>
                          </div>
                        )}
                      </AdminCardSection>

                      <AdminCardSection
                        label="Ações raras"
                        subtitle="Oferta inicial, agendamento e conceder plano manual"
                        icon={Settings2}
                        tone="amber"
                        isOpen={isSectionOpen(cardKey, 'acoes', false)}
                        onToggle={() => toggleSection(cardKey, 'acoes')}
                      >
                        {/* Fase 26: caso de borda — cliente pagando fora do sistema (ex:
                         *  uma vez só, via Pix direto), sem assinatura Asaas de verdade. */}
                        {item.manual_plan ? (
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                                <Gift className="w-3.5 h-3.5" />
                                Manual: {item.plan_tier === 'plus' ? 'Agenda' : 'Catálogo'} ativo
                              </span>
                              <button
                                onClick={() => revokeManualPlan(item)}
                                className="text-xs text-rose-400 hover:text-rose-300 font-bold underline"
                              >
                                Revogar
                              </button>
                            </div>
                            <p className="text-[11px] text-emerald-300/60">Sem cobrança via Asaas — concedido manualmente.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            {(!item.plan_tier || item.plan_tier === 'catalog') && (
                              <button
                                onClick={() => toggleFirstOfferTier(item)}
                                className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                                  item.first_offer_tier === 'plus'
                                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                                    : 'bg-slate-800 border-slate-600 text-slate-200'
                                }`}
                              >
                                <Crown className="w-3.5 h-3.5" />
                                Oferta inicial: {item.first_offer_tier === 'plus' ? 'Agenda direto' : 'Catálogo (padrão)'}
                              </button>
                            )}
                            <button
                              onClick={() => toggleBookingEnabled(item)}
                              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                                item.booking_enabled
                                  ? 'bg-rose-500/20 border-rose-500/60 text-rose-300'
                                  : 'bg-slate-800 border-slate-600 text-slate-200'
                              }`}
                            >
                              <CalendarClock className="w-3.5 h-3.5" />
                              Agendamento automático: {item.booking_enabled ? 'Ligado' : 'Desligado'}
                            </button>
                            <button
                              onClick={() => grantManualPlan(item, 'basico')}
                              className="w-full px-2 py-2 rounded-xl text-xs font-bold bg-slate-800 border border-slate-600 text-slate-200 hover:border-emerald-500/60 hover:text-emerald-300 transition-all flex items-center justify-center gap-1"
                            >
                              <Gift className="w-3.5 h-3.5" />
                              Conceder Catálogo (manual)
                            </button>
                            <button
                              onClick={() => grantManualPlan(item, 'plus')}
                              className="w-full px-2 py-2 rounded-xl text-xs font-bold bg-slate-800 border border-slate-600 text-slate-200 hover:border-amber-500/60 hover:text-amber-300 transition-all flex items-center justify-center gap-1"
                            >
                              <Gift className="w-3.5 h-3.5" />
                              Conceder Agenda (manual)
                            </button>
                          </div>
                        )}
                      </AdminCardSection>

                      <AdminCardSection
                        label="Desativação"
                        subtitle="Pausar ou excluir este catálogo"
                        icon={AlertTriangle}
                        tone="red"
                        isOpen={isSectionOpen(cardKey, 'desativacao', false)}
                        onToggle={() => toggleSection(cardKey, 'desativacao')}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleCatalogDisabled(item)}
                            className={`flex-1 px-3 py-2.5 rounded-xl border transition-all flex items-center justify-center gap-1.5 text-xs font-bold ${
                              item.catalog_disabled
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                                : 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                            }`}
                            title={item.catalog_disabled ? 'Reativar Catálogo' : 'Desativar Catálogo'}
                          >
                            {item.catalog_disabled ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                            <span>{item.catalog_disabled ? 'Reativar' : 'Desativar'} Catálogo</span>
                          </button>

                          <button
                            onClick={() => setCatalogToDelete(item)}
                            className="flex-1 px-3 py-2.5 rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-all flex items-center justify-center gap-1.5 text-xs font-bold"
                            title="Excluir Catálogo"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Excluir Catálogo</span>
                          </button>
                        </div>
                      </AdminCardSection>
                    </div>
                  )}
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

      {servicesModalItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60]">
          <div className="max-w-lg w-full max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Bot className="w-5 h-5 text-rose-400" />
                  Cadastrar Serviços com IA
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {servicesModalItem.studio_name || servicesModalItem.client_name}
                </p>
              </div>
              <button onClick={closeServicesModal} className="p-1.5 text-slate-500 hover:text-white flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {servicesErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm text-center font-medium">
                {servicesErrorMsg}
              </div>
            )}

            {servicesModalStep === 'upload' ? (
              <>
                <p className="text-sm text-slate-400">
                  Envie o print, foto ou PDF com os serviços e valores que a cliente mandou. A IA extrai tudo pra você revisar antes
                  de salvar. Limite de 5 arquivos por vez — catálogo maior que isso, é só repetir o processo (usando "+ Adicionar
                  mais" na revisão) quantas vezes precisar, que os resultados se somam.
                </p>
                <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                  ⚠️ Isso vai <strong>substituir todos os serviços atuais</strong> do catálogo (inclusive os de exemplo, se ainda
                  estiverem lá) pelos novos. Não é possível desfazer.
                </p>

                <label className="flex items-center justify-center gap-2.5 w-full bg-slate-950 border-2 border-dashed border-slate-800 hover:border-rose-500 rounded-xl p-5 text-sm text-slate-400 cursor-pointer transition-all">
                  <FileText className="w-5 h-5" />
                  <span>{servicesFiles.length ? `${servicesFiles.length} arquivo(s) selecionado(s)` : 'Escolher imagem(ns) ou PDF'}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => setServicesFiles(Array.from(e.target.files || []))}
                  />
                </label>

                <button
                  type="button"
                  onClick={handleExtractServices}
                  disabled={isExtractingServices || !servicesFiles.length}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:opacity-95 disabled:opacity-50 font-bold text-sm tracking-wider uppercase text-white flex items-center justify-center gap-2.5 shadow-lg"
                >
                  <Upload className="w-5 h-5" />
                  <span>{isExtractingServices ? 'Lendo com IA...' : 'Extrair com IA'}</span>
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-serif text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-400 flex-shrink-0" /> Confira o que a IA entendeu
                  </h4>
                  <button
                    type="button"
                    onClick={addExtractedProcedure}
                    className="px-3 py-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 flex-shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Item
                  </button>
                </div>

                <div className="space-y-3">
                  {extractedProcedures.map((proc) => (
                    <div key={proc.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Nome do serviço"
                          value={proc.title}
                          onChange={(e) => updateExtractedProcedure(proc.id, 'title', e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
                        />
                        <button type="button" onClick={() => removeExtractedProcedure(proc.id)} className="text-slate-500 hover:text-rose-400 p-1.5 flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Preço"
                          value={proc.price}
                          onChange={(e) => updateExtractedProcedure(proc.id, 'price', e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Duração"
                          value={proc.duration}
                          onChange={(e) => updateExtractedProcedure(proc.id, 'duration', e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Categoria"
                          value={proc.category}
                          onChange={(e) => updateExtractedProcedure(proc.id, 'category', e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                  {extractedProcedures.length === 0 && (
                    <p className="text-center text-sm text-slate-500 py-4">Nenhum procedimento — adicione manualmente ou volte e tente outro arquivo.</p>
                  )}
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => setServicesModalStep('upload')}
                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-300"
                    title="Envia mais arquivos e soma com o que já está na lista de revisão"
                  >
                    + Adicionar mais
                  </button>
                  <button
                    onClick={handleSaveServices}
                    disabled={isSavingServices || extractedProcedures.length === 0}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 disabled:opacity-60 text-sm font-bold text-white"
                  >
                    {isSavingServices ? 'Salvando...' : 'Confirmar e Substituir'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
