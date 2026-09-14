import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  tone?: 'rose' | 'amber';
  onClick?: () => void;
}

const TONE_CLASSES: Record<NonNullable<StatCardProps['tone']>, { border: string; icon: string; label: string; value: string }> = {
  rose: { border: 'border-linen', icon: 'text-rose-200', label: 'text-ink-faint', value: 'text-rose-600' },
  amber: { border: 'border-amber-200', icon: 'text-amber-200', label: 'text-amber-600', value: 'text-amber-700' },
};

/** Cartão de estatística simples (ícone decorativo de fundo + label + valor
 *  em destaque) — mesmo padrão dos KPIs do LashAgenda. Sem lógica própria,
 *  só apresentação; quem chama decide o número. */
export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, tone = 'rose', onClick }) => {
  const t = TONE_CLASSES[tone];
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      className={`relative overflow-hidden bg-surface border ${t.border} rounded-2xl p-4 shadow-sm text-left w-full ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
    >
      <Icon className={`absolute -top-3 -right-3 w-16 h-16 ${t.icon} rotate-12 pointer-events-none select-none`} strokeWidth={1.25} />
      <div className="relative z-10 min-w-0">
        <p className={`text-[10px] font-bold uppercase tracking-wider leading-tight ${t.label}`}>{label}</p>
        <p className={`font-serif-pro font-semibold text-2xl mt-1.5 ${t.value}`}>{value}</p>
      </div>
    </Tag>
  );
};
