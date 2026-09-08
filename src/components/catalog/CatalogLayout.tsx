'use client';

import React, { useMemo, useEffect } from 'react';

import { CatalogOrderData, ThemeVariant } from '@/types/catalog';
import { HeaderCover } from './HeaderCover';
import { ProcedureGrid } from './ProcedureGrid';
import { InstructionsSection } from './InstructionsSection';
import { CTASection } from './CTASection';

import { ClientEditBar } from './ClientEditBar';

interface CatalogLayoutProps {
  data: CatalogOrderData;
  isEditMode?: boolean;
  editToken?: string;
  onThemeChange?: (theme: ThemeVariant) => void;
}

export const CatalogLayout: React.FC<CatalogLayoutProps> = ({
  data,
  isEditMode = false,
  editToken = '',
  onThemeChange,
}) => {
  const [catalogState, setCatalogState] = React.useState<CatalogOrderData>(data);

  // Manter estado sincronizado se data prop mudar externamente
  useEffect(() => {
    setCatalogState(data);
  }, [data]);

  const isLuxury = catalogState.theme_variant === 'luxury';

  // Sincronizar data-theme no <body> para ativar as regras CSS do tema Luxury/Rosé
  useEffect(() => {
    const theme = catalogState.theme_variant || 'rose';
    document.body.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    return () => {
      document.body.removeAttribute('data-theme');
      document.documentElement.removeAttribute('data-theme');
    };
  }, [catalogState.theme_variant]);

  // Extrair categorias para os chips da Hero
  const categories = useMemo(() => {
    const set = new Set<string>();
    catalogState.procedures.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [catalogState.procedures]);

  return (
    <div className={`mosaico-wrapper ${isLuxury ? 'theme-luxury' : 'theme-rose'}`}>
      {/* SELETOR / BARRA DE EDIÇÃO DA CLIENTE */}
      {isEditMode && (
        <ClientEditBar
          catalogData={catalogState}
          editToken={editToken}
          onUpdateCatalog={setCatalogState}
        />
      )}

      {/* SELETOR FLUTUANTE DUAL DE TEMA ULTRA PREMIUM (ROSÉ 🌸 / LUXURY 👑) */}
      {onThemeChange && (
        <nav className="theme-switcher-widget" id="theme-switcher-widget" aria-label="Alternar Tema do Catálogo">
          <div className="theme-switcher-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <span>Clique para mudar o tema</span>
          </div>
          <div className="theme-switcher-options">
            <button
              type="button"
              className={`theme-switcher-btn ${!isLuxury ? 'is-active' : ''}`}
              onClick={() => onThemeChange('rose')}
            >
              <span className="theme-switcher-icon">🌸</span>
              <span className="theme-switcher-title">Modo Rosé</span>
            </button>
            <button
              type="button"
              className={`theme-switcher-btn ${isLuxury ? 'is-active' : ''}`}
              onClick={() => onThemeChange('luxury')}
            >
              <span className="theme-switcher-icon">👑</span>
              <span className="theme-switcher-title">Modo Luxury</span>
            </button>
          </div>
        </nav>
      )}

      {/* App Mobile Container Original */}
      <div className={`mosaico-app is-visible ${isLuxury ? 'is-luxury' : ''}`}>
        {/* 1. Hero Section */}
        <HeaderCover data={catalogState} categories={categories} />

        {/* 2. Seção Mosaico/Clássico de Procedimentos */}
        <ProcedureGrid
          procedures={catalogState.procedures}
          whatsappNumber={catalogState.whatsapp_number}
          clientName={catalogState.client_name}
          layoutModel={catalogState.layout_model}
        />

        {/* 3. Seção Orientações */}
        <InstructionsSection instructions={catalogState.instructions} bgUrl={catalogState.instructions_bg_url} />

        {/* 4. Seção Contato & Localização */}
        <CTASection data={catalogState} />
      </div>
    </div>
  );
};
