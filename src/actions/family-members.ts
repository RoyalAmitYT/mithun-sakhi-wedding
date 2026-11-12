"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/supabase/auth-helpers";

export interface FamilyMemberRecord {
  id: string;
  family_group_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export type FamilyMemberActionResult =
  | { success: true; member?: FamilyMemberRecord; message?: string }
  | { success: false; error: string };

/**
 * Add a family member to the current user's household.
 */
export async function addFamilyMemberAction(
  name: string
): Promise<FamilyMemberActionResult> {
  try {
    const trimmed = name?.trim();
    if (!trimmed || trimmed.length < 1) {
      return { success: false, error: "Please enter a valid family member name." };
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
          error: "Failed to initialize household. Please contact the wedding desk.",
        };
      }
      familyGroupId = householdId as string;
    }

    const { data, error } = await supabase
      .from("family_members")
      .insert({
        family_group_id: familyGroupId,
        name: trimmed,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message || "Failed to add family member." };
    }

    revalidatePath("/account");
    revalidatePath("/rsvp");
    revalidatePath("/admin/rsvps");

    return {
      success: true,
      member: data as unknown as FamilyMemberRecord,
      message: `${trimmed} has been added to your household.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: msg };
  }
}

/**
 * Update an existing family member's name.
 */
export async function updateFamilyMemberAction(
  memberId: string,
  name: string
): Promise<FamilyMemberActionResult> {
  try {
    const trimmed = name?.trim();
    if (!trimmed || trimmed.length < 1) {
      return { success: false, error: "Family member name cannot be blank." };
    }

    const { profile } = await requireAuth("/account");
    if (!profile.family_group_id) {
      return { success: false, error: "No household assigned." };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("family_members")
      .update({ name: trimmed })
      .eq("id", memberId)
      .eq("family_group_id", profile.family_group_id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message || "Failed to update member name." };
    }

    revalidatePath("/account");
    revalidatePath("/rsvp");
    revalidatePath("/admin/rsvps");

    return {
      success: true,
      member: data as unknown as FamilyMemberRecord,
      message: "Household member updated successfully.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: msg };
  }
}

/**
 * Delete a family member from the current user's household.
 */
export async function deleteFamilyMemberAction(
  memberId: string
): Promise<FamilyMemberActionResult> {
  try {
    const { profile } = await requireAuth("/account");
    if (!profile.family_group_id) {
      return { success: false, error: "No household assigned." };
    }

    const supabase = await createClient();

    // Verify member belongs to caller's household
    const { data: existing } = await supabase
      .from("family_members")
      .select("id, name")
      .eq("id", memberId)
      .eq("family_group_id", profile.family_group_id)
      .maybeSingle();

    if (!existing) {
      return { success: false, error: "Family member not found in your household." };
    }

    const { error } = await supabase
      .from("family_members")
      .delete()
      .eq("id", memberId)
      .eq("family_group_id", profile.family_group_id);

    if (error) {
      return { success: false, error: error.message || "Failed to remove family member." };
    }

    revalidatePath("/account");
    revalidatePath("/rsvp");
    revalidatePath("/admin/rsvps");

    return {
      success: true,
      message: `${existing.name} has been removed from your household.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: msg };
  }
}
