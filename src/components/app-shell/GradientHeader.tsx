import React from 'react';

interface GradientHeaderProps {
  children: React.ReactNode;
  className?: string;
  /** Pontos decorativos "✦" no canto — desligados quando o cabeçalho já tem
   *  outro elemento ali (ex: a pill de navegação de data da Agenda), onde
   *  eles ficavam colados/sobrepostos. */
  showSparkles?: boolean;
  /** 'light' — mesmo rosinha claro do card "Compartilhe seu Catálogo" —
   *  usado só no banner de saudação do Início (pedido dela, 2026-09-24: o
   *  gradiente rose forte competia visualmente com os cards de ação
   *  abaixo). Cabeçalho da Agenda continua 'dark' (padrão), sem mudar. */
  tone?: 'dark' | 'light';
}

const TONE_CLASSES: Record<NonNullable<GradientHeaderProps['tone']>, string> = {
  dark: 'text-white bg-gradient-to-br from-rose-700 to-rose-500',
  light: 'text-rose-800 bg-gradient-to-br from-rose-200 to-rose-100 border border-rose-200/60',
};

/** Bloco com gradiente rose usado no banner de saudação do Início e no
 *  cabeçalho da Agenda — mesmo padrão visual do LashAgenda (cantos bem
 *  arredondados). Puramente apresentacional, sem estado. */
export const GradientHeader: React.FC<GradientHeaderProps> = ({ children, className = '', showSparkles = true, tone = 'dark' }) => {
  return (
    <div className={`rounded-2xl p-6 relative overflow-hidden ${TONE_CLASSES[tone]} ${className}`}>
      {showSparkles && (
        <div
          className={`absolute top-4 right-5 pointer-events-none select-none leading-none text-lg font-light ${
            tone === 'light' ? 'text-rose-300/70' : 'text-white/50'
          }`}
        >
          ✦
          <br />
          <span className="text-[15px]">✦</span>
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
