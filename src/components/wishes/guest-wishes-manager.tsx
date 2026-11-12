"use client";

import React, { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { submitWishAction, updateWishAction, deleteWishAction } from "@/actions/wishes";
import { useMotionReduced, MOTION_EASINGS } from "@/lib/motion";
import type { Database } from "@/types/database.types";

type WishRecord = Database["public"]["Tables"]["wishes"]["Row"];

interface GuestWishesManagerProps {
  initialWishes: WishRecord[];
  isCutoffPassed: boolean;
  authorFirstName: string;
}

export function GuestWishesManager({
  initialWishes,
  isCutoffPassed,
  authorFirstName,
}: GuestWishesManagerProps) {
  const shouldReduceMotion = useMotionReduced();
  const luxuryEase = MOTION_EASINGS.luxury as [number, number, number, number];

  const [wishes, setWishes] = useState<WishRecord[]>(initialWishes);
  const [newWishText, setNewWishText] = useState("");
  const [editingWishId, setEditingWishId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWishText.trim().length < 3) return;

    setStatusMessage(null);
    startTransition(async () => {
      const res = await submitWishAction(newWishText);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: "Your blessing has been submitted for family review and will appear on the public wall upon approval.",
        });
        setNewWishText("");
        // Optimistically add wish
        const optimisticWish: WishRecord = {
          id: res.wishId || ("temp-" + Date.now()),
          profile_id: "me",
          author_display_name: authorFirstName,
          wish_text: newWishText.trim(),
          status: "pending",
          moderated_by: null,
          moderated_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setWishes((prev) => [optimisticWish, ...prev]);
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to submit blessing.",
        });
      }
    });
  };

  const handleStartEdit = (wish: WishRecord) => {
    setEditingWishId(wish.id);
    setEditText(wish.wish_text);
    setStatusMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingWishId(null);
    setEditText("");
  };

  const handleSaveEdit = (wishId: string) => {
    if (editText.trim().length < 3) return;

    setStatusMessage(null);
    startTransition(async () => {
      const res = await updateWishAction(wishId, editText);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: "Blessing updated successfully. It will be re-reviewed by the family.",
        });
        setWishes((prev) =>
          prev.map((w) =>
            w.id === wishId
              ? { ...w, wish_text: editText.trim(), status: "pending" }
              : w
          )
        );
        setEditingWishId(null);
        setEditText("");
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to update blessing.",
        });
      }
    });
  };

  const handleDelete = (wishId: string) => {
    if (!window.confirm("Are you sure you wish to delete this blessing?")) return;

    setStatusMessage(null);
    startTransition(async () => {
      const res = await deleteWishAction(wishId);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: "Blessing has been removed.",
        });
        setWishes((prev) => prev.filter((w) => w.id !== wishId));
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to remove blessing.",
        });
      }
    });
  };

  return (
    <div id="wishes" className="space-y-8 scroll-mt-24">
      {/* Section Header */}
      <div className="border-b border-[#B8975E]/30 pb-3">
        <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-[#B8975E] block mb-1">
          Blessings &bull; Guestbook
        </span>
        <h2 className="font-serif text-3xl font-light text-[#292322]">
          Your Wishes &amp; Blessings
        </h2>
        <p className="font-sans text-xs text-[#292322]/60 mt-1">
          Share your heartfelt prayers and congratulations for Mithun &amp; Sakhi. All blessings are lovingly reviewed before illuminating on the public wall.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {statusMessage && (
          <motion.div
            key={statusMessage.text}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: luxuryEase }}
            role="alert"
            className={`p-4 rounded-xl text-xs font-sans leading-relaxed border ${
              statusMessage.type === "success"
                ? "bg-[#69765D]/10 border-[#69765D]/30 text-[#434D3A]"
                : "bg-[#A52232]/10 border-[#A52232]/30 text-[#A52232]"
            }`}
          >
            {statusMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submission Form or Memories Mode Banner */}
      {isCutoffPassed ? (
        <div className="bg-[#FFFCF6] border border-[#B8975E]/30 rounded-xl p-5 text-xs text-[#292322]/70 leading-relaxed">
          <span className="font-serif text-sm font-medium text-[#A52232] block mb-1">
            Memories Mode Active
          </span>
          Guestbook submissions are now closed as the wedding celebrations have concluded. You may continue to view, update, or remove your previously submitted blessings below.
        </div>
      ) : (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-white/80 border border-[#B8975E]/30 rounded-2xl p-6 backdrop-blur-md space-y-4"
        >
          <div className="flex items-center justify-between">
            <label
              htmlFor="new-wish"
              className="text-xs font-serif font-medium text-[#292322]"
            >
              Write a Blessing for the Couple
            </label>
            <span className="text-[10px] font-sans text-[#292322]/50">
              {newWishText.length} / 1000 characters
            </span>
          </div>

          <textarea
            id="new-wish"
            value={newWishText}
            onChange={(e) => setNewWishText(e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="May your union be blessed with eternal happiness, laughter, and prosperity..."
            className="w-full px-4 py-3 rounded-xl border border-[#B8975E]/30 focus:border-[#B8975E] focus:outline-none focus:ring-1 focus:ring-[#B8975E] font-serif text-base sm:text-sm text-[#292322] bg-[#FFFCF6]/50 placeholder-[#292322]/30 transition-colors resize-none"
            disabled={isPending}
            required
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-[#292322]/50 font-sans italic">
              Bestowed as: <strong className="text-[#292322]">{authorFirstName}</strong>
            </p>

            <motion.button
              type="submit"
              disabled={isPending || newWishText.trim().length < 3}
              whileHover={isPending || newWishText.trim().length < 3 || shouldReduceMotion ? undefined : { scale: 1.025, y: -1 }}
              whileTap={isPending || newWishText.trim().length < 3 || shouldReduceMotion ? undefined : { scale: 0.98 }}
              className="inline-flex items-center justify-center px-6 py-2.5 min-h-[44px] rounded-full bg-[#B8975E] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#9B7D48] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {isPending ? "Submitting..." : "Send Blessing"}
            </motion.button>
          </div>
        </form>
      )}

      {/* List of Previous Wishes */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-medium text-[#292322]">
          Submitted Blessings ({wishes.length})
        </h3>

        {wishes.length === 0 ? (
          <div className="bg-white/60 border border-[rgba(184,151,94,0.2)] rounded-xl p-8 text-center text-xs text-[#292322]/60">
            You have not submitted any blessings yet. Write your wishes above to bestow your love upon Mithun &amp; Sakhi.
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {wishes.map((wish) => {
              const isEditing = editingWishId === wish.id;

              return (
                <motion.div
                  key={wish.id}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: luxuryEase }}
                  className="bg-white/90 border border-[#B8975E]/30 rounded-2xl p-6 backdrop-blur-md space-y-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-[#B8975E] block">
                        Bestowed as: {wish.author_display_name}
                      </span>
                      <span className="text-[11px] text-[#292322]/40 font-sans">
                        {new Date(wish.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Status Badge */}
                    {wish.status === "approved" ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-sans font-medium bg-[#69765D]/15 text-[#525D48] border border-[#69765D]/30">
                        Approved &bull; Live on Wall
                      </span>
                    ) : wish.status === "rejected" ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-sans font-medium bg-[#A52232]/15 text-[#A52232] border border-[#A52232]/30">
                        Declined
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-sans font-medium bg-[#B8975E]/15 text-[#8E6D38] border border-[#B8975E]/30">
                        Pending Review
                      </span>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3 pt-2">
                      <div className="p-3 rounded-lg bg-[#B8975E]/10 border border-[#B8975E]/20 text-[11px] text-[#8E6D38]">
                        Note: Saving changes will reset this blessing to &quot;Pending Review&quot; for family moderation before it appears publicly again.
                      </div>

                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        maxLength={1000}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-[#B8975E]/40 focus:border-[#B8975E] focus:outline-none focus:ring-1 focus:ring-[#B8975E] font-serif text-base sm:text-sm text-[#292322] bg-[#FFFCF6] transition-colors resize-none"
                        disabled={isPending}
                      />

                      <div className="flex items-center justify-between text-[10px] text-[#292322]/50 font-sans">
                        <span>{editText.length} / 1000 characters</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={isPending}
                            className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <motion.button
                            type="button"
                            onClick={() => handleSaveEdit(wish.id)}
                            disabled={isPending || editText.trim().length < 3}
                            whileHover={isPending || editText.trim().length < 3 || shouldReduceMotion ? undefined : { scale: 1.025 }}
                            whileTap={isPending || editText.trim().length < 3 || shouldReduceMotion ? undefined : { scale: 0.98 }}
                            className="px-4 py-1.5 rounded-full bg-[#B8975E] text-white text-xs font-semibold hover:bg-[#9B7D48] transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {isPending ? "Saving..." : "Save Blessing"}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="font-serif italic text-base text-[#292322] leading-relaxed whitespace-pre-wrap">
                        &ldquo;{wish.wish_text}&rdquo;
                      </p>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#B8975E]/15">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(wish)}
                          disabled={isPending}
                          className="px-3 py-1 text-xs font-sans text-[#8E6D38] hover:text-[#B8975E] hover:underline cursor-pointer transition-colors"
                        >
                          Edit
                        </button>
                        <span className="text-[#B8975E]/40 text-xs">&bull;</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(wish.id)}
                          disabled={isPending}
                          className="px-3 py-1 text-xs font-sans text-[#A52232] hover:text-[#8D1B29] hover:underline cursor-pointer transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
