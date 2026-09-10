'use client';

import React from 'react';
import { ProcedureItem } from '@/types/catalog';
import { CheckCircle } from 'lucide-react';

type ConfirmModalType =
  | 'save_confirm'
  | 'save_success'
  | 'save_error'
  | 'category_delete_confirm'
  | 'category_delete_blocked'
  | 'proc_delete_confirm'
  | 'discard_confirm';

interface ConfirmModalsProps {
  activeModal: ConfirmModalType;
  changesSummary: string[];
  isSaving: boolean;
  errorMessage: string;
  categoryToDelete?: { name: string; count: number } | null;
  procToDelete?: ProcedureItem | null;
  onClose: () => void;
  onConfirmSaveDatabase: () => void;
  onConfirmDeleteCategory?: () => void;
  onConfirmDeleteProc?: () => void;
  onConfirmDiscard?: () => void;
}

export const ConfirmModals: React.FC<ConfirmModalsProps> = ({
  activeModal,
  changesSummary,
  isSaving,
  errorMessage,
  categoryToDelete,
  procToDelete,
  onClose,
  onConfirmSaveDatabase,
  onConfirmDeleteCategory,
  onConfirmDeleteProc,
  onConfirmDiscard,
}) => {
  if (activeModal === 'save_confirm') {
    return (
      <div className="lm-modal-card">
        <h3 className="lm-modal-title">✨ Publicar Alterações</h3>
        <p className="lm-modal-desc">Confira o resumo das alterações antes de publicar no seu catálogo:</p>

        <div className="lm-save-summary-container">
          {changesSummary.map((itemText, idx) => (
            <div key={idx} className="lm-save-summary-item">
              {itemText}
            </div>
          ))}
        </div>

        <div className="lm-modal-actions">
          <button type="button" className="lm-modal-btn lm-modal-btn-cancel" onClick={onClose} disabled={isSaving}>
            Cancelar
          </button>
          <button
            type="button"
            className="lm-modal-btn lm-modal-btn-confirm"
            onClick={onConfirmSaveDatabase}
            disabled={isSaving}
          >
            {isSaving ? 'Publicando...' : '🚀 Confirmar'}
          </button>
        </div>
      </div>
    );
  }

  if (activeModal === 'save_success') {
    return (
      <div className="lm-modal-card" style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.12)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto',
          }}
        >
          <CheckCircle className="w-7 h-7" />
        </div>
        <h3 className="lm-modal-title" style={{ fontSize: '1.3rem' }}>
          Catálogo Publicado!
        </h3>
        <p className="lm-modal-desc" style={{ marginBottom: '22px' }}>
          Suas alterações foram salvas com sucesso e já estão ao vivo no seu catálogo online!
        </p>

        <div className="lm-modal-actions">
          <button
            type="button"
            className="lm-modal-btn lm-modal-btn-confirm"
            onClick={onClose}
            style={{ width: '100%', flex: '1 1 100%' }}
          >
            ✨ Entendido!
          </button>
        </div>
      </div>
    );
  }

  if (activeModal === 'save_error') {
    return (
      <div className="lm-modal-card" style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto',
          }}
        >
          <span style={{ fontSize: '24px' }}>⚠️</span>
        </div>
        <h3 className="lm-modal-title" style={{ color: '#ef4444', fontSize: '1.25rem' }}>
          Ops! Algo deu errado
        </h3>
        <p className="lm-modal-desc" style={{ color: '#4a3239', marginBottom: '22px' }}>
          {errorMessage || 'Ocorreu um erro ao tentar salvar as alterações no catálogo.'}
        </p>

        <div className="lm-modal-actions">
          <button
            type="button"
            className="lm-modal-btn lm-modal-btn-cancel"
            onClick={onClose}
            style={{ width: '100%', flex: '1 1 100%', background: '#f4e6e9', color: '#6b4c55' }}
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  if (activeModal === 'category_delete_blocked') {
    return (
      <div className="lm-modal-card" style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto',
          }}
        >
          <span style={{ fontSize: '24px' }}>🛑</span>
        </div>
        <h3 className="lm-modal-title" style={{ color: '#c04b6b', fontSize: '1.25rem' }}>
          Não é possível excluir
        </h3>
        <p className="lm-modal-desc" style={{ color: '#4a3239', marginBottom: '22px', lineHeight: '1.5' }}>
          A categoria <strong>"{categoryToDelete?.name}"</strong> possui{' '}
          <strong>{categoryToDelete?.count} procedimento(s)</strong> vinculado(s).
          <br />
          Para excluí-la, remova ou altere a categoria desses procedimentos primeiro.
        </p>

        <div className="lm-modal-actions">
          <button
            type="button"
            className="lm-modal-btn lm-modal-btn-confirm"
            onClick={onClose}
            style={{ width: '100%', flex: '1 1 100%' }}
          >
            ✨ Entendido!
          </button>
        </div>
      </div>
    );
  }

  if (activeModal === 'category_delete_confirm') {
    return (
      <div className="lm-modal-card">
        <h3 className="lm-modal-title">🗑️ Excluir Categoria</h3>
        <p className="lm-modal-desc">
          Tem certeza que deseja excluir a categoria <strong>"{categoryToDelete?.name}"</strong>?
        </p>

        <div className="lm-modal-actions">
          <button type="button" className="lm-modal-btn lm-modal-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="lm-modal-btn lm-modal-btn-confirm"
            style={{ background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' }}
            onClick={() => {
              if (onConfirmDeleteCategory) onConfirmDeleteCategory();
            }}
          >
            🗑️ Excluir Categoria
          </button>
        </div>
      </div>
    );
  }

  if (activeModal === 'proc_delete_confirm') {
    return (
      <div className="lm-modal-card">
        <h3 className="lm-modal-title">🗑️ Excluir Procedimento</h3>
        <p className="lm-modal-desc">
          Tem certeza que deseja excluir o procedimento <strong>"{procToDelete?.title}"</strong>?
        </p>

        <div className="lm-modal-actions">
          <button type="button" className="lm-modal-btn lm-modal-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="lm-modal-btn lm-modal-btn-confirm"
            style={{ background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' }}
            onClick={() => {
              if (onConfirmDeleteProc) onConfirmDeleteProc();
            }}
          >
            🗑️ Excluir Procedimento
          </button>
        </div>
      </div>
    );
  }

  // discard_confirm
  return (
    <div className="lm-modal-card">
      <h3 className="lm-modal-title">🗑️ Descartar Alterações</h3>
      <p className="lm-modal-desc">Deseja descartar todas as alterações não salvas da sessão de edição?</p>

      <div className="lm-modal-actions">
        <button type="button" className="lm-modal-btn lm-modal-btn-cancel" onClick={onClose}>
          Cancelar
        </button>
        <button
          type="button"
          className="lm-modal-btn lm-modal-btn-confirm"
          style={{ background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' }}
          onClick={() => {
            if (onConfirmDiscard) onConfirmDiscard();
          }}
        >
          🗑️ Descartar Alterações
        </button>
      </div>
    </div>
  );
};
