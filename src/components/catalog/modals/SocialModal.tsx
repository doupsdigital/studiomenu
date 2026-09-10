'use client';

import React from 'react';

interface SocialForm {
  whatsapp: string;
  instagram: string;
  address: string;
}

interface SocialModalProps {
  socialForm: SocialForm;
  setSocialForm: React.Dispatch<React.SetStateAction<SocialForm>>;
  onSaveSocial: (type: 'whatsapp' | 'instagram' | 'address', value: string) => void;
  onClose: () => void;
}

export const SocialModal: React.FC<SocialModalProps> = ({ socialForm, setSocialForm, onSaveSocial, onClose }) => {
  return (
    <div className="lm-modal-card">
      <h3 className="lm-modal-title">✏️ Editar Contatos</h3>
      <p className="lm-modal-desc">Ajuste seu WhatsApp, Instagram e Cidade exibidos no catálogo:</p>

      <div className="lm-form-group">
        <label>WHATSAPP (COM DDD) *</label>
        <input
          type="text"
          value={socialForm.whatsapp}
          onChange={(e) => setSocialForm({ ...socialForm, whatsapp: e.target.value })}
          placeholder="Ex: 11999998888"
        />
      </div>

      <div className="lm-form-group">
        <label>INSTAGRAM (@USUARIO)</label>
        <input
          type="text"
          value={socialForm.instagram}
          onChange={(e) => setSocialForm({ ...socialForm, instagram: e.target.value })}
          placeholder="Ex: @studio.exemplo"
        />
      </div>

      <div className="lm-form-group">
        <label>CIDADE E ESTADO</label>
        <input
          type="text"
          value={socialForm.address}
          onChange={(e) => setSocialForm({ ...socialForm, address: e.target.value })}
          placeholder="Ex: Piraúba - Minas Gerais"
        />
      </div>

      <div className="lm-modal-actions">
        <button type="button" className="lm-modal-btn lm-modal-btn-cancel" onClick={onClose}>
          Cancelar
        </button>
        <button
          type="button"
          className="lm-modal-btn lm-modal-btn-confirm"
          onClick={() => {
            onSaveSocial('whatsapp', socialForm.whatsapp);
            onSaveSocial('instagram', socialForm.instagram);
            onSaveSocial('address', socialForm.address);
            onClose();
          }}
        >
          💾 Salvar Contatos
        </button>
      </div>
    </div>
  );
};
