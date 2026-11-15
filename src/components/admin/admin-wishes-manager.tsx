"use client";

import React, { useState, useTransition } from "react";
import { adminDeleteWishAction } from "@/actions/wishes";
import { useToast } from "@/components/ui/toast";

export type AdminWishItem = {
  id: string;
  profile_id: string | null;
  author_display_name: string;
  wish_text: string;
  status: "approved" | "pending" | "rejected";
  source_type: "guest_submission" | "host_curated";
  created_at: string;
  updated_at: string;
};

interface AdminWishesManagerProps {
  initialWishes: AdminWishItem[];
}

type WishFilter = "all" | "guest_submission" | "host_curated";

const FILTER_LABELS: Record<WishFilter, string> = {
  all: "All Wishes",
  guest_submission: "Guest Submissions",
  host_curated: "Host-Curated Blessings",
};

export function AdminWishesManager({ initialWishes }: AdminWishesManagerProps) {
  const { toast } = useToast();
  const [wishes, setWishes] = useState<AdminWishItem[]>(initialWishes);
  const [filter, setFilter] = useState<WishFilter>("all");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const guestCount = wishes.filter((w) => w.source_type === "guest_submission").length;
  const curatedCount = wishes.filter((w) => w.source_type === "host_curated").length;

  const filteredWishes = wishes.filter((w) => {
    if (filter === "all") return true;
    return w.source_type === filter;
  });

  const handleDelete = (wishId: string) => {
    setDeletingId(wishId);
    setStatusMessage(null);
    startTransition(async () => {
      try {
        const res = await adminDeleteWishAction(wishId);
        if (res.success) {
          const msg = "Blessing permanently removed.";
          setStatusMessage({ type: "success", text: msg });
          setWishes((prev) => prev.filter((w) => w.id !== wishId));
          toast.success("Blessing Removed", msg);
          setConfirmDeleteId(null);
        } else {
          const err = res.error || "Failed to delete blessing.";
          setStatusMessage({ type: "error", text: err });
          toast.error("Deletion Failed", err);
        }
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {statusMessage && (
        <div
          role="alert"
          className={`p-4 rounded-xl text-xs font-sans leading-relaxed border ${
            statusMessage.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Summary Stats */}
      <div className="flex flex-wrap gap-4">
        <div className="bg-white border border-[#B8975E]/30 rounded-xl px-5 py-3 flex items-baseline gap-2">
          <span className="font-serif text-2xl text-[#292322]">{wishes.length}</span>
          <span className="text-xs font-sans text-[#292322]/60">Total Published</span>
        </div>
        <div className="bg-white border border-[#B8975E]/30 rounded-xl px-5 py-3 flex items-baseline gap-2">
          <span className="font-serif text-2xl text-[#292322]">{guestCount}</span>
          <span className="text-xs font-sans text-[#292322]/60">Guest Submissions</span>
        </div>
        <div className="bg-white border border-[#B8975E]/30 rounded-xl px-5 py-3 flex items-baseline gap-2">
          <span className="font-serif text-2xl text-[#292322]">{curatedCount}</span>
          <span className="text-xs font-sans text-[#292322]/60">Host-Curated</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-[#B8975E]/20 pb-3">
        {(Object.keys(FILTER_LABELS) as WishFilter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-sans font-medium transition-all flex items-center cursor-pointer ${
              filter === f
                ? "bg-[#292322] text-white shadow-xs"
                : "bg-white text-[#292322]/70 border border-[#B8975E]/30 hover:bg-[#F7F1E6]"
            }`}
          >
            {FILTER_LABELS[f]}
            {f === "all" && wishes.length > 0 && (
              <span className="ml-1.5 opacity-70">({wishes.length})</span>
            )}
            {f === "guest_submission" && guestCount > 0 && (
              <span className="ml-1.5 opacity-70">({guestCount})</span>
            )}
            {f === "host_curated" && curatedCount > 0 && (
              <span className="ml-1.5 opacity-70">({curatedCount})</span>
            )}
          </button>
        ))}
      </div>

      {/* Wishes List */}
      {filteredWishes.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#B8975E]/10 mx-auto flex items-center justify-center">
            <span className="text-2xl">🌸</span>
          </div>
          <p className="font-serif text-lg text-[#292322]/70">No wishes in this category yet.</p>
          <p className="text-xs font-sans text-[#292322]/50">
            Guest submissions appear instantly after they submit.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWishes.map((wish) => (
            <div
              key={wish.id}
              className="bg-white border border-[#B8975E]/25 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#B8975E]/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Author + source badge */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-serif text-base font-medium text-[#292322]">
                      {wish.author_display_name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        wish.source_type === "guest_submission"
                          ? "bg-[#69765D]/15 text-[#525D48]"
                          : "bg-[#B8975E]/15 text-[#8E6D38]"
                      }`}
                    >
                      {wish.source_type === "guest_submission"
                        ? "Guest"
                        : "Host Curated"}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="text-sm font-sans text-[#292322]/80 leading-relaxed">
                    &ldquo;{wish.wish_text}&rdquo;
                  </p>

                  {/* Date */}
                  <span className="text-[11px] font-sans text-[#292322]/40 mt-2 block">
                    {new Date(wish.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(wish.created_at).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Delete action with inline confirmation */}
                <div className="self-end sm:self-start shrink-0">
                  {confirmDeleteId === wish.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={deletingId === wish.id}
                        onClick={() => handleDelete(wish.id)}
                        className="min-h-[44px] px-3.5 py-2 rounded-xl bg-red-600 text-white text-xs font-sans font-semibold hover:bg-red-700 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        {deletingId === wish.id ? (
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : null}
                        <span>Confirm Delete</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="min-h-[44px] px-3 py-2 rounded-xl border border-gray-300 text-xs font-sans text-gray-600 hover:bg-gray-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(wish.id)}
                      disabled={isPending}
                      className="min-h-[44px] px-4 py-2 rounded-xl border border-red-200 text-xs font-sans font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                      title="Permanently delete this blessing"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
