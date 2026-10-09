import React from 'react';
import { CatalogInstructions, CatalogInstructionItem } from '@/types/catalog';

interface InstructionsSectionProps {
  instructions?: CatalogInstructions;
  bgUrl?: string;
  coverUrl?: string;
  isEditMode?: boolean;
  onOpenAddInstructionItemModal?: () => void;
  onEditInstructionItem?: (item: CatalogInstructionItem, index: number) => void;
  onDeleteInstructionItem?: (item: CatalogInstructionItem) => void;
}

export const InstructionsSection: React.FC<InstructionsSectionProps> = ({
  instructions,
  bgUrl,
  coverUrl,
  isEditMode = false,
  onOpenAddInstructionItemModal,
  onEditInstructionItem,
  onDeleteInstructionItem,
}) => {
  // Nome próprio (não é mais "hero.webp") de propósito: reaproveitar o
  // mesmo nome (só diferindo na capitalização de "Hero.webp", a foto da
  // capa) quebrou de verdade em produção (2026-09-23) — Windows não
  // distingue maiúscula de minúscula no sistema de arquivos, então ao
  // gerar os dois .webp na mesma pasta um sobrescreveu o outro sem avisar,
  // e só o build do servidor (Linux, sensível a maiúscula) expôs o 404.
  const defaultBg = '/modelos/mosaico/assets/img/orientacoes-bg.webp';
  // Evita repetir a mesma foto da capa na tela de orientações — comparação
  // direta de URL, não por nome de arquivo (que já causou falso positivo
  // com qualquer fundo cujo caminho terminasse em "hero.png").
  const isSameAsCover = Boolean(bgUrl && coverUrl && bgUrl === coverUrl);
  const bgImage = bgUrl && !isSameAsCover ? bgUrl : defaultBg;

  // Lista livre de itens (título + descrição) — pedido real, 2026-10-09,
  // substitui os 4 bullets fixos que existiam antes. Catálogos que nunca
  // editaram essa tela já chegam aqui com um array-padrão (montado em
  // `getCatalogBySlug`, `catalog-service.ts`), então nada muda pra eles.
  const items = instructions?.items || [];

  return (
    <section className="secao-orientacoes is-visible" id="orientacoes" data-screen-label="Orientações">
      <div className="secao-orientacoes__foto-wrap">

        <img
          src={bgImage}
          alt="Orientações"
          className="secao-orientacoes__foto"
          loading="lazy"
        />
      </div>
      <div className="secao-orientacoes__scrim"></div>

      <div className="secao-orientacoes__conteudo">
        <div className="secao-orientacoes__topo">
          <span className="etiqueta anim-fade-up delay-1">Orientações</span>
        </div>

        <div className="secao-orientacoes__corpo">
          <h2 className="secao-orientacoes__titulo anim-fade-up delay-2">
            Informações <em>importantes</em>
          </h2>

          {items.length > 0 && (
            <div className="orientacoes__card anim-fade-up delay-3">
              {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (
                  <div
                    key={item.id}
                    className={`orientacao__item ${isLast ? 'orientacao__item--ultimo' : ''} ${isEditMode ? 'orientacao__item--editable' : ''}`}
                  >
                    <div className="orientacao__icon-box">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <div className="orientacao__info">
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                    </div>
                    {isEditMode && (
                      <div className="orientacao__item-actions">
                        <button
                          type="button"
                          className="orientacao__item-btn"
                          title="Editar"
                          onClick={() => onEditInstructionItem?.(item, index)}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="orientacao__item-btn orientacao__item-btn--danger"
                          title="Excluir"
                          onClick={() => onDeleteInstructionItem?.(item)}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {isEditMode && (
            <button
              type="button"
              className="lm-btn-add-service orientacoes__add-item"
              onClick={onOpenAddInstructionItemModal}
            >
              ➕ Adicionar Informação
            </button>
          )}
        </div>

        <div className="secao-orientacoes__scroll-cue anim-fade-up delay-4">
          <span>Deslize</span>
          <div className="hero__scroll-linha"></div>
        </div>
      </div>
    </section>
  );
};
