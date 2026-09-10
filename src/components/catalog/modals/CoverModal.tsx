'use client';

import React from 'react';
import { Upload } from 'lucide-react';

interface CoverModalProps {
  isUploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
}

export const CoverModal: React.FC<CoverModalProps> = ({ isUploading, onFileUpload, onClose }) => {
  return (
    <div className="lm-modal-card">
      <h3 className="lm-modal-title">📷 Alterar Foto de Capa</h3>
      <p className="lm-modal-desc">Escolha uma nova imagem para o topo do seu catálogo:</p>

      <div className="lm-form-group">
        <label className="lm-svc-photo-upload-btn" style={{ width: '100%', justifyContent: 'center' }}>
          <Upload className="w-4 h-4" />
          <span>{isUploading ? 'Enviando foto...' : 'Escolher Imagem do Dispositivo'}</span>
          <input type="file" accept="image/*" onChange={onFileUpload} style={{ display: 'none' }} />
        </label>
      </div>

      <div className="lm-modal-actions">
        <button type="button" className="lm-modal-btn lm-modal-btn-cancel" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
};
