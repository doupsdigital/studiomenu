/** Nomes que nunca podem ser tratados como subdomínio de cliente — colidem
 *  com rotas reais do app ou com domínios do próprio produto. */
export const RESERVED_SLUGS = [
  'www',
  'studiomenu',
  'lashmenu-vendas',
  'admin',
  'api',
  'form',
  'vendas',
  'c',
  'modelos',
  'clientes',
  // Subdomínios do DNS do Resend (e-mail, 2026-11-18): o registro CNAME
  // fixo ganharia do `*`, então um catálogo com esse slug nunca abriria.
  'send',
  'rsend',
];
