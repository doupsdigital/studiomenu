'use client';

import React, { use, useEffect, useState } from 'react';
import { LayoutModel, ThemeVariant, NicheType } from '@/types/catalog';
import { CatalogLayout } from '@/components/catalog/CatalogLayout';
import { StylePickerPanel } from '@/components/catalog/StylePickerPanel';
import { nichePresetsMap } from '@/data/niche-presets';

export default function ShowcasePage({ params }: { params: Promise<{ niche: string }> }) {
  const { niche: nicheParam } = use(params);
  const niche = nicheParam as NicheType;
  const basePreset = nichePresetsMap[niche];

  const [layoutModel, setLayoutModel] = useState<LayoutModel>(basePreset?.layout_model || 'mosaico');
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>(basePreset?.theme_variant || 'rose');
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
      <StylePickerPanel
        layoutModel={layoutModel}
        themeVariant={themeVariant}
        onChangeLayout={setLayoutModel}
        onChangeTheme={setThemeVariant}
        onCoverScreen={onCoverScreen}
      />

      {/* Renderização do Catálogo Real — mesmo componente usado nos catálogos de clientes.
          CatalogLayout re-sincroniza sozinho ao trocar modelo/tema, preservando o scroll. */}
      <CatalogLayout data={catalog} />
    </div>
  );
}
