export type LeadStatus = 'pendente' | 'abordado' | 'negociacao' | 'fechado' | 'recusado';

export interface ProspectLead {
  Rank: number;
  Score_Potencial: number;
  Nome_Estudio: string;
  Bairro: string;
  Avaliação_Google: number;
  Total_Avaliações: number;
  Telefone?: string;
  Link_WhatsApp?: string;
  Instagram?: string;
  Website?: string;
  Endereço?: string;
  Link_GoogleMaps?: string;
  Abordagem_1_Inicial?: string;
  Resposta_2_Demonstracao_SIM?: string;
  Fechamento_3_Oferta_Preco_Pix?: string;
  // Campos de variação (Abordagem_1_Variação_1, Resposta_2_Variação_2, etc.) são
  // acessados dinamicamente por chave computada — cobertos por este índice.
  [key: string]: string | number | undefined;
}

export interface LeadRuntimeState {
  status: LeadStatus;
  notes: string;
}
