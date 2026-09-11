'use client';

import React from 'react';
import { ProcedureItem } from '@/types/catalog';

type ProcForm = ProcedureItem & { maintenance?: string; visualEffect?: string };

interface ProcedureModalProps {
  procForm: ProcForm;
  setProcForm: React.Dispatch<React.SetStateAction<ProcForm>>;
  editingProcIndex: number | null;
  safeCategories: string[];
  procFormError: string;
  setProcFormError: (msg: string) => void;
  onOpenAddCatModal?: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveProcedure: (proc: ProcedureItem, index: number | null) => void;
  onClose: () => void;
}

export const ProcedureModal: React.FC<ProcedureModalProps> = ({
  procForm,
  setProcForm,
  editingProcIndex,
  safeCategories,
  procFormError,
  setProcFormError,
  onOpenAddCatModal,
  onFileUpload,
  onSaveProcedure,
  onClose,
}) => {
  return (
    <div className="lm-modal-card">
      <h3 className="lm-modal-title">
        {editingProcIndex !== null ? `✏️ Editar: ${procForm.title || 'Procedimento'}` : '➕ Criar Novo Procedimento'}
      </h3>

      <div className="lm-form-group">
        <label>NOME DO SERVIÇO *</label>
        <input
          type="text"
          value={procForm.title}
          onChange={(e) => setProcForm({ ...procForm, title: e.target.value })}
          placeholder="Clássico Fio a Fio"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="lm-form-group">
          <label>PREÇO (R$) *</label>
          <input
            type="text"
            value={procForm.price}
            onChange={(e) => setProcForm({ ...procForm, price: e.target.value })}
            placeholder="100,00"
          />
        </div>
        <div className="lm-form-group">
          <label>DURAÇÃO *</label>
          <input
            type="text"
            value={procForm.duration || ''}
            onChange={(e) => setProcForm({ ...procForm, duration: e.target.value })}
            placeholder="1h30"
          />
        </div>
      </div>

      <div className="lm-form-group">
        <label>DURAÇÃO EM MINUTOS (PARA AGENDAMENTO AUTOMÁTICO)</label>
        <input
          type="number"
          min={5}
          step={5}
          value={procForm.duration_minutes ?? ''}
          onChange={(e) =>
            setProcForm({
              ...procForm,
              duration_minutes: e.target.value === '' ? null : Number(e.target.value),
            })
          }
          placeholder="Ex: 90"
        />
        <span style={{ fontSize: '0.75rem', opacity: 0.65, marginTop: '4px', display: 'block' }}>
          Opcional por enquanto. Vai ser usado pra calcular os horários disponíveis quando o agendamento automático estiver ativo.
        </span>
      </div>

      <div className="lm-form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ marginBottom: 0 }}>CATEGORIA *</label>
          <button
            type="button"
            className="lm-btn-add-cat-inline"
            onClick={() => {
              if (onOpenAddCatModal) {
                onOpenAddCatModal();
              }
            }}
          >
            + Nova Categoria
          </button>
        </div>
        <select
          className="lm-form-select"
          value={procForm.category || safeCategories[0] || 'Geral'}
          onChange={(e) => setProcForm({ ...procForm, category: e.target.value })}
        >
          {safeCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="lm-form-group">
          <label>MANUTENÇÃO (OPCIONAL)</label>
          <input
            type="text"
            value={procForm.maintenance || ''}
            onChange={(e) => setProcForm({ ...procForm, maintenance: e.target.value })}
            placeholder="Ex: 60,00 (até 20 dias)"
          />
        </div>
        <div className="lm-form-group">
          <label>EFEITO VISUAL (OPCIONAL)</label>
          <input
            type="text"
            value={procForm.visualEffect || ''}
            onChange={(e) => setProcForm({ ...procForm, visualEffect: e.target.value })}
            placeholder="Natural, Discreto & Elegante"
          />
        </div>
      </div>

      <div className="lm-form-group">
        <label>FOTO DO SERVIÇO</label>
        <div className="lm-svc-photo-row">
          <div className="lm-svc-photo-preview-wrap">
            <img
              src={procForm.image_url || 'https://images.unsplash.com/photo-1583001809873-a1284d563391?auto=format&fit=crop&w=400&q=80'}
              alt="Preview"
            />
          </div>
          <label className="lm-svc-photo-upload-btn">
            <span>📤 ESCOLHER FOTO</span>
            <input type="file" accept="image/*" onChange={onFileUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div className="lm-form-group">
        <label>DESCRIÇÃO</label>
        <textarea
          rows={3}
          value={procForm.description || ''}
          onChange={(e) => setProcForm({ ...procForm, description: e.target.value })}
          placeholder="Um fio sintético ultrafino acoplado a cada cílio natural saudável. O resultado mais elegante e discreto: olhar iluminado com efeito de rímel perfeito."
        />
      </div>

      {procFormError && (
        <div style={{ color: '#dc2626', fontSize: '0.82rem', fontWeight: 600, marginBottom: '12px', textAlign: 'center' }}>
          ⚠️ {procFormError}
        </div>
      )}

      <div className="lm-modal-actions">
        <button type="button" className="lm-modal-btn lm-modal-btn-cancel" onClick={onClose}>
          Cancelar
        </button>
        <button
          type="button"
          className="lm-modal-btn lm-modal-btn-confirm"
          onClick={() => {
            if (!procForm.title || !procForm.price) {
              setProcFormError('Por favor informe o título e o preço do procedimento.');
              return;
            }
            setProcFormError('');
            onSaveProcedure(procForm, editingProcIndex);
            onClose();
          }}
        >
          💾 Salvar Alterações
        </button>
      </div>
    </div>
  );
};
