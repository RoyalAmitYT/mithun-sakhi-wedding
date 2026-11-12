"use client";

import React from "react";
import Link from "next/link";
import { type AdminNotificationItem } from "./admin-notifications-drawer";
import { AdminTeamManager, type AdminTeamMember } from "./admin-team-manager";

export type AdminDashboardMetricsData = {
  is_super_admin: boolean;
  unread_notifications_count: number;
  recent_notifications: AdminNotificationItem[];
  rsvp_metrics?: {
    public_rsvp_count: number;
    attending_total: number;
    attending_haldi: number;
    attending_mehndi: number;
    attending_wedding: number;
    attending_reception: number;
  };
  wishes_metrics?: {
    total_wishes: number;
  };
  photos_metrics?: {
    draft_photos: number;
    published_photos: number;
    published_videos: number;
    total_media: number;
  };
  invitation_metrics?: {
    is_published: boolean;
    default_template: string;
    headline_text: string;
  };
};

interface UnifiedAdminDashboardProps {
  metrics: AdminDashboardMetricsData;
  adminTeam: AdminTeamMember[] | null;
  adminName?: string;
  isSuperAdmin: boolean;
  permissions?: string[];
}

const NAV_PILL =
  "text-xs font-sans font-semibold text-[#8E6D38] hover:text-[#B8975E] inline-flex items-center gap-1 pt-2 border-t border-[#B8975E]/15";

function KpiCard({
  label,
  value,
  subtext,
  href,
  linkLabel,
  badge,
}: {
  label: string;
  value: React.ReactNode;
  subtext?: string;
  href: string;
  linkLabel: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="bg-white/90 border border-[#B8975E]/30 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between space-y-4 shadow-xs">
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#B8975E]">
            {label}
          </span>
          {badge}
        </div>
        <div className="font-serif text-3xl font-light text-[#292322]">{value}</div>
        {subtext && (
          <p className="text-xs font-sans text-[#292322]/60 mt-1">{subtext}</p>
        )}
      </div>
      <Link href={href} className={NAV_PILL}>
        <span>{linkLabel}</span>
        <span>&rarr;</span>
      </Link>
    </div>
  );
}

export function UnifiedAdminDashboard({
  metrics,
  adminTeam,
  isSuperAdmin,
}: UnifiedAdminDashboardProps) {
  const { rsvp_metrics, wishes_metrics, photos_metrics, invitation_metrics } = metrics;

  return (
    <div className="space-y-10">
      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Public RSVP Submissions */}
        {rsvp_metrics !== undefined && (
          <KpiCard
            label="RSVP Submissions"
            value={rsvp_metrics.public_rsvp_count}
            subtext={`${rsvp_metrics.attending_total} total guests confirmed across all ceremonies`}
            href="/admin/rsvps"
            linkLabel="View RSVPs"
            badge={
              <span className="w-2 h-2 rounded-full bg-[#69765D]" />
            }
          />
        )}

        {/* Card 2: Published Wishes */}
        {wishes_metrics !== undefined && (
          <KpiCard
            label="Wishes & Blessings"
            value={wishes_metrics.total_wishes}
            subtext="Published blessings on the public wall"
            href="/admin/wishes"
            linkLabel="Manage Wishes"
            badge={
              <span className="w-2 h-2 rounded-full bg-[#B8975E]" />
            }
          />
        )}

        {/* Card 3: Published Gallery Media */}
        {photos_metrics !== undefined && (
          <KpiCard
            label="Gallery Media"
            value={photos_metrics.published_photos + photos_metrics.published_videos}
            subtext={`${photos_metrics.published_photos} photos · ${photos_metrics.published_videos} films published`}
            href="/admin/media"
            linkLabel="Manage Gallery Media"
            badge={
              photos_metrics.draft_photos > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                  {photos_metrics.draft_photos} Draft
                </span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-[#B8975E]" />
              )
            }
          />
        )}

        {/* Card 4: Invitation Studio */}
        {invitation_metrics !== undefined && (
          <KpiCard
            label="Invitation Studio"
            value={
              <span className="capitalize">
                {invitation_metrics.default_template}
              </span>
            }
            subtext={`Default edition · ${invitation_metrics.headline_text}`}
            href="/admin/invitation"
            linkLabel="Configure Studio"
            badge={
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  invitation_metrics.is_published
                    ? "bg-[#69765D]/15 text-[#525D48]"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {invitation_metrics.is_published ? "Published" : "Draft"}
              </span>
            }
          />
        )}
      </div>

      {/* Ceremony-by-Ceremony Attendance Breakdown */}
      {rsvp_metrics !== undefined && (
        <div className="bg-white/80 border border-[#B8975E]/30 rounded-2xl p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#B8975E]/15 pb-3">
            <div>
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-[#B8975E] block">
                Ceremony Breakdown
              </span>
              <h3 className="font-serif text-xl font-medium text-[#292322]">
                Guest Count by Ceremony
              </h3>
            </div>
            <Link
              href="/admin/rsvps"
              className="text-xs font-sans font-semibold text-[#8E6D38] hover:underline"
            >
              Full Roster &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Haldi Ceremony", count: rsvp_metrics.attending_haldi },
              { label: "Mehndi Ceremony", count: rsvp_metrics.attending_mehndi },
              { label: "Sacred Wedding", count: rsvp_metrics.attending_wedding },
              { label: "Reception", count: rsvp_metrics.attending_reception },
            ].map((evt) => (
              <div
                key={evt.label}
                className="p-4 rounded-xl border border-[#B8975E]/20 bg-[#FFFCF6]/80 flex flex-col justify-between space-y-2"
              >
                <span className="font-serif text-sm font-medium text-[#292322] block leading-snug">
                  {evt.label}
                </span>
                <div className="border-t border-[#B8975E]/15 pt-2 flex items-baseline justify-between text-xs">
                  <span className="font-sans text-[#292322]/60">Guests</span>
                  <span className="font-serif text-lg font-bold text-[#A52232]">
                    {evt.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Super Admin Panel (Only for Super Admin) */}
      {isSuperAdmin && adminTeam && (
        <AdminTeamManager initialTeam={adminTeam} />
      )}
    </div>
  );
}
