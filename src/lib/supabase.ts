// filepath: src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const service = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || anon;

export const supabase = createClient(url, anon);

export const supabaseAdmin = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
});
