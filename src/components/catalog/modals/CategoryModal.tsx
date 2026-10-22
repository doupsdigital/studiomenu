'use client';

import React from 'react';

interface CategoryModalProps {
  newCatName: string;
  setNewCatName: (name: string) => void;
  onAddCategory: (categoryName: string) => void;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ newCatName, setNewCatName, onAddCategory, onClose }) => {
  return (
    <div className="lm-modal-card">
      <h3 className="lm-modal-title">➕ Criar Nova Categoria</h3>
      <p className="lm-modal-desc">Digite o nome da nova categoria para organizar seus procedimentos:</p>

      <div className="lm-form-group">
        <label>NOME DA CATEGORIA *</label>
        <input
          type="text"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          placeholder="Ex: Lash Lifting, Micropigmentação, Cursos..."
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
            if (newCatName.trim()) {
              const catName = newCatName.trim();
              setNewCatName('');
              onAddCategory(catName);
            } else {
              onClose();
            }
          }}
        >
          ✨ Criar Categoria
        </button>
      </div>
    </div>
  );
};
