// lib/supabase/server.ts
import { createClient as createBrowserClient } from "@supabase/supabase-js";

// This creates a Supabase client that works on the server without Next.js cookie dependencies
export async function createClient() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  return supabase;
}
