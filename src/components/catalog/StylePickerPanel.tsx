'use client';

import React, { useState } from 'react';
import { LayoutModel, ThemeVariant } from '@/types/catalog';
import { Layers, ChevronDown, Wand2, Sparkles } from 'lucide-react';

interface StylePickerPanelProps {
  layoutModel: LayoutModel;
  themeVariant: ThemeVariant;
  onChangeLayout: (layout: LayoutModel) => void;
  onChangeTheme: (theme: ThemeVariant) => void;
  /** Na capa faz mais sentido destacar o Tema; da tela de procedimentos em
   *  diante, o que se destaca é o Modelo (grid vs lista). */
  onCoverScreen: boolean;
  /** Aberto por padrão (usado no passo de criação, onde o painel deve
   *  chamar atenção de cara em vez de começar colapsado como no Showroom). */
  defaultOpen?: boolean;
}

export const StylePickerPanel: React.FC<StylePickerPanelProps> = ({
  layoutModel,
  themeVariant,
  onChangeLayout,
  onChangeTheme,
  onCoverScreen,
  defaultOpen = false,
}) => {
  const [panelOpen, setPanelOpen] = useState(defaultOpen);

  return (
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
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 mb-1 px-0.5">Tema</p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onChangeTheme('rose')}
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
                  onClick={() => onChangeTheme('luxury')}
                  className={`py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    themeVariant === 'luxury' ? 'text-[#0f0c0b] shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'
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
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 mb-1 px-0.5">Modelo</p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onChangeLayout('mosaico')}
                  className={`py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    layoutModel === 'mosaico' ? 'bg-white text-slate-900 shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Mosaico</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeLayout('classico')}
                  className={`py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    layoutModel === 'classico' ? 'bg-white text-slate-900 shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'
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
  );
};
