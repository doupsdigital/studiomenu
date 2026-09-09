'use client';

import React from 'react';
import { CatalogOrderData, ThemeVariant } from '@/types/catalog';

interface VisualEditorBottomBarProps {
  catalogData: CatalogOrderData;
  isSaved: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onToggleTheme: () => void;
  onDiscard: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export const VisualEditorBottomBar: React.FC<VisualEditorBottomBarProps> = ({
  catalogData,
  isSaved,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onToggleTheme,
  onDiscard,
  onSave,
  isSaving,
}) => {
  const isLuxury = catalogData.theme_variant === 'luxury';

  return (
    <>
      {/* 1. Indicador Discreto no Topo Direito: ● Edição Ativa */}
      <div id="lm-editor-top-status" aria-label="Status do Editor">
        <span className={`lm-status-dot ${isSaved ? 'is-saved' : ''}`} />
        <span id="lm-status-text">{isSaved ? 'Salvo' : 'Edição Ativa'}</span>
      </div>

      {/* 2. Barra Flutuante Inferior Arredondada (#lm-editor-bottom-bar) */}
      <div id="lm-editor-bottom-bar">
        <div className="lm-mb-btn-group">
          <button
            type="button"
            className="lm-mb-btn"
            id="lm-btn-undo"
            title="Desfazer"
            disabled={!canUndo}
            onClick={onUndo}
          >
            ↩️
          </button>
          <button
            type="button"
            className="lm-mb-btn"
            id="lm-btn-redo"
            title="Refazer"
            disabled={!canRedo}
            onClick={onRedo}
          >
            ↪️
          </button>
          <button
            type="button"
            className="lm-mb-btn"
            id="lm-btn-theme"
            title="Alternar Tema (Rosé / Luxury)"
            onClick={onToggleTheme}
          >
            {isLuxury ? '👑' : '🌸'}
          </button>
          <button
            type="button"
            className="lm-mb-btn"
            id="lm-btn-discard"
            title="Descartar Alterações"
            onClick={onDiscard}
          >
            🗑️
          </button>
          <a
            className="lm-mb-btn"
            id="lm-btn-view-catalog"
            href={`/c/${catalogData.slug}`}
            target="_blank"
            rel="noreferrer"
            title="Ver Meu Catálogo (Prévia Leitura)"
          >
            👁️
          </a>
        </div>

        <button
          type="button"
          className="lm-mb-btn-save"
          id="lm-btn-save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? '⏳ SALVANDO...' : '💾 SALVAR'}
        </button>
      </div>
    </>
  );
};
