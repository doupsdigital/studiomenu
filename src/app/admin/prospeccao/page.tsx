'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Gem,
  Download,
  Upload,
  RotateCcw,
  Search,
  Copy,
  ChevronDown,
  MapPin,
  Star,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { ProspectLead, LeadStatus } from '@/types/prospeccao';

const SEED_URL = '/data/prospeccao-leads-seed.json';
const DATASET_STORAGE_KEY = 'studiomenu_crm_leads_dataset';
const leadStorageKey = (rank: number) => `studiomenu_crm_lead_${rank}`;

const STATUS_LABELS: Record<LeadStatus, string> = {
  pendente: '⚪ Pendente',
  abordado: '🟡 Abordado',
  negociacao: '🟣 Em Negociação',
  fechado: '💎 Venda Fechada',
  recusado: '🔴 Sem Resposta',
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  pendente: 'text-slate-400 border-slate-700',
  abordado: 'text-amber-400 border-amber-500/40',
  negociacao: 'text-purple-400 border-purple-500/40',
  fechado: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  recusado: 'text-red-400 border-red-500/40',
};

const FILTERS: { key: 'todos' | LeadStatus; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'pendente', label: '⚪ Pendentes' },
  { key: 'abordado', label: '🟡 Abordados' },
  { key: 'negociacao', label: '🟣 Em Negociação' },
  { key: 'fechado', label: '💎 Fechados' },
  { key: 'recusado', label: '🔴 Sem Resposta' },
];

const META_SCRIPTS: Record<number, { title: string; variations: string[] }> = {
  1: {
    title: '💬 1. Boas-Vindas & Qualificação',
    variations: [
      'Oii! Seja muito bem-vinda! 💕 Fico super feliz pelo seu interesse no StudioMenu! ✨ Qual o seu nome e de qual cidade é o seu estúdio? 😍',
      'Oii, tudo bem? 🥰 Seja bem-vinda! Que incrível ter você por aqui. Me conta, você já trabalha com procedimentos de beleza no seu estúdio atualmente? ✨',
      'Olá! Que ótimo ter você por aqui! 🌸 Fico feliz que tenha visto nosso anúncio. Você sofre hoje tendo que mandar foto por foto de tabela no Whats pra cada cliente? 📲',
    ],
  },
  2: {
    title: '✅ 2. Apresentação & Oferta Vídeo Demo',
    variations: [
      'Que maravilhosa! 😍 O StudioMenu transforma aquela tabela de preços solta num catálogo digital interativo lindo pro link da sua bio do Instagram e conversas no Whats! 🌸✨ Gravei um vídeo curtinho de 15 segundos mostrando como ele funciona na prática. Posso te mandar aqui? 💕',
      'Perfeito! 🥰 O StudioMenu deixa o atendimento do seu estúdio muito mais profissional e elegante! Temos modelos prontos incríveis pra cada nicho. Quer dar uma olhadinha neles ou prefere que eu te mande um vídeo de demonstração rápida? ✨',
      'Incrível! 💕 O StudioMenu foi feito sob medida pra profissionais de beleza valorizarem o trabalho e não perderem tempo explicando técnica por técnica. O catálogo organiza fotos, valores e botão de agendamento num só link! 🚀 Posso te enviar um modelo de demonstração bem rapidinho pra você ver como fica? 👁️✨',
    ],
  },
  3: {
    title: '💰 3. Fechamento & Oferta Pix',
    variations: [
      'O que achou? Lindo né? 😍✨ O valor de criação completa do StudioMenu com hospedagem e suporte é R$ 197 no cartão. Mas fechando hoje por aqui no Pix, temos o desconto especial por apenas *R$ 167 à vista (pagamento único sem mensalidades!)*. 🚀💎 Quer que eu já garanta a sua chave Pix para ativarmos o seu catálogo hoje? 💕',
      'Viu como fica elegante? 🥰 Se quiser, você já pode me mandar aqui a foto da sua tabela de preços que eu crio a versão personalizada com a marca do seu estúdio! E fechando hoje via Pix, de R$ 197 fica por apenas *R$ 167 à vista (sem mensalidade)*. 🌸📲 Posso gerar o Pix para você?',
      'Dá um destaque surreal pro estúdio! ✨🌸 Conseguimos liberar para você a condição especial por Pix: apenas *R$ 167 à vista* (taxa única de configuração, sem cobrança mensal). 🎉💎 Posso te passar a chave Pix para finalizar e já começarmos a montagem do seu link? 🚀💕',
    ],
  },
};

