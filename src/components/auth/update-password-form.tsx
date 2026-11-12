"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updatePasswordAction, type AuthActionResult } from "@/actions/auth";

export function UpdatePasswordForm() {
  const [state, formAction, isPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(updatePasswordAction, null);

  return (
    <div className="w-full max-w-md mx-auto bg-white/90 border border-[#B8975E]/30 rounded-2xl p-8 sm:p-10 shadow-sm backdrop-blur-md">
      <div className="text-center mb-8">
        <span className="text-[11px] font-sans font-medium uppercase tracking-[0.25em] text-[#B8975E] block mb-2">
          Secure Authentication
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#292322]">
          Set New Password
        </h1>
        <p className="font-sans text-xs text-[#292322]/60 mt-2">
          Choose a secure password for your guest account
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

      {state?.success ? (
        <div className="text-center">
          <div
            role="status"
            className="mb-6 p-4 rounded-xl bg-[#69765D]/10 border border-[#69765D]/30 text-xs text-[#69765D] leading-relaxed flex items-start gap-2.5 text-left"
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
          <Link
            href="/account"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#A52232] text-white hover:bg-[#8D1B29] transition-colors"
          >
            Go to Your Account
          </Link>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-sans font-medium uppercase tracking-wider text-[#292322]/70 mb-1.5"
            >
              New Password (Minimum 6 characters)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-[#B8975E]/30 bg-[#FFFCF6] text-[#292322] text-sm placeholder:text-[#292322]/30 focus:outline-hidden focus:ring-2 focus:ring-[#B8975E]/40 focus:border-[#B8975E] transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="confirm_password"
              className="block text-xs font-sans font-medium uppercase tracking-wider text-[#292322]/70 mb-1.5"
            >
              Confirm New Password
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-[#B8975E]/30 bg-[#FFFCF6] text-[#292322] text-sm placeholder:text-[#292322]/30 focus:outline-hidden focus:ring-2 focus:ring-[#B8975E]/40 focus:border-[#B8975E] transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-6 rounded-full bg-[#A52232] text-white font-sans text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#8D1B29] transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Updating Password..." : "Update Password"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
