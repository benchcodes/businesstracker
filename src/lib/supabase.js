import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function getSupabaseConfig(url = supabaseUrl, key = supabaseAnonKey) {
  if (!url || !key) {
    return null;
  }

  return { url, key };
}

export function createSupabaseClient(url = supabaseUrl, key = supabaseAnonKey) {
  const config = getSupabaseConfig(url, key);

  if (!config) {
    return null;
  }

  return createClient(config.url, config.key);
}

export const supabase = createSupabaseClient();
