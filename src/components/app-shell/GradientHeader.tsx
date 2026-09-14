import React from 'react';

interface GradientHeaderProps {
  children: React.ReactNode;
  className?: string;
  /** Pontos decorativos "✦" no canto — desligados quando o cabeçalho já tem
   *  outro elemento ali (ex: a pill de navegação de data da Agenda), onde
   *  eles ficavam colados/sobrepostos. */
  showSparkles?: boolean;
}

/** Bloco com gradiente rose usado no banner de saudação do Início e no
 *  cabeçalho da Agenda — mesmo padrão visual do LashAgenda (cantos bem
 *  arredondados). Puramente apresentacional, sem estado. */
export const GradientHeader: React.FC<GradientHeaderProps> = ({ children, className = '', showSparkles = true }) => {
  return (
    <div
      className={`rounded-2xl p-6 text-white relative overflow-hidden bg-gradient-to-br from-rose-700 to-rose-500 ${className}`}
    >
      {showSparkles && (
        <div className="absolute top-4 right-5 text-white/50 pointer-events-none select-none leading-none text-lg font-light">
          ✦
          <br />
          <span className="text-sm">✦</span>
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
