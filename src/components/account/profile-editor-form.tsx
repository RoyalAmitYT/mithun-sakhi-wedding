"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileActionResult } from "@/actions/profile";
import type { ProfileRecord } from "@/lib/supabase/auth-helpers";

interface ProfileEditorFormProps {
  profile: ProfileRecord;
}

export function ProfileEditorForm({ profile }: ProfileEditorFormProps) {
  const [state, formAction, isPending] = useActionState<
    ProfileActionResult | null,
    FormData
  >(updateProfileAction, null);

  return (
    <div className="bg-white/80 border border-[#B8975E]/30 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
      <div className="mb-6">
        <h2 className="font-serif text-xl sm:text-2xl font-light text-[#292322]">
          Personal Profile Details
        </h2>
        <p className="font-sans text-xs text-[#292322]/60 mt-1">
          Manage your verified contact details for wedding updates
        </p>
      </div>

      {state?.error && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-[#A52232]/10 border border-[#A52232]/30 text-xs text-[#A52232] leading-relaxed flex items-start gap-2.5"
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
          className="mb-6 p-4 rounded-xl bg-[#69765D]/10 border border-[#69765D]/30 text-xs text-[#69765D] leading-relaxed flex items-start gap-2.5"
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

      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="full_name"
            className="block text-xs font-sans font-medium uppercase tracking-wider text-[#292322]/70 mb-1.5"
          >
            Full Name <span className="text-[#A52232]">*</span>
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            defaultValue={profile.full_name}
            className="w-full px-4 py-2.5 rounded-xl border border-[#B8975E]/30 bg-[#FFFCF6] text-[#292322] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B8975E]/40 focus:border-[#B8975E] transition-all"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-xs font-sans font-medium uppercase tracking-wider text-[#292322]/70 mb-1.5"
          >
            Email Address (Primary Identity)
          </label>
          <input
            id="email"
            type="email"
            disabled
            value={profile.email}
            className="w-full px-4 py-2.5 rounded-xl border border-[#B8975E]/20 bg-[#F7F1E6]/50 text-[#292322]/60 text-sm cursor-not-allowed"
          />
          <p className="text-[11px] font-sans text-[#292322]/40 mt-1">
            Email is tied to your login identity and cannot be edited directly.
          </p>
        </div>

        <div>
          <label
            htmlFor="mobile_number"
            className="block text-xs font-sans font-medium uppercase tracking-wider text-[#292322]/70 mb-1.5"
          >
            Mobile Number (Optional)
          </label>
          <input
            id="mobile_number"
            name="mobile_number"
            type="tel"
            defaultValue={profile.mobile_number || ""}
            placeholder="+91 98765 43210"
            className="w-full px-4 py-2.5 rounded-xl border border-[#B8975E]/30 bg-[#FFFCF6] text-[#292322] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B8975E]/40 focus:border-[#B8975E] transition-all"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="py-2.5 px-6 rounded-full bg-[#A52232] text-white font-sans text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#8D1B29] transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
