import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

/**
 * Refreshes Supabase authentication sessions and propagates refreshed cookies
 * through the Next.js 16 Proxy layer with high-performance routing fast-paths.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  // Dedicated admin login page is public, but all other /admin/* paths require authentication
  const isAdminLogin = pathname === "/admin/login";
  const isProtectedAdminPath = pathname.startsWith("/admin") && !isAdminLogin;
  const isProtectedAccountPath = pathname.startsWith("/account");
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  // Check if any Supabase session cookies exist in this request
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.startsWith("sb-") || c.name.includes("auth-token")
  );

  // Fast path 1: Public routes without session cookies (Home, Gallery, Wishes, RSVP, RSC prefetch)
  // Skip remote Supabase auth network round-trip entirely, eliminating 300ms–1500ms latency on every click!
  if (!isProtectedAdminPath && !isProtectedAccountPath && !isAuthPage && !hasAuthCookie) {
    return response;
  }

  // Fast path 2: Unauthenticated visitors hitting protected routes redirect immediately without network delay
  if (!hasAuthCookie && isProtectedAdminPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (!hasAuthCookie && isProtectedAccountPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (!hasAuthCookie && isAuthPage) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Calling getUser refreshes the session token if expired (only when session cookies exist)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Unauthenticated visitors accessing protected admin routes redirect directly to /admin/login
  if (!user && isProtectedAdminPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // 2. Unauthenticated visitors accessing /account redirect to /login
  if (!user && isProtectedAccountPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // 3. Authenticated users visiting public guest auth pages redirect to /account
  if (user && isAuthPage && pathname !== "/forgot-password") {
    const url = request.nextUrl.clone();
    url.pathname = "/account";
    return NextResponse.redirect(url);
  }

  return response;
}