function getStepText(lead: ProspectLead, step: 1 | 2 | 3, varNum: number): string {
  const prefix = step === 1 ? 'Abordagem_1_Variação_' : step === 2 ? 'Resposta_2_Variação_' : 'Fechamento_3_Variação_';
  const fallback =
    step === 1 ? lead.Abordagem_1_Inicial : step === 2 ? lead.Resposta_2_Demonstracao_SIM : lead.Fechamento_3_Oferta_Preco_Pix;
  const varValue = lead[`${prefix}${varNum}`];
  return (typeof varValue === 'string' ? varValue : undefined) || fallback || '';
}

export default function AdminProspeccaoPage() {
  const [leads, setLeads] = useState<ProspectLead[]>([]);
  const [statusMap, setStatusMap] = useState<Record<number, LeadStatus>>({});
  const [notesMap, setNotesMap] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'todos' | LeadStatus>('todos');
  const [expandedRanks, setExpandedRanks] = useState<Set<number>>(new Set());
  const [leadVariations, setLeadVariations] = useState<Record<string, number>>({});
  const [metaVariations, setMetaVariations] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0 });
  const [metaSectionOpen, setMetaSectionOpen] = useState(true);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const applyDataset = (data: ProspectLead[]) => {
    setLeads(data);
    const savedStatus: Record<number, LeadStatus> = {};
    const savedNotes: Record<number, string> = {};
    data.forEach((lead) => {
      try {
        const raw = localStorage.getItem(leadStorageKey(lead.Rank));
        if (raw) {
          const parsed = JSON.parse(raw);
          savedStatus[lead.Rank] = parsed.status || 'pendente';
          savedNotes[lead.Rank] = parsed.notes || '';
        } else {
          savedStatus[lead.Rank] = 'pendente';
          savedNotes[lead.Rank] = '';
        }
      } catch {
        savedStatus[lead.Rank] = 'pendente';
        savedNotes[lead.Rank] = '';
      }
    });
    setStatusMap(savedStatus);
    setNotesMap(savedNotes);
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const savedDataset = localStorage.getItem(DATASET_STORAGE_KEY);
        if (savedDataset) {
          applyDataset(JSON.parse(savedDataset));
        } else {
          const res = await fetch(SEED_URL);
          const data = await res.json();
          applyDataset(data);
        }
      } catch (err) {
        console.error('Erro ao carregar leads:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const updateStatus = (rank: number, status: LeadStatus) => {
    setStatusMap((prev) => {
      const next = { ...prev, [rank]: status };
      localStorage.setItem(leadStorageKey(rank), JSON.stringify({ status, notes: notesMap[rank] || '' }));
      return next;
    });
  };

  const updateNotes = (rank: number, notes: string) => {
    setNotesMap((prev) => ({ ...prev, [rank]: notes }));
    localStorage.setItem(leadStorageKey(rank), JSON.stringify({ status: statusMap[rank] || 'pendente', notes }));
  };

  const metrics = useMemo(() => {
    const total = leads.length;
    const contacted = leads.filter((l) => statusMap[l.Rank] === 'abordado').length;
    const negotiating = leads.filter((l) => statusMap[l.Rank] === 'negociacao').length;
    const closed = leads.filter((l) => statusMap[l.Rank] === 'fechado').length;
    return { total, contacted, negotiating, closed };
  }, [leads, statusMap]);

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: leads.length };
    (['pendente', 'abordado', 'negociacao', 'fechado', 'recusado'] as LeadStatus[]).forEach((s) => {
      counts[s] = leads.filter((l) => (statusMap[l.Rank] || 'pendente') === s).length;
    });
    return counts;
  }, [leads, statusMap]);

  const filteredLeads = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return leads.filter((lead) => {
      const status = statusMap[lead.Rank] || 'pendente';
      const matchesFilter = activeFilter === 'todos' || status === activeFilter;
      const matchesSearch =
        !q ||
        lead.Nome_Estudio?.toLowerCase().includes(q) ||
        lead.Bairro?.toLowerCase().includes(q) ||
        lead.Telefone?.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [leads, statusMap, activeFilter, searchTerm]);

  const toggleExpand = (rank: number) => {
    setExpandedRanks((prev) => {
      const next = new Set(prev);
      if (next.has(rank)) next.delete(rank);
      else next.add(rank);
      return next;
    });
  };

  const getLeadVar = (rank: number, step: number) => leadVariations[`${rank}-${step}`] ?? 0;
  const setLeadVar = (rank: number, step: number, varIdx: number) =>
    setLeadVariations((prev) => ({ ...prev, [`${rank}-${step}`]: varIdx }));

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('✅ Mensagem copiada com sucesso!');
  };

  const exportReport = () => {
    const report = leads.map((l) => ({
      Rank: l.Rank,
      Estudio: l.Nome_Estudio,
      Bairro: l.Bairro,
      Telefone: l.Telefone,
      Status: statusMap[l.Rank] || 'pendente',
      Anotacoes: notesMap[l.Rank] || '',
    }));
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-crm-studiomenu-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!Array.isArray(data)) throw new Error('O arquivo precisa ser uma lista (array) de leads.');
        localStorage.setItem(DATASET_STORAGE_KEY, JSON.stringify(data));
        applyDataset(data);
        showToast(`✅ ${data.length} leads importados com sucesso!`);
      } catch (err: any) {
        showToast('❌ Erro ao importar: ' + (err.message || 'arquivo inválido'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmResetProgress = () => {
    leads.forEach((lead) => localStorage.removeItem(leadStorageKey(lead.Rank)));
    const resetStatus: Record<number, LeadStatus> = {};
    const resetNotes: Record<number, string> = {};
    leads.forEach((l) => {
      resetStatus[l.Rank] = 'pendente';
      resetNotes[l.Rank] = '';
    });
    setStatusMap(resetStatus);
    setNotesMap(resetNotes);
    setConfirmResetOpen(false);
    showToast('🔄 Progresso resetado com sucesso!');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-slate-300 mb-2 transition-all"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Voltar ao Painel</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <Gem className="w-5 h-5" />
              </span>
              <h1 className="font-serif text-2xl md:text-3xl font-bold">Painel de Prospecção & CRM</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">Gestão de abordagens, 1-clique copy e controle de leads.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input type="file" accept="application/json" ref={fileInputRef} onChange={handleImportFile} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all text-xs font-semibold flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importar Leads</span>
            </button>
            <button
              onClick={exportReport}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>
            <button
              onClick={() => setConfirmResetOpen(true)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/50 text-slate-300 hover:text-red-400 transition-all text-xs font-semibold flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resetar</span>
            </button>
          </div>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 border-l-4 border-l-rose-500">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total de Leads</p>
            <p className="text-2xl font-bold mt-1">{metrics.total}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 border-l-4 border-l-amber-400">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Abordagens Enviadas</p>
            <p className="text-2xl font-bold mt-1">{metrics.contacted}</p>
            <p className="text-[10px] text-slate-500">{metrics.total ? Math.round((metrics.contacted / metrics.total) * 100) : 0}% da base</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 border-l-4 border-l-purple-400">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Em Negociação</p>
            <p className="text-2xl font-bold mt-1">{metrics.negotiating}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 border-l-4 border-l-emerald-400">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Vendas Fechadas</p>
            <p className="text-2xl font-bold mt-1">{metrics.closed}</p>
            <p className="text-[10px] text-slate-500">R$ {metrics.closed * 167} acumulados</p>
          </div>
        </div>

        {/* Meta Ads / Inbound Scripts */}
        <div className="rounded-2xl bg-slate-900 border border-rose-500/30 overflow-hidden">
          <button
            onClick={() => setMetaSectionOpen((v) => !v)}
            className="w-full p-4 flex items-center justify-between gap-3 bg-gradient-to-r from-rose-500/10 to-amber-500/5 hover:from-rose-500/15 transition-all"
          >
            <div className="flex items-center gap-2 flex-wrap text-left">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                📢 Meta Ads / Inbound
              </span>
              <span className="font-bold text-sm">Scripts de Atendimento Rápido (Leads dos Anúncios)</span>
            </div>
            <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${metaSectionOpen ? 'rotate-180' : ''}`} />
          </button>

          {metaSectionOpen && (
            <div className="p-4 pt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
              {[1, 2, 3].map((step) => {
                const script = META_SCRIPTS[step];
                const varIdx = metaVariations[step] || 0;
                const text = script.variations[varIdx];
                return (
                  <div key={step} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold text-rose-300">{script.title}</span>
                      <button
                        onClick={() => copyText(text)}
                        className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-bold flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copiar
                      </button>
                    </div>
                    <div className="flex gap-1">
                      {script.variations.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setMetaVariations((prev) => ({ ...prev, [step]: i }))}
                          className={`px-2 py-0.5 rounded-md text-[9px] font-semibold border transition-all ${
                            varIdx === i
                              ? 'bg-rose-500/20 border-rose-500/60 text-rose-200'
                              : 'bg-white/5 border-slate-700 text-slate-500'
                          }`}
                        >
                          Var {i + 1}
                        </button>
                      ))}
                    </div>
                    <div className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed bg-black/30 rounded-lg p-2.5 max-h-40 overflow-y-auto">
                      {text}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Busca e Filtros */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por estúdio, nome ou bairro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                  activeFilter === f.key
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {f.label} ({filterCounts[f.key] ?? 0})
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Leads */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-500 text-xs animate-pulse">Carregando leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 p-8">
            <p className="text-sm font-semibold text-slate-300">Nenhum lead encontrado.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredLeads.map((lead) => {
              const status = statusMap[lead.Rank] || 'pendente';
              const isExpanded = expandedRanks.has(lead.Rank);

              return (
                <div key={lead.Rank} className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/30 transition-all overflow-hidden">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleExpand(lead.Rank)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') toggleExpand(lead.Rank);
                    }}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="px-2 py-1 rounded-lg bg-white/5 text-amber-400 font-bold text-xs flex-shrink-0">#{lead.Rank}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm truncate">{lead.Nome_Estudio}</span>
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[9px] font-bold flex-shrink-0">
                            ⭐ {lead.Score_Potencial} pts
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.Bairro}</span>
                          <span className="flex items-center gap-1"><Star className="w-3 h-3" />{lead.Avaliação_Google} ({lead.Total_Avaliações})</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.Telefone || 'Sem tel'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        onClick={(e) => e.stopPropagation()}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${STATUS_COLORS[status]}`}
                      >
                        <select
                          value={status}
                          onChange={(e) => updateStatus(lead.Rank, e.target.value as LeadStatus)}
                          className="bg-transparent outline-none cursor-pointer"
                        >
                          {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => (
                            <option key={s} value={s} className="bg-slate-900 text-white">
                              {STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-800 pt-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                        <div><strong className="text-slate-300">Endereço:</strong> {lead.Endereço || 'N/A'}</div>
                        <div>
                          <strong className="text-slate-300">Instagram:</strong>{' '}
                          {lead.Instagram ? (
                            <a href={`https://instagram.com/${lead.Instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:underline">
                              {lead.Instagram}
                            </a>
                          ) : (
                            'Não informado'
                          )}
                        </div>
                        {lead.Link_GoogleMaps && (
                          <div>
                            <strong className="text-slate-300">Google Maps:</strong>{' '}
                            <a href={lead.Link_GoogleMaps} target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:underline">
                              Ver Perfil
                            </a>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">📝 Anotações Rápidas</label>
                        <textarea
                          defaultValue={notesMap[lead.Rank] || ''}
                          onBlur={(e) => updateNotes(lead.Rank, e.target.value)}
                          placeholder="Ex: Pediu para ligar amanhã às 14h..."
                          rows={2}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-rose-500 focus:outline-none resize-y"
                        />
                      </div>

                      {[1, 2, 3].map((step) => {
                        const titles = ['💬 1. Abordagem Inicial', '✅ 2. Resposta / Oferta de Vídeo', '💰 3. Fechamento & Oferta Pix'];
                        const varIdx = getLeadVar(lead.Rank, step);
                        const text = getStepText(lead, step as 1 | 2 | 3, varIdx + 1);
                        return (
                          <div key={step} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-xs font-bold text-amber-400">{titles[step - 1]}</span>
                              <button
                                onClick={() => copyText(text)}
                                className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-bold flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                Copiar
                              </button>
                            </div>
                            <div className="flex gap-1">
                              {[0, 1, 2].map((i) => (
                                <button
                                  key={i}
                                  onClick={() => setLeadVar(lead.Rank, step, i)}
                                  className={`px-2 py-0.5 rounded-md text-[9px] font-semibold border transition-all ${
                                    varIdx === i ? 'bg-rose-500/20 border-rose-500/60 text-rose-200' : 'bg-white/5 border-slate-700 text-slate-500'
                                  }`}
                                >
                                  Var {i + 1}
                                </button>
                              ))}
                            </div>
                            <div className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed bg-black/30 rounded-lg p-2.5">
                              {text}
                            </div>
                            {step === 1 && lead.Link_WhatsApp && (
                              <a
                                href={lead.Link_WhatsApp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-black text-[10px] font-bold"
                              >
                                <MessageCircle className="w-3 h-3" />
                                Abrir no WhatsApp Direct
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Reset */}
      {confirmResetOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60]">
          <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-center">
            <h3 className="font-bold text-white text-sm">Resetar todo o progresso?</h3>
            <p className="text-xs text-slate-400">
              Isso vai apagar o status e as anotações de todos os leads. Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmResetOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={confirmResetProgress}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 text-xs font-bold"
              >
                Sim, Resetar
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold shadow-2xl z-50">
          {toastMessage}
        </div>
      )}
    </main>
  );
}
