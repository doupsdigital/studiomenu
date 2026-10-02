'use client';

import React from 'react';
import { Upload } from 'lucide-react';
import { useFilePickerFallback } from '@/lib/use-file-picker-fallback';
import { isKnownInAppBrowser } from '@/lib/in-app-browser';

interface CoverModalProps {
  isUploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
}

export const CoverModal: React.FC<CoverModalProps> = ({ isUploading, onFileUpload, onClose }) => {
  const { showStuckHint, copied, handleLabelClick, handleChange, copyPageLink } = useFilePickerFallback(onFileUpload);

  return (
    <div className="lm-modal-card">
      <h3 className="lm-modal-title">📷 Alterar Foto de Capa</h3>
      <p className="lm-modal-desc">Escolha uma nova imagem para o topo do seu catálogo:</p>

      {isKnownInAppBrowser() && (
        <p className="lm-filepicker-inapp-hint">
          Parece que você abriu esse link por dentro de outro app (Instagram, Facebook ou TikTok). Se o seletor de
          fotos não abrir, toque em "⋮" e escolha "Abrir no navegador".
        </p>
      )}

      <div className="lm-form-group">
        <label className="lm-svc-photo-upload-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLabelClick}>
          <Upload className="w-4 h-4" />
          <span>{isUploading ? 'Enviando foto...' : 'Escolher Imagem do Dispositivo'}</span>
          <input type="file" accept="image/*" onChange={handleChange} style={{ display: 'none' }} />
        </label>
        {showStuckHint && (
          <p className="lm-filepicker-stuck-hint">
            Não abriu? Copie este link e cole direto no Chrome ou Safari.{' '}
            <button type="button" onClick={copyPageLink}>
              {copied ? '✓ Copiado!' : 'Copiar link'}
            </button>
          </p>
        )}
      </div>

      <div className="lm-modal-actions">
        <button type="button" className="lm-modal-btn lm-modal-btn-cancel" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
};
