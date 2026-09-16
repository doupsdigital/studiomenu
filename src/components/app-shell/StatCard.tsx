import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  tone?: 'rose' | 'amber';
  onClick?: () => void;
  /** Quando informado, o card vira um link de navegação (`next/link`) em vez
   *  de um botão com `onClick` — usado pelos cards do Início, que são
   *  server component e não podem passar uma função pro client. */
  href?: string;
}

const TONE_CLASSES: Record<NonNullable<StatCardProps['tone']>, { border: string; icon: string; label: string; value: string }> = {
  rose: { border: 'border-linen', icon: 'text-rose-200', label: 'text-ink-faint', value: 'text-rose-600' },
  amber: { border: 'border-amber-200', icon: 'text-amber-200', label: 'text-amber-600', value: 'text-amber-700' },
};

/** Cartão de estatística simples (ícone decorativo de fundo + label + valor
 *  em destaque) — mesmo padrão dos KPIs do LashAgenda. Sem lógica própria,
 *  só apresentação; quem chama decide o número. */
export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, tone = 'rose', onClick, href }) => {
  const t = TONE_CLASSES[tone];
  const isInteractive = Boolean(onClick || href);
  const className = `relative overflow-hidden bg-surface border ${t.border} rounded-2xl p-4 shadow-sm text-left w-full block ${
    isInteractive ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
  }`;

  const content = (
    <>
      <Icon className={`absolute -top-3 -right-3 w-16 h-16 ${t.icon} rotate-12 pointer-events-none select-none`} strokeWidth={1.25} />
      <div className="relative z-10 min-w-0">
        <p className={`text-[11px] font-bold uppercase tracking-wider leading-tight ${t.label}`}>{label}</p>
        <p className={`font-serif-pro font-semibold text-2xl mt-1.5 ${t.value}`}>{value}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag onClick={onClick} type={onClick ? 'button' : undefined} className={className}>
      {content}
    </Tag>
  );
};
