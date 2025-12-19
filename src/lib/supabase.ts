import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string) => {
    // Check Vite environment variable first, then fallback to runtime window._env_
    return import.meta.env[key] || (window as any)._env_?.[key];
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key missing in environment variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});
