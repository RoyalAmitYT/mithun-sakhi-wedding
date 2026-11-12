import React from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Navbar } from "@/components/navigation";
import { EditorialFooter } from "@/components/sections";
import { requireAdmin } from "@/lib/supabase/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/admin-header";
import type { AdminDashboardMetricsData } from "@/components/admin/unified-admin-dashboard";
import {
  AdminMediaManager,
  type AdminMediaItem,
} from "@/components/admin/admin-media-manager";

export const instant = false;

export const metadata: Metadata = {
  title: "Media Manager & Published Gallery | Admin Portal",
  description:
    "Curate ceremony photographs, private drafts, image download permissions, and YouTube wedding films.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminMediaPage() {
  await connection();
  const adminCtx = await requireAdmin("photos");
  const supabase = await createClient();

  // Load dashboard metrics for header notifications
  const { data: rawMetrics } = await supabase.rpc("get_admin_dashboard_metrics");
  const metrics = rawMetrics as unknown as AdminDashboardMetricsData | null;

  // Load all media items (both drafts and published)
  const { data: rawMedia, error: mediaError } = await supabase.rpc(
    "admin_get_all_media"
  );

  if (mediaError) {
    console.error("Failed to load admin media items:", mediaError);
  }

  const mediaItems = (rawMedia as unknown as AdminMediaItem[]) || [];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#FFFCF6] pt-32 pb-32 sm:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <AdminHeader
            adminName={adminCtx.profile.full_name || "Administrator"}
            isSuperAdmin={adminCtx.isSuperAdmin}
            permissions={adminCtx.permissions}
            unreadNotificationsCount={metrics?.unread_notifications_count ?? 0}
            recentNotifications={metrics?.recent_notifications ?? []}
          />

          {/* Subpage Header */}
          <div className="border-b border-[#B8975E]/20 pb-4">
            <span className="text-[11px] font-sans font-medium uppercase tracking-[0.25em] text-[#B8975E] block mb-1">
              Visual Chronicle
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#292322]">
              Media &amp; Photography Manager
            </h1>
            <p className="font-sans text-xs text-[#292322]/60 mt-1">
              Curate high-resolution ceremony photographs, private review drafts, download toggles, and YouTube films
            </p>
          </div>

          <AdminMediaManager initialItems={mediaItems} />
        </div>
      </main>

      <EditorialFooter />
    </>
  );
}
