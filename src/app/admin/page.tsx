import React from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Navbar } from "@/components/navigation";
import { EditorialFooter } from "@/components/sections";
import { requireAnyAdmin } from "@/lib/supabase/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  UnifiedAdminDashboard,
  type AdminDashboardMetricsData,
} from "@/components/admin/unified-admin-dashboard";
import { type AdminTeamMember } from "@/components/admin/admin-team-manager";

export const instant = false;

export const metadata: Metadata = {
  title: "Executive Command & Intelligence | Admin Portal",
  description:
    "Unified wedding operations, ceremony attendance headcounts, access verification, and administrative team management.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminOverviewPage() {
  await connection();
  const adminCtx = await requireAnyAdmin("/admin");
  const supabase = await createClient();

  // Fetch unified dashboard metrics scoped strictly to caller's permissions
  const { data: rawMetrics, error: metricsError } = await supabase.rpc(
    "get_admin_dashboard_metrics"
  );

  if (metricsError) {
    console.error("Failed to load admin dashboard metrics:", metricsError);
  }

  const metrics: AdminDashboardMetricsData =
    (rawMetrics as unknown as AdminDashboardMetricsData) || {
      is_super_admin: adminCtx.isSuperAdmin,
      unread_notifications_count: 0,
      recent_notifications: [],
    };

  // If caller is Super Admin, retrieve administrative staff roster
  let adminTeam: AdminTeamMember[] | null = null;
  if (adminCtx.isSuperAdmin) {
    const { data: rawTeam, error: teamError } = await supabase.rpc("get_admin_team");
    if (teamError) {
      console.error("Failed to load admin team roster:", teamError);
    } else {
      adminTeam = (rawTeam as unknown as AdminTeamMember[]) || [];
    }
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
            unreadNotificationsCount={metrics.unread_notifications_count}
            recentNotifications={metrics.recent_notifications}
          />

          <UnifiedAdminDashboard
            metrics={metrics}
            adminTeam={adminTeam}
            adminName={adminCtx.profile.full_name || "Administrator"}
            isSuperAdmin={adminCtx.isSuperAdmin}
            permissions={adminCtx.permissions}
          />
        </div>
      </main>

      <EditorialFooter />
    </>
  );
}
