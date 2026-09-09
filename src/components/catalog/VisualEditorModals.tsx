'use client';

import React, { useState } from 'react';
import { CatalogOrderData, ProcedureItem } from '@/types/catalog';
import { Upload, CheckCircle } from 'lucide-react';

interface VisualEditorModalsProps {
  catalogData: CatalogOrderData;
  initialCatalogData?: CatalogOrderData;
  editToken: string;
  categories: string[];
  activeModal:
    | 'none'
    | 'cover'
    | 'procedure'
    | 'social'
    | 'category'
    | 'save_confirm'
    | 'save_success'
    | 'save_error'
    | 'category_delete_confirm'
    | 'category_delete_blocked'
    | 'proc_delete_confirm'
    | 'discard_confirm';
  errorMessage?: string;
  editingProc: ProcedureItem | null;
  editingProcIndex: number | null;
  editingSocialType: 'whatsapp' | 'instagram' | 'address' | null;
  categoryToDelete?: { name: string; count: number } | null;
  procToDelete?: ProcedureItem | null;
  onClose: () => void;
  onSaveProcedure: (proc: ProcedureItem, index: number | null) => void;
  onSaveCoverUrl: (url: string) => void;
  onSaveSocial: (type: 'whatsapp' | 'instagram' | 'address', value: string) => void;
  onAddCategory: (categoryName: string) => void;
  onConfirmDeleteCategory?: () => void;
  onConfirmDeleteProc?: () => void;
  onConfirmDiscard?: () => void;
  onOpenAddCatModal?: () => void;
  onConfirmSaveDatabase: () => void;
  isSaving: boolean;
}

