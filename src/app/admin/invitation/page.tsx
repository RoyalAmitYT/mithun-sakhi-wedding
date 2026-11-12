import React from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { Navbar } from "@/components/navigation";
import { EditorialFooter } from "@/components/sections";
import { requireAdmin } from "@/lib/supabase/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/admin-header";
import type { AdminDashboardMetricsData } from "@/components/admin/unified-admin-dashboard";
import {
  AdminInvitationSettingsForm,
  type AdminInvitationSettings,
} from "@/components/admin/admin-invitation-settings-form";
import { InvitationStudio } from "@/components/invitation";

export const instant = false;

export const metadata: Metadata = {
  title: "Invitation Studio | Admin Portal",
  description:
    "Admin-only Invitation Studio for Mithun & Sakhi Wedding. Curate digital invitation designs, export print graphics, and configure public presentation.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminInvitationPage() {
  await connection();
  const adminCtx = await requireAdmin("invitation_studio");
  const supabase = await createClient();

  // Load dashboard metrics for header notifications
  const { data: rawMetrics } = await supabase.rpc("get_admin_dashboard_metrics");
  const metrics = rawMetrics as unknown as AdminDashboardMetricsData | null;

  // Load invitation settings
  const { data: rawSettings } = await supabase.rpc("admin_get_invitation_settings");
  const settings = (rawSettings as unknown as AdminInvitationSettings) || {
    id: "default",
    headline_text: "Celebrate the Wedding of",
    intro_text:
      "With the blessings of our parents, we warmly invite you to join us in celebrating the holy union of Mithun & Sakhi.",
    qr_code_target_url: "https://mithun-sakhi-wedding.vercel.app/#invitation",
    default_template: "cinematic",
    is_published: true,
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#FFFCF6] pt-32 pb-32 sm:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <AdminHeader
            adminName={adminCtx.profile.full_name || "Administrator"}
            isSuperAdmin={adminCtx.isSuperAdmin}
            permissions={adminCtx.permissions}
            unreadNotificationsCount={metrics?.unread_notifications_count ?? 0}
            recentNotifications={metrics?.recent_notifications ?? []}
          />

          {/* Subpage Header Lockup */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#B8975E]/20 pb-5">
            <div>
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-[#B8975E] block mb-1">
                Executive Administration
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#292322]">
                Invitation Studio &amp; Asset Management
              </h1>
              <p className="text-xs text-[#5C5452] mt-1.5 max-w-xl">
                Official administrator studio to preview the canonical invitation artwork, export print PDFs, download high-resolution PNG assets, and manage public presentation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/#invitation"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#B8975E]/40 bg-white text-[#8E6D38] hover:bg-[#B8975E]/10 text-xs font-sans font-semibold uppercase tracking-wider transition-colors shadow-xs"
              >
                <span>View Public Invitation</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* SECTION 1: Interactive Invitation Studio (Admin-Only Interface) */}
          <div className="space-y-6">
            <div className="border-b border-[#B8975E]/15 pb-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-[#A52232]">
                  Interactive Studio
                </span>
                <h2 className="font-serif text-2xl font-light text-[#292322]">
                  Official Wedding Invitation Artwork &amp; Exports
                </h2>
              </div>
              <span className="text-xs font-sans text-[#8A8280]">
                100% Vector Code &bull; High-Resolution PNG &amp; Print PDF
              </span>
            </div>

            <InvitationStudio initialSettings={settings} />
          </div>

          {/* SECTION 2: Studio Configuration & Public Presentation Settings */}
          <div className="space-y-6 pt-6 border-t border-[#B8975E]/20">
            <div className="border-b border-[#B8975E]/15 pb-2">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-[#B8975E]">
                Publication &amp; Presentation Controls
              </span>
              <h2 className="font-serif text-2xl font-light text-[#292322]">
                Configure Public Invitation Settings
              </h2>
              <p className="text-xs text-[#5C5452] mt-1">
                Control invitation copywriting, canonical QR destination, and publication state served to public visitors on /#invitation.
              </p>
            </div>

            <AdminInvitationSettingsForm initialSettings={settings} />
          </div>
        </div>
      </main>

      <EditorialFooter />
    </>
  );
}
