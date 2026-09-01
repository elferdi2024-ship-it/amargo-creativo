// filepath: src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const DEFAULT_URL = "https://hmpswvofxxfanmaiyriu.supabase.co";
const DEFAULT_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcHN3dm9meHhmYW5tYWl5cml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNzExMDYsImV4cCI6MjEwMzg0NzEwNn0.DU76rR3IeMvCynCeutWnr9h9y7lfFe3q2ykfJCM7Kyc";
const DEFAULT_SERVICE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcHN3dm9meHhmYW5tYWl5cml1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODI3MTEwNiwiZXhwIjoyMTAzODQ3MTA2fQ.-U9OJNRg61B8IaE9zLGA-yoRJs7z_f5vH5V9s514iJU";

const url = import.meta.env.PUBLIC_SUPABASE_URL || DEFAULT_URL;
const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON;
const service = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE;

export const supabase = createClient(url, anon);

export const supabaseAdmin = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
});
