"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, requireAdmin } from "@/lib/supabase/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { isMemoriesModeActive } from "@/lib/lifecycle";

export type AccessRequestActionResult = {
  success?: boolean;
  error?: string;
  message?: string;
};

/**
 * Submits an access request for an authenticated unapproved wedding guest.
 */
export async function submitAccessRequestAction(
  prevState: AccessRequestActionResult | null,
  formData: FormData
): Promise<AccessRequestActionResult> {
  if (isMemoriesModeActive()) {
    return {
      error:
        "Access requests are closed as wedding celebrations have transitioned into Memories Mode.",
    };
  }

  const { user, profile } = await requireAuth("/account/request-access");

  if (profile.is_approved_guest) {
    return {
      error:
        "Your wedding guest access is already approved. You do not need to submit an access request.",
    };
  }

  const invitedFamilyName = formData
    .get("invited_family_name")
    ?.toString()
    .trim();
  const relationshipToCouple = formData
    .get("relationship_to_couple")
    ?.toString()
    .trim();
  const message = formData.get("message")?.toString().trim() || null;

  if (!invitedFamilyName || invitedFamilyName.length < 2) {
    return {
      error:
        "Please specify your invited family or party name (e.g., 'The Mukherjee Family').",
    };
  }

  if (!relationshipToCouple || relationshipToCouple.length < 2) {
    return {
      error:
        "Please specify your relationship to the bride or groom (e.g., 'Cousin of Groom', 'Friend of Bride').",
    };
  }

  const supabase = await createClient();

  // Check for an existing pending request
  const { data: existingPending } = await supabase
    .from("access_requests")
    .select("id")
    .eq("profile_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existingPending) {
    return {
      error:
        "You already have an access request pending review by the couple. Please await approval.",
    };
  }

  const { error } = await supabase.from("access_requests").insert({
    profile_id: user.id,
    invited_family_name: invitedFamilyName,
    relationship_to_couple: relationshipToCouple,
    message,
    status: "pending",
  });

  if (error) {
    return {
      error:
        "Unable to submit your access request at this time. Please try again shortly.",
    };
  }

  revalidatePath("/account");
  revalidatePath("/account/request-access");
  return {
    success: true,
    message:
      "Your access request has been submitted. The wedding family will review it shortly.",
  };
}

/**
 * Reviews a guest access request (Approve or Reject with mandatory reason).
 * Restricted to administrators holding the 'guest_rsvp' permission group.
 */
export async function adminReviewAccessRequestAction(
  prevState: AccessRequestActionResult | null,
  formData: FormData
): Promise<AccessRequestActionResult> {
  await requireAdmin("guest_rsvp");

  const requestId = formData.get("request_id")?.toString();
  const decision = formData.get("decision")?.toString();
  const rejectionReason = formData.get("rejection_reason")?.toString()?.trim();
  const familyName = formData.get("family_name")?.toString()?.trim() || null;
  const existingFamilyId =
    formData.get("existing_family_id")?.toString()?.trim() || null;
  const makeFamilyManager = formData.get("make_family_manager") === "true";

  if (!requestId || !decision) {
    return { error: "Missing required request identifier or review decision." };
  }

  if (decision !== "approved" && decision !== "rejected") {
    return { error: "Review decision must be either 'approved' or 'rejected'." };
  }

  if (decision === "rejected" && (!rejectionReason || rejectionReason.length < 3)) {
    return {
      error:
        "A clear rejection reason (minimum 3 characters) is required when declining an access request.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("admin_review_access_request", {
    p_request_id: requestId,
    p_decision: decision,
    p_rejection_reason: rejectionReason || undefined,
    p_family_name: familyName || undefined,
    p_existing_family_id: existingFamilyId || undefined,
    p_make_family_manager: makeFamilyManager,
  });

  if (error) {
    return {
      error: error.message || "Failed to process the access request review.",
    };
  }

  revalidatePath("/admin/access-requests");
  revalidatePath("/account");
  return {
    success: true,
    message: `Access request has been successfully ${decision}.`,
  };
}
