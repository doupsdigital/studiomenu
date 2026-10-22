'use client';

import React, { useEffect, useState } from 'react';
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

const MAX_EXTRA_PHOTOS = 2;

interface ProcedureModalProps {
  procForm: ProcForm;
  setProcForm: React.Dispatch<React.SetStateAction<ProcForm>>;
  editingProcIndex: number | null;
  safeCategories: string[];
  procFormError: string;
  setProcFormError: (msg: string) => void;
  onOpenAddCatModal?: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Fotos extras do procedimento (pedido real, 2026-10-22), opcional — no
   *  máx. `MAX_EXTRA_PHOTOS`. Mesmo mecanismo de upload da foto principal
   *  (`onFileUpload`), só que escreve em `procForm.extra_photos[index]` em
   *  vez de `procForm.image_url` (ver `VisualEditorModals.tsx`). */
  onFileUploadExtra?: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  /** Qual quadrado de foto está com upload em andamento agora (pedido real,
   *  2026-10-22) — 'main' pra foto principal, índice pra foto extra, null
   *  pra nenhuma. Mostra um spinner centralizado no quadrado certo. */
  uploadingProcSlot?: 'main' | number | null;
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
  onFileUploadExtra,
  uploadingProcSlot = null,
  onSaveProcedure,
  onClose,
}) => {
  const initialTotalMinutes = roundToNearestQuarter(procForm.duration_minutes ?? parseDurationToMinutes(procForm.duration) ?? 0);
  const [durationHours, setDurationHours] = useState(() => Math.min(6, Math.floor(initialTotalMinutes / 60)));
  const [durationMinutesPart, setDurationMinutesPart] = useState(() => initialTotalMinutes % 60);
  const { showStuckHint, copied, handleLabelClick, handleChange: handleFileChange, copyPageLink } = useFilePickerFallback(onFileUpload);
  // Quantas linhas de foto extra já estão reveladas — uma por clique em
  // "+ Adicionar mais fotos" (pedido real, 2026-10-22: mesmo formato da
  // linha principal, reveladas uma de cada vez, não todas de uma vez).
  // Começa já mostrando as linhas de fotos que o procedimento já tem
  // salvas, pra reabrir pra editar não esconder o que já foi configurado.
  const [extraRowCount, setExtraRowCount] = useState(() => procForm.extra_photos?.length || 0);
  // Bug real, 2026-10-22: `procForm` chega aqui ainda desatualizado no 1º
  // render (o componente pai, `VisualEditorModals.tsx`, só corrige o
  // `procForm` dele num `useEffect` que roda 1 ciclo DEPOIS de abrir pra
  // editar) — o `useState` lazy acima então calculava `extraRowCount` a
  // partir do procedimento ERRADO (o que estava sendo editado antes) e
  // nunca mais corrigia. `procForm.id` é o sinal confiável de "é outro
  // procedimento de verdade" (também chega desatualizado no 1º render,
  // mas muda de novo quando o pai corrige — refazendo este efeito).
  useEffect(() => {
    setExtraRowCount(procForm.extra_photos?.length || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [procForm.id]);
  const extraSlot0 = useFilePickerFallback((e) => onFileUploadExtra?.(e, 0));
  const extraSlot1 = useFilePickerFallback((e) => onFileUploadExtra?.(e, 1));
  const extraSlotPickers = [extraSlot0, extraSlot1];

  // Remove só a foto, mantendo a linha visível (volta pro estado vazio com
  // o "+") — pedido real, 2026-10-22, "relacionado à foto em si".
  const removeExtraPhoto = (index: number) => {
    setProcForm((prev) => ({
      ...prev,
      extra_photos: (prev.extra_photos || []).filter((_, i) => i !== index),
    }));
  };

  // Recolhe a última linha de foto extra revelada — remove a linha inteira
  // (não só a foto), e o link "+ Adicionar mais fotos" volta a aparecer.
  const retractLastExtraRow = (index: number) => {
    setExtraRowCount((c) => Math.max(0, c - 1));
    removeExtraPhoto(index);
  };

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
          {procForm.image_url ? (
            <div className="lm-svc-photo-preview-wrap">
              <img src={procForm.image_url} alt="Preview" />
              {uploadingProcSlot === 'main' && <span className="lm-svc-photo-spinner" aria-label="Enviando foto..." />}
            </div>
          ) : (
            <label className="lm-svc-photo-preview-wrap lm-svc-photo-preview-wrap--empty" onClick={handleLabelClick}>
              {uploadingProcSlot === 'main' ? (
                <span className="lm-svc-photo-spinner" aria-label="Enviando foto..." />
              ) : (
                <span className="lm-svc-photo-add-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          )}
          <div className="lm-svc-photo-actions">
            <label className="lm-svc-photo-upload-btn" onClick={handleLabelClick}>
              <span>📤 ESCOLHER FOTO</span>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
            {procForm.image_url && (
              <button type="button" className="lm-svc-photo-remove-link" onClick={() => setProcForm((prev) => ({ ...prev, image_url: '' }))}>
                Remover foto
              </button>
            )}
          </div>
        </div>
        {showStuckHint && (
          <p className="lm-filepicker-stuck-hint">
            Não abriu? Copie este link e cole direto no Chrome ou Safari.{' '}
            <button type="button" onClick={copyPageLink}>
              {copied ? '✓ Copiado!' : 'Copiar link'}
            </button>
          </p>
        )}

        {/* Fotos extras (pedido real, 2026-10-22) — cada clique em "+
         *  Adicionar mais fotos" revela mais 1 linha abaixo, no mesmo
         *  formato da linha principal acima (quadrado + botão "ESCOLHER
         *  FOTO" do lado) — não todas de uma vez. O link some ao atingir
         *  `MAX_EXTRA_PHOTOS`, indicando que não dá pra adicionar mais. */}
        {Array.from({ length: extraRowCount }).map((_, i) => {
          const url = procForm.extra_photos?.[i];
          const picker = extraSlotPickers[i];
          return (
            <div className="lm-svc-photo-row lm-svc-photo-row--extra" key={i}>
              {url ? (
                <div className="lm-svc-photo-preview-wrap">
                  <img src={url} alt={`Foto extra ${i + 1}`} />
                  {uploadingProcSlot === i && <span className="lm-svc-photo-spinner" aria-label="Enviando foto..." />}
                </div>
              ) : (
                <label className="lm-svc-photo-preview-wrap lm-svc-photo-preview-wrap--empty" onClick={picker.handleLabelClick}>
                  {uploadingProcSlot === i ? (
                    <span className="lm-svc-photo-spinner" aria-label="Enviando foto..." />
                  ) : (
                    <span className="lm-svc-photo-add-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </span>
                  )}
                  <input type="file" accept="image/*" onChange={picker.handleChange} style={{ display: 'none' }} />
                </label>
              )}
              <div className="lm-svc-photo-actions">
                <label className="lm-svc-photo-upload-btn" onClick={picker.handleLabelClick}>
                  <span>📤 ESCOLHER FOTO</span>
                  <input type="file" accept="image/*" onChange={picker.handleChange} style={{ display: 'none' }} />
                </label>
                {url && (
                  <button type="button" className="lm-svc-photo-remove-link" onClick={() => removeExtraPhoto(i)}>
                    Remover foto
                  </button>
                )}
              </div>
              {i === extraRowCount - 1 && (
                <button
                  type="button"
                  className="lm-svc-photo-extra-retract"
                  aria-label="Remover esta foto extra"
                  onClick={() => retractLastExtraRow(i)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}

        {extraRowCount < MAX_EXTRA_PHOTOS && (
          <button
            type="button"
            className="lm-svc-photo-extra-add-link"
            onClick={() => setExtraRowCount((c) => Math.min(MAX_EXTRA_PHOTOS, c + 1))}
          >
            + Adicionar mais fotos
          </button>
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
