"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export type ProfileActionResult = {
  success?: boolean;
  error?: string;
  message?: string;
};

/**
 * Updates the user's permitted profile fields (full name and mobile number).
 * Strictly respects PostgreSQL column-level grants from Phase P-07.2.
 */
export async function updateProfileAction(
  prevState: ProfileActionResult | null,
  formData: FormData
): Promise<ProfileActionResult> {
  const { user } = await requireAuth("/account");

  const fullName = formData.get("full_name")?.toString().trim();
  const mobileNumber = formData.get("mobile_number")?.toString().trim() || null;

  if (!fullName || fullName.length < 2) {
    return { error: "Please enter a valid full name (minimum 2 characters)." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      mobile_number: mobileNumber,
    })
    .eq("id", user.id);

  if (error) {
    return {
      error: "Unable to update profile. Please verify your details and try again.",
    };
  }

  revalidatePath("/account");
  return {
    success: true,
    message: "Your profile details have been successfully updated.",
  };
}
