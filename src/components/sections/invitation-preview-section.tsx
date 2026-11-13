import React from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  InvitationPreviewClient,
  type InvitationPreviewSettings,
} from "./invitation-preview-client";

export {
  InvitationPreviewClient,
  type InvitationPreviewSettings,
} from "./invitation-preview-client";

export const DEFAULT_INVITATION_SETTINGS: InvitationPreviewSettings = {
  id: "default",
  headline_text: "WITH THE DIVINE BLESSINGS OF OUR FAMILIES",
  intro_text:
    "With joyful hearts, we invite you to celebrate our sacred union\nand bless the beautiful beginning of our life together.",
  qr_code_target_url: "https://mithun-sakhi-wedding.vercel.app/#invitation",
  default_template: "cinematic",
  is_published: true,
};

export interface InvitationPreviewSectionProps {
  initialSettings?: InvitationPreviewSettings;
}

export function InvitationPreviewSkeleton() {
  return (
    <section
      id="invitation"
      aria-label="Loading Official Wedding Invitation"
      className="relative py-20 sm:py-28 md:py-32 bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB] border-t border-[rgba(184,151,94,0.2)] scroll-mt-24 overflow-hidden"
    >
      <div className="max-w-xl sm:max-w-2xl lg:max-w-[730px] mx-auto px-4 text-center">
        <div className="h-4 w-32 mx-auto bg-[#B8975E]/20 rounded-full animate-pulse mb-3" />
        <div className="h-10 w-64 mx-auto bg-[#B8975E]/15 rounded-md animate-pulse mb-4" />
        <div className="h-4 w-72 mx-auto bg-[#B8975E]/10 rounded-full animate-pulse mb-10" />
        <div className="aspect-[4/5] w-full max-w-[620px] sm:max-w-[680px] md:max-w-[730px] mx-auto bg-[#FAF6EE] rounded-2xl sm:rounded-3xl border border-[rgba(184,151,94,0.3)] animate-pulse shadow-sm flex flex-col justify-between p-6">
          <div className="h-6 w-48 mx-auto bg-[#B8975E]/15 rounded" />
          <div className="h-12 w-64 mx-auto bg-[#B8975E]/10 rounded" />
          <div className="h-20 w-80 mx-auto bg-[#B8975E]/10 rounded" />
          <div className="h-24 w-24 mx-auto bg-[#B8975E]/15 rounded-lg" />
        </div>
      </div>
    </section>
  );
}

export async function InvitationPreviewSection({
  initialSettings,
}: InvitationPreviewSectionProps = {}) {
  if (initialSettings) {
    return <InvitationPreviewClient settings={initialSettings} />;
  }

  await connection();
  let settings: InvitationPreviewSettings = DEFAULT_INVITATION_SETTINGS;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_invitation_settings");

    if (!error && data && typeof data === "object") {
      const parsed = data as Record<string, unknown>;

      const headline =
        typeof parsed.headline_text === "string" && parsed.headline_text.trim()
          ? parsed.headline_text.trim()
          : DEFAULT_INVITATION_SETTINGS.headline_text;

      const intro =
        typeof parsed.intro_text === "string" && parsed.intro_text.trim()
          ? parsed.intro_text.trim()
          : DEFAULT_INVITATION_SETTINGS.intro_text;

      let qrUrl =
        typeof parsed.qr_code_target_url === "string" && parsed.qr_code_target_url.trim()
          ? parsed.qr_code_target_url.trim()
          : DEFAULT_INVITATION_SETTINGS.qr_code_target_url;

      // Defensive fallback against any legacy test/dev values
      if (qrUrl && qrUrl.includes("mithun-kabita-wedding")) {
        qrUrl = DEFAULT_INVITATION_SETTINGS.qr_code_target_url;
      }

      settings = {
        id: typeof parsed.id === "string" ? parsed.id : "default",
        headline_text: headline,
        intro_text: intro,
        qr_code_target_url: qrUrl,
        default_template:
          typeof parsed.default_template === "string" ? parsed.default_template : "cinematic",
        custom_announcement:
          typeof parsed.custom_announcement === "string" ? parsed.custom_announcement : null,
        is_published: typeof parsed.is_published === "boolean" ? parsed.is_published : true,
      };
    }
  } catch (err) {
    console.error("Failed to fetch invitation settings for public homepage:", err);
    settings = DEFAULT_INVITATION_SETTINGS;
  }

  return <InvitationPreviewClient settings={settings} />;
}
