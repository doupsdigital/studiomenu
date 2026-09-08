import { supabase } from './supabase';
import { CatalogOrderData, ProcedureItem } from '@/types/catalog';

export async function getCatalogBySlug(slug: string): Promise<CatalogOrderData | null> {
  const normalizedSlug = slug.toLowerCase().trim();

  try {
    // 1. Buscar pedido na tabela `orders`
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('slug', normalizedSlug)
      .single();

    if (orderError || !orderData) {
      console.warn(`[StudioMenu SSR] Catálogo para slug "${normalizedSlug}" não encontrado no Supabase.`);
      return null;
    }

    // 2. Buscar serviços da tabela `order_services` vinculada
    let procedures: ProcedureItem[] = [];
    const { data: servicesData } = await supabase
      .from('order_services')
      .select('*')
      .eq('order_id', orderData.id)
      .order('order_index', { ascending: true });

    if (servicesData && servicesData.length > 0) {
      procedures = servicesData.map((s: any, idx: number) => ({
        id: s.id || String(idx),
        title: s.title || s.nome || 'Procedimento',
        description: s.desc || s.description || '',
        price: s.preco || s.price || 'Sob Consulta',
        duration: s.duracao || s.duration || '',
        category: s.catLabel || s.category || s.cat || 'Geral',
        image_url: s.img || s.image_url || '',
        badge: s.badge || '',
        is_highlight: Boolean(s.destaque || s.is_highlight),
      }));
    } else if (Array.isArray(orderData.procedures)) {
      // Suporte a JSON direto na coluna `procedures` se existir
      procedures = orderData.procedures;
    }

    // 3. Mapear para a interface `CatalogOrderData`
    const catalog: CatalogOrderData = {
      id: orderData.id,
      slug: orderData.slug || normalizedSlug,
      client_name: orderData.client_name || orderData.name || normalizedSlug,
      studio_name: orderData.studio_name || `Studio ${orderData.client_name || normalizedSlug}`,
      hero_phrase: orderData.hero_phrase || 'A arte de transformar a sua beleza com leveza e precisão.',
      bio_description: orderData.bio_description || '',
      avatar_url: orderData.avatar_url || orderData.cover_media_url,
      cover_media_url: orderData.cover_media_url || orderData.avatar_url,
      niche: orderData.niche || 'lash',
      layout_model: (orderData.layout_model || orderData.modelo || 'mosaico').toLowerCase() === 'classico' ? 'classico' : 'mosaico',
      theme_variant: (orderData.theme_variant || orderData.theme || 'rose').toLowerCase().includes('luxury') ? 'luxury' : 'rose',
      whatsapp_number: orderData.whatsapp_number || orderData.whatsapp || '5511999999999',
      instagram_handle: orderData.instagram_handle || orderData.instagram || '',
      address: orderData.address || orderData.cidade || '',
      maps_url: orderData.maps_url || '',
      instructions_bg_url: orderData.instructions_bg_url,
      final_screen_bg_url: orderData.final_screen_bg_url,
      procedures: procedures,
      instructions: {
        pre_care: Array.isArray(orderData.pre_care) ? orderData.pre_care : ['Venha sem maquiagem na região do procedimento.'],
        post_care: Array.isArray(orderData.post_care) ? orderData.post_care : ['Higienizar diariamente conforme as recomendações.'],
        tolerances: orderData.tolerances || 'Tolerância máxima de 15 minutos de atraso.',
      },
    };

    return catalog;
  } catch (err) {
    console.error(`[StudioMenu SSR Error] Erro ao buscar slug "${normalizedSlug}":`, err);
    return null;
  }
}
