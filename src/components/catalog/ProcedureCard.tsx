import React from 'react';
import { ProcedureItem } from '@/types/catalog';
import { ProcedureImage } from './ProcedureImage';

interface ProcedureCardProps {
  item: ProcedureItem;
  whatsappNumber: string;
  clientName?: string;
  isEditMode?: boolean;
  onSelect?: (item: ProcedureItem) => void;
}

export const ProcedureCard: React.FC<ProcedureCardProps> = ({ item, whatsappNumber, clientName, isEditMode = false, onSelect }) => {
  const formatPrice = (val: string) => {
    if (!val) return 'Sob Consulta';
    const lower = val.toLowerCase();
    if (lower.includes('r$') || lower.includes('incluso') || lower.includes('guia') || lower.includes('consulta')) {
      return val;
    }
    return `R$ ${val}`;
  };

  const handleBooking = () => {
    if (isEditMode) return;
    if (onSelect) {
      onSelect(item);
      return;
    }
    const text = encodeURIComponent(`Olá! Gostaria de agendar o procedimento: *${item.title}* (${formatPrice(item.price)}).`);
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div
      className={`tile ${item.is_highlight ? 'tile--destaque' : ''} is-revealed ${isEditMode ? 'lm-service-card-wrapper' : ''}`}
      onClick={handleBooking}
    >
      <ProcedureImage src={item.image_url} alt={item.title} className="tile__foto" variant="tile" clientName={clientName} />
      <div className="tile__scrim"></div>
      <div className="tile__conteudo">
        {item.category && <span className="tile__cat">{item.category}</span>}
        <h3 className="tile__titulo">{item.title}</h3>
        <div className="tile__meta">
          <span className="tile__preco">{formatPrice(item.price)}</span>
          {item.duration && <span className="tile__duracao">{item.duration}</span>}
        </div>
      </div>
    </div>
  );
};
