"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction, type AuthActionResult } from "@/actions/auth";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(forgotPasswordAction, null);

  return (
    <div className="w-full max-w-md mx-auto bg-white/90 border border-[#B8975E]/30 rounded-2xl p-8 sm:p-10 shadow-sm backdrop-blur-md">
      <div className="text-center mb-8">
        <span className="text-[11px] font-sans font-medium uppercase tracking-[0.25em] text-[#B8975E] block mb-2">
          Account Recovery
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#292322]">
          Reset Password
        </h1>
        <p className="font-sans text-xs text-[#292322]/60 mt-2">
          Enter your registered email to receive a password reset link
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

      <form action={formAction} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-sans font-medium uppercase tracking-wider text-[#292322]/70 mb-2"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="guest@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-[#B8975E]/30 bg-[#FFFCF6] text-[#292322] text-sm placeholder:text-[#292322]/30 focus:outline-hidden focus:ring-2 focus:ring-[#B8975E]/40 focus:border-[#B8975E] transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-6 rounded-full bg-[#A52232] text-white font-sans text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#8D1B29] transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
        >
          {isPending ? "Sending Instructions..." : "Send Reset Instructions"}
        </button>
      </form>

      <p className="mt-8 text-center font-sans text-xs text-[#292322]/60">
        Remembered your password?{" "}
        <Link href="/login" className="text-[#A52232] font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
