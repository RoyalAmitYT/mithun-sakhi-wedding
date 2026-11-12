"use client";

import React, { useState, useTransition } from "react";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/actions/admin-management";

export type AdminNotificationItem = {
  id: string;
  permission_group: string;
  title: string;
  message: string;
  related_entity_id: string | null;
  is_read: boolean;
  created_at: string;
};

interface AdminNotificationsDrawerProps {
  notifications: AdminNotificationItem[];
  unreadCount: number;
}

export function AdminNotificationsDrawer({
  notifications: initialNotifications,
  unreadCount: initialUnreadCount,
}: AdminNotificationsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [isPending, startTransition] = useTransition();

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      const res = await markNotificationReadAction(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      const res = await markAllNotificationsReadAction();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    });
  };

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full border border-[#B8975E]/30 bg-white hover:bg-[#F7F1E6] transition-colors cursor-pointer text-[#292322]"
        title="Operational Notifications"
        aria-label="Operational Notifications"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#A52232] text-white text-[9px] font-sans font-bold shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="absolute right-0 mt-2 w-[calc(100vw-2.5rem)] sm:w-96 max-w-sm rounded-2xl bg-white border border-[#B8975E]/40 shadow-xl z-50 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#B8975E]/20 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm font-medium text-[#292322]">
                  Operational Alerts
                </span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#A52232]/10 text-[#A52232] font-semibold">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={isPending}
                  className="text-[11px] font-sans text-[#8E6D38] hover:text-[#B8975E] hover:underline cursor-pointer transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#292322]/50 font-sans">
                  No notifications recorded yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border text-xs transition-colors ${
                      n.is_read
                        ? "bg-[#FFFCF6]/60 border-[#B8975E]/15 opacity-75"
                        : "bg-white border-[#B8975E]/40 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-sans font-semibold text-[#292322]">
                        {n.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-[#B8975E]/15 text-[#8E6D38]">
                        {n.permission_group.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#292322]/70 font-sans leading-relaxed mb-2">
                      {n.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-[#292322]/40 border-t border-[#B8975E]/10 pt-1.5">
                      <span>
                        {new Date(n.created_at).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>

                      {!n.is_read && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(n.id)}
                          disabled={isPending}
                          className="text-[#8E6D38] hover:underline cursor-pointer"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
