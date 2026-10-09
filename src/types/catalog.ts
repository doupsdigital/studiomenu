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

export interface CatalogInstructionItem {
  id: string;
  title: string;
  description: string;
}

export interface CatalogInstructions {
  pre_care?: string[];
  post_care?: string[];
  tolerances?: string;
  location_notes?: string;
  custom_policies?: string[];
  /** Lista livre de itens (título + descrição) da tela de Orientações
   *  (pedido real, 2026-10-09) — substitui os 4 bullets fixos que
   *  existiam antes. A profissional adiciona/edita/remove à vontade pelo
   *  Editor Visual. Catálogos que nunca editaram essa tela continuam
   *  vendo um array-padrão montado a partir de `tolerances`/`pre_care`
   *  (ver `getCatalogBySlug` em `catalog-service.ts`) — essas colunas
   *  antigas continuam existindo só pra esse fallback. */
  items?: CatalogInstructionItem[];
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
  /** Se true, o botão "agendar" do catálogo abre o wizard de horários reais
   *  em vez de redirecionar direto pro WhatsApp (agendamento automático). */
  booking_enabled?: boolean;
  /** Ela mesma pausou o agendamento automático temporariamente (Fase 23) —
   *  com `booking_enabled = true` mas isso em `true`, o catálogo se comporta
   *  como se não tivesse o Plano Agenda (WhatsApp em vez do wizard). */
  agenda_paused?: boolean;
  /** Desativado pelo admin (falta de pagamento, pausa a pedido dela, etc) —
   *  bloqueia o link público E o link mágico de edição; acesso ao app
   *  continua normal. */
  catalog_disabled?: boolean;
  /** Catálogo que veio de uma assinatura recorrente (Fase 27 — Catálogo
   *  avulso ou vendido como Plano Agenda a partir dele) cuja cobrança não
   *  está em dia agora (cancelada/suspensa), sem plano manual por trás.
   *  Diferente de `catalog_disabled` (toggle manual do admin): esse aqui é
   *  automático, a mesma consequência que cancelar o Plano Agenda sempre
   *  teve (perder o que dependia de cobrança), só que agora também se
   *  aplica ao Catálogo quando ELE é a coisa recorrente. Catálogo avulso
   *  (pagamento único, o padrão) nunca liga essa flag — é pra sempre dela,
   *  por definição. */
  catalog_payment_lapsed?: boolean;
  categories?: string[];
  procedures: ProcedureItem[];
  instructions?: CatalogInstructions;
  status?: string;
  created_at?: string;
  updated_at?: string;
}
