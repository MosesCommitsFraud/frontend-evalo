// app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      const { searchParams } = new URL(window.location.href);
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (error) {
        console.error("OAuth error:", error, errorDescription);
        router.push(
          `/auth/sign-in?error=${encodeURIComponent(errorDescription || error)}`,
        );
        return;
      }

      if (code) {
        try {
          // Exchange the auth code for a session
          // Supabase handles this automatically through the ssr pacakge
          // We just need to check for the session
          const { data } = await supabase.auth.getSession();

          if (data.session) {
            // Check if a profile exists
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", data.session.user.id)
              .single();

            if (!profile) {
              // Create a profile for the user
              const fullName =
                data.session.user.user_metadata.full_name ||
                data.session.user.user_metadata.name ||
                "User";

              await supabase.from("profiles").insert({
                id: data.session.user.id,
                email: data.session.user.email,
                full_name: fullName,
                avatar_url: data.session.user.user_metadata.avatar_url,
                role: "teacher", // Default role
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }

            router.push("/dashboard");
          } else {
            router.push("/auth/sign-in");
          }
        } catch (error) {
          console.error("Error processing OAuth callback:", error);
          router.push("/auth/sign-in?error=Error processing authentication");
        }
      } else {
        // No code found, redirect to sign in
        router.push("/auth/sign-in");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      <p className="mt-4 text-lg">Completing authentication...</p>
    </div>
  );
}
