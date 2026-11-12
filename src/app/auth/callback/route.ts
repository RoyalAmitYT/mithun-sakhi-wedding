import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirectUrl } from "@/lib/safe-redirect";

/**
 * Handles OAuth and password-recovery PKCE authorization code exchange.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const safeNext = getSafeRedirectUrl(next, "/account");

  if (error) {
    const errorUrl = new URL("/auth/auth-code-error", origin);
    errorUrl.searchParams.set("error", error);
    if (errorDescription) {
      errorUrl.searchParams.set("description", errorDescription);
    }
    return NextResponse.redirect(errorUrl);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // Return to an authentication error page if exchange failed
  const fallbackUrl = new URL("/auth/auth-code-error", origin);
  fallbackUrl.searchParams.set(
    "error",
    "Unable to verify authorization credentials. The link may have expired."
  );
  return NextResponse.redirect(fallbackUrl);
}
