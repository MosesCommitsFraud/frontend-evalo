"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const supabase = createClient();

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/auth/sign-in");
          return;
        }

        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        // Consider both dean and admin roles as admin
        if (profile && (profile.role === "dean" || profile.role === "admin")) {
          setIsAdmin(true);
        } else {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error checking admin access:", error);
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return isAdmin ? children : null;
}
