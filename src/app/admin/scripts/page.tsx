'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Search, Copy, Lightbulb } from 'lucide-react';
import { SCRIPTS_DATA, SCRIPT_CATEGORIES } from '@/data/vendas-x1-scripts';

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
    <main className="min-h-screen bg-slate-950 text-white p-5 md:p-10">
      <div className="max-w-4xl mx-auto space-y-7">
        {/* Header */}
        <header className="pb-7 border-b border-slate-800">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 mb-2.5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Painel</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <MessageCircle className="w-6 h-6" />
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold">
              Playbook de Vendas <em className="not-italic text-emerald-400">WhatsApp X1</em>
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1.5">
            Abordagens, contorno de objeções e mensagens de 1 clique para copiar.
          </p>
        </header>

        {/* Busca */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar script por palavra (ex: caro, pix, canva, instagram)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Filtro de Categorias */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {SCRIPT_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
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
        <p className="text-xs text-slate-500">
          Exibindo <strong className="text-slate-300">{filteredScripts.length}</strong> de {SCRIPTS_DATA.length} scripts
        </p>

        {/* Lista de Scripts */}
        {filteredScripts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 p-8">
            <p className="text-base font-semibold text-slate-300">
              Nenhum script encontrado para &quot;{searchTerm}&quot;.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredScripts.map((script) => (
              <div
                key={script.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-all"
              >
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#c9a389]/10 text-[#c9a389] border border-[#c9a389]/20">
                  {script.categoryName}
                </span>

                <h3 className="font-bold text-white text-base leading-snug">{script.title}</h3>

                {script.tip && (
                  <div className="flex items-start gap-2.5 bg-white/[0.03] border-l-2 border-[#c9a389] rounded-r-lg px-3.5 py-2.5 text-sm text-slate-400">
                    <Lightbulb className="w-4 h-4 text-[#c9a389] flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[#c9a389]">Dica de uso:</strong> {script.tip}
                    </span>
                  </div>
                )}

                <div className="bg-slate-950 border border-dashed border-slate-700 rounded-xl p-4 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {script.content}
                </div>

                <button
                  type="button"
                  onClick={() => copyScript(script.content)}
                  className="w-full py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copiar Script</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white text-sm font-semibold shadow-2xl z-50">
          {toastMessage}
        </div>
      )}
    </main>
  );
}
