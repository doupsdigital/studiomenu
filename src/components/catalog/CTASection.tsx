import React from 'react';
import { CatalogOrderData } from '@/types/catalog';

interface CTASectionProps {
  data: CatalogOrderData;
  isEditMode?: boolean;
  onOpenSocialModal?: (type: 'whatsapp' | 'instagram' | 'address') => void;
  onUpdateAddress?: (newAddress: string) => void;
}

export const CTASection: React.FC<CTASectionProps> = ({
  data,
  isEditMode = false,
  onOpenSocialModal,
  onUpdateAddress,
}) => {
  const wspText = encodeURIComponent(`Olá ${data.client_name}! Vim através do seu catálogo digital e gostaria de agendar um horário.`);
  const wspUrl = `https://wa.me/${data.whatsapp_number}?text=${wspText}`;
  const instagramHandle = data.instagram_handle ? (data.instagram_handle.startsWith('@') ? data.instagram_handle : `@${data.instagram_handle}`) : '@instagram';
  const instagramUrl = data.instagram_handle ? `https://instagram.com/${data.instagram_handle.replace('@', '')}` : '#';

  const footerBg = data.cta_bg_url || data.final_screen_bg_url || data.cover_media_url || 'https://lashmenu.com/modelos/mosaico/assets/img/Footer.png';

  return (
    <section className="secao-contato is-visible" id="contato" data-screen-label="Contato">
      <div className="secao-contato__foto-wrap">
        <img
          src={footerBg}
          alt={data.client_name}
          className="secao-contato__foto"
        />
      </div>
      <div className="secao-contato__scrim"></div>

      <div className="secao-contato__conteudo">
        <div className="secao-contato__topo">
          <span className="etiqueta anim-fade-up delay-1">Atendimento Exclusivo</span>
        </div>

        <div className="secao-contato__corpo">
          <h2 className="secao-contato__titulo anim-fade-up delay-2">
            Agende seu <em>horário</em>
          </h2>
          <p className="secao-contato__desc anim-fade-up delay-3">
            Atendimento personalizado com hora marcada em estúdio privativo.
          </p>

          <div className="secao-contato__acoes">
            {/* Botão Principal WhatsApp */}
            <a
              href={isEditMode ? '#' : wspUrl}
              target={isEditMode ? '_self' : '_blank'}
              rel="noopener noreferrer"
              className={`btn-whatsapp anim-fade-up delay-4 ${isEditMode ? 'lm-social-wrapper' : ''}`}
              onClick={(e) => {
                if (isEditMode) e.preventDefault();
              }}
            >
              {isEditMode && (
                <button
                  type="button"
                  className="lm-social-edit-pencil"
                  title="Editar WhatsApp"
                  onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    if (onOpenSocialModal) onOpenSocialModal('whatsapp');
                  }}
                >
                  ✏️
                </button>
              )}

              <span className="btn__left">
                <svg className="btn__icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.43 0-2.82-.37-4.05-1.08l-.29-.17-3.12.82.83-3.04-.19-.3a8.132 8.132 0 0 1-1.25-4.46c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.58c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.22-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.1-.22-.16-.47-.28z" />
                </svg>
                <span>Agendar pelo WhatsApp</span>
              </span>
              <span className="btn__arrow">→</span>
            </a>

            {/* Botão Secundário Instagram */}
            <a
              href={isEditMode ? '#' : instagramUrl}
              target={isEditMode ? '_self' : '_blank'}
              rel="noopener noreferrer"
              className={`btn-instagram anim-fade-up delay-5 ${isEditMode ? 'lm-social-wrapper' : ''}`}
              onClick={(e) => {
                if (isEditMode) e.preventDefault();
              }}
            >
              {isEditMode && (
                <button
                  type="button"
                  className="lm-social-edit-pencil"
                  title="Editar Instagram"
                  onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    if (onOpenSocialModal) onOpenSocialModal('instagram');
                  }}
                >
                  ✏️
                </button>
              )}

              <span className="btn__left">
                <svg className="btn__icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>{instagramHandle}</span>
              </span>
              <span className="btn__arrow">↗</span>
            </a>
          </div>

          <div className="secao-contato__info anim-fade-up delay-6">
            <span>
              {data.client_name} —{' '}
              <span
                className="secao-contato__endereco"
                data-lm-editable={isEditMode ? 'true' : undefined}
                contentEditable={isEditMode}
                suppressContentEditableWarning={true}
                onBlur={(e) => {
                  if (isEditMode && onUpdateAddress) {
                    onUpdateAddress(e.currentTarget.innerText.trim());
                  }
                }}
              >
                {data.address || 'Atendimento Privativo'}
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
