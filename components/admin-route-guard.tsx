"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Skip check if authentication is still loading or user is not authenticated
      if (isLoading) return;
      if (!user) {
        router.push("/auth/sign-in?redirectTo=/admin-analytics");
        return;
      }

      try {
        // Get the user's profile from the context or make an API call
        const supabase = createClient();
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error checking user role:", error);
          setIsAdmin(false);
          router.push("/access-denied");
          return;
        }

        const isUserAdmin = data?.role === "dean"; // Assuming "dean" is your admin role
        setIsAdmin(isUserAdmin);

        if (!isUserAdmin) {
          router.push("/access-denied");
        }
      } catch (error) {
        console.error("Error verifying admin status:", error);
        setIsAdmin(false);
        router.push("/access-denied");
      }
    };

    checkAdminStatus();
  }, [user, isLoading, router]);

  // Show loading state while checking admin status
  if (isLoading || isAdmin === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="mt-4 text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  // If user is not admin, the redirection should have already happened
  // But as a fallback, return null
  if (!isAdmin) {
    return null;
  }

  // User is an admin, show the children
  return <>{children}</>;
}

// Import at the top
import { createClient } from "@/lib/supabase/client";
