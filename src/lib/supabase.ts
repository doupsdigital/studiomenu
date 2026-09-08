import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wffhptpsafllsmcsoiih.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzIsInJlZiI6IndmZmhwdHBzYWZsbHNtY3NvaWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyODkyMTYsImV4cCI6MjEwMjg2NTIxNn0.nwpvIwl8V6_KGIp5e5oeraAcGyt3oo8Kdam2hp6ajSQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
