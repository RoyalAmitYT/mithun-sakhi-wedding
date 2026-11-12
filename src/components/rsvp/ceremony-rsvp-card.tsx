"use client";

import React, { useState, useTransition } from "react";
import { submitFamilyRsvpAction } from "@/actions/rsvp";
import { MagneticButton } from "@/components/interactive";

export interface CeremonyEventData {
  id: "haldi" | "mehndi" | "wedding" | "reception";
  title: string;
  traditionalTitle: string | null;
  tagline: string | null;
  ceremonyDate: string;
  startTimeIst: string;
  venueName: string;
  venueAddress: string;
  googleMapsUrl: string;
  rsvpDeadlineUtc: string;
}

export interface FamilyMemberOption {
  id: string;
  name: string;
}

export interface ExistingRsvpData {
  id: string;
  status: "attending" | "not_attending" | "not_sure";
  arrivalDetails: string | null;
  specialDietaryRequests: string | null;
  submittedAt: string;
  attendees: Array<{
    id?: string;
    full_name: string;
    family_member_id?: string | null;
  }>;
}

interface CeremonyRsvpCardProps {
  event: CeremonyEventData;
  familyGroupId: string;
  familyMembers: FamilyMemberOption[];
  existingRsvp?: ExistingRsvpData | null;
  isDeadlinePassed: boolean;
}

