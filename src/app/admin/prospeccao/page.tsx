'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Gem, Download, Upload, RotateCcw, Search } from 'lucide-react';
import { ProspectLead, LeadStatus } from '@/types/prospeccao';
import { KpiCards } from '@/components/admin/prospeccao/KpiCards';
import { ScriptsPanel } from '@/components/admin/prospeccao/ScriptsPanel';
import { LeadCard } from '@/components/admin/prospeccao/LeadCard';
import { ResetConfirmModal } from '@/components/admin/prospeccao/ResetConfirmModal';

const SEED_URL = '/data/prospeccao-leads-seed.json';
const DATASET_STORAGE_KEY = 'studiomenu_crm_leads_dataset';
const leadStorageKey = (rank: number) => `studiomenu_crm_lead_${rank}`;

const FILTERS: { key: 'todos' | LeadStatus; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'pendente', label: '⚪ Pendentes' },
  { key: 'abordado', label: '🟡 Abordados' },
  { key: 'negociacao', label: '🟣 Em Negociação' },
  { key: 'fechado', label: '💎 Fechados' },
  { key: 'recusado', label: '🔴 Sem Resposta' },
];

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

        <KpiCards metrics={metrics} />

        <ScriptsPanel
          isOpen={metaSectionOpen}
          onToggleOpen={() => setMetaSectionOpen((v) => !v)}
          activeVariations={metaVariations}
          onSelectVariation={(step, i) => setMetaVariations((prev) => ({ ...prev, [step]: i }))}
          onCopy={copyText}
        />

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
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.Rank}
                lead={lead}
                status={statusMap[lead.Rank] || 'pendente'}
                isExpanded={expandedRanks.has(lead.Rank)}
                notes={notesMap[lead.Rank] || ''}
                getVariation={(step) => getLeadVar(lead.Rank, step)}
                onToggleExpand={() => toggleExpand(lead.Rank)}
                onStatusChange={(status) => updateStatus(lead.Rank, status)}
                onNotesBlur={(notes) => updateNotes(lead.Rank, notes)}
                onSetVariation={(step, varIdx) => setLeadVar(lead.Rank, step, varIdx)}
                onCopy={copyText}
              />
            ))}
          </div>
        )}
      </div>

      {confirmResetOpen && (
        <ResetConfirmModal onCancel={() => setConfirmResetOpen(false)} onConfirm={confirmResetProgress} />
      )}

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold shadow-2xl z-50">
          {toastMessage}
        </div>
      )}
    </main>
  );
}
