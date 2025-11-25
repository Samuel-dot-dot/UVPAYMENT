import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types_db';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Standard client (for browser/public use)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null as any;

// Admin client (for server-side operations requiring elevated privileges)
// This should ONLY be used in API routes and server components
export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Legacy helper for backwards compatibility
export const createSupabaseClient = <T = any>(key?: string) => {
  const accessKey = key ?? supabaseAnonKey;
  return createClient<T>(supabaseUrl, accessKey);
};
