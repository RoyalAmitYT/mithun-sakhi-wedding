"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { CardCornerBrackets } from "@/components/ui/decorative-surfaces";
import { submitPublicRsvpAction, type PublicRsvpPayload } from "@/actions/rsvp";
import { useToast } from "@/components/ui/toast";

interface CeremonyConfig {
  id: "haldi" | "mehndi" | "wedding" | "reception";
  title: string;
  dateStr: string;
  timeStr: string;
  description: string;
}

const CEREMONIES: CeremonyConfig[] = [
  {
    id: "haldi",
    title: "Haldi Ceremony",
    dateStr: "Thursday, 19 November 2026",
    timeStr: "9:00 AM IST",
    description: "Sacred turmeric blessings, morning music & joy",
  },
  {
    id: "mehndi",
    title: "Mehndi Ceremony",
    dateStr: "Friday, 20 November 2026",
    timeStr: "9:00 AM IST",
    description: "Intricate henna artistry, songs & celebration",
  },
  {
    id: "wedding",
    title: "The Sacred Wedding",
    dateStr: "Saturday, 21 November 2026",
    timeStr: "11:00 PM IST",
    description: "Auspicious Vedic nuptials, Saat Phere & Sindoor Daan",
  },
  {
    id: "reception",
    title: "Reception",
    dateStr: "Sunday, 22 November 2026",
    timeStr: "5:00 PM IST",
    description: "Grand banquet, family blessings & evening feast",
  },
];

