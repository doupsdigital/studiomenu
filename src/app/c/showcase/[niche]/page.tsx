'use client';

import React, { use, useEffect, useState } from 'react';
import { LayoutModel, ThemeVariant, NicheType } from '@/types/catalog';
import { CatalogLayout } from '@/components/catalog/CatalogLayout';
import { nichePresetsMap } from '@/modelos-novos';
import { Sparkles, Layers, ChevronDown, Wand2 } from 'lucide-react';

export default function ShowcasePage({ params }: { params: Promise<{ niche: string }> }) {
  const { niche: nicheParam } = use(params);
  const niche = nicheParam as NicheType;
  const basePreset = nichePresetsMap[niche];

  const [layoutModel, setLayoutModel] = useState<LayoutModel>(basePreset?.layout_model || 'mosaico');
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>(basePreset?.theme_variant || 'rose');
  const [panelOpen, setPanelOpen] = useState(false);
  // Na capa (#hero) faz mais sentido mostrar o seletor de Tema; a partir da tela
  // de procedimentos (#catalogo) em diante, o que se destaca é o Modelo (grid vs lista).
  const [onCoverScreen, setOnCoverScreen] = useState(true);

  useEffect(() => {
    const heroEl = document.getElementById('hero');
    if (!heroEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => setOnCoverScreen(entry.isIntersecting),
      { threshold: 0.5 }
    );
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, [niche, layoutModel, themeVariant]);

  if (!basePreset) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-white text-center">
        <div className="max-w-sm w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
          <h1 className="font-serif text-2xl font-bold mb-2">Modelo Não Encontrado</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Não existe um modelo de vitrine para o nicho <code className="text-rose-400 font-mono">{nicheParam}</code>.
          </p>
        </div>
      </main>
    );
  }

  const catalog = {
    ...basePreset,
    layout_model: layoutModel,
    theme_variant: themeVariant,
    cover_media_url: layoutModel === 'classico' ? '/modelos/classico/assets/img/Hero.png' : '/modelos/mosaico/assets/img/Hero.png',
    avatar_url: layoutModel === 'classico' ? '/modelos/classico/assets/img/Hero.png' : '/modelos/mosaico/assets/img/Hero.png',
  };

  return (
    <div className="relative min-h-screen">
      {/* Botão/Painel Flutuante de Personalização — colapsado vira uma pílula pequena só
          com texto, ancorada no canto, para nunca tampar conteúdo. Largura/altura explícitas
          (não "auto") para a expansão animar suavemente em vez de "pular". */}
      <div
        className={`fixed top-4 left-4 z-50 overflow-hidden bg-slate-950/90 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 ease-out ${
          panelOpen ? 'w-64 rounded-3xl' : 'w-32 rounded-full'
        }`}
      >
        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          className={`relative flex items-center text-[10px] font-bold uppercase tracking-widest text-rose-300 transition-all duration-300 ease-out ${
            panelOpen ? 'h-11 w-full justify-between px-3.5' : 'h-7 w-32 justify-center px-3'
          }`}
        >
          {!panelOpen && <span className="absolute inset-0 rounded-full bg-rose-400/20 animate-pulse" />}
          <span className="relative flex items-center gap-1.5">
            {panelOpen && <Wand2 className="w-3.5 h-3.5 flex-shrink-0" />}
            <span className="whitespace-nowrap">Personalizar</span>
          </span>
          {panelOpen && <ChevronDown className="w-3 h-3 flex-shrink-0" />}
        </button>

        <div
          className={`transition-all duration-300 ease-out overflow-hidden ${
            panelOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="px-3.5 pb-3.5">
            {onCoverScreen ? (
                /* Na capa: destaque para o Tema (Rosé/Luxury) */
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 mb-1 px-0.5">Tema</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setThemeVariant('rose')}
                      className={`py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        themeVariant === 'rose'
                          ? 'bg-gradient-to-r from-rose-500 to-rose-400 text-white shadow-lg shadow-rose-500/30'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <span>🌸</span>
                      <span>Rosé</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setThemeVariant('luxury')}
                      className={`py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        themeVariant === 'luxury'
                          ? 'text-[#0f0c0b] shadow-lg'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                      style={
                        themeVariant === 'luxury'
                          ? { background: 'linear-gradient(135deg, #c9a389 0%, #dfa87a 100%)' }
                          : undefined
                      }
                    >
                      <span>👑</span>
                      <span>Luxury</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Da tela de procedimentos em diante: destaque para o Modelo (Mosaico/Clássico) */
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 mb-1 px-0.5">Modelo</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLayoutModel('mosaico')}
                      className={`py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        layoutModel === 'mosaico'
                          ? 'bg-white text-slate-900 shadow-lg'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Mosaico</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLayoutModel('classico')}
                      className={`py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        layoutModel === 'classico'
                          ? 'bg-white text-slate-900 shadow-lg'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Clássico</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
      </div>

      {/* Renderização do Catálogo Real — mesmo componente usado nos catálogos de clientes.
          CatalogLayout re-sincroniza sozinho ao trocar modelo/tema, preservando o scroll. */}
      <CatalogLayout data={catalog} />
    </div>
  );
}
