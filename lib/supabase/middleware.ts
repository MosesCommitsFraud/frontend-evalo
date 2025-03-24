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
  // Otherwise, you might get unexpected auth behavior

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is authenticated, ensure they have a profile
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

      // Check for organization membership
      const hasOrganization = profile && profile.organization_id;

      // Define public routes that don't require authentication
      const publicRoutes = [
        "/",
        "/auth/sign-in",
        "/auth/sign-up",
        "/auth/forgot-password",
        "/auth/reset-password",
        "/auth/callback",
        "/student-share", // Keep student share public
        "/access-denied", // Access denied page
      ];

      // Define organization routes (require auth but not organization)
      const organizationRoutes = ["/auth/organization"];

      // Check if current path is a public route
      const isPublicRoute = publicRoutes.some((route) => {
        // Handle exact matches and routes that have additional path segments
        return (
          route === request.nextUrl.pathname ||
          (route !== "/" && request.nextUrl.pathname.startsWith(route + "/"))
        );
      });

      // Check if current path is an organization route
      const isOrganizationRoute = organizationRoutes.some((route) => {
        return (
          route === request.nextUrl.pathname ||
          request.nextUrl.pathname.startsWith(route + "/")
        );
      });

      // If user has no organization and not on allowed routes, redirect to organization page
      if (!hasOrganization && !isPublicRoute && !isOrganizationRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/organization";
        return NextResponse.redirect(url);
      }
    } catch (e) {
      console.error("Error checking/creating profile:", e);
    }
  }

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth/sign-in",
    "/auth/sign-up",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/callback",
    "/student-share", // Keep student share public
    "/access-denied", // Access denied page
  ];

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some((route) => {
    // Handle exact matches and routes that have additional path segments
    return (
      route === request.nextUrl.pathname ||
      (route !== "/" && request.nextUrl.pathname.startsWith(route + "/"))
    );
  });

  // Check for login intent - source of navigation
  const loginIntent = request.nextUrl.searchParams.get("login") === "true";
  const referer = request.headers.get("referer") || "";

  // If no user and not on a public route
  if (!user && !isPublicRoute) {
    // If there's login intent or they're coming from the homepage, go directly to sign-in
    // This handles the "Teacher Login" button click case
    if (loginIntent || referer.includes(request.nextUrl.origin + "/")) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/sign-in";
      url.searchParams.set("redirectTo", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    // Otherwise (direct URL access), show access denied page
    else {
      const url = request.nextUrl.clone();
      url.pathname = "/access-denied";
      url.searchParams.set("from", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
