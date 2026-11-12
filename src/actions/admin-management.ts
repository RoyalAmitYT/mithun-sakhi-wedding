"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAnyAdmin } from "@/lib/supabase/auth-helpers";

export type AdminActionResult =
  | { success: true; message?: string }
  | { success: false; error: string };

/**
 * Updates an administrator's active status and assigned permission groups.
 * Strictly restricted to the Super Administrator.
 */
export async function manageAdminUserAction(
  targetAdminId: string,
  isActive: boolean,
  permissions: string[]
): Promise<AdminActionResult> {
  try {
    const adminCtx = await requireAnyAdmin("/admin");

    if (!adminCtx.isSuperAdmin) {
      return {
        success: false,
        error: "Unauthorized: Only the Super Administrator can configure admin accounts.",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.rpc("admin_manage_admin_user", {
      p_admin_id: targetAdminId,
      p_is_active: isActive,
      p_permissions: permissions,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to update administrator configuration.",
      };
    }

    revalidatePath("/admin");
    return { success: true, message: "Administrator settings updated successfully." };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}

/**
 * Marks a single operational notification as read.
 * Scoped to administrators holding matching permission or Super Admin.
 */
export async function markNotificationReadAction(
  notificationId: string
): Promise<AdminActionResult> {
  try {
    await requireAnyAdmin("/admin");
    const supabase = await createClient();

    const { error } = await supabase.rpc("admin_mark_notification_read", {
      p_notification_id: notificationId,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to mark notification as read.",
      };
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}

/**
 * Marks all notifications matching the caller's active permissions as read.
 */
export async function markAllNotificationsReadAction(): Promise<AdminActionResult> {
  try {
    await requireAnyAdmin("/admin");
    const supabase = await createClient();

    const { error } = await supabase.rpc("admin_mark_all_notifications_read");

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to mark notifications as read.",
      };
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}
