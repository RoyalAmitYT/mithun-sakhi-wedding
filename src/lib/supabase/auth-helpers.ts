import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type ProfileRecord = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Returns the verified authenticated user via server-side Supabase Auth.
 * Never relies on unverified client session or cookie content.
 */
export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }
  return user;
}

/**
 * Returns the authenticated user and their corresponding database profile.
 */
export async function getAuthenticatedProfile(): Promise<{
  user: NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>>;
  profile: ProfileRecord;
} | null> {
  const user = await getAuthenticatedUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return null;
  }

  return { user, profile };
}

/**
 * Server-side guard requiring an authenticated session.
 * Redirects unauthenticated visitors to `/login`.
 */
export async function requireAuth(redirectPath = "/account") {
  const authData = await getAuthenticatedProfile();
  if (!authData) {
    redirect(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  }
  return authData;
}

/**
 * Returns comprehensive verified administrator context for the current user session,
 * including active status, Super Admin flag, and all held permission groups.
 */
export async function getAdminContext() {
  const authData = await getAuthenticatedProfile();
  if (!authData) return null;

  const { user, profile } = authData;
  const supabase = await createClient();

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("is_super_admin, is_active")
    .eq("id", user.id)
    .single();

  if (!adminUser || !adminUser.is_active) {
    return null;
  }

  const isSuperAdmin = Boolean(adminUser.is_super_admin);

  const { data: permissions } = await supabase
    .from("admin_permissions")
    .select("permission_group")
    .eq("admin_id", user.id);

  const permissionGroups = (permissions || []).map((p) => p.permission_group);

  return {
    user,
    profile,
    isSuperAdmin,
    permissions: permissionGroups,
    hasPermission: (group: string) => isSuperAdmin || permissionGroups.includes(group),
  };
}

/**
 * Server-side guard requiring active administrator access (Super Admin or any permission group).
 * Redirects unauthenticated visitors to `/admin/login` and non-admin guests to `/admin/login?error=unauthorized`.
 */
export async function requireAnyAdmin(redirectPath = "/admin") {
  const authData = await getAuthenticatedProfile();
  if (!authData) {
    redirect(`/admin/login?redirect=${encodeURIComponent(redirectPath)}`);
  }

  const adminCtx = await getAdminContext();
  if (!adminCtx) {
    redirect("/admin/login?error=unauthorized");
  }

  return adminCtx;
}

/**
 * Server-side guard requiring trusted administrator permissions for a specific group.
 * Verifies that the user is an active Super Admin or holds the specified permission group.
 */
export async function requireAdmin(permissionGroup = "guest_rsvp") {
  const adminCtx = await requireAnyAdmin(`/admin`);

  if (!adminCtx.hasPermission(permissionGroup)) {
    redirect("/admin");
  }

  return {
    user: adminCtx.user,
    profile: adminCtx.profile,
    isSuperAdmin: adminCtx.isSuperAdmin,
    hasPermission: true,
    permissions: adminCtx.permissions,
  };
}

