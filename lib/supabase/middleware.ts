// lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Do not add code between createServerClient and supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define routes that are always accessible regardless of auth state or organization
  const publicRoutes = [
    "/",
    "/auth/sign-in",
    "/auth/sign-up",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/callback",
    "/student-feedback", // Base student feedback path
    "/access-denied",
  ];

  // Define authentication-only routes (require auth but exempt from organization checks)
  const authOnlyRoutes = [
    "/auth/organization",
    "/auth/confirm-mail",
    "/auth/profile-setup",
  ];

  // Special handling for student feedback routes
  if (request.nextUrl.pathname.startsWith("/student-feedback/")) {
    // Always allow student feedback paths with codes
    return supabaseResponse;
  }

  // Check if current path matches any of the defined routes
  const isPublicRoute = publicRoutes.some((route) => {
    return (
      route === request.nextUrl.pathname ||
      (route !== "/" && request.nextUrl.pathname.startsWith(route + "/"))
    );
  });

  const isAuthOnlyRoute = authOnlyRoutes.some((route) => {
    return (
      route === request.nextUrl.pathname ||
      request.nextUrl.pathname.startsWith(route + "/")
    );
  });

  // FIRST CHECK: Authentication Check
  // If no user and not on a public route, redirect to sign-in or access denied
  if (!user && !isPublicRoute) {
    // Check if coming from homepage/login button or direct access
    const loginIntent = request.nextUrl.searchParams.get("login") === "true";
    const referer = request.headers.get("referer") || "";
    const fromHomepage = referer.includes(request.nextUrl.origin + "/");

    if (loginIntent || fromHomepage) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/sign-in";
      url.searchParams.set("redirectTo", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    } else {
      const url = request.nextUrl.clone();
      url.pathname = "/access-denied";
      url.searchParams.set("from", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // If we're on a public or auth-only route, don't do organization checks
  if (isPublicRoute || isAuthOnlyRoute) {
    return supabaseResponse;
  }

  // SECOND CHECK: If user is authenticated, create/verify profile
  if (user) {
    try {
      // Check if profile exists
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*, organization_id")
        .eq("id", user.id)
        .maybeSingle();

      // If no profile found and no error, create one
      if (!profile && !error) {
        console.log(`Creating profile for user ${user.id}`);
        const { error: insertError } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || "",
          role: "teacher", // Default role
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          department: "", // Required field
          bio: "Teacher with experience in education.", // Optional field
          avatar_url: null, // Optional field
        });

        if (insertError) {
          console.error("Error creating profile:", insertError);
        }
      }

      // THIRD CHECK: Organization Membership
      // Skip organization check for auth-related pages
      const hasOrganization = profile && profile.organization_id;

      // Only apply organization check to dashboard and protected routes
      if (!hasOrganization) {
        // We could be more specific here if needed
        const url = request.nextUrl.clone();
        url.pathname = "/auth/organization";
        return NextResponse.redirect(url);
      }
    } catch (e) {
      console.error("Error checking/creating profile:", e);
    }
  }

  return supabaseResponse;
}
