import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Resolves the Supabase project's REST/Auth URL (https://<ref>.supabase.co).
 * Some setups only have SUPABASE_URL populated with the Postgres connection
 * string (e.g. copied from the "Connect" dialog instead of Settings > API) --
 * in that case we derive the project URL from the DB host instead of failing.
 */
function resolveSupabaseUrl(): string {
  const raw = process.env.SUPABASE_URL;
  if (raw && /^https?:\/\//.test(raw)) {
    return raw;
  }

  const dbUrl = process.env.SUPABASE_DB_URL ?? raw;
  // Direct connection host: postgres://postgres:<pw>@db.<ref>.supabase.co:5432/postgres
  const directMatch = dbUrl?.match(/@db\.([a-z0-9-]+)\.supabase\.co/i);
  if (directMatch) {
    return `https://${directMatch[1]}.supabase.co`;
  }
  // Pooler connection: postgres://postgres.<ref>:<pw>@<region>.pooler.supabase.com:6543/postgres
  const poolerMatch = dbUrl?.match(/postgres(?:ql)?:\/\/postgres\.([a-z0-9-]+):/i);
  if (poolerMatch) {
    return `https://${poolerMatch[1]}.supabase.co`;
  }

  throw new Error(
    "SUPABASE_URL must be set to your Supabase project URL (https://<ref>.supabase.co), " +
      "and it could not be derived from SUPABASE_DB_URL either.",
  );
}

const supabaseUrl = resolveSupabaseUrl();
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error("SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY must both be set.");
}

// Used for user-facing auth operations (sign up / sign in) -- respects
// Supabase Auth's normal password/email rules exactly as a client app would.
export const supabaseAnon: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Used for privileged operations (verifying bearer tokens server-side).
// Never expose this client or its key to the frontend.
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
