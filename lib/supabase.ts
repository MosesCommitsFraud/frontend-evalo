// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createBrowserClient } from "@supabase/ssr";

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a Supabase client for use in browser components
export const createBrowserSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Browser client instance (safe for client components)
export const supabase = createBrowserSupabaseClient();
