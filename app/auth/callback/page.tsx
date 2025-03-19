"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      router.push(`/auth/sign-in?error=${error}`);
      return;
    }
    // Force a reload after a short delay to ensure the new session is detected
    const timer = setTimeout(() => {
      // Option 1: Reload the entire page
      window.location.reload();

      // Option 2: Or redirect to a route that initializes AuthContext (uncomment below if you prefer)
      // router.push("/dashboard");
    }, 2000);

    return () => clearTimeout(timer);
  }, [error, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      <p className="mt-4 text-lg">Completing authentication...</p>
    </div>
  );
}
