import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  throw new Error('supabaseBrowser requer NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY definidas.');
}

// Client público (chave anon) — só pra Auth (login/cadastro da profissional)
// dentro de componentes 'use client'. Nunca usar pra ler/gravar tabelas do
// app: essas continuam passando exclusivamente pelas rotas server-side com
// supabaseAdmin (RLS bloqueia o papel anon em todas elas, de propósito).
export const supabaseBrowser = createClient(supabaseUrl, anonKey);
