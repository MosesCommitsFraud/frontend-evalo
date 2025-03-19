"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const error = searchParams.get("error");

  useEffect(() => {
    async function completeAuth() {
      if (error) {
        router.push(`/auth/sign-in?error=${error}`);
        return;
      }
      // Retrieve the session to ensure the user is signed in after confirmation.
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        console.error("Error getting session:", sessionError);
      }
      // Once the session is established, redirect to the dashboard (or any other page)
      router.push("/dashboard");
    }
    completeAuth();
  }, [error, router, supabase]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      <p className="mt-4 text-lg">Completing authentication...</p>
    </div>
  );
}
