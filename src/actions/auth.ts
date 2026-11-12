"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirectUrl } from "@/lib/safe-redirect";
import { isMemoriesModeActive } from "@/lib/lifecycle";

export type AuthActionResult = {
  success?: boolean;
  error?: string;
  message?: string;
  requiresVerification?: boolean;
};

/**
 * Handles guest registration with full name, email, password, and optional mobile number.
 */
export async function signUpAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  if (isMemoriesModeActive()) {
    return {
      error:
        "Guest registration has concluded as the wedding celebrations have transitioned into Memories Mode.",
    };
  }

  const fullName = formData.get("full_name")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();
  const mobileNumber = formData.get("mobile_number")?.toString().trim() || null;

  if (!fullName || fullName.length < 2) {
    return { error: "Please enter your full name (at least 2 characters)." };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters in length." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        mobile_number: mobileNumber,
      },
    },
  });

  if (error) {
    // Return friendly generic error to prevent enumeration or revealing database internals
    if (error.message.toLowerCase().includes("already registered")) {
      return {
        error:
          "An account with this email address already exists. Please log in instead.",
      };
    }
    return {
      error:
        "Unable to complete registration at this time. Please check your details and try again.",
    };
  }

  // If user is authenticated immediately (confirmations disabled)
  if (data.session && data.user) {
    if (mobileNumber) {
      await supabase
        .from("profiles")
        .update({ mobile_number: mobileNumber })
        .eq("id", data.user.id);
    }
    revalidatePath("/", "layout");
    redirect("/account");
  }

  // If environment has email confirmations enabled
  return {
    success: true,
    requiresVerification: true,
    message:
      "Registration successful! Please check your email inbox to confirm your account before logging in.",
  };
}

/**
 * Handles guest login with email and password.
 */
export async function signInAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();
  const redirectTarget = formData.get("redirect")?.toString();

  if (!email || !password) {
    return { error: "Please enter both your email address and password." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error:
        "Invalid email or password. Please verify your credentials and try again.",
    };
  }

  const safeDestination = getSafeRedirectUrl(redirectTarget, "/account");
  revalidatePath("/", "layout");
  redirect(safeDestination);
}

/**
 * Handles administrator login with email, password, and active admin role verification.
 * Strictly prevents non-admin users from obtaining an administrator session.
 */
export async function adminSignInAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();
  const redirectTarget = formData.get("redirect")?.toString();

  if (!email || !password) {
    return { error: "Please enter both your administrator email and password." };
  }

  const supabase = await createClient();

  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !authData.user) {
    return {
      error: "Invalid email or password. Please verify your administrator credentials.",
    };
  }

  // Authoritative server-side check: caller must exist in admin_users with is_active = true
  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("id, is_active, is_super_admin")
    .eq("id", authData.user.id)
    .single();

  if (adminError || !adminUser || !adminUser.is_active) {
    // Revoke session immediately so regular accounts never gain admin privileges
    await supabase.auth.signOut();
    return {
      error: "Access denied. This account does not possess active administrative privileges.",
    };
  }

  const safeDestination = getSafeRedirectUrl(redirectTarget, "/admin");
  revalidatePath("/", "layout");
  redirect(safeDestination.startsWith("/admin") ? safeDestination : "/admin");
}

/**
 * Signs the current user out and invalidates the session.
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Signs the administrator out and redirects to /admin/login.
 */
export async function adminSignOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/admin/login");
}

/**
 * Initiates password recovery email dispatch.
 */
export async function forgotPasswordAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email")?.toString().trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const headerList = await headers();
  const host = headerList.get("host") || "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  const supabase = await createClient();

  // Request password reset email
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  });

  // Always return a generic success message to prevent account enumeration
  return {
    success: true,
    message:
      "If an account exists for this email address, password reset instructions have been sent. Please check your inbox.",
  };
}

/**
 * Updates the authenticated user's password.
 */
export async function updatePasswordAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirm_password")?.toString();

  if (!password || password.length < 6) {
    return { error: "New password must be at least 6 characters in length." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match. Please re-enter your new password." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return {
      error:
        "Unable to update your password at this time. Please request a new reset link and try again.",
    };
  }

  revalidatePath("/", "layout");
  return {
    success: true,
    message: "Your password has been successfully updated. You may now proceed to your account.",
  };
}

/**
 * Generates the Google OAuth authorization URL for redirect.
 */
export async function getGoogleOAuthUrl(redirectTarget?: string): Promise<{
  url?: string;
  error?: string;
}> {
  const headerList = await headers();
  const host = headerList.get("host") || "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  const safeNext = getSafeRedirectUrl(redirectTarget, "/account");
  const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
    },
  });

  if (error || !data.url) {
    return {
      error:
        "Google sign-in is not yet configured for this environment. Please sign in with your email and password.",
    };
  }

  return { url: data.url };
}
