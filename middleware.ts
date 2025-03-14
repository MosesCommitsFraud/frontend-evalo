import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/callback",
];

export async function middleware(request: NextRequest) {
  // Create a response to modify
  const response = NextResponse.next();

  // Create a Supabase client using the Request and Response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // This will be used to set cookies after the response is created
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: any) {
          response.cookies.delete(name, options);
        },
      },
    },
  );

  // Check if the current path is a public route
  const isPublicRoute =
    publicRoutes.some((route) => request.nextUrl.pathname === route) ||
    request.nextUrl.pathname.startsWith("/auth/");

  // Get the user's session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If user is not authenticated and the route requires authentication
  if (!session && !isPublicRoute) {
    // Redirect to login with the original URL as a query parameter
    const redirectUrl = new URL("/auth/sign-in", request.url);
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated but trying to access auth pages
  if (session && request.nextUrl.pathname.startsWith("/auth/")) {
    // Redirect to dashboard
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
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
