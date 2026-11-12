"use client";

import { useState, useActionState } from "react";
import {
  adminReviewAccessRequestAction,
  type AccessRequestActionResult,
} from "@/actions/access-requests";

export interface PendingAccessRequestItem {
  id: string;
  profile_id: string;
  invited_family_name: string;
  relationship_to_couple: string;
  message: string | null;
  status: string;
  created_at: string;
  profile?: {
    full_name: string;
    email: string;
    mobile_number: string | null;
  } | null;
}

interface ReviewAccessRequestsProps {
  requests: PendingAccessRequestItem[];
}

export function ReviewAccessRequests({ requests }: ReviewAccessRequestsProps) {
  const [activeModal, setActiveModal] = useState<{
    type: "approve" | "reject";
    request: PendingAccessRequestItem;
  } | null>(null);

  const [state, formAction, isPending] = useActionState<
    AccessRequestActionResult | null,
    FormData
  >(async (prev, formData) => {
    const res = await adminReviewAccessRequestAction(prev, formData);
    if (res.success) {
      setActiveModal(null);
    }
    return res;
  }, null);

  if (requests.length === 0) {
    return (
      <div className="bg-white/80 border border-[#B8975E]/30 rounded-2xl p-12 text-center backdrop-blur-md">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#69765D]/10 border border-[#69765D]/30 flex items-center justify-center text-[#69765D]">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="font-serif text-2xl font-light text-[#292322] mb-1">
          All Requests Reviewed
        </h3>
        <p className="font-sans text-xs text-[#292322]/60">
          There are currently no pending guest access requests awaiting review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {state?.error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-[#A52232]/10 border border-[#A52232]/30 text-xs text-[#A52232] leading-relaxed flex items-start gap-2.5"
        >
          <svg
            className="w-4 h-4 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>{state.error}</span>
        </div>
      )}

      {state?.success && (
        <div
          role="status"
          className="p-4 rounded-xl bg-[#69765D]/10 border border-[#69765D]/30 text-xs text-[#69765D] leading-relaxed flex items-start gap-2.5"
        >
          <svg
            className="w-4 h-4 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{state.message}</span>
        </div>
      )}

      <div className="grid gap-4">
        {requests.map((item) => {
          const submittedDate = new Date(item.created_at).toLocaleDateString(
            "en-IN",
            {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }
          );

          return (
            <div
              key={item.id}
              className="bg-white/90 border border-[#B8975E]/30 rounded-2xl p-6 shadow-sm backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-serif text-xl font-light text-[#292322]">
                    {item.profile?.full_name || "Unknown Guest"}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-sans font-medium uppercase tracking-wider bg-[#B8975E]/15 text-[#8E6D38] border border-[#B8975E]/30">
                    Pending Review
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs font-sans text-[#292322]/70">
                  <div>
                    <span className="font-medium text-[#292322]">Email:</span>{" "}
                    {item.profile?.email || "—"}
                  </div>
                  <div>
                    <span className="font-medium text-[#292322]">Mobile:</span>{" "}
                    {item.profile?.mobile_number || "Not provided"}
                  </div>
                  <div>
                    <span className="font-medium text-[#292322]">
                      Invited Family:
                    </span>{" "}
                    {item.invited_family_name}
                  </div>
                  <div>
                    <span className="font-medium text-[#292322]">
                      Relationship:
                    </span>{" "}
                    {item.relationship_to_couple}
                  </div>
                </div>

                {item.message && (
                  <p className="text-xs font-sans italic text-[#292322]/60 bg-[#FFFCF6] p-2.5 rounded-lg border border-[#B8975E]/20 mt-2">
                    &ldquo;{item.message}&rdquo;
                  </p>
                )}

                <p className="text-[10px] font-sans text-[#292322]/40">
                  Submitted: {submittedDate} IST
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#B8975E]/20">
                <button
                  type="button"
                  onClick={() =>
                    setActiveModal({ type: "approve", request: item })
                  }
                  className="px-5 py-2 rounded-full bg-[#69765D] text-white font-sans text-xs font-semibold uppercase tracking-wider hover:bg-[#525D48] transition-colors cursor-pointer"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveModal({ type: "reject", request: item })
                  }
                  className="px-5 py-2 rounded-full border border-[#A52232]/40 text-[#A52232] font-sans text-xs font-semibold uppercase tracking-wider hover:bg-[#A52232]/10 transition-colors cursor-pointer"
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Approve Modal */}
      {activeModal && activeModal.type === "approve" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#B8975E]/40 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-serif text-xl font-light text-[#292322]">
              Approve Guest Access
            </h3>
            <p className="font-sans text-xs text-[#292322]/70 leading-relaxed">
              Approve{" "}
              <strong>{activeModal.request.profile?.full_name}</strong> and
              assign them to a family group.
            </p>

            <form action={formAction} className="space-y-4">
              <input
                type="hidden"
                name="request_id"
                value={activeModal.request.id}
              />
              <input type="hidden" name="decision" value="approved" />

              <div>
                <label
                  htmlFor="family_name"
                  className="block text-xs font-sans font-medium uppercase tracking-wider text-[#292322]/70 mb-1"
                >
                  Family Group Name
                </label>
                <input
                  id="family_name"
                  name="family_name"
                  type="text"
                  required
                  defaultValue={activeModal.request.invited_family_name}
                  className="w-full px-3 py-2 rounded-lg border border-[#B8975E]/30 text-sm font-sans focus:outline-hidden focus:border-[#B8975E]"
                />
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  id="make_family_manager"
                  name="make_family_manager"
                  type="checkbox"
                  value="true"
                  defaultChecked
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#A52232] focus:ring-[#B8975E]"
                />
                <label
                  htmlFor="make_family_manager"
                  className="text-xs font-sans text-[#292322]/80 leading-normal"
                >
                  Assign as Active RSVP Manager (Allows this guest to submit
                  ceremony attendance for this family unit)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  disabled={isPending}
                  className="px-4 py-2 rounded-full border border-gray-300 text-xs font-sans text-[#292322]/70 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full bg-[#69765D] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#525D48] disabled:opacity-50"
                >
                  {isPending ? "Approving..." : "Confirm Approval"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {activeModal && activeModal.type === "reject" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#A52232]/40 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-serif text-xl font-light text-[#A52232]">
              Decline Access Request
            </h3>
            <p className="font-sans text-xs text-[#292322]/70 leading-relaxed">
              Decline request for{" "}
              <strong>{activeModal.request.profile?.full_name}</strong>. A
              clear reason is mandatory and will be visible on the guest&apos;s
              account page.
            </p>

            <form action={formAction} className="space-y-4">
              <input
                type="hidden"
                name="request_id"
                value={activeModal.request.id}
              />
              <input type="hidden" name="decision" value="rejected" />

              <div>
                <label
                  htmlFor="rejection_reason"
                  className="block text-xs font-sans font-medium uppercase tracking-wider text-[#292322]/70 mb-1"
                >
                  Reason for Declining <span className="text-[#A52232]">*</span>
                </label>
                <textarea
                  id="rejection_reason"
                  name="rejection_reason"
                  required
                  minLength={3}
                  rows={3}
                  placeholder="e.g., Name not recognized on primary guest list; please contact Mithun directly."
                  className="w-full px-3 py-2 rounded-lg border border-[#B8975E]/30 text-sm font-sans focus:outline-hidden focus:border-[#A52232] resize-y"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  disabled={isPending}
                  className="px-4 py-2 rounded-full border border-gray-300 text-xs font-sans text-[#292322]/70 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full bg-[#A52232] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#8D1B29] disabled:opacity-50"
                >
                  {isPending ? "Declining..." : "Confirm Decline"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