export function CeremonyRsvpCard({
  event,
  familyGroupId,
  familyMembers,
  existingRsvp,
  isDeadlinePassed,
}: CeremonyRsvpCardProps) {
  const [isPending, startTransition] = useTransition();

  const [status, setStatus] = useState<"attending" | "not_attending" | "not_sure">(
    existingRsvp?.status || "attending"
  );

  // Initialize selected members from existing RSVP attendee links or match names
  const initialSelectedIds = React.useMemo(() => {
    if (!existingRsvp || existingRsvp.status !== "attending") {
      // By default, select all family members
      return familyMembers.map((m) => m.id);
    }
    const matchedIds: string[] = [];
    for (const att of existingRsvp.attendees) {
      if (att.family_member_id) {
        matchedIds.push(att.family_member_id);
      } else {
        const found = familyMembers.find(
          (m) => m.name.toLowerCase() === att.full_name.toLowerCase()
        );
        if (found) matchedIds.push(found.id);
      }
    }
    return matchedIds.length > 0 ? matchedIds : familyMembers.map((m) => m.id);
  }, [existingRsvp, familyMembers]);

  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(initialSelectedIds);

  const [arrivalDetails, setArrivalDetails] = useState<string>(
    existingRsvp?.arrivalDetails || ""
  );

  const [specialDietaryRequests, setSpecialDietaryRequests] = useState<string>(
    existingRsvp?.specialDietaryRequests || ""
  );

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [isSubmitted, setIsSubmitted] = useState<boolean>(Boolean(existingRsvp));

  const toggleMember = (memberId: string) => {
    if (isDeadlinePassed) return;
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (isDeadlinePassed) return;
    setSelectedMemberIds(familyMembers.map((m) => m.id));
  };

  const handleDeselectAll = () => {
    if (isDeadlinePassed) return;
    setSelectedMemberIds([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDeadlinePassed) {
      setFeedback({
        type: "error",
        message: "The RSVP deadline for this ceremony has passed. Responses can no longer be modified.",
      });
      return;
    }

    if (status === "attending" && selectedMemberIds.length === 0) {
      setFeedback({
        type: "error",
        message: "Please select at least one family member attending this ceremony.",
      });
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const res = await submitFamilyRsvpAction({
        eventId: event.id,
        familyGroupId,
        status,
        memberIds: status === "attending" ? selectedMemberIds : [],
        arrivalDetails: arrivalDetails.trim() || null,
        specialDietaryRequests: specialDietaryRequests.trim() || null,
      });

      if (res.success) {
        setIsSubmitted(true);
        setFeedback({
          type: "success",
          message:
            status === "attending"
              ? `RSVP confirmed for ${res.attendeeCount} ${res.attendeeCount === 1 ? "family member" : "family members"}!`
              : status === "not_attending"
              ? "Your regrets have been recorded with reverence."
              : "Your response has been noted as undecided.",
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to submit RSVP. Please try again.",
        });
      }
    });
  };

  // Accent styling based on ceremony
  const ceremonyColorClasses = {
    haldi: "border-[#B8975E]/30 bg-[#FFFCF6]",
    mehndi: "border-[#69765D]/30 bg-[#F9FAF8]",
    wedding: "border-[#A52232]/30 bg-[#FFFDFD]",
    reception: "border-[#B8975E]/30 bg-[#FFFCF6]",
  }[event.id];

  const ceremonyBadgeColor = {
    haldi: "bg-[#B8975E]/15 text-[#8E6D38] border-[#B8975E]/30",
    mehndi: "bg-[#69765D]/15 text-[#525D48] border-[#69765D]/30",
    wedding: "bg-[#A52232]/15 text-[#A52232] border-[#A52232]/30",
    reception: "bg-[#8E6D38]/15 text-[#8E6D38] border-[#8E6D38]/30",
  }[event.id];

  return (
    <div
      className={`rounded-2xl border p-6 sm:p-8 backdrop-blur-md shadow-xs space-y-6 ${ceremonyColorClasses}`}
    >
      {/* Ceremony Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#292322]/10 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider border ${ceremonyBadgeColor}`}
            >
              {event.id.toUpperCase()}
            </span>
            <span className="text-[11px] font-sans text-[#292322]/60">
              {new Date(event.ceremonyDate).toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {" · "}
              {event.startTimeIst}
            </span>
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl text-[#292322]">
            {event.title}
          </h3>

          <p className="font-sans text-xs text-[#292322]/65 mt-1">
            📍 {event.venueName}, {event.venueAddress}
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
          {isDeadlinePassed ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-300">
              RSVP Closed
            </span>
          ) : isSubmitted ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider bg-[#69765D]/15 text-[#525D48] border border-[#69765D]/30 inline-flex items-center gap-1">
              <svg className="w-3 h-3 text-[#69765D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Response Saved
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider bg-[#B8975E]/15 text-[#8E6D38] border border-[#B8975E]/30">
              Awaiting Response
            </span>
          )}

          <span className="text-[10px] font-sans text-[#292322]/50">
            Cutoff:{" "}
            {new Date(event.rsvpDeadlineUtc).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-sans flex items-start gap-2.5 transition-all ${
            feedback.type === "success"
              ? "bg-[#69765D]/10 text-[#525D48] border border-[#69765D]/30"
              : "bg-[#A52232]/10 text-[#A52232] border border-[#A52232]/30"
          }`}
        >
          {feedback.type === "success" ? (
            <svg className="w-4 h-4 shrink-0 text-[#69765D] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 shrink-0 text-[#A52232] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status Selector */}
        <div className="space-y-2">
          <label className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#292322]/50 block">
            Attendance Response
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              disabled={isDeadlinePassed}
              onClick={() => setStatus("attending")}
              className={`p-3 rounded-xl border text-xs font-sans font-medium transition-all text-left flex items-center justify-between cursor-pointer ${
                status === "attending"
                  ? "border-[#69765D] bg-[#69765D]/15 text-[#525D48] shadow-xs"
                  : "border-[#292322]/15 bg-white text-[#292322]/70 hover:border-[#292322]/30"
              } ${isDeadlinePassed ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <span>Joyfully Attending</span>
              <span
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                  status === "attending"
                    ? "border-[#525D48] bg-[#525D48]"
                    : "border-gray-300"
                }`}
              >
                {status === "attending" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </span>
            </button>

            <button
              type="button"
              disabled={isDeadlinePassed}
              onClick={() => setStatus("not_attending")}
              className={`p-3 rounded-xl border text-xs font-sans font-medium transition-all text-left flex items-center justify-between cursor-pointer ${
                status === "not_attending"
                  ? "border-[#A52232] bg-[#A52232]/15 text-[#A52232] shadow-xs"
                  : "border-[#292322]/15 bg-white text-[#292322]/70 hover:border-[#292322]/30"
              } ${isDeadlinePassed ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <span>Regretfully Declining</span>
              <span
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                  status === "not_attending"
                    ? "border-[#A52232] bg-[#A52232]"
                    : "border-gray-300"
                }`}
              >
                {status === "not_attending" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </span>
            </button>

            <button
              type="button"
              disabled={isDeadlinePassed}
              onClick={() => setStatus("not_sure")}
              className={`p-3 rounded-xl border text-xs font-sans font-medium transition-all text-left flex items-center justify-between cursor-pointer ${
                status === "not_sure"
                  ? "border-[#B8975E] bg-[#B8975E]/15 text-[#8E6D38] shadow-xs"
                  : "border-[#292322]/15 bg-white text-[#292322]/70 hover:border-[#292322]/30"
              } ${isDeadlinePassed ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <span>Undecided / Unsure</span>
              <span
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                  status === "not_sure"
                    ? "border-[#8E6D38] bg-[#8E6D38]"
                    : "border-gray-300"
                }`}
              >
                {status === "not_sure" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Member Checkboxes (Only when Attending) */}
        {status === "attending" && (
          <div className="p-4 sm:p-5 rounded-xl border border-[#B8975E]/30 bg-white/80 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#B8975E]/15 pb-2.5">
              <div>
                <label className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#292322]/60 block">
                  Who will attend {event.title}?
                </label>
                <p className="text-[11px] font-sans text-[#292322]/60">
                  Select each family member from your household joining this ceremony.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {familyMembers.length > 1 && !isDeadlinePassed && (
                  <>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-[10px] font-sans font-medium text-[#8E6D38] hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="text-[10px] font-sans font-medium text-[#292322]/50 hover:underline"
                    >
                      Clear
                    </button>
                  </>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider bg-[#B8975E]/15 text-[#8E6D38] border border-[#B8975E]/30 ml-1">
                  {selectedMemberIds.length} {selectedMemberIds.length === 1 ? "Member" : "Members"} Attending
                </span>
              </div>
            </div>

            {familyMembers.length === 0 ? (
              <p className="text-xs font-sans text-[#A52232] py-2">
                No household members found. Please add family members in the &quot;My Family&quot; section above.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {familyMembers.map((member) => {
                  const isChecked = selectedMemberIds.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      disabled={isDeadlinePassed}
                      onClick={() => toggleMember(member.id)}
                      className={`p-3 rounded-lg border text-left text-xs font-sans transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isChecked
                          ? "border-[#69765D] bg-[#69765D]/10 text-[#292322] font-medium"
                          : "border-gray-200 bg-white text-[#292322]/70 hover:border-gray-300"
                      } ${isDeadlinePassed ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 h-5 rounded-full bg-[#B8975E]/15 border border-[#B8975E]/30 flex items-center justify-center text-[10px] text-[#8E6D38] shrink-0 font-serif">
                          ✓
                        </span>
                        <span className="truncate">{member.name}</span>
                      </div>

                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isChecked
                            ? "border-[#69765D] bg-[#69765D] text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isChecked && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Optional Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#292322]/50 block">
              Arrival Details (Optional)
            </label>
            <input
              type="text"
              value={arrivalDetails}
              onChange={(e) => setArrivalDetails(e.target.value)}
              disabled={isDeadlinePassed || isPending}
              placeholder="e.g. Arriving by Ranchi flight, Purulia express"
              className="w-full px-3 py-2 text-xs font-sans rounded-xl border border-[#292322]/15 bg-white text-[#292322] placeholder:text-[#292322]/35 focus:outline-hidden focus:border-[#B8975E]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#292322]/50 block">
              Dietary Requests / Notes (Optional)
            </label>
            <input
              type="text"
              value={specialDietaryRequests}
              onChange={(e) => setSpecialDietaryRequests(e.target.value)}
              disabled={isDeadlinePassed || isPending}
              placeholder="e.g. Pure vegetarian, Jain meal, Wheelchair assistance"
              className="w-full px-3 py-2 text-xs font-sans rounded-xl border border-[#292322]/15 bg-white text-[#292322] placeholder:text-[#292322]/35 focus:outline-hidden focus:border-[#B8975E]"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="text-[11px] font-sans text-[#292322]/55">
            {isDeadlinePassed
              ? "Deadline passed. Changes can no longer be saved."
              : isSubmitted
              ? "You can update your response at any time before the cutoff."
              : "Responses are saved directly to the wedding guest roster."}
          </p>

          <MagneticButton
            disabled={isDeadlinePassed || isPending || (status === "attending" && selectedMemberIds.length === 0)}
          >
            <button
              type="submit"
              disabled={isDeadlinePassed || isPending || (status === "attending" && selectedMemberIds.length === 0)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8E6D38] via-[#B8975E] to-[#8E6D38] text-white text-xs font-sans font-semibold uppercase tracking-wider hover:opacity-95 hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer shrink-0"
            >
              {isPending
                ? "Saving..."
                : isSubmitted
                ? "Update Ceremony RSVP"
                : "Confirm Ceremony RSVP"}
            </button>
          </MagneticButton>
        </div>
      </form>
    </div>
  );
}
