'use client';

import React, { useState } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';

interface NewCatalogWelcomeOverlayProps {
  slug: string;
  editToken: string;
  onClose: () => void;
}

export const NewCatalogWelcomeOverlay: React.FC<NewCatalogWelcomeOverlayProps> = ({ slug, editToken, onClose }) => {
  const [linkCopied, setLinkCopied] = useState(false);
  const editUrl = typeof window !== 'undefined' ? `${window.location.origin}/c/${slug}?edit=${editToken}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(editUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="lm-new-catalog-overlay" role="dialog" aria-modal="true">
      <div className="lm-new-catalog-card">
        <div className="lm-new-catalog-icon">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2>Seu catálogo foi criado!</h2>
        <p>
          Toque em qualquer texto, foto ou procedimento na tela pra editar. Quando terminar,
          toque em <strong>💾 SALVAR</strong> no rodapé pra publicar as mudanças.
        </p>

        <div className="lm-new-catalog-link">
          <span className="lm-new-catalog-link-label">Link mágico de edição (guarde ou envie pra cliente)</span>
          <div className="lm-new-catalog-link-row">
            <span className="lm-new-catalog-link-text">{editUrl}</span>
            <button type="button" onClick={handleCopy} className="lm-new-catalog-copy-btn">
              {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <button type="button" className="lm-new-catalog-start-btn" onClick={onClose}>
          Começar a editar
        </button>
      </div>
    </div>
  );
};
