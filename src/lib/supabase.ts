import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://orrfslursoielebvdhbf.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycmZzbHVyc29pZWxlYnZkaGJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4ODc4NTIsImV4cCI6MjEwNDQ2Mzg1Mn0.WFjKCJOvmf2cXY8zR29cgS7zS9Drtbx1zgPa3jplErw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
