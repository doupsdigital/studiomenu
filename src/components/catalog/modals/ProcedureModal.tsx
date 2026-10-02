'use client';

import React, { useState } from 'react';
import { ProcedureItem } from '@/types/catalog';
import { formatCurrencyBRL, formatMinutesToLabel, parseDurationToMinutes } from '@/lib/format';
import { useFilePickerFallback } from '@/lib/use-file-picker-fallback';
import { isKnownInAppBrowser } from '@/lib/in-app-browser';

type ProcForm = ProcedureItem & { maintenance?: string; visualEffect?: string };

const DURATION_HOUR_OPTIONS = [0, 1, 2, 3, 4, 5, 6];
const DURATION_MINUTE_OPTIONS = [0, 15, 30, 45];

/** Arredonda pro múltiplo de 15 mais próximo — cobre o raro caso de um
 *  catálogo antigo ter uma duração "torta" (ex: extraída por IA de um
 *  texto incomum) que não bate certinho com as opções do seletor. */
function roundToNearestQuarter(minutes: number): number {
  return Math.round(minutes / 15) * 15;
}

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
  const initialTotalMinutes = roundToNearestQuarter(procForm.duration_minutes ?? parseDurationToMinutes(procForm.duration) ?? 0);
  const [durationHours, setDurationHours] = useState(() => Math.min(6, Math.floor(initialTotalMinutes / 60)));
  const [durationMinutesPart, setDurationMinutesPart] = useState(() => initialTotalMinutes % 60);
  const { showStuckHint, copied, handleLabelClick, handleChange: handleFileChange, copyPageLink } = useFilePickerFallback(onFileUpload);

  const applyDuration = (hours: number, minutesPart: number) => {
    const total = hours * 60 + minutesPart;
    setProcForm({ ...procForm, duration_minutes: total || null, duration: formatMinutesToLabel(total) });
  };

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

      <div className="lm-form-group">
        <label>PREÇO (R$) *</label>
        <input
          type="text"
          inputMode="decimal"
          value={procForm.price}
          onChange={(e) => setProcForm({ ...procForm, price: formatCurrencyBRL(e.target.value) })}
          placeholder="R$ 0,00"
        />
      </div>

      <div className="lm-form-group">
        <label>DURAÇÃO *</label>
        {/* Seletores em vez de texto livre — evita qualquer duração "torta"
         *  chegar na agenda (achado real, 2026-09-28: campo de texto
         *  atrapalhava a leitura de tempo). `duration` (o texto de exibição
         *  no catálogo) e `duration_minutes` (o que o agendamento automático
         *  usa) são sempre derivados juntos daqui — nunca mais digitados
         *  separadamente. */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            className="lm-form-select"
            value={durationHours}
            onChange={(e) => {
              const hours = Number(e.target.value);
              setDurationHours(hours);
              applyDuration(hours, durationMinutesPart);
            }}
          >
            {DURATION_HOUR_OPTIONS.map((h) => (
              <option key={h} value={h}>
                {h}h
              </option>
            ))}
          </select>
          <select
            className="lm-form-select"
            value={durationMinutesPart}
            onChange={(e) => {
              const minutesPart = Number(e.target.value);
              setDurationMinutesPart(minutesPart);
              applyDuration(durationHours, minutesPart);
            }}
          >
            {DURATION_MINUTE_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}min
              </option>
            ))}
          </select>
        </div>
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
        {isKnownInAppBrowser() && (
          <p className="lm-filepicker-inapp-hint">
            Parece que você abriu esse link por dentro de outro app (Instagram, Facebook ou TikTok). Se o seletor de
            fotos não abrir, toque em "⋮" e escolha "Abrir no navegador".
          </p>
        )}
        <div className="lm-svc-photo-row">
          <div className="lm-svc-photo-preview-wrap">
            <img
              src={procForm.image_url || 'https://images.unsplash.com/photo-1583001809873-a1284d563391?auto=format&fit=crop&w=400&q=80'}
              alt="Preview"
            />
          </div>
          <label className="lm-svc-photo-upload-btn" onClick={handleLabelClick}>
            <span>📤 ESCOLHER FOTO</span>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
        </div>
        {showStuckHint && (
          <p className="lm-filepicker-stuck-hint">
            Não abriu? Copie este link e cole direto no Chrome ou Safari.{' '}
            <button type="button" onClick={copyPageLink}>
              {copied ? '✓ Copiado!' : 'Copiar link'}
            </button>
          </p>
        )}
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
