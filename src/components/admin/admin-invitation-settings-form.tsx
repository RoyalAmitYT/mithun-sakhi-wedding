"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { updateInvitationSettingsAction } from "@/actions/invitation";

export interface AdminInvitationSettings {
  id?: string;
  headline_text?: string;
  intro_text?: string;
  qr_code_target_url?: string;
  default_template?: string;
  custom_announcement?: string | null;
  is_published?: boolean;
}

interface AdminInvitationSettingsFormProps {
  initialSettings: AdminInvitationSettings;
}

export function AdminInvitationSettingsForm({ initialSettings }: AdminInvitationSettingsFormProps) {
  const [headline, setHeadline] = useState(
    initialSettings.headline_text || "WITH THE DIVINE BLESSINGS OF OUR FAMILIES"
  );
  const [intro, setIntro] = useState(
    initialSettings.intro_text ||
      "With joyful hearts, we invite you to celebrate our sacred union\nand bless the beautiful beginning of our life together."
  );
  const [qrUrl, setQrUrl] = useState(
    initialSettings.qr_code_target_url || "https://mithun-sakhi-wedding.vercel.app/#invitation"
  );
  const [customAnnouncement, setCustomAnnouncement] = useState(
    initialSettings.custom_announcement || ""
  );
  const [isPublished, setIsPublished] = useState(initialSettings.is_published ?? true);

  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const formData = new FormData();
    formData.append("headline_text", headline);
    formData.append("intro_text", intro);
    formData.append("qr_code_target_url", qrUrl);
    formData.append("default_template", "cinematic");
    formData.append("is_published", isPublished ? "true" : "false");
    if (customAnnouncement.trim()) {
      formData.append("custom_announcement", customAnnouncement.trim());
    }

    startTransition(async () => {
      const res = await updateInvitationSettingsAction(formData);
      if (res.success) {
        setStatusMessage({ type: "success", text: "Invitation Studio configuration saved successfully." });
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to save configuration." });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {statusMessage && (
        <div
          role="alert"
          className={`p-4 rounded-xl text-sm font-medium border flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-[#292322] text-[#FFFDF9] border-[#B8975E]"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold uppercase tracking-wider px-2 py-1 opacity-80 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Official Artwork Status Panel (Single Canonical Design) */}
      <div className="bg-white/80 border border-[#B8975E]/30 rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-[#B8975E] block mb-1">
              Official Artwork
            </span>
            <h2 className="font-serif text-2xl font-light text-[#292322]">
              Single Official Invitation Card
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDF9F3] text-[#8E6D38] border border-[#B8975E]/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Active
          </span>
        </div>
        <p className="text-xs text-[#5C5452] leading-relaxed">
          The official Mithun &amp; Sakhi wedding invitation decree is rendered dynamically from code with high-resolution vector ornaments, real selectable typography, and scannable QR verification. Design switching and alternative templates have been permanently retired.
        </p>
      </div>

      {/* 2. Headline & Content Settings */}
      <div className="bg-white/80 border border-[#B8975E]/30 rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-5 shadow-xs">
        <div>
          <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-[#B8975E] block mb-1">
            Copywriting &amp; Announcement
          </span>
          <h2 className="font-serif text-2xl font-light text-[#292322]">
            Invitation Copy &amp; QR Target
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="headline" className="block text-xs font-semibold text-[#292322] uppercase tracking-wider mb-1.5">
              Headline Kicker
            </label>
            <input
              id="headline"
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              maxLength={200}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm text-[#292322] focus:outline-none focus:ring-2 focus:ring-[#B8975E] focus:border-transparent"
              placeholder="e.g. Celebrate the Sacred Wedding of"
            />
          </div>

          <div>
            <label htmlFor="intro" className="block text-xs font-semibold text-[#292322] uppercase tracking-wider mb-1.5">
              Introductory Blessing / Note
            </label>
            <textarea
              id="intro"
              rows={3}
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              maxLength={500}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm text-[#292322] focus:outline-none focus:ring-2 focus:ring-[#B8975E] focus:border-transparent"
              placeholder="Introductory blessings from the parents and families..."
            />
          </div>

          <div>
            <label htmlFor="qrUrl" className="block text-xs font-semibold text-[#292322] uppercase tracking-wider mb-1.5">
              Canonical QR Target URL
            </label>
            <input
              id="qrUrl"
              type="url"
              value={qrUrl}
              onChange={(e) => setQrUrl(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm text-[#292322] focus:outline-none focus:ring-2 focus:ring-[#B8975E] focus:border-transparent font-mono"
              placeholder="https://..."
            />
          </div>

          <div>
            <label htmlFor="customAnnouncement" className="block text-xs font-semibold text-[#292322] uppercase tracking-wider mb-1.5">
              Custom Announcement Banner <span className="text-neutral-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              id="customAnnouncement"
              type="text"
              value={customAnnouncement}
              onChange={(e) => setCustomAnnouncement(e.target.value)}
              maxLength={300}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm text-[#292322] focus:outline-none focus:ring-2 focus:ring-[#B8975E] focus:border-transparent"
              placeholder="e.g. Complimentary transport departs from Purulia Junction..."
            />
          </div>
        </div>
      </div>

      {/* 3. Publication State Controls */}
      <div className="bg-white/80 border border-[#B8975E]/30 rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-4 shadow-xs">
        <div>
          <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-[#B8975E] block mb-1">
            Access Control
          </span>
          <h2 className="font-serif text-2xl font-light text-[#292322]">
            Public Page Visibility
          </h2>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 bg-[#FDF9F3]">
          <div>
            <span className="text-sm font-semibold text-[#292322] block">
              Publish Digital Invitation Page
            </span>
            <span className="text-xs text-[#5C5452]">
              When enabled, visitors can access the public <Link href="/#invitation" className="underline hover:text-[#B8975E]">/#invitation</Link> decree.
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#B8975E] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#292322]"></div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-[#292322] hover:bg-[#A52232] disabled:opacity-50 transition-colors shadow-sm active:scale-[0.98] cursor-pointer"
        >
          {isPending ? "Saving Changes..." : "Save Configuration"}
        </button>
      </div>
    </form>
  );
}
