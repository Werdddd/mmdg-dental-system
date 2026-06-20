// True once a real Supabase project URL has replaced the placeholder in
// .env.local. Used to let the app run/demo before Supabase is wired up —
// auth gating and real sign-in switch on automatically once this is true.
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder'),
)