export function PublicRsvpForm() {
  // Form input state
  const [guestName, setGuestName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [relationship, setRelationship] = useState<string>("");
  const [guestCount, setGuestCount] = useState<number>(1);

  // Independent ceremony choices (Yes = true, No = false)
  const [ceremonyAttendance, setCeremonyAttendance] = useState<Record<string, boolean>>({
    haldi: true,
    mehndi: true,
    wedding: true,
    reception: true,
  });

  // Honeypot field for anti-spam bots
  const [honeypot, setHoneypot] = useState("");

  // Submission UI state
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submittedDetails, setSubmittedDetails] = useState<{
    name: string;
    guestCount: number;
    attendingCeremonies: string[];
  } | null>(null);

  const handleEditResponse = () => {
    setIsEditing(true);
    setIsSuccess(false);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const toggleCeremony = (ceremonyId: string, willAttend: boolean) => {
    setCeremonyAttendance((prev) => ({
      ...prev,
      [ceremonyId]: willAttend,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const trimmedName = guestName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      const msg = "Please enter your full name (at least 2 characters).";
      setSubmitError(msg);
      toast.error("Full Name Required", msg);
      return;
    }

    if (guestCount < 1) {
      const msg = "Total number of guests must be at least 1.";
      setSubmitError(msg);
      toast.error("Guest Count Required", msg);
      return;
    }

    setIsSubmitting(true);

    const payload: PublicRsvpPayload = {
      guestName: trimmedName,
      mobile: mobile.trim() || undefined,
      address: address.trim() || undefined,
      relationship: relationship || undefined,
      guestCount: Math.max(1, Math.floor(guestCount)),
      attendingHaldi: ceremonyAttendance.haldi,
      attendingMehndi: ceremonyAttendance.mehndi,
      attendingWedding: ceremonyAttendance.wedding,
      attendingReception: ceremonyAttendance.reception,
      honeypot: honeypot.trim(),
    };

    try {
      const result = await submitPublicRsvpAction(payload);
      if (result.success) {
        const attendingList: string[] = [];
        if (ceremonyAttendance.haldi) attendingList.push("Haldi (19 Nov)");
        if (ceremonyAttendance.mehndi) attendingList.push("Mehndi (20 Nov)");
        if (ceremonyAttendance.wedding) attendingList.push("The Sacred Wedding (21 Nov)");
        if (ceremonyAttendance.reception) attendingList.push("Reception (22 Nov)");

        setSubmittedDetails({
          name: trimmedName,
          guestCount: payload.guestCount,
          attendingCeremonies: attendingList,
        });
        setIsEditing(false);
        setIsSuccess(true);
        toast.success(
          isEditing ? "RSVP Updated Successfully!" : "RSVP Confirmed with Gratitude!",
          "Thank you! Mithun & Sakhi look forward to celebrating with you."
        );
        // Scroll smoothly to top of form
        window.scrollTo({ top: 120, behavior: "smooth" });
      } else {
        const errText = result.error || "Failed to confirm RSVP. Please try again.";
        setSubmitError(errText);
        toast.error("RSVP Confirmation Incomplete", errText);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setSubmitError(message);
      toast.error("Submission Error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForAnother = () => {
    setIsSuccess(false);
    setIsEditing(false);
    setGuestName("");
    setMobile("");
    setAddress("");
    setRelationship("");
    setGuestCount(1);
    setCeremonyAttendance({
      haldi: true,
      mehndi: true,
      wedding: true,
      reception: true,
    });
    setSubmitError(null);
    setSubmittedDetails(null);
  };

  return (
    <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
      {/* SUCCESS CONFIRMATION SCREEN */}
      <AnimatePresence mode="wait">
        {isSuccess && submittedDetails ? (
          <motion.div
            key="success-screen"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-[24px] sm:rounded-[28px] bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FFF9F0] border border-[#B8975E]/40 p-7 sm:p-10 shadow-[0_20px_50px_-12px_rgba(184,151,94,0.22)] overflow-hidden text-center"
          >
            <CardCornerBrackets color="#B8975E" size={20} />

            {/* Sacred Lotus / Monogram Seal */}
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#FDF6E9] via-[#F8ECE0] to-[#EEDCC8] border border-[#B8975E]/50 flex items-center justify-center shadow-sm mb-5 sm:mb-6">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-[#A52232]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>

            <span className="text-[11px] font-sans font-bold uppercase tracking-[0.22em] text-[#A52232] block mb-2">
              RSVP Confirmed &bull; With Gratitude
            </span>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#292322] font-normal leading-tight">
              We Look Forward to Celebrating With You!
            </h2>

            <p className="font-sans text-sm sm:text-base text-[#5C5452] mt-3 max-w-lg mx-auto leading-relaxed">
              Dear <strong className="text-[#292322] font-semibold">{submittedDetails.name}</strong>,
              Mithun and Sakhi are truly honoured and overjoyed that you will be joining our wedding festivities.
            </p>

            {/* Summary Badge Card */}
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-white/90 border border-[#B8975E]/30 text-left max-w-md mx-auto space-y-2.5 shadow-xs relative">
              {/* Card Header with Edit Action */}
              <div className="flex items-center justify-between border-b border-[#B8975E]/15 pb-2.5">
                <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#8A8280]">
                  Your RSVP Details
                </span>
                <button
                  type="button"
                  onClick={handleEditResponse}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF5E6] hover:bg-[#F5EDD8] border border-[#B8975E]/40 text-xs font-semibold text-[#7D1525] transition-all hover:border-[#7D1525]/60 hover:shadow-2xs active:scale-95 cursor-pointer"
                  title="Edit and update your RSVP response"
                  aria-label="Edit and update your RSVP response"
                >
                  <svg
                    className="w-3.5 h-3.5 text-[#A52232]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>Edit Response</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm border-b border-[#B8975E]/15 pb-2">
                <span className="text-[#5C5452]">Total Guests Attending:</span>
                <span className="font-semibold text-[#A52232] font-serif text-base">
                  {submittedDetails.guestCount} {submittedDetails.guestCount === 1 ? "Guest" : "Guests"}
                </span>
              </div>

              <div>
                <span className="text-xs text-[#5C5452] block mb-1.5 font-medium">
                  Confirmed Ceremonies:
                </span>
                {submittedDetails.attendingCeremonies.length > 0 ? (
                  <ul className="space-y-1">
                    {submittedDetails.attendingCeremonies.map((cName) => (
                      <li
                        key={cName}
                        className="text-xs sm:text-sm text-[#292322] flex items-center gap-2"
                      >
                        <span className="text-[#A52232] text-xs">◆</span>
                        <span>{cName}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#5C5452] italic">
                    You indicated you will not be attending. We will miss your presence and cherish your warm blessings!
                  </p>
                )}
              </div>
            </div>

            {/* Actions: View Wedding Invitation, Return to Homepage, or Submit Another */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8 flex-wrap">
              <Link
                href="/#invitation"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#7D1525] via-[#9B1E30] to-[#6A1220] hover:brightness-110 active:scale-[0.98] text-white border border-[#D4AF37]/50 shadow-[0_6px_20px_rgba(155,30,48,0.28)] font-sans font-medium text-sm transition-all text-center"
              >
                View Wedding Invitation &rarr;
              </Link>
              <button
                type="button"
                onClick={handleResetForAnother}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-[#FDF6E8] active:scale-[0.98] text-[#7D1525] border border-[#B8975E]/60 text-sm font-medium transition-all text-center cursor-pointer shadow-2xs"
              >
                Submit Another RSVP
              </button>
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-[#FDF6E8] active:scale-[0.98] text-[#5C5452] hover:text-[#292322] border border-[#B8975E]/40 text-sm font-medium transition-all text-center flex items-center justify-center gap-2 shadow-2xs"
              >
                <svg
                  className="w-4 h-4 text-[#B8975E]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>Return Home</span>
              </Link>
            </div>
          </motion.div>
        ) : (
          /* RSVP FORM SCREEN */
          <motion.div
            key="rsvp-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-[24px] sm:rounded-[28px] bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FFF9F0] border border-[#B8975E]/40 p-6 sm:p-9 md:p-10 shadow-[0_16px_45px_-12px_rgba(184,151,94,0.18),0_4px_16px_-4px_rgba(41,35,34,0.06)] overflow-hidden"
          >
            <CardCornerBrackets color="#B8975E" size={18} />

            {/* Header Lockup */}
            <div className="text-center max-w-lg mx-auto mb-7 sm:mb-9">
              <div className="flex items-center justify-center gap-2 mb-2 select-none" aria-hidden="true">
                <span className="text-[7px] text-[#A52232] font-bold">◆</span>
                <span className="font-sans text-[11px] font-semibold tracking-[0.24em] text-[#A52232] uppercase">
                  GUEST RSVP
                </span>
                <span className="text-[7px] text-[#A52232] font-bold">◆</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl text-[#292322] font-normal leading-tight">
                Confirm Your Presence
              </h1>

              <p className="font-serif text-sm sm:text-base text-[#5C5452] mt-2.5 leading-relaxed">
                Your presence would make our celebrations even more special. Please let us know how you will be joining us.
              </p>

              {/* Decorative Gold Filigree Divider */}
              <div
                className="flex items-center justify-center gap-2 mt-4 select-none"
                aria-hidden="true"
              >
                <span className="w-12 sm:w-20 h-[1px] bg-gradient-to-r from-transparent to-[#B8975E]/60" />
                <span className="text-[7px] text-[#B8975E] rotate-45 font-bold">◇</span>
                <span className="text-[9px] text-[#B8975E] rotate-45 font-bold">◆</span>
                <span className="text-[7px] text-[#B8975E] rotate-45 font-bold">◇</span>
                <span className="w-12 sm:w-20 h-[1px] bg-gradient-to-l from-transparent to-[#B8975E]/60" />
              </div>
            </div>

            {/* ERROR BANNER */}
            {submitError && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-xl bg-[#FFF0F2] border border-[#A52232]/30 text-xs sm:text-sm text-[#A52232] flex items-start gap-2.5"
              >
                <svg
                  className="w-5 h-5 shrink-0 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{submitError}</span>
              </div>
            )}

            {/* EDITING MODE BANNER */}
            {isEditing && (
              <div className="mb-6 p-3.5 sm:p-4 rounded-xl bg-[#FAF5E6] border border-[#B8975E]/50 text-xs sm:text-sm text-[#7D1525] flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white border border-[#B8975E]/40 flex items-center justify-center shrink-0 shadow-2xs">
                    <svg
                      className="w-3.5 h-3.5 text-[#A52232]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold block text-[#292322]">Editing Your Submitted RSVP</span>
                    <span className="text-[#5C5452] text-[11px] sm:text-xs">
                      Update your guest details or ceremony choices below and submit to save changes.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setIsSuccess(true);
                  }}
                  className="text-xs font-semibold text-[#7D1525] hover:text-[#A52232] underline cursor-pointer shrink-0 py-1 px-1.5"
                >
                  Cancel
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Anti-spam honeypot */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website_url">Website</label>
                <input
                  id="website_url"
                  type="text"
                  name="website_url"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* SECTION 1: GUEST DETAILS */}
              <div className="space-y-4">
                {/* 1. Full Name */}
                <div>
                  <label
                    htmlFor="guest-name"
                    className="block text-xs sm:text-[13px] font-sans font-semibold uppercase tracking-wider text-[#292322] mb-1.5"
                  >
                    Full Name <span className="text-[#A52232]">*</span>
                  </label>
                  <input
                    id="guest-name"
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#B8975E]/40 focus:border-[#A52232] focus:ring-2 focus:ring-[#A52232]/20 focus:outline-none font-sans text-base text-[#292322] placeholder:text-[#8A8280]/70 transition-all shadow-2xs"
                  />
                </div>

                {/* 2. Mobile Number & 3. Address in 2 columns on tablet+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Mobile Number */}
                  <div>
                    <label
                      htmlFor="guest-mobile"
                      className="block text-xs sm:text-[13px] font-sans font-semibold uppercase tracking-wider text-[#292322] mb-1.5"
                    >
                      Mobile Number <span className="text-[11px] font-normal text-[#8A8280] lowercase">(optional)</span>
                    </label>
                    <input
                      id="guest-mobile"
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#B8975E]/40 focus:border-[#A52232] focus:ring-2 focus:ring-[#A52232]/20 focus:outline-none font-sans text-base text-[#292322] placeholder:text-[#8A8280]/70 transition-all shadow-2xs"
                    />
                  </div>

                  {/* Relation to Mithun & Sakhi */}
                  <div>
                    <label
                      htmlFor="guest-relation"
                      className="block text-xs sm:text-[13px] font-sans font-semibold uppercase tracking-wider text-[#292322] mb-1.5"
                    >
                      Relation to Mithun &amp; Sakhi <span className="text-[11px] font-normal text-[#8A8280] lowercase">(optional)</span>
                    </label>
                    <div className="relative">
                      <select
                        id="guest-relation"
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#B8975E]/40 focus:border-[#A52232] focus:ring-2 focus:ring-[#A52232]/20 focus:outline-none font-sans text-base text-[#292322] transition-all shadow-2xs appearance-none cursor-pointer"
                      >
                        <option value="">Select relationship</option>
                        <option value="Family">Family</option>
                        <option value="Relative">Relative</option>
                        <option value="Friend">Friend</option>
                        <option value="Colleague">Colleague</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#B8975E]">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Address */}
                <div>
                  <label
                    htmlFor="guest-address"
                    className="block text-xs sm:text-[13px] font-sans font-semibold uppercase tracking-wider text-[#292322] mb-1.5"
                  >
                    Address <span className="text-[11px] font-normal text-[#8A8280] lowercase">(optional)</span>
                  </label>
                  <input
                    id="guest-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="City, State or Full Residential Address"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#B8975E]/40 focus:border-[#A52232] focus:ring-2 focus:ring-[#A52232]/20 focus:outline-none font-sans text-base text-[#292322] placeholder:text-[#8A8280]/70 transition-all shadow-2xs"
                  />
                </div>

                {/* 5. Number of Guests */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/80 border border-[#B8975E]/30 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label
                        htmlFor="guest-count"
                        className="block text-xs sm:text-[13px] font-sans font-semibold uppercase tracking-wider text-[#292322]"
                      >
                        Number of Guests <span className="text-[#A52232]">*</span>
                      </label>
                      <p className="text-xs text-[#5C5452] mt-0.5">
                        Total number of guests attending together under this response (including yourself).
                      </p>
                    </div>

                    {/* Numeric Counter Controls */}
                    <div className="flex items-center gap-2.5 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
                        disabled={guestCount <= 1}
                        aria-label="Decrease guest count"
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-[#B8975E]/45 bg-[#FFFDF9] hover:bg-[#F7F1E6] active:scale-95 disabled:opacity-35 disabled:pointer-events-none flex items-center justify-center text-xl font-bold text-[#292322] transition-all cursor-pointer shadow-2xs"
                      >
                        &minus;
                      </button>

                      <input
                        id="guest-count"
                        type="number"
                        min="1"
                        max="50"
                        value={guestCount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setGuestCount(isNaN(val) ? 1 : Math.max(1, Math.min(50, val)));
                        }}
                        className="w-16 sm:w-20 h-10 sm:h-11 text-center flex items-center justify-center rounded-xl bg-white border border-[#B8975E]/50 font-serif text-2xl sm:text-[26px] font-bold text-[#A52232] focus:border-[#A52232] focus:ring-2 focus:ring-[#A52232]/20 focus:outline-none shadow-2xs p-0 m-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none select-none"
                      />

                      <button
                        type="button"
                        onClick={() => setGuestCount((c) => Math.min(50, c + 1))}
                        disabled={guestCount >= 50}
                        aria-label="Increase guest count"
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-[#B8975E]/45 bg-[#FFFDF9] hover:bg-[#F7F1E6] active:scale-95 disabled:opacity-35 disabled:pointer-events-none flex items-center justify-center text-xl font-bold text-[#292322] transition-all cursor-pointer shadow-2xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CEREMONY ATTENDANCE (Independent Yes/No Choices) */}
              <div className="pt-3 border-t border-[#B8975E]/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg sm:text-xl text-[#292322] font-normal">
                    Ceremony Attendance
                  </h3>
                  <span className="text-[11px] font-sans font-medium text-[#8A8280] uppercase tracking-wider">
                    Select for each event
                  </span>
                </div>

                <div className="space-y-3">
                  {CEREMONIES.map((c) => {
                    const isAttending = ceremonyAttendance[c.id];
                    return (
                      <div
                        key={c.id}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
                          isAttending
                            ? "bg-white border-[#B8975E]/60 shadow-[0_4px_16px_-4px_rgba(184,151,94,0.15)]"
                            : "bg-[#F7F1E6]/50 border-gray-200 opacity-80"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#B8975E] block">
                              {c.dateStr} &bull; {c.timeStr}
                            </span>
                            <h4 className="font-serif text-base sm:text-lg text-[#292322] font-medium leading-snug">
                              {c.title}
                            </h4>
                            <p className="text-xs text-[#5C5452]">
                              {c.description}
                            </p>
                          </div>

                          {/* Independent Yes / No Toggle Pill */}
                          <div
                            role="radiogroup"
                            aria-label={`Attendance choice for ${c.title}`}
                            className="flex items-center p-1 rounded-xl bg-[#F4EFE6] border border-[#B8975E]/30 shrink-0 self-start sm:self-auto"
                          >
                            <button
                              type="button"
                              role="radio"
                              aria-checked={isAttending}
                              onClick={() => toggleCeremony(c.id, true)}
                              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-sans font-semibold active:scale-95 transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                                isAttending
                                  ? "bg-gradient-to-r from-[#7D1525] to-[#9B1E30] text-white shadow-xs"
                                  : "text-[#5C5452] hover:text-[#292322] active:bg-[#EAE2D2]"
                              }`}
                            >
                              {isAttending && (
                                <svg
                                  className="w-3.5 h-3.5 text-white"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                              <span>Attending (Yes)</span>
                            </button>

                            <button
                              type="button"
                              role="radio"
                              aria-checked={!isAttending}
                              onClick={() => toggleCeremony(c.id, false)}
                              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium active:scale-95 transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                                !isAttending
                                  ? "bg-white text-[#292322] border border-gray-300 shadow-xs font-semibold"
                                  : "text-[#5C5452] hover:text-[#292322] active:bg-[#EAE2D2]"
                              }`}
                            >
                              <span>No</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PRIMARY ACTION BUTTON */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-13 sm:h-14 px-6 rounded-xl bg-gradient-to-r from-[#7D1525] via-[#9B1E30] to-[#6A1220] hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none text-white border border-[#D4AF37]/50 shadow-[0_8px_24px_rgba(155,30,48,0.32)] font-sans font-semibold text-base flex items-center justify-center gap-3 transition-all duration-150 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      <span>{isEditing ? "Updating Your Response..." : "Recording Your Response..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{isEditing ? "Update RSVP Response" : "Confirm RSVP"}</span>
                      <span aria-hidden="true" className="text-lg font-light">
                        &rarr;
                      </span>
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-[#8A8280] mt-3">
                  No login or account creation required &bull; Submissions are warmly received by the family
                </p>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
