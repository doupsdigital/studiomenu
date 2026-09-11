export type NicheType = 'lash' | 'nail' | 'estetica' | 'studio';
export type LayoutModel = 'mosaico' | 'classico';
export type ThemeVariant = 'rose' | 'luxury';

export interface ProcedureItem {
  id: string;
  title: string;
  description?: string;
  price: string;
  duration?: string;
  /** Duração em minutos, usada pelo motor de disponibilidade do agendamento
   *  automático. `duration` (texto livre acima) continua existindo só pra
   *  exibição — este campo é o que a régua de horários realmente usa. */
  duration_minutes?: number | null;
  /** Se false, o procedimento fica de fora do agendamento automático (ex:
   *  "sob consulta"), mesmo com o catálogo tendo `booking_enabled = true`. */
  bookable?: boolean;
  category?: string;
  image_url?: string;
  badge?: string;
  is_highlight?: boolean;
  specs?: [string, string][];
}

export interface CatalogInstructions {
  pre_care?: string[];
  post_care?: string[];
  tolerances?: string;
  location_notes?: string;
  custom_policies?: string[];
}

export interface CatalogOrderData {
  id?: string;
  slug: string;
  client_name: string;
  studio_name?: string;
  bio_description?: string;
  hero_phrase?: string;
  avatar_url?: string;
  cover_media_url?: string;
  niche: NicheType;
  layout_model: LayoutModel;
  theme_variant: ThemeVariant;
  whatsapp_number: string;
  instagram_handle?: string;
  address?: string;
  maps_url?: string;
  instructions_bg_url?: string;
  final_screen_bg_url?: string;
  cta_bg_url?: string;
  edit_token?: string;
  categories?: string[];
  procedures: ProcedureItem[];
  instructions?: CatalogInstructions;
  status?: string;
  created_at?: string;
  updated_at?: string;
}
