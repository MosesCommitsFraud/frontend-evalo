import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured for the edge runtime
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth/sign-in",
    "/auth/sign-up",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/callback",
  ];
  const isPublicRoute =
    publicRoutes.some((route) => request.nextUrl.pathname === route) ||
    request.nextUrl.pathname.startsWith("/auth/");

  // Check if user is authenticated
  if (!session && !isPublicRoute) {
    // User is not authenticated and trying to access a protected route, redirect to login
    const redirectUrl = new URL("/auth/sign-in", request.url);
    // Add the original URL as a query parameter to redirect after login
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (session && request.nextUrl.pathname.startsWith("/auth/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - API routes (you might want to protect some APIs too)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
