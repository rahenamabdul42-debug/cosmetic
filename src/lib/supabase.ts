import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const supabasePublicKey = (
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
)?.trim();

const hasValidConfig =
  Boolean(supabaseUrl) &&
  Boolean(supabasePublicKey) &&
  !supabaseUrl?.includes('your-project-id') &&
  !supabasePublicKey?.includes('your-supabase-') &&
  !supabasePublicKey?.includes('your_publishable_key');

export const isSupabaseConfigured = (): boolean => hasValidConfig;

export const supabase: SupabaseClient | null = hasValidConfig
  ? createClient(supabaseUrl!, supabasePublicKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
