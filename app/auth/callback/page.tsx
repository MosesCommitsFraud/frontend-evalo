"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after successful authentication
    // Supabase will automatically handle the auth state based on the URL params
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      <p className="mt-4 text-lg">Completing authentication...</p>
    </div>
  );
}
