"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { isMemoriesModeActive } from "@/lib/lifecycle";
import type { Json } from "@/types/database.types";

export type AttendeeInput = {
  full_name: string;
  age_category?: "adult" | "child" | "infant";
  member_id?: string;
};

export type SubmitRsvpPayload = {
  eventId: "haldi" | "mehndi" | "wedding" | "reception";
  familyGroupId?: string;
  status: "attending" | "not_attending" | "not_sure";
  memberIds?: string[];
  attendees?: AttendeeInput[];
  arrivalDetails?: string | null;
  specialDietaryRequests?: string | null;
};

export type SubmitRsvpResult =
  | { success: true; rsvpId: string; attendeeCount: number }
  | { success: false; error: string };

/**
 * Server action to submit or update a ceremony RSVP for a family group.
 * Strictly verifies user authentication, household membership, attendee selection,
 * duplicate protection (ONE HOUSEHOLD + ONE CEREMONY = ONE RSVP), and ceremony cutoff deadlines.
 */
export async function submitFamilyRsvpAction(
  payload: SubmitRsvpPayload
): Promise<SubmitRsvpResult> {
  try {
    if (isMemoriesModeActive()) {
      return {
        success: false,
        error: "RSVP submissions have concluded as wedding celebrations transition into Memories Mode.",
      };
    }

    const { user, profile } = await requireAuth("/account");

    const supabase = await createClient();

    // Ensure user has a household assigned; if missing, auto-initialize
    let familyGroupId = profile.family_group_id;
    if (!familyGroupId) {
      const { data: householdId, error: initError } = await supabase.rpc(
        "initialize_user_household",
        {
          p_user_id: user.id,
          p_full_name: profile.full_name || "Guest",
        }
      );
      if (initError || !householdId) {
        return {
          success: false,
          error: "Failed to initialize household. Please try again.",
        };
      }
      familyGroupId = householdId;
    }

    // Verify authorized family group
    if (payload.familyGroupId && payload.familyGroupId !== familyGroupId) {
      return {
        success: false,
        error: "You are not authorized to submit an RSVP for another family group.",
      };
    }

    if (!["attending", "not_attending", "not_sure"].includes(payload.status)) {
      return {
        success: false,
        error: "Invalid RSVP response status.",
      };
    }

    // Prepare attendees payload for submit_family_rsvp RPC
    let pAttendees: Json = [];

    if (payload.status === "attending") {
      if (payload.memberIds && payload.memberIds.length > 0) {
        // Clean and deduplicate member IDs
        const uniqueMemberIds = Array.from(new Set(payload.memberIds.filter(Boolean)));
        if (uniqueMemberIds.length === 0) {
          return {
            success: false,
            error: "Please select at least one family member attending this ceremony.",
          };
        }
        pAttendees = uniqueMemberIds;
      } else if (payload.attendees && payload.attendees.length > 0) {
        // Backwards compatibility with legacy callers
        for (const attendee of payload.attendees) {
          if (!attendee.full_name || attendee.full_name.trim() === "") {
            return {
              success: false,
              error: "All attendee names must be provided.",
            };
          }
        }
        pAttendees = payload.attendees.map((a) => ({
          full_name: a.full_name.trim(),
          age_category: a.age_category || null,
        }));
      } else {
        return {
          success: false,
          error: "Please select at least one family member attending this ceremony.",
        };
      }
    }

    const { data, error } = await supabase.rpc("submit_family_rsvp", {
      p_event_id: payload.eventId,
      p_family_group_id: familyGroupId,
      p_status: payload.status,
      p_attendees: pAttendees,
      p_arrival_details: payload.arrivalDetails?.trim() || undefined,
      p_special_dietary_requests: payload.specialDietaryRequests?.trim() || undefined,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to submit RSVP. Please try again.",
      };
    }

    const result = data as {
      success: boolean;
      rsvp_id: string;
      attendee_count: number;
    };

    revalidatePath("/account");
    revalidatePath("/rsvp");
    revalidatePath("/admin/rsvps");

    return {
      success: true,
      rsvpId: result.rsvp_id,
      attendeeCount: result.attendee_count,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return {
      success: false,
      error: message,
    };
  }
}

export type PublicRsvpPayload = {
  guestName: string;
  mobile?: string;
  address?: string;
  relationship?: "Family" | "Relative" | "Friend" | "Colleague" | "Other" | string;
  guestCount: number;
  attendingHaldi: boolean;
  attendingMehndi: boolean;
  attendingWedding: boolean;
  attendingReception: boolean;
  honeypot?: string;
};

export type PublicRsvpResult =
  | { success: true; rsvpId: string }
  | { success: false; error: string };

/**
 * Public RSVP submission action.
 * Allows any guest to confirm presence without logging in or creating an account.
 * Enforces sanitization, length boundaries, and anti-spam honeypot checking.
 */
export async function submitPublicRsvpAction(
  payload: PublicRsvpPayload
): Promise<PublicRsvpResult> {
  try {
    // 1. Anti-spam honeypot check
    if (payload.honeypot && payload.honeypot.trim().length > 0) {
      return { success: true, rsvpId: "mock-submission-id" };
    }

    // 2. Lifecycle cutoff check
    if (isMemoriesModeActive()) {
      return {
        success: false,
        error: "RSVP confirmations have concluded as celebrations transition into Memories Mode.",
      };
    }

    // 3. Clean and validate inputs
    const cleanName = (payload.guestName || "").replace(/<[^>]*>?/gm, "").trim();
    const cleanMobile = (payload.mobile || "").replace(/<[^>]*>?/gm, "").trim();
    const cleanAddress = (payload.address || "").replace(/<[^>]*>?/gm, "").trim();
    const cleanRelationship = (payload.relationship || "").replace(/<[^>]*>?/gm, "").trim();
    const guestCount = Math.max(1, Math.min(50, Math.floor(Number(payload.guestCount) || 1)));

    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      return {
        success: false,
        error: "Please provide your full name (between 2 and 100 characters).",
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase.rpc("submit_public_rsvp", {
      p_guest_name: cleanName,
      p_mobile: cleanMobile || undefined,
      p_address: cleanAddress || undefined,
      p_relationship: cleanRelationship || undefined,
      p_guest_count: guestCount,
      p_attending_haldi: Boolean(payload.attendingHaldi),
      p_attending_mehndi: Boolean(payload.attendingMehndi),
      p_attending_wedding: Boolean(payload.attendingWedding),
      p_attending_reception: Boolean(payload.attendingReception),
      p_honeypot: payload.honeypot || "",
    });

    if (error) {
      console.warn("submit_public_rsvp RPC error:", error.message);
      return {
        success: false,
        error: error.message || "Failed to submit RSVP. Please try again.",
      };
    }

    revalidatePath("/rsvp");
    revalidatePath("/admin/rsvps");

    const result = data as { success?: boolean; rsvp_id?: string } | null;
    return {
      success: true,
      rsvpId: result?.rsvp_id || "",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return {
      success: false,
      error: message,
    };
  }
}
