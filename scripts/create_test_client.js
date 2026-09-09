const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://orrfslursoielebvdhbf.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycmZzbHVyc29pZWxlYnZkaGJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4ODc4NTIsImV4cCI6MjEwNDQ2Mzg1Mn0.WFjKCJOvmf2cXY8zR29cgS7zS9Drtbx1zgPa3jplErw';

const headers = {
  'apikey': supabaseAnonKey,
  'Authorization': `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

async function createTestClient() {
  console.log('🚀 Cadastrando cliente fictícia Vanessa Camargo via Supabase REST API...');

  const slug = 'vanessa-camargo';
  const editToken = 'token_vanessa_test_12345';

  // 1. Verificar se o catálogo já existe em `orders`
  const checkRes = await fetch(`${supabaseUrl}/rest/v1/orders?slug=eq.${slug}`, { headers });
  const existingOrders = await checkRes.json();

  const orderPayload = {
    slug,
    client_name: 'Vanessa Camargo',
    studio_name: 'Vanessa Camargo Beauty Studio',
    niche: 'lash',
    layout_model: 'mosaico',
    theme_variant: 'rose',
    whatsapp_number: '5511987654321',
    instagram_handle: '@vanessacamargo.beauty',
    hero_phrase: 'Sua melhor versão com o olhar marcante, precisão e acabamento impecável.',
    bio_description: 'Lash Designer especialista em Cílios Tecnológicos e Design de Sobrancelhas.',
    cover_media_url: 'https://lashmenu.com/modelos/mosaico/assets/img/Hero.png',
    avatar_url: 'https://lashmenu.com/modelos/mosaico/assets/img/Hero.png',
    instructions_bg_url: '/modelos/mosaico/assets/img/hero.jpg',
    final_screen_bg_url: 'https://lashmenu.com/modelos/mosaico/assets/img/Footer.png',
    cta_bg_url: 'https://lashmenu.com/modelos/mosaico/assets/img/Footer.png',
    address: 'São Paulo - SP',
    tolerances: 'Tolerância máxima de 15 minutos de atraso.',
    pre_care: [
      'Venha sem maquiagem na região dos olhos.',
      'Não utilize protetor solar ou cremes faciais no dia da sessão.',
    ],
    post_care: [
      'Evite molhar as extensões nas primeiras 24 horas.',
      'Higienize os cílios diariamente com shampoo infantil ou neutro.',
      'Penteie delicadamente duas vezes ao dia.',
    ],
    edit_token: editToken,
    status: 'active',
  };

  let order;

  if (Array.isArray(existingOrders) && existingOrders.length > 0) {
    order = existingOrders[0];
    console.log('🔄 Catálogo já existente encontrado. Atualizando dados...', order.id);

    const updateRes = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${order.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(orderPayload),
    });
    const updated = await updateRes.json();
    if (updated.length) order = updated[0];

    // Remover serviços antigos vinculados
    await fetch(`${supabaseUrl}/rest/v1/order_services?order_id=eq.${order.id}`, {
      method: 'DELETE',
      headers,
    });
  } else {
    const resOrder = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderPayload),
    });
    const insertedOrders = await resOrder.json();
    if (!resOrder.ok || !insertedOrders.length) {
      console.error('❌ Erro ao criar cliente em orders:', insertedOrders);
      process.exit(1);
    }
    order = insertedOrders[0];
  }

  console.log('✅ Cliente pronta em orders! ID:', order.id);

  // 2. Inserir procedimentos em `order_services`
  const services = [
    {
      order_id: order.id,
      order_index: 0,
      title: 'Volume Brasileiro',
      description: 'Aplicação com fios em formato Y. Proporciona leveza, preenchimento marcante e excelente retenção.',
      price: '160,00',
      duration: '1h30min',
      category: 'Extensão de Cílios',
      image_url: '/modelos/mosaico/assets/img/volume-brasileiro.png',
      badge: 'Mais Pedido',
      is_highlight: true,
      specs: [
        ['Curvatura', 'D ou C'],
        ['Espessura', '0.07mm'],
        ['Durabilidade', '20 a 25 dias'],
      ],
    },
    {
      order_id: order.id,
      order_index: 1,
      title: 'Volume Egípcio 3D',
      description: 'Técnica com fios em W (3 pontas). Oferece olhar volumoso com acabamento texturizado e sofisticado.',
      price: '180,00',
      duration: '1h45min',
      category: 'Extensão de Cílios',
      image_url: '/modelos/mosaico/assets/img/volume-egipcio.png',
      badge: '',
      is_highlight: false,
      specs: [
        ['Curvatura', 'D / CC'],
        ['Efeito', 'Volume Texturizado'],
        ['Retenção', 'Até 25 dias'],
      ],
    },
    {
      order_id: order.id,
      order_index: 2,
      title: 'Lash Lifting com Tintura',
      description: 'Curvatura e alinhamento dos cílios naturais acompanhado de nutrição com queratina e pigmentação preta.',
      price: '140,00',
      duration: '1h',
      category: 'Cuidados & Curvatura',
      image_url: '/modelos/mosaico/assets/img/lash-lifting.png',
      badge: '',
      is_highlight: false,
      specs: [
        ['Resultado', 'Cílios curvados e pretos'],
        ['Durabilidade', '6 a 8 semanas'],
        ['Nutrição', 'Vitamins & Queratina'],
      ],
    },
    {
      order_id: order.id,
      order_index: 3,
      title: 'Design de Sobrancelha com Henna',
      description: 'Mapeamento facial completo com visagismo, alinhamento dos fios e aplicação de henna de alta fixação.',
      price: '70,00',
      duration: '45min',
      category: 'Sobrancelhas',
      image_url: '/modelos/mosaico/assets/img/volume-brasileiro.png',
      badge: '',
      is_highlight: false,
      specs: [
        ['Fixação', 'Até 10 dias na pele'],
        ['Técnica', 'Visagismo Facial'],
        ['Acabamento', 'Efeito Ombré'],
      ],
    },
  ];

  const resServices = await fetch(`${supabaseUrl}/rest/v1/order_services`, {
    method: 'POST',
    headers,
    body: JSON.stringify(services),
  });

  const insertedServices = await resServices.json();
  if (!resServices.ok) {
    console.error('❌ Erro ao criar procedimentos em order_services:', insertedServices);
    process.exit(1);
  }

  console.log(`✅ ${insertedServices.length} procedimentos cadastrados com sucesso!`);
  console.log('----------------------------------------------------');
  console.log('🎉 CATÁLOGO FICTÍCIO CADASTRADO COM SUCESSO NO SUPABASE!');
  console.log(`👤 Profissional: ${order.client_name} (${order.studio_name})`);
  console.log(`📍 URL Pública: http://localhost:3000/c/${slug}`);
  console.log(`🔑 Token Mágico de Edição: ${editToken}`);
  console.log(`🔗 Link Mágico de Edição: http://localhost:3000/c/${slug}?edit=${editToken}`);
  console.log('----------------------------------------------------');
}

createTestClient();
