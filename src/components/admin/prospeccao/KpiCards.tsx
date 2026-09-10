'use client';

import React from 'react';

interface KpiCardsProps {
  metrics: {
    total: number;
    contacted: number;
    negotiating: number;
    closed: number;
  };
}

export const KpiCards: React.FC<KpiCardsProps> = ({ metrics }) => {
  return (
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
  );
};
