'use client';

import { useState } from 'react';
import { NicheType, LayoutModel, ThemeVariant } from '@/types/catalog';
import { nichePresetsMap } from '@/data/niche-presets';

/** Estado de nicho/modelo/tema + o handler que reseta modelo e tema pro
 *  padrão do preset ao trocar de nicho — duplicado antes entre o onboarding
 *  e o "Criar com IA". */
export function useNicheSelection(initialNiche: NicheType = 'lash') {
  const initialPreset = nichePresetsMap[initialNiche];
  const [niche, setNiche] = useState<NicheType>(initialNiche);
  const [layoutModel, setLayoutModel] = useState<LayoutModel>(initialPreset.layout_model);
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>(initialPreset.theme_variant);

  const handleNicheChange = (newNiche: NicheType) => {
    setNiche(newNiche);
    setLayoutModel(nichePresetsMap[newNiche].layout_model);
    setThemeVariant(nichePresetsMap[newNiche].theme_variant);
  };

  return { niche, layoutModel, themeVariant, setLayoutModel, setThemeVariant, handleNicheChange };
}
