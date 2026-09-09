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
        description: s.description || s.desc || '',
        price: s.price || s.preco || 'Sob Consulta',
        duration: s.duration || s.duracao || '',
        category: s.category || s.catLabel || s.cat || 'Geral',
        image_url: s.image_url || s.img || '',
        badge: s.badge || '',
        is_highlight: Boolean(s.destaque || s.is_highlight),
      }));
    } else if (Array.isArray(orderData.procedures) && orderData.procedures.length > 0) {
      procedures = orderData.procedures;
    }

    // Fallback de segurança se não houver procedimentos cadastrados
    if (procedures.length === 0) {
      procedures = [
        {
          id: 'brasileiro',
          title: 'Volume Brasileiro',
          description: 'Fios tecnológicos com formato Y que preenchem as falhas naturais com leveza incomparável, alta durabilidade e acabamento marcante.',
          price: 'R$ 160',
          duration: '1h30min',
          category: 'Extensão de Cílios',
          badge: 'Mais Pedido',
          is_highlight: true,
          image_url: '/modelos/mosaico/assets/img/volume-brasileiro.png',
        },
        {
          id: 'egipcio',
          title: 'Volume Egípcio 3D',
          description: 'Fios especiais em formato W (3D tecnológico) que proporcionam densidade homogênea, efeito aveludado e volume equilibrado.',
          price: 'R$ 180',
          duration: '1h45min',
          category: 'Extensão de Cílios',
          badge: '',
          is_highlight: false,
          image_url: '/modelos/mosaico/assets/img/volume-egipcio.png',
        },
        {
          id: 'lifting',
          title: 'Lash Lifting com Tintura',
          description: 'Curvatura e alinhamento dos cílios naturais acompanhado de nutrição com queratina e pigmentação preta.',
          price: 'R$ 140',
          duration: '1h00min',
          category: 'Cuidados & Curvatura',
          badge: '',
          is_highlight: false,
          image_url: '/modelos/mosaico/assets/img/lash-lifting.png',
        },
        {
          id: 'henna',
          title: 'Design de Sobrancelha com Henna',
          description: 'Mapeamento facial completo com visagismo, alinhamento dos fios e aplicação de henna de alta fixação.',
          price: 'R$ 70',
          duration: '45min',
          category: 'Sobrancelhas',
          badge: '',
          is_highlight: false,
          image_url: '/modelos/mosaico/assets/img/sobrancelha-henna.jpg',
        },
      ];
    }

    // 3. Mapear para a interface `CatalogOrderData`
    const catalog: CatalogOrderData = {
      id: orderData.id,
      slug: orderData.slug || normalizedSlug,
      edit_token: orderData.edit_token,
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
      categories: Array.isArray(orderData.categories) ? orderData.categories : [],
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
