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
  AdminRsvpDashboard,
  type AdminPublicRsvpItem,
} from "@/components/admin/admin-rsvp-dashboard";

export const instant = false;

export const metadata: Metadata = {
  title: "RSVP & Attendance Intelligence | Admin Portal",
  description:
    "Ceremony-by-ceremony RSVP monitoring, public guest submissions, and attendance headcounts.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminRsvpsPage() {
  await connection();
  const adminCtx = await requireAdmin("guest_rsvp");

  const supabase = await createClient();

  // Load dashboard metrics for header notifications
  const { data: rawMetrics } = await supabase.rpc("get_admin_dashboard_metrics");
  const metrics = rawMetrics as unknown as AdminDashboardMetricsData | null;

  // Fetch public RSVP submissions — only source of truth
  let publicRsvps: AdminPublicRsvpItem[] = [];
  const { data: rawPublic, error: publicError } = await supabase.rpc(
    "get_admin_public_rsvps"
  );

  if (publicError) {
    console.error("Failed to load public RSVPs:", publicError);
  } else if (rawPublic && Array.isArray(rawPublic)) {
    publicRsvps = rawPublic as AdminPublicRsvpItem[];
  }

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

          {/* Subpage Heading */}
          <div className="border-b border-[#B8975E]/20 pb-4">
            <span className="text-[11px] font-sans font-medium uppercase tracking-[0.25em] text-[#B8975E] block mb-1">
              Executive Administration
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#292322]">
              RSVP & Attendance Intelligence
            </h1>
            <p className="font-sans text-xs text-[#292322]/60 mt-1">
              Public guest RSVP submissions — ceremony-by-ceremony headcounts and guest roster
            </p>
          </div>

          {publicError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              Failed to load RSVP data: {publicError.message}
            </div>
          )}

          <AdminRsvpDashboard publicRsvps={publicRsvps} />
        </div>
      </main>

      <EditorialFooter />
    </>
  );
}
