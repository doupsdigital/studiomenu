import React from 'react';
import Link from 'next/link';
import { X, ChevronRight, type LucideIcon } from 'lucide-react';

interface OnboardingCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
  onDismiss: () => void;
}

/** Card de instrução dispensável — nudge leve (não é venda, por isso o
 *  visual neutro, diferente do `PlusUpsellCard` em gradiente rose). */
export const OnboardingCard: React.FC<OnboardingCardProps> = ({ icon: Icon, title, description, ctaHref, ctaLabel, onDismiss }) => {
  return (
    <div className="relative rounded-2xl bg-surface border border-linen p-4 flex gap-3">
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dispensar"
        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-linen text-ink-faint flex items-center justify-center"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0 pr-6">
        <p className="font-bold text-sm text-ink">{title}</p>
        <p className="text-[13px] text-ink-soft mt-0.5 mb-2">{description}</p>
        <Link href={ctaHref} className="inline-flex items-center gap-1 text-[13px] font-bold text-rose-600">
          {ctaLabel} <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
