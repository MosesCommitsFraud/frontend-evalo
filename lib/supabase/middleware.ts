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
          cookiesToSet.forEach(({ name, value, options }) =>
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
  // Otherwise, you might get unexpected auth behavior

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth/sign-in",
    "/auth/sign-up",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/callback",
    "/student-feedback", // Keep student feedback public
  ];

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some((route) => {
    // Handle exact matches and routes that have additional path segments
    return (
      route === request.nextUrl.pathname ||
      (route !== "/" && request.nextUrl.pathname.startsWith(route + "/"))
    );
  });

  // If no user and not on a public route, redirect to sign-in
  if (!user && !isPublicRoute) {
    // No user, redirect to sign-in page
    const url = request.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    // Add the original URL as a "redirectTo" param to redirect after login
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
