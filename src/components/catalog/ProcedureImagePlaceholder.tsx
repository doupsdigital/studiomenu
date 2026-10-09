import React from 'react';
import { getInitials } from '@/lib/initials';

interface ProcedureImagePlaceholderProps {
  clientName?: string;
  /** `tile` = card grande do Mosaico (círculo + texto). `thumb` = card
   *  pequeno do Clássico, 80x80 (só círculo, sem espaço pro texto).
   *  `detail` = banner do modal de detalhes/agendamento (só texto, sem
   *  círculo — pedido explícito, 2026-10-09). */
  variant: 'tile' | 'thumb' | 'detail';
}

/** Substitui a foto quando o procedimento não tem uma (ou quando a URL
 *  salva está quebrada) — pedido real, 2026-10-09: antes caía no ícone
 *  nativo de "imagem quebrada" do navegador (campo não vazio, só inválido,
 *  então o fallback por `||` nunca disparava) ou numa foto de banco de
 *  imagens genérica que não combinava com o nicho. */
export const ProcedureImagePlaceholder: React.FC<ProcedureImagePlaceholderProps> = ({ clientName, variant }) => {
  const initials = getInitials(clientName);

  return (
    <div className={`procedimento-placeholder procedimento-placeholder--${variant}`}>
      {variant !== 'detail' && <div className="procedimento-placeholder__circulo">{initials}</div>}
      {variant !== 'thumb' && <span className="procedimento-placeholder__texto">Imagem em breve...</span>}
    </div>
  );
};
