// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

// Define routes that should be accessible without authentication
const publicRoutes = [
  "/",
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/callback",
  "/student-feedback", // Student feedback entries are public
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create a Supabase client specifically for the middleware
  const supabase = createMiddlewareClient<Database>({ req, res });

  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get the pathname from the request
  const { pathname } = req.nextUrl;

  // Check if the path is a public route or starts with one
  // This handles paths like /student-feedback/{code}
  const isPublicRoute = publicRoutes.some(
    (route) =>
      pathname === route ||
      (route.endsWith("/")
        ? pathname.startsWith(route)
        : pathname.startsWith(`${route}/`)),
  );

  // If the route is not public and the user is not authenticated, redirect to sign in
  if (!isPublicRoute && !session) {
    const redirectUrl = new URL("/auth/sign-in", req.url);

    // Add the original URL as a parameter to redirect back after login
    redirectUrl.searchParams.set("redirectTo", pathname);

    return NextResponse.redirect(redirectUrl);
  }

  // If the user is trying to access auth pages while logged in, redirect to dashboard
  if (pathname.startsWith("/auth/") && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't require authentication
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/public).*)",
  ],
};
