'use client';

import React, { useState } from 'react';
import { CatalogOrderData, LayoutModel, ThemeVariant, NicheType } from '@/types/catalog';
import { CatalogLayout } from '@/components/catalog/CatalogLayout';
import { Sparkles, Palette, Layers, Scissors } from 'lucide-react';

const mockCatalogData: Record<NicheType, CatalogOrderData> = {
  lash: {
    slug: 'mariana-alves',
    client_name: 'Mariana Alves',
    studio_name: 'Studio Mariana Alves',
    hero_phrase: 'A arte de transformar o seu olhar — leveza incomparável, precisão e elegância.',
    bio_description: 'Especialista em Cílios, Lash Lifting e Visagismo do Olhar.',
    cover_media_url: 'https://lashmenu.com/modelos/mosaico/assets/img/Hero.png',
    avatar_url: 'https://lashmenu.com/modelos/mosaico/assets/img/Hero.png',
    niche: 'lash',
    layout_model: 'mosaico',
    theme_variant: 'rose',
    whatsapp_number: '5562991083435',
    instagram_handle: '@marianaalves.lash',
    address: 'São Paulo',
    procedures: [
      {
        id: '1',
        title: 'Volume Brasileiro',
        description: 'Técnica de aplicação com fios em formato Y, proporcionando volume leve e efeito pretinho marcante.',
        price: '180,00',
        duration: '2h',
        category: 'Extensão de Cílios',
        badge: 'Mais Pedido',
        is_highlight: true,
        image_url: 'https://images.unsplash.com/photo-1583001809873-a1284d563391?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: '2',
        title: 'Lash Lifting com Nutrição',
        description: 'Curvatura e tintura dos cílios naturais com tratamento intensivo de queratina e vitaminas.',
        price: '140,00',
        duration: '1h15min',
        category: 'Extensão de Cílios',
        image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: '3',
        title: 'Design de Sobrancelhas + Henna',
        description: 'Mapeamento facial personalizado, alinhamento simétrico e aplicação de henna natural.',
        price: '70,00',
        duration: '45min',
        category: 'Sobrancelhas',
      },
      {
        id: '4',
        title: 'Volume Egípcio',
        description: 'Efeito preenchido e sofisticado com fios em formato W super leves.',
        price: '210,00',
        duration: '2h15min',
        category: 'Extensão de Cílios',
        badge: 'Lançamento',
      },
    ],
    instructions: {
      pre_care: [
        'Venha com a região dos olhos sem maquiagem.',
      ],
      post_care: [
        'Não molhar nas primeiras 24h.',
      ],
      tolerances: 'Tolerância máxima de 15 minutos de atraso.',
    },
  },
  nail: {
    slug: 'carla-nails',
    client_name: 'Carla Souza',
    studio_name: 'Carla Souza Nail Designer',
    hero_phrase: 'Unhas de Gel, Banho de Gel e Nail Art Exclusiva com Acabamento Perfeito.',
    niche: 'nail',
    layout_model: 'mosaico',
    theme_variant: 'luxury',
    whatsapp_number: '5562991083435',
    instagram_handle: '@carlasouza.nails',
    cover_media_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
    procedures: [
      {
        id: 'n1',
        title: 'Alongamento em Gel no Molde',
        description: 'Estruturação natural e resistente com acabamento fino e esmaltação em gel.',
        price: '220,00',
        duration: '2h30min',
        category: 'Unhas de Gel',
        badge: 'Destaque',
        is_highlight: true,
      },
      {
        id: 'n2',
        title: 'Banho de Gel nas Unhas Naturais',
        description: 'Blindagem de alta resistência para unhas naturais crescerem sem quebrar.',
        price: '130,00',
        duration: '1h30min',
        category: 'Blindagem',
      },
    ],
    instructions: {
      pre_care: ['Unhas limpas sem esmalte tradicional.'],
      post_care: ['Evitar usar as unhas como ferramentas.'],
      tolerances: 'Tolerância máxima de 10 minutos.',
    },
  },
  estetica: {
    slug: 'clinica-bella',
    client_name: 'Dra. Beatriz Lima',
    studio_name: 'Bella Estética Avançada',
    hero_phrase: 'Tratamentos Faciais, Limpeza de Pele Profunda e Depilação a Laser.',
    niche: 'estetica',
    layout_model: 'classico',
    theme_variant: 'rose',
    whatsapp_number: '5562991083435',
    instagram_handle: '@bella.esteticago',
    procedures: [
      {
        id: 'e1',
        title: 'Limpeza de Pele Fotônica',
        description: 'Extração profunda de cravos, esfoliação ultrassônica e máscara regeneradora.',
        price: '190,00',
        duration: '1h45min',
        category: 'Tratamento Facial',
        badge: 'Queridinho',
      },
      {
        id: 'e2',
        title: 'Drenagem Linfática Facial',
        description: 'Manobras para desinchamento e contorno facial.',
        price: '150,00',
        duration: '1h',
        category: 'Tratamento Facial',
      },
    ],
    instructions: {
      pre_care: ['Evitar exposição solar intensa no dia anterior.'],
      post_care: ['Usar protetor solar FPS 50+ a cada 3 horas.'],
      tolerances: 'Tolerância de 15 minutos.',
    },
  },
  studio: {
    slug: 'studio-beauty-lounge',
    client_name: 'Juliana & Equipe',
    studio_name: 'Beauty Lounge Studio',
    hero_phrase: 'Seu espaço completo de beleza: Lash, Nails, Cabelo e Estética em um só lugar.',
    niche: 'studio',
    layout_model: 'mosaico',
    theme_variant: 'luxury',
    whatsapp_number: '5562991083435',
    instagram_handle: '@beautylounge.studio',
    procedures: [
      {
        id: 's1',
        title: 'Combo Lash + Sobrancelha VIP',
        description: 'Volume Brasileiro + Design de Sobrancelha com Henna no mesmo dia.',
        price: '230,00',
        duration: '2h30min',
        category: 'Combos VIP',
        badge: 'Super Combo',
      },
      {
        id: 's2',
        title: 'Alongamento em Gel + Esmaltação',
        description: 'Unhas perfeitas por semanas com acabamento luxo.',
        price: '210,00',
        duration: '2h',
        category: 'Nails & Gel',
      },
    ],
    instructions: {
      pre_care: ['Chegar com 5 minutos de antecedência.'],
      post_care: ['Seguir as orientações de cada profissional.'],
      tolerances: 'Tolerância de 15 minutos.',
    },
  },
};

