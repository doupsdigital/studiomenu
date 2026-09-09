'use client';

import React, { useState } from 'react';
import { CatalogOrderData, ProcedureItem } from '@/types/catalog';
import { Upload, X, CheckCircle, Sparkles } from 'lucide-react';

interface VisualEditorModalsProps {
  catalogData: CatalogOrderData;
  editToken: string;
  activeModal: 'none' | 'cover' | 'procedure' | 'social' | 'category' | 'save_confirm';
  editingProc: ProcedureItem | null;
  editingProcIndex: number | null;
  editingSocialType: 'whatsapp' | 'instagram' | 'address' | null;
  onClose: () => void;
  onSaveProcedure: (proc: ProcedureItem, index: number | null) => void;
  onSaveCoverUrl: (url: string) => void;
  onSaveSocial: (type: 'whatsapp' | 'instagram' | 'address', value: string) => void;
  onAddCategory: (categoryName: string) => void;
  onConfirmSaveDatabase: () => void;
  isSaving: boolean;
}

export const VisualEditorModals: React.FC<VisualEditorModalsProps> = ({
  catalogData,
  editToken,
  activeModal,
  editingProc,
  editingProcIndex,
  editingSocialType,
  onClose,
  onSaveProcedure,
  onSaveCoverUrl,
  onSaveSocial,
  onAddCategory,
  onConfirmSaveDatabase,
  isSaving,
}) => {
  const [coverInputUrl, setCoverInputUrl] = useState(catalogData.cover_media_url || '');
  const [isUploading, setIsUploading] = useState(false);

  // Form Proc State
  const [procForm, setProcForm] = useState<ProcedureItem>(
    editingProc || {
      id: '',
      title: '',
      price: '',
      duration: '',
      category: 'Geral',
      description: '',
      image_url: '',
      badge: '',
      is_highlight: false,
    }
  );

  // Form Social State
  const [socialForm, setSocialForm] = useState({
    whatsapp: catalogData.whatsapp_number || '',
    instagram: catalogData.instagram_handle || '',
    address: catalogData.address || '',
  });

  // New Category State
  const [newCatName, setNewCatName] = useState('');

  // Sincronizar form proc se prop mudar
  React.useEffect(() => {
    if (editingProc) {
      setProcForm(editingProc);
    } else {
      setProcForm({
        id: '',
        title: '',
        price: '',
        duration: '',
        category: 'Geral',
        description: '',
        image_url: '',
        badge: '',
        is_highlight: false,
      });
    }
  }, [editingProc]);

  // Sincronizar form social se props mudarem
  React.useEffect(() => {
    setSocialForm({
      whatsapp: catalogData.whatsapp_number || '',
      instagram: catalogData.instagram_handle || '',
      address: catalogData.address || '',
    });
  }, [catalogData]);

  // Handle File Upload to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'cover' | 'proc') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', catalogData.slug);
      formData.append('edit_token', editToken);

      const res = await fetch('/api/catalog/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (result.success && result.url) {
        if (target === 'cover') {
          setCoverInputUrl(result.url);
          onSaveCoverUrl(result.url);
          onClose();
        } else if (target === 'proc') {
          setProcForm((prev) => ({ ...prev, image_url: result.url }));
        }
      } else {
        alert(result.message || 'Erro ao enviar imagem.');
      }
    } catch (err) {
      alert('Falha ao conectar com o servidor para upload.');
    } finally {
      setIsUploading(false);
    }
  };

  if (activeModal === 'none') return null;

  return (
    <div className="lm-modal-overlay is-open">
      {/* 1. MODAL ALTERAR FOTO DE CAPA */}
      {activeModal === 'cover' && (
        <div className="lm-modal-card">
          <h3 className="lm-modal-title">Alterar Foto de Capa</h3>
          <p className="lm-modal-desc">Envie uma imagem do seu dispositivo ou cole um link público.</p>

          <div className="lm-form-group">
            <label>Upload de Arquivo (Galeria)</label>
            <label className="lm-svc-photo-upload-btn" style={{ width: '100%', justifyContent: 'center' }}>
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Enviando foto...' : 'Escolher Imagem do Dispositivo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'cover')}
              />
            </label>
          </div>

          <div className="lm-form-group" style={{ marginTop: '14px' }}>
            <label>Ou URL Direta da Imagem</label>
            <input
              type="text"
              value={coverInputUrl}
              onChange={(e) => setCoverInputUrl(e.target.value)}
              placeholder="https://..."
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
                onSaveCoverUrl(coverInputUrl);
                onClose();
              }}
            >
              Aplicar Capa
            </button>
          </div>
        </div>
      )}

      {/* 2. MODAL ADICIONAR / EDITAR PROCEDIMENTO */}
      {activeModal === 'procedure' && (
        <div className="lm-modal-card">
          <h3 className="lm-modal-title">
            {editingProcIndex !== null ? 'Editar Procedimento' : 'Novo Procedimento'}
          </h3>

          <div className="lm-form-group">
            <label>Título do Procedimento *</label>
            <input
              type="text"
              value={procForm.title}
              onChange={(e) => setProcForm({ ...procForm, title: e.target.value })}
              placeholder="Ex: Extensão Volume Brasileiro"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="lm-form-group">
              <label>Preço *</label>
              <input
                type="text"
                value={procForm.price}
                onChange={(e) => setProcForm({ ...procForm, price: e.target.value })}
                placeholder="R$ 150,00"
              />
            </div>
            <div className="lm-form-group">
              <label>Duração</label>
              <input
                type="text"
                value={procForm.duration || ''}
                onChange={(e) => setProcForm({ ...procForm, duration: e.target.value })}
                placeholder="1h30"
              />
            </div>
          </div>

          <div className="lm-form-group">
            <label>Categoria</label>
            <input
              type="text"
              value={procForm.category || ''}
              onChange={(e) => setProcForm({ ...procForm, category: e.target.value })}
              placeholder="Ex: Cílios"
            />
          </div>

          <div className="lm-form-group">
            <label>Imagem do Procedimento</label>
            <div className="lm-svc-photo-row">
              {procForm.image_url && (
                <div className="lm-svc-photo-preview-wrap">
                  <img src={procForm.image_url} alt="Preview" />
                </div>
              )}
              <label className="lm-svc-photo-upload-btn">
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Enviando...' : 'Trocar Foto'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'proc')}
                />
              </label>
            </div>
          </div>

          <div className="lm-form-group">
            <label>Descrição</label>
            <textarea
              rows={2}
              value={procForm.description || ''}
              onChange={(e) => setProcForm({ ...procForm, description: e.target.value })}
              placeholder="Detalhes sobre técnica, durabilidade e cuidados..."
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
                if (!procForm.title || !procForm.price) {
                  alert('Por favor informe o título e o preço.');
                  return;
                }
                onSaveProcedure(procForm, editingProcIndex);
                onClose();
              }}
            >
              Salvar Procedimento
            </button>
          </div>
        </div>
      )}

      {/* 3. MODAL EDITAR CONTATOS (WHATSAPP, INSTAGRAM, ENDEREÇO) */}
      {activeModal === 'social' && (
        <div className="lm-modal-card">
          <h3 className="lm-modal-title">Editar Contatos e Localização</h3>
          <p className="lm-modal-desc">Ajuste seu WhatsApp, Instagram e Cidade exibidos no catálogo.</p>

          <div className="lm-form-group">
            <label>WhatsApp (Apenas números com DDD)</label>
            <input
              type="text"
              value={socialForm.whatsapp}
              onChange={(e) => setSocialForm({ ...socialForm, whatsapp: e.target.value })}
              placeholder="Ex: 5511999999999"
            />
          </div>

          <div className="lm-form-group">
            <label>Instagram (@usuario)</label>
            <input
              type="text"
              value={socialForm.instagram}
              onChange={(e) => setSocialForm({ ...socialForm, instagram: e.target.value })}
              placeholder="Ex: @studio.exemplo"
            />
          </div>

          <div className="lm-form-group">
            <label>Cidade / Estado / Endereço</label>
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
              Salvar Contatos
            </button>
          </div>
        </div>
      )}

      {/* 4. MODAL ADICIONAR CATEGORIA */}
      {activeModal === 'category' && (
        <div className="lm-modal-card">
          <h3 className="lm-modal-title">Adicionar Nova Categoria</h3>

          <div className="lm-form-group">
            <label>Nome da Categoria</label>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Ex: Manutenção, Sobrancelhas, Labial..."
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
                  onAddCategory(newCatName.trim());
                  setNewCatName('');
                }
                onClose();
              }}
            >
              Criar Categoria
            </button>
          </div>
        </div>
      )}

      {/* 5. MODAL DE CONFIRMAÇÃO AO SALVAR NO BANCO DE DADOS */}
      {activeModal === 'save_confirm' && (
        <div className="lm-modal-card" style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="lm-modal-title">Salvar Alterações no Supabase?</h3>
          <p className="lm-modal-desc">
            Seu catálogo online será atualizado imediatamente com todas as modificações que você realizou.
          </p>

          <div className="lm-modal-actions">
            <button type="button" className="lm-modal-btn lm-modal-btn-cancel" onClick={onClose} disabled={isSaving}>
              Voltar ao Editor
            </button>
            <button
              type="button"
              className="lm-modal-btn lm-modal-btn-confirm"
              onClick={onConfirmSaveDatabase}
              disabled={isSaving}
            >
              {isSaving ? 'Gravando...' : 'Confirmar e Salvar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
