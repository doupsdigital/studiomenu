'use client';

import React, { useState } from 'react';
import { LayoutModel, ThemeVariant, NicheType } from '@/types/catalog';
import { CatalogLayout } from '@/components/catalog/CatalogLayout';
import { nichePresetsMap } from '@/modelos-novos';
import { Sparkles, Palette, Layers, Scissors } from 'lucide-react';

export default function DemoPage() {
  const [selectedNiche, setSelectedNiche] = useState<NicheType>('lash');
  const [layoutModel, setLayoutModel] = useState<LayoutModel>('mosaico');
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>('rose');

  const basePreset = nichePresetsMap[selectedNiche];

  const catalog = {
    ...basePreset,
    layout_model: layoutModel,
    theme_variant: themeVariant,
    client_name: basePreset.client_name,
    cover_media_url: layoutModel === 'classico' ? '/modelos/classico/assets/img/Hero.png' : '/modelos/mosaico/assets/img/Hero.png',
    avatar_url: layoutModel === 'classico' ? '/modelos/classico/assets/img/Hero.png' : '/modelos/mosaico/assets/img/Hero.png',
  };

  return (
    <div className="relative min-h-screen">
      {/* Barra de Controle de Testes Visual Superior (Overlay Flutuante) */}
      <div className="fixed top-2 left-2 right-2 z-50 max-w-md mx-auto bg-slate-950/90 backdrop-blur-md text-white p-2.5 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Testes StudioMenu
            </span>
            <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
              Modelos Novos por Nicho
            </span>
          </div>

          {/* Seletores de Nicho, Modelo e Tema */}
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <div>
              <select
                value={selectedNiche}
                onChange={(e) => setSelectedNiche(e.target.value as NicheType)}
                className="w-full bg-slate-800/90 text-white rounded-lg p-1 text-[10px] font-medium border border-slate-700 focus:outline-none"
              >
                <option value="lash">Lash Designer</option>
                <option value="nail">Nail Designer</option>
                <option value="estetica">Estética</option>
                <option value="studio">Studio (Multi)</option>
              </select>
            </div>

            <div>
              <select
                value={layoutModel}
                onChange={(e) => setLayoutModel(e.target.value as LayoutModel)}
                className="w-full bg-slate-800/90 text-white rounded-lg p-1 text-[10px] font-medium border border-slate-700 focus:outline-none"
              >
                <option value="mosaico">Mosaico</option>
                <option value="classico">Clássico</option>
              </select>
            </div>

            <div>
              <select
                value={themeVariant}
                onChange={(e) => setThemeVariant(e.target.value as ThemeVariant)}
                className="w-full bg-slate-800/90 text-white rounded-lg p-1 text-[10px] font-medium border border-slate-700 focus:outline-none"
              >
                <option value="rose">Rosé 🌸</option>
                <option value="luxury">Luxury 👑</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Renderização do Catálogo Fiel */}
      {/* CatalogLayout re-sincroniza sozinho quando slug/layout_model/theme_variant mudam
          (ver useEffect em CatalogLayout.tsx) — sem precisar remontar e sem perder o scroll. */}
      <CatalogLayout
        data={catalog}
        onThemeChange={(newTheme) => setThemeVariant(newTheme)}
      />
    </div>
  );
}
