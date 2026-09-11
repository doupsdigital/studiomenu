'use client';

import React, { useEffect } from 'react';
import { ProcedureItem } from '@/types/catalog';

interface ProcedureDetailModalProps {
  item: ProcedureItem;
  clientName?: string;
  whatsappNumber: string;
  onClose: () => void;
  onNext?: () => void;
}

export const ProcedureDetailModal: React.FC<ProcedureDetailModalProps> = ({
  item,
  clientName = 'Mariana',
  whatsappNumber,
  onClose,
  onNext,
}) => {
  // Lock body scroll when modal is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const formatPrice = (val: string) => {
    if (!val) return 'Sob Consulta';
    const lower = val.toLowerCase();
    if (lower.includes('r$') || lower.includes('incluso') || lower.includes('guia') || lower.includes('consulta')) {
      return val;
    }
    return `R$ ${val}`;
  };

  const getSpecs = (): [string, string][] => {
    if (item.specs && item.specs.length > 0) {
      return item.specs;
    }
    const list: [string, string][] = [];
    list.push(['Investimento', formatPrice(item.price)]);
    if (item.duration) {
      list.push(['Duração', item.duration]);
    }
    return list;
  };

  const firstName = clientName.split(' ')[0];
  const messageText = encodeURIComponent(
    `Olá, ${firstName}! Estava vendo seu catálogo digital e gostaria de agendar o procedimento: *${item.title}*.`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${messageText}`;

  const fallbackImage = 'https://images.unsplash.com/photo-1583001809873-a1284d563391?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="modal-detalhe" role="dialog" aria-modal="true" aria-label={item.title}>
      <div className="modal-detalhe__backdrop" onClick={onClose} />
      <div className="modal-detalhe__sheet">
        <div className="modal__foto-wrap">
          <img
            src={item.image_url || fallbackImage}
            alt={item.title}
            className="modal__foto"
          />
          <div className="modal__scrim" />
          <button
            type="button"
            className="modal__fechar"
            aria-label="Fechar"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="modal__corpo">
          {item.category && <span className="modal__cat">{item.category}</span>}
          <h3 className="modal__titulo">{item.title}</h3>
          {item.description && <p className="modal__desc">{item.description}</p>}

          <div className="modal__specs">
            {getSpecs().map(([k, v]) => (
              <div key={k} className="modal__spec">
                <span className="modal__spec-k">{k}</span>
                <span className="modal__spec-v">{v}</span>
              </div>
            ))}
          </div>

          <div className="modal__acoes">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="modal__cta"
            >
              Agendar {item.title} →
            </a>
            {onNext && (
              <button
                type="button"
                className="modal__proximo"
                title="Ver próximo procedimento"
                onClick={onNext}
              >
                →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
