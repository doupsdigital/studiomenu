'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Search, Copy, Lightbulb } from 'lucide-react';
import { SCRIPTS_DATA, SCRIPT_CATEGORIES } from '@/data/vendasX1Scripts';

export default function AdminScriptsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const filteredScripts = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return SCRIPTS_DATA.filter((item) => {
      const matchCat = activeCategory === 'all' || item.category === activeCategory;
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchTerm]);

  const copyScript = (content: string) => {
    navigator.clipboard.writeText(content);
    showToast('✅ Script copiado com sucesso!');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <header className="pb-6 border-b border-slate-800">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-slate-300 mb-2 transition-all"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Voltar ao Painel</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <MessageCircle className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold">
              Playbook de Vendas <em className="not-italic text-emerald-400">WhatsApp X1</em>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Abordagens, contorno de objeções e mensagens de 1 clique para copiar.
          </p>
        </header>

        {/* Busca */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar script por palavra (ex: caro, pix, canva, instagram)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Filtro de Categorias */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {SCRIPT_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.key
                  ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Contador */}
        <p className="text-[10px] text-slate-500">
          Exibindo <strong className="text-slate-300">{filteredScripts.length}</strong> de {SCRIPTS_DATA.length} scripts
        </p>

        {/* Lista de Scripts */}
        {filteredScripts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 p-8">
            <p className="text-sm font-semibold text-slate-300">
              Nenhum script encontrado para &quot;{searchTerm}&quot;.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredScripts.map((script) => (
              <div
                key={script.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2.5 hover:border-slate-700 transition-all"
              >
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#c9a389]/10 text-[#c9a389] border border-[#c9a389]/20">
                  {script.categoryName}
                </span>

                <h3 className="font-bold text-white text-sm leading-snug">{script.title}</h3>

                {script.tip && (
                  <div className="flex items-start gap-2 bg-white/[0.03] border-l-2 border-[#c9a389] rounded-r-lg px-3 py-2 text-xs text-slate-400">
                    <Lightbulb className="w-3.5 h-3.5 text-[#c9a389] flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[#c9a389]">Dica de uso:</strong> {script.tip}
                    </span>
                  </div>
                )}

                <div className="bg-slate-950 border border-dashed border-slate-700 rounded-xl p-3.5 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {script.content}
                </div>

                <button
                  type="button"
                  onClick={() => copyScript(script.content)}
                  className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Script</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold shadow-2xl z-50">
          {toastMessage}
        </div>
      )}
    </main>
  );
}
