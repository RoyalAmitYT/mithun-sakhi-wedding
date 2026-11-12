"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminSignOutAction } from "@/actions/auth";
import {
  AdminNotificationsDrawer,
  type AdminNotificationItem,
} from "./admin-notifications-drawer";

interface AdminHeaderProps {
  adminName: string;
  isSuperAdmin: boolean;
  permissions: string[];
  unreadNotificationsCount?: number;
  recentNotifications?: AdminNotificationItem[];
}

export function AdminHeader({
  adminName,
  isSuperAdmin,
  permissions,
  unreadNotificationsCount = 0,
  recentNotifications = [],
}: AdminHeaderProps) {
  const pathname = usePathname();

  const hasRsvp = isSuperAdmin || permissions.includes("guest_rsvp");
  const hasPhotos = isSuperAdmin || permissions.includes("photos");
  const hasWishes = isSuperAdmin || permissions.includes("wishes");
  const hasInvitation = isSuperAdmin || permissions.includes("invitation_studio");
  return (
    <div className="bg-white/80 border border-[#B8975E]/30 rounded-2xl p-5 sm:p-6 backdrop-blur-md space-y-5 shadow-xs">
      {/* Top Row: Title, Admin Role, Notifications & Account Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#B8975E]/15 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-[#B8975E]">
              Executive Wedding Administration
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                isSuperAdmin
                  ? "bg-[#A52232]/10 text-[#A52232] border border-[#A52232]/30"
                  : "bg-[#B8975E]/15 text-[#8E6D38] border border-[#B8975E]/30"
              }`}
            >
              {isSuperAdmin ? "Super Admin" : "Staff Coordinator"}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#292322]">
            {adminName}
          </h1>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          {/* Notifications Drawer */}
          <AdminNotificationsDrawer
            notifications={recentNotifications}
            unreadCount={unreadNotificationsCount}
          />

          <form action={adminSignOutAction}>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-full border border-[#A52232]/30 text-xs font-sans font-medium text-[#A52232] hover:bg-[#A52232]/10 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </form>

          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-full border border-[#B8975E]/30 text-xs font-sans font-medium text-[#8E6D38] hover:bg-[#B8975E]/10 transition-colors"
          >
            Public Site &rarr;
          </Link>
        </div>
      </div>

      {/* Navigation Pills Bar */}
      <nav aria-label="Admin Navigation" className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap">
        <Link
          href="/admin"
          className={`whitespace-nowrap px-4 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 rounded-full text-xs font-sans font-medium transition-all shrink-0 ${
            pathname === "/admin"
              ? "bg-[#292322] text-white shadow-sm"
              : "bg-white text-[#292322]/70 hover:bg-[#F7F1E6] border border-[#B8975E]/30"
          }`}
        >
          Overview Dashboard
        </Link>

        {hasRsvp && (
          <Link
            href="/admin/rsvps"
            className={`whitespace-nowrap px-4 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 rounded-full text-xs font-sans font-medium transition-all shrink-0 ${
              pathname === "/admin/rsvps"
                ? "bg-[#292322] text-white shadow-sm"
                : "bg-white text-[#292322]/70 hover:bg-[#F7F1E6] border border-[#B8975E]/30"
            }`}
          >
            RSVP & Attendance
          </Link>
        )}

        {hasPhotos && (
          <Link
            href="/admin/media"
            className={`whitespace-nowrap px-4 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 rounded-full text-xs font-sans font-medium transition-all shrink-0 ${
              pathname === "/admin/media"
                ? "bg-[#292322] text-white shadow-sm"
                : "bg-white text-[#292322]/70 hover:bg-[#F7F1E6] border border-[#B8975E]/30"
            }`}
          >
            Media Manager
          </Link>
        )}

        {hasWishes && (
          <Link
            href="/admin/wishes"
            className={`whitespace-nowrap px-4 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 rounded-full text-xs font-sans font-medium transition-all shrink-0 ${
              pathname === "/admin/wishes"
                ? "bg-[#292322] text-white shadow-sm"
                : "bg-white text-[#292322]/70 hover:bg-[#F7F1E6] border border-[#B8975E]/30"
            }`}
          >
            Wishes & Blessings
          </Link>
        )}

        {hasInvitation && (
          <Link
            href="/admin/invitation"
            className={`whitespace-nowrap px-4 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 rounded-full text-xs font-sans font-medium transition-all shrink-0 ${
              pathname === "/admin/invitation"
                ? "bg-[#292322] text-white shadow-sm"
                : "bg-white text-[#292322]/70 hover:bg-[#F7F1E6] border border-[#B8975E]/30"
            }`}
          >
            Invitation Studio
          </Link>
        )}
      </nav>
    </div>
  );
}
