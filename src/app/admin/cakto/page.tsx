'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Webhook, ChevronDown, X } from 'lucide-react';

interface CaktoEvent {
  id: string;
  received_at: string;
  event: string | null;
  cakto_order_id: string | null;
  slug: string | null;
  result: 'processed' | 'ignored' | 'rejected' | 'error';
  message: string | null;
  payload: unknown;
}

const RESULT_STYLE: Record<CaktoEvent['result'], { label: string; className: string }> = {
  processed: { label: 'Processado', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  ignored: { label: 'Ignorado', className: 'bg-slate-800 text-slate-400 border-slate-700' },
  rejected: { label: 'Rejeitado', className: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  error: { label: 'Erro', className: 'bg-red-500/10 text-red-400 border-red-500/30' },
};

const EVENT_LABEL: Record<string, string> = {
  purchase_approved: '💰 Compra aprovada',
  subscription_renewed: '🔁 Renovação paga',
  subscription_canceled: '🚫 Assinatura cancelada',
  subscription_cancelled: '🚫 Assinatura cancelada',
  subscription_renewal_refused: '⚠️ Renovação recusada',
  refund: '↩️ Reembolso',
  chargeback: '⛔ Chargeback',
  admin_manual_activation: '🛠️ Ativação manual (admin)',
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Lista dos webhooks recebidos da Cakto (2026-11-18). A Cakto não reenvia
 *  evento que falhou, então tudo fica logado em `cakto_events` — aqui dá pra
 *  ver o que chegou, o que o sistema fez e o payload bruto. */
export default function AdminCaktoEventsPage() {
  const [events, setEvents] = useState<CaktoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [slugFilter, setSlugFilter] = useState<string | null>(null);

  useEffect(() => {
    setSlugFilter(new URLSearchParams(window.location.search).get('slug'));
  }, []);

  const load = useCallback(async (slug: string | null) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/cakto${slug ? `?slug=${encodeURIComponent(slug)}` : ''}`, { cache: 'no-store' });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setEvents(json.events);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'Erro ao carregar.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(slugFilter);
  }, [load, slugFilter]);

  function clearFilter() {
    setSlugFilter(null);
    window.history.replaceState(null, '', '/admin/cakto');
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-5 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <Link href="/admin/catalogos" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 mb-2.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar aos Catálogos</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
                <Webhook className="w-6 h-6" />
              </span>
              <h1 className="font-serif text-3xl font-bold">Eventos da Cakto</h1>
            </div>
            <p className="text-sm text-slate-400 mt-1.5">Últimos 150 webhooks recebidos e o que o sistema fez com cada um.</p>
          </div>
          <button
            onClick={() => load(slugFilter)}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-sm font-semibold flex items-center gap-2 self-start"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </header>

        {slugFilter && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Só do catálogo</span>
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 font-semibold">{slugFilter}</span>
            <button onClick={clearFilter} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400" aria-label="Ver todos">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {!loading && events.length === 0 && !error ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 text-slate-400 text-sm">
            Nenhum evento recebido ainda.
          </div>
        ) : (
          <ul className="space-y-2">
            {events.map((ev) => {
              const style = RESULT_STYLE[ev.result] ?? RESULT_STYLE.ignored;
              const isOpen = openId === ev.id;
              return (
                <li key={ev.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
                  <button type="button" onClick={() => setOpenId(isOpen ? null : ev.id)} className="w-full text-left p-4 flex items-start gap-3">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${style.className}`}>
                          {style.label}
                        </span>
                        <span className="text-sm font-bold">{(ev.event && EVENT_LABEL[ev.event]) || ev.event || '(sem evento)'}</span>
                        <span className="text-xs text-slate-500">{formatWhen(ev.received_at)}</span>
                      </div>
                      {ev.message && <p className="text-sm text-slate-300 break-words">{ev.message}</p>}
                      <div className="flex gap-3 text-xs text-slate-500 flex-wrap">
                        {ev.slug && (
                          <a href={`/c/${ev.slug}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-rose-400 hover:underline">
                            {ev.slug}
                          </a>
                        )}
                        {ev.cakto_order_id && <span>pedido {ev.cakto_order_id}</span>}
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-500 mt-1 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <pre className="mx-4 mb-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto max-h-96">
                      {JSON.stringify(ev.payload, null, 2)}
                    </pre>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
