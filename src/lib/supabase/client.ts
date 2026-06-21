import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a mock client during SSR/build when env vars aren't set
    // Real usage happens client-side where env vars are available
    return createBrowserClient(
      url || "https://placeholder.supabase.co",
      key || "placeholder-key"
    );
  }

  return createBrowserClient(url, key);
}
