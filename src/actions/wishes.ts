"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireAdmin } from "@/lib/supabase/auth-helpers";
import { isWeddingCutoffPassed } from "@/data/wedding-data";
import { checkRateLimit } from "@/lib/rate-limit";

export type WishActionResponse =
  | { success: true; wishId?: string }
  | { success: false; error: string };

export interface PublicWishInput {
  authorName: string;
  wishText: string;
  honeypot?: string;
}

/**
 * Submits an anonymous public wish / blessing.
 * Open to any wedding guest without account or authentication.
 * Defaults to 'pending' moderation status for family approval.
 */
export async function submitPublicWishAction(
  input: PublicWishInput
): Promise<WishActionResponse> {
  try {
    if (isWeddingCutoffPassed()) {
      return {
        success: false,
        error:
          "Guestbook submissions have concluded as celebrations transition into Memories Mode.",
      };
    }

    // Honeypot spam defense: if bot filled this hidden field, silently return success
    if (input.honeypot && input.honeypot.trim().length > 0) {
      return { success: true };
    }

    // Distributed persistent rate limiting defense (max 5 requests per 60s per client)
    const rateLimit = await checkRateLimit("wishes", { limit: 5, windowSeconds: 60 });
    if (!rateLimit.allowed) {
      return {
        success: false,
        error:
          rateLimit.error ||
          `Too many blessings submitted from your connection. Please wait ${rateLimit.retryAfter || 60} seconds before sending another.`,
      };
    }

    // Sanitization: strip HTML tags and trim
    const cleanName = (input.authorName || "")
      .replace(/<[^>]*>?/gm, "")
      .trim();
    const cleanText = (input.wishText || "")
      .replace(/<[^>]*>?/gm, "")
      .trim();

    if (cleanName.length < 2 || cleanName.length > 80) {
      return {
        success: false,
        error: "Your name must be between 2 and 80 characters.",
      };
    }

    if (cleanText.length < 3 || cleanText.length > 1000) {
      return {
        success: false,
        error: "Your blessing must be between 3 and 1000 characters.",
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("submit_public_wish", {
      p_author_name: cleanName,
      p_wish_text: cleanText,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to submit blessing. Please try again.",
      };
    }

    // Explicitly revalidate homepage, public wishes page, and admin wishes manager
    revalidatePath("/");
    revalidatePath("/wishes");
    revalidatePath("/admin/wishes");

    const result = data as { success?: boolean; wish_id?: string } | null;
    return { success: true, wishId: result?.wish_id };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}

/**
 * Submits a new wedding blessing / guestbook message.
 * Available to any authenticated user (approved or pending verification).
 * Enforces text length (3-1000 chars) and wedding cutoff boundary.
 */
export async function submitWishAction(
  wishText: string
): Promise<WishActionResponse> {
  try {
    if (isWeddingCutoffPassed()) {
      return {
        success: false,
        error: "Guestbook submissions have concluded as celebrations transition into Memories Mode.",
      };
    }

    const { user, profile } = await requireAuth("/account");

    const trimmed = (wishText || "").trim();
    if (trimmed.length < 3 || trimmed.length > 1000) {
      return {
        success: false,
        error: "Blessing message must be between 3 and 1000 characters.",
      };
    }

    const supabase = await createClient();
    const firstName = profile.full_name?.trim().split(/\s+/)[0] || "Guest";

    const { data, error } = await supabase
      .from("wishes")
      .insert({
        profile_id: user.id,
        author_display_name: firstName,
        wish_text: trimmed,
        status: "pending",
      })
      .select("id")
      .single();

    if (error || !data) {
      return {
        success: false,
        error: error?.message || "Failed to submit blessing. Please try again.",
      };
    }

    revalidatePath("/");
    revalidatePath("/account");
    return { success: true, wishId: data.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}

/**
 * Updates an author's existing wish.
 * Allowed anytime by author (including post-cutoff).
 * Immediately resets status to pending and clears previous moderation.
 */
export async function updateWishAction(
  wishId: string,
  wishText: string
): Promise<WishActionResponse> {
  try {
    const { user } = await requireAuth("/account");

    const trimmed = (wishText || "").trim();
    if (trimmed.length < 3 || trimmed.length > 1000) {
      return {
        success: false,
        error: "Blessing message must be between 3 and 1000 characters.",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("wishes")
      .update({
        wish_text: trimmed,
      })
      .eq("id", wishId)
      .eq("profile_id", user.id);

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to update blessing.",
      };
    }

    revalidatePath("/");
    revalidatePath("/account");
    return { success: true, wishId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}

/**
 * Deletes an existing wish.
 * Authors can delete their own wish at any time.
 * Admins with 'wishes' permission can also delete any wish.
 */
export async function deleteWishAction(
  wishId: string
): Promise<WishActionResponse> {
  try {
    const { user } = await requireAuth("/account");
    const supabase = await createClient();

    // First attempt deletion as author
    const { data: ownWish } = await supabase
      .from("wishes")
      .select("id, profile_id")
      .eq("id", wishId)
      .single();

    if (!ownWish) {
      return { success: false, error: "Blessing not found." };
    }

    if (ownWish.profile_id === user.id) {
      const { error } = await supabase
        .from("wishes")
        .delete()
        .eq("id", wishId)
        .eq("profile_id", user.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // Must be an admin with wishes permission
      await requireAdmin("wishes");
      const { error } = await supabase
        .from("wishes")
        .delete()
        .eq("id", wishId);

      if (error) {
        return { success: false, error: error.message };
      }
    }

    revalidatePath("/");
    revalidatePath("/wishes");
    revalidatePath("/account");
    revalidatePath("/admin/wishes");
    revalidateTag("public-wishes", { expire: 0 });
    return { success: true, wishId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}

/**
 * Admin-only: Permanently delete any wish by ID.
 * Uses the secure admin_delete_wish RPC which enforces permission checks server-side.
 */
export async function adminDeleteWishAction(
  wishId: string
): Promise<WishActionResponse> {
  try {
    await requireAdmin("wishes");
    const supabase = await createClient();

    const { error } = await supabase.rpc("admin_delete_wish", {
      p_wish_id: wishId,
    });

    if (error) {
      return { success: false, error: error.message || "Failed to delete blessing." };
    }

    revalidatePath("/");
    revalidatePath("/wishes");
    revalidatePath("/admin/wishes");
    revalidateTag("public-wishes", { expire: 0 });
    return { success: true, wishId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}

/**
 * Moderates a wish (approve or reject).
 * Restricted to administrators holding the 'wishes' permission group (or Super Admin).
 * @deprecated Moderation workflow removed — wishes are published instantly.
 */
export async function adminModerateWishAction(
  wishId: string,
  decision: "approved" | "rejected"
): Promise<WishActionResponse> {
  try {
    await requireAdmin("wishes");
    const supabase = await createClient();

    const { error } = await supabase.rpc("admin_moderate_wish", {
      p_wish_id: wishId,
      p_decision: decision,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to moderate wish.",
      };
    }

    revalidatePath("/");
    revalidatePath("/wishes");
    revalidatePath("/account");
    revalidatePath("/admin/wishes");
    revalidateTag("public-wishes", { expire: 0 });
    return { success: true, wishId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}
