'use client';

import React from 'react';

interface InstructionItemForm {
  title: string;
  description: string;
}

interface InstructionItemModalProps {
  itemForm: InstructionItemForm;
  setItemForm: React.Dispatch<React.SetStateAction<InstructionItemForm>>;
  isNew: boolean;
  onSaveItem: (values: InstructionItemForm) => void;
  onClose: () => void;
}

export const InstructionItemModal: React.FC<InstructionItemModalProps> = ({
  itemForm,
  setItemForm,
  isNew,
  onSaveItem,
  onClose,
}) => {
  const canSave = itemForm.title.trim().length > 0;

  return (
    <div className="lm-modal-card">
      <h3 className="lm-modal-title">{isNew ? '➕ Adicionar Informação' : '✏️ Editar Informação'}</h3>
      <p className="lm-modal-desc">
        Título curto + descrição — use pra política de cancelamento, pontualidade, formas de
        pagamento, ou qualquer outro aviso que seu catálogo precise.
      </p>

      <div className="lm-form-group">
        <label>TÍTULO *</label>
        <input
          type="text"
          value={itemForm.title}
          onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
          placeholder="Ex: Política de Cancelamento"
        />
      </div>

      <div className="lm-form-group">
        <label>DESCRIÇÃO</label>
        <textarea
          value={itemForm.description}
          onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
          placeholder="Ex: Cancelamentos com menos de 24h de antecedência não são reembolsados."
          rows={3}
        />
      </div>

      <div className="lm-modal-actions">
        <button type="button" className="lm-modal-btn lm-modal-btn-cancel" onClick={onClose}>
          Cancelar
        </button>
        <button
          type="button"
          className="lm-modal-btn lm-modal-btn-confirm"
          disabled={!canSave}
          onClick={() => {
            if (!canSave) return;
            onSaveItem(itemForm);
            onClose();
          }}
        >
          💾 Salvar
        </button>
      </div>
    </div>
  );
};
