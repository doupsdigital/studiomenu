'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CatalogOrderData } from '@/types/catalog';
import Link from 'next/link';
import { Sparkles, ExternalLink, Search, RefreshCw, Scissors, Plus, Trash2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const [catalogs, setCatalogs] = useState<CatalogOrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCatalogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setCatalogs(data as CatalogOrderData[]);
      }
    } catch (err) {
      console.error('Erro ao buscar catálogos:', err);
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
    if (!id || !confirm('Tem certeza que deseja excluir este catálogo?')) return;
    try {
      await supabase.from('orders').delete().eq('id', id);
      fetchCatalogs();
    } catch (e) {}
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Superior do Painel Admin */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <Sparkles className="w-5 h-5" />
              </span>
              <h1 className="font-serif text-2xl md:text-3xl font-bold">Painel Administrativo</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Gerenciamento central de catálogos do <span className="text-rose-400 font-semibold">StudioMenu</span>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCatalogs}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
            <Link
              href="/form"
              className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Catálogo</span>
            </Link>
          </div>
        </header>

        {/* Campo de Busca */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por cliente, nome do studio ou slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
          />
        </div>

        {/* Tabela / Grid de Catálogos Registrados */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-500 text-xs animate-pulse">
            Carregando catálogos cadastrados no Supabase...
          </div>
        ) : filteredCatalogs.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 p-8 space-y-3">
            <p className="text-sm font-semibold text-slate-300">Nenhum catálogo encontrado.</p>
            <p className="text-xs text-slate-500">Crie o primeiro catálogo clicando em Novo Catálogo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalogs.map((item) => (
              <div
                key={item.id || item.slug}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                      <Scissors className="w-3 h-3" />
                      <span>{item.niche || 'Lash'}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      {item.layout_model || 'mosaico'} / {item.theme_variant || 'rose'}
                    </span>
                  </div>

                  <h2 className="font-serif text-lg font-bold text-white leading-tight">
                    {item.studio_name || item.client_name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Por {item.client_name}</p>
                  <p className="text-[11px] font-mono text-rose-400/90 mt-2 truncate">
                    /c/{item.slug}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <Link
                    href={`/c/${item.slug}`}
                    target="_blank"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1 transition-all"
                  >
                    <span>Ver Catálogo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => deleteCatalog(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    title="Excluir Catálogo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
