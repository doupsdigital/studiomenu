import React from 'react';
import { getInitials } from '@/lib/initials';

interface ProcedureImagePlaceholderProps {
  clientName?: string;
  /** `tile` (card grande do Mosaico) e `detail` (banner do modal de
   *  detalhes/agendamento) mostram a mesma composição "STUDIO" + nome,
   *  igual já usada na capa (`HeaderCover.tsx`) — têm espaço de sobra
   *  (pedido real, 2026-10-09: ela viu o texto sozinho no modal e achou
   *  que a versão completa, com o nome, ficaria melhor ali também).
   *  `thumb` (card pequeno do Clássico, 80x80) é o único sem espaço
   *  pro nome — só o círculo com iniciais. */
  variant: 'tile' | 'thumb' | 'detail';
}

/** Substitui a foto quando o procedimento não tem uma (ou quando a URL
 *  salva está quebrada) — pedido real, 2026-10-09: antes caía no ícone
 *  nativo de "imagem quebrada" do navegador (campo não vazio, só inválido,
 *  então o fallback por `||` nunca disparava) ou numa foto de banco de
 *  imagens genérica que não combinava com o nicho. */
export const ProcedureImagePlaceholder: React.FC<ProcedureImagePlaceholderProps> = ({ clientName, variant }) => {
  if (variant === 'thumb') {
    return (
      <div className="procedimento-placeholder procedimento-placeholder--thumb">
        <div className="procedimento-placeholder__circulo">{getInitials(clientName)}</div>
      </div>
    );
  }

  return (
    <div className={`procedimento-placeholder procedimento-placeholder--${variant}`}>
      <div className="procedimento-placeholder__nome">
        <span className="procedimento-placeholder__label">Studio</span>
        <div className="procedimento-placeholder__linha" />
        <strong className="procedimento-placeholder__cliente">{clientName || 'StudioMenu'}</strong>
      </div>
      <span className="procedimento-placeholder__texto">Imagem em breve...</span>
    </div>
  );
};
