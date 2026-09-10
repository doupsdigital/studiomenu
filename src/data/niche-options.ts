import React from 'react';
import { NicheType } from '@/types/catalog';
import { Sparkle, Gem, Sparkles, Layers } from 'lucide-react';

export interface NicheOption {
  value: NicheType;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

export const NICHE_OPTIONS: NicheOption[] = [
  { value: 'lash', label: 'Lash Designer', sublabel: 'Cílios & Sobrancelhas', icon: React.createElement(Sparkle, { className: 'w-5 h-5' }) },
  { value: 'nail', label: 'Nail Designer', sublabel: 'Unhas de Gel & Nail Art', icon: React.createElement(Gem, { className: 'w-5 h-5' }) },
  { value: 'estetica', label: 'Estética', sublabel: 'Clínica Facial & Corporal', icon: React.createElement(Sparkles, { className: 'w-5 h-5' }) },
  { value: 'studio', label: 'Studio de Beleza', sublabel: 'Multi-serviços', icon: React.createElement(Layers, { className: 'w-5 h-5' }) },
];
