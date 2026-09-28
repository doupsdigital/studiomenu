import 'server-only';
import { randomBytes } from 'crypto';
import { supabaseAdmin } from './supabase-admin';

// Sem 0/O/1/I/l — ambíguos demais pra um link que alguém pode ler em voz
// alta ou digitar (mesmo sendo majoritariamente clicado, não custa evitar).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
const CODE_LENGTH = 7;

function generateCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}

/** Gera e salva um código curto único (`orders.app_short_code`) pro link
 *  do app (`/a/[code]`) — chamado sob demanda pela listagem do admin pra
 *  qualquer catálogo que ainda não tenha um (tanto os criados antes dessa
 *  funcionalidade quanto os novos). 7 caracteres num alfabeto de 58
 *  símbolos (~1,4 trilhão de combinações) torna colisão real improvável,
 *  mas a função tenta de novo mesmo assim — a coluna é `UNIQUE`. */
export async function assignAppShortCode(orderId: string): Promise<string | null> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateCode();
    const { error } = await supabaseAdmin.from('orders').update({ app_short_code: code }).eq('id', orderId);
    if (!error) return code;
    // 23505 = violação de UNIQUE (colisão de código) — tenta outro.
    // Qualquer outro erro não é recuperável tentando de novo.
    if (error.code !== '23505') {
      console.error('[assignAppShortCode] Erro ao salvar código curto:', error);
      return null;
    }
  }
  console.error('[assignAppShortCode] Não conseguiu gerar código único após 5 tentativas.');
  return null;
}
