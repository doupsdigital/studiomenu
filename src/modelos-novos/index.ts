import { NicheType, CatalogOrderData } from '@/types/catalog';
import { lashPreset } from './lash';
import { nailPreset } from './nail';
import { esteticaPreset } from './estetica';
import { studioPreset } from './studio';

export { lashPreset } from './lash';
export { nailPreset } from './nail';
export { esteticaPreset } from './estetica';
export { studioPreset } from './studio';

export const nichePresetsMap: Record<NicheType, CatalogOrderData> = {
  lash: lashPreset,
  nail: nailPreset,
  estetica: esteticaPreset,
  studio: studioPreset,
};
