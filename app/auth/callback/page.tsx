"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    // If there's an error, redirect to sign-in page
    if (error) {
      router.push(`/auth/sign-in?error=${error}`);
      return;
    }

    // The actual auth verification is handled by the route.ts handler
    // This is just a loading page that will be shown briefly
  }, [error, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      <p className="mt-4 text-lg">Completing authentication...</p>
    </div>
  );
}