export default function DemoPage() {
  const [selectedNiche, setSelectedNiche] = useState<NicheType>('lash');
  const [layoutModel, setLayoutModel] = useState<LayoutModel>('mosaico');
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>('rose');

  const catalog = {
    ...mockCatalogData[selectedNiche],
    layout_model: layoutModel,
    theme_variant: themeVariant,
  };

  return (
    <div className="relative min-h-screen">
      {/* Barra de Controle de Testes Visual Superior (Overlay Flutuante) */}
      <div className="fixed top-2 left-2 right-2 z-50 max-w-md mx-auto bg-slate-950/90 backdrop-blur-md text-white p-2.5 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Testes StudioMenu
            </span>
            <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
              Etapa 2 — Homologação
            </span>
          </div>

          {/* Seletores de Nicho, Modelo e Tema */}
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <div>
              <select
                value={selectedNiche}
                onChange={(e) => setSelectedNiche(e.target.value as NicheType)}
                className="w-full bg-slate-800/90 text-white rounded-lg p-1 text-[10px] font-medium border border-slate-700 focus:outline-none"
              >
                <option value="lash">Lash Designer</option>
                <option value="nail">Nail Designer</option>
                <option value="estetica">Estética</option>
                <option value="studio">Studio (Multi)</option>
              </select>
            </div>

            <div>
              <select
                value={layoutModel}
                onChange={(e) => setLayoutModel(e.target.value as LayoutModel)}
                className="w-full bg-slate-800/90 text-white rounded-lg p-1 text-[10px] font-medium border border-slate-700 focus:outline-none"
              >
                <option value="mosaico">Mosaico</option>
                <option value="classico">Clássico</option>
              </select>
            </div>

            <div>
              <select
                value={themeVariant}
                onChange={(e) => setThemeVariant(e.target.value as ThemeVariant)}
                className="w-full bg-slate-800/90 text-white rounded-lg p-1 text-[10px] font-medium border border-slate-700 focus:outline-none"
              >
                <option value="rose">Rosé 🌸</option>
                <option value="luxury">Luxury 👑</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Renderização do Catálogo Fiel */}
      <CatalogLayout
        data={catalog}
        onThemeChange={(newTheme) => setThemeVariant(newTheme)}
      />
    </div>
  );
}

