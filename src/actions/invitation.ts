"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth-helpers";

export interface UpdateInvitationSettingsInput {
  headlineText: string;
  introText: string;
  qrCodeTargetUrl: string;
  defaultTemplate: "cinematic" | "traditional";
  isPublished: boolean;
  customAnnouncement?: string | null;
}

export async function updateInvitationSettingsAction(formData: FormData) {
  try {
    await requireAdmin("invitation_studio");
    const supabase = await createClient();

    const headlineText = ((formData.get("headline_text") as string) || "").trim();
    const introText = ((formData.get("intro_text") as string) || "").trim();
    const qrCodeTargetUrl = ((formData.get("qr_code_target_url") as string) || "").trim();
    const defaultTemplateRaw = (formData.get("default_template") as string) || "cinematic";
    const isPublished = formData.get("is_published") === "true";
    const customAnnouncementRaw = (formData.get("custom_announcement") as string) || "";
    const customAnnouncement = customAnnouncementRaw.trim() ? customAnnouncementRaw.trim() : undefined;

    if (!headlineText) {
      return { success: false, error: "Headline text is required." };
    }
    if (headlineText.length > 200) {
      return { success: false, error: "Headline text cannot exceed 200 characters." };
    }

    if (!introText) {
      return { success: false, error: "Introductory text is required." };
    }
    if (introText.length > 500) {
      return { success: false, error: "Introductory text cannot exceed 500 characters." };
    }

    if (!qrCodeTargetUrl) {
      return { success: false, error: "QR code target URL is required." };
    }

    try {
      new URL(qrCodeTargetUrl);
    } catch {
      return { success: false, error: "QR code target URL must be a valid, well-formed URL." };
    }

    if (defaultTemplateRaw !== "cinematic" && defaultTemplateRaw !== "traditional") {
      return { success: false, error: "Template must be either 'cinematic' or 'traditional'." };
    }
    const defaultTemplate: "cinematic" | "traditional" = defaultTemplateRaw;

    if (customAnnouncement && customAnnouncement.length > 300) {
      return { success: false, error: "Custom announcement cannot exceed 300 characters." };
    }

    const { data, error } = await supabase.rpc("admin_update_invitation_settings", {
      p_headline_text: headlineText,
      p_intro_text: introText,
      p_qr_code_target_url: qrCodeTargetUrl,
      p_default_template: defaultTemplate,
      p_is_published: isPublished,
      p_custom_announcement: customAnnouncement,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/invitation");
    revalidatePath("/admin");

    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update invitation settings.";
    return { success: false, error: message };
  }
}