export const VisualEditorModals: React.FC<VisualEditorModalsProps> = ({
  catalogData,
  initialCatalogData,
  editToken,
  categories = [],
  activeModal,
  errorMessage = '',
  editingProc,
  editingProcIndex,
  editingSocialType,
  categoryToDelete,
  procToDelete,
  onClose,
  onSaveProcedure,
  onSaveCoverUrl,
  onSaveSocial,
  onAddCategory,
  onConfirmDeleteCategory,
  onConfirmDeleteProc,
  onConfirmDiscard,
  onOpenAddCatModal,
  onConfirmSaveDatabase,
  isSaving,
}) => {
  const safeCategories = React.useMemo(() => {
    const list = categories && categories.length > 0 ? [...categories] : ['Extensão de Cílios', 'Lash Lifting', 'Sobrancelhas'];
    if (editingProc?.category && !list.includes(editingProc.category)) {
      list.push(editingProc.category);
    }
    return list;
  }, [categories, editingProc]);

  const [isUploading, setIsUploading] = useState(false);

  // Gerar resumo de alterações da sessão de edição
  const getChangesSummary = (): string[] => {
    const initial = initialCatalogData || catalogData;
    const current = catalogData;
    const changes: string[] = [];

    if (initial.client_name !== current.client_name) {
      changes.push(`✏️ Nome do Catálogo: ${current.client_name}`);
    }
    if (initial.hero_phrase !== current.hero_phrase) {
      changes.push(`💬 Frase de Destaque: Alterada`);
    }
    if (initial.whatsapp_number !== current.whatsapp_number) {
      changes.push(`📱 WhatsApp: ${current.whatsapp_number}`);
    }
    if (initial.instagram_handle !== current.instagram_handle) {
      changes.push(`📸 Instagram: @${(current.instagram_handle || '').replace(/^@/, '')}`);
    }
    if (initial.address !== current.address) {
      changes.push(`📍 Localização: ${current.address}`);
    }
    if (initial.cover_media_url !== current.cover_media_url) {
      changes.push(`📷 Foto de Capa: Nova imagem selecionada`);
    }

    const initialProcs = initial.procedures || [];
    const currentProcs = current.procedures || [];

    if (currentProcs.length < initialProcs.length) {
      changes.push(`🗑️ Procedimentos removidos: ${initialProcs.length - currentProcs.length} item(ns)`);
    } else if (currentProcs.length > initialProcs.length) {
      changes.push(`✨ Novos procedimentos: ${currentProcs.length - initialProcs.length} item(ns)`);
    }

    let modifiedCount = 0;
    currentProcs.forEach((proc, idx) => {
      const orig = initialProcs[idx];
      if (
        orig &&
        (proc.title !== orig.title ||
          proc.price !== orig.price ||
          proc.duration !== orig.duration ||
          proc.image_url !== orig.image_url ||
          proc.category !== orig.category ||
          proc.description !== orig.description)
      ) {
        modifiedCount++;
      }
    });

    if (modifiedCount > 0) {
      changes.push(`✏️ Procedimentos alterados: ${modifiedCount} item(ns)`);
    }

    if (changes.length === 0) {
      changes.push('Nenhuma alteração pendente');
    }

    return changes;
  };

  // Proc Form State
  const [procForm, setProcForm] = useState<ProcedureItem & { maintenance?: string; visualEffect?: string }>(
    editingProc
      ? { ...editingProc }
      : {
          id: '',
          title: '',
          price: '',
          duration: '',
          category: safeCategories[0] || 'Extensão de Cílios',
          description: '',
          image_url: '',
          badge: '',
          is_highlight: false,
          maintenance: '',
          visualEffect: '',
        }
  );

  // Social Form State
  const [socialForm, setSocialForm] = useState({
    whatsapp: catalogData.whatsapp_number || '',
    instagram: catalogData.instagram_handle || '',
    address: catalogData.address || '',
  });

  // Category State
  const [newCatName, setNewCatName] = useState('');

  // Form Error State
  const [procFormError, setProcFormError] = useState('');

  // Sincronizar form proc se prop mudar
  React.useEffect(() => {
    if (editingProc) {
      setProcForm({ ...editingProc });
    } else {
      setProcForm({
        id: '',
        title: '',
        price: '',
        duration: '',
        category: safeCategories[0] || 'Extensão de Cílios',
        description: '',
        image_url: '',
        badge: '',
        is_highlight: false,
        maintenance: '',
        visualEffect: '',
      });
    }
  }, [editingProc, activeModal]);

  // Sincronizar form social se props mudarem
  React.useEffect(() => {
    setSocialForm({
      whatsapp: catalogData.whatsapp_number || '',
      instagram: catalogData.instagram_handle || '',
      address: catalogData.address || '',
    });
  }, [catalogData]);

  // Upload de Imagem para Supabase Storage
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
          onSaveCoverUrl(result.url);
          onClose();
        } else if (target === 'proc') {
          setProcForm((prev) => ({ ...prev, image_url: result.url }));
        }
      } else {
        // Fallback local se upload der algum aviso
        const localUrl = URL.createObjectURL(file);
        if (target === 'cover') {
          onSaveCoverUrl(localUrl);
          onClose();
        } else {
          setProcForm((prev) => ({ ...prev, image_url: localUrl }));
        }
      }
    } catch (err) {
      const localUrl = URL.createObjectURL(file);
      if (target === 'cover') {
        onSaveCoverUrl(localUrl);
        onClose();
      } else {
        setProcForm((prev) => ({ ...prev, image_url: localUrl }));
      }
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
          <h3 className="lm-modal-title">📷 Alterar Foto de Capa</h3>
          <p className="lm-modal-desc">Escolha uma nova imagem para o topo do seu catálogo:</p>

          <div className="lm-form-group">
            <label className="lm-svc-photo-upload-btn" style={{ width: '100%', justifyContent: 'center' }}>
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Enviando foto...' : 'Escolher Imagem do Dispositivo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'cover')}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div className="lm-modal-actions">
            <button type="button" className="lm-modal-btn lm-modal-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* 2. MODAL EDITAR / NOVO PROCEDIMENTO (MATCHING PRINT 4 EXACTLY) */}
      {activeModal === 'procedure' && (
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
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'proc')}
                  style={{ display: 'none' }}
                />
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
      )}

      {/* 3. MODAL EDITAR CONTATOS (WHATSAPP, INSTAGRAM, ENDEREÇO) */}
      {activeModal === 'social' && (
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
      )}

      {/* 4. MODAL CRIAR CATEGORIA (MATCHING PRINT 5 EXACTLY) */}
      {activeModal === 'category' && (
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
      )}

      {/* 5. MODAL DE CONFIRMAÇÃO E RESUMO DE ALTERAÇÕES */}
      {activeModal === 'save_confirm' && (
        <div className="lm-modal-card">
          <h3 className="lm-modal-title">✨ Publicar Alterações</h3>
          <p className="lm-modal-desc">
            Confira o resumo das alterações antes de publicar no seu catálogo:
          </p>

          <div className="lm-save-summary-container">
            {getChangesSummary().map((itemText, idx) => (
              <div key={idx} className="lm-save-summary-item">
                {itemText}
              </div>
            ))}
          </div>

          <div className="lm-modal-actions">
            <button
              type="button"
              className="lm-modal-btn lm-modal-btn-cancel"
              onClick={onClose}
              disabled={isSaving}
            >
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
      )}

      {/* 6. MODAL DE SUCESSO DO SISTEMA */}
      {activeModal === 'save_success' && (
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
      )}

      {/* 7. MODAL DE ERRO DO SISTEMA (SUBSTITUI BROWSER ALERTS) */}
      {activeModal === 'save_error' && (
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
      )}

      {/* 8. MODAL DE BLOQUEIO DE EXCLUSÃO DE CATEGORIA COM PROCEDIMENTOS VINCULADOS */}
      {activeModal === 'category_delete_blocked' && (
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
            A categoria <strong>"{categoryToDelete?.name}"</strong> possui <strong>{categoryToDelete?.count} procedimento(s)</strong> vinculado(s).
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
      )}

      {/* 9. MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE CATEGORIA VAZIA */}
      {activeModal === 'category_delete_confirm' && (
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
      )}

      {/* 10. MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE PROCEDIMENTO */}
      {activeModal === 'proc_delete_confirm' && (
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
      )}

      {/* 11. MODAL DE CONFIRMAÇÃO DE DESCARTAR ALTERAÇÕES (RESET) */}
      {activeModal === 'discard_confirm' && (
        <div className="lm-modal-card">
          <h3 className="lm-modal-title">🗑️ Descartar Alterações</h3>
          <p className="lm-modal-desc">
            Deseja descartar todas as alterações não salvas da sessão de edição?
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
                if (onConfirmDiscard) onConfirmDiscard();
              }}
            >
              🗑️ Descartar Alterações
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

