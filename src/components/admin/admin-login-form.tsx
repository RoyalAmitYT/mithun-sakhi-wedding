"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { adminSignInAction, type AuthActionResult } from "@/actions/auth";
import { CardCornerBrackets } from "@/components/ui/decorative-surfaces";
import { useToast } from "@/components/ui/toast";

interface AdminLoginFormProps {
  redirectTarget?: string;
  initialError?: string;
}

export function AdminLoginForm({
  redirectTarget = "/admin",
  initialError,
}: AdminLoginFormProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [serverState, setServerState] = useState<AuthActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const errorMessage =
    clientError ||
    serverState?.error ||
    (initialError === "unauthorized"
      ? "Access Denied: Your account does not possess active administrative privileges."
      : null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setClientError(null);
    setServerState(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      const msg = "Please enter a valid administrator email address.";
      setClientError(msg);
      toast.error("Email Required", msg);
      return;
    }

    if (!password) {
      const msg = "Please enter your administrator password.";
      setClientError(msg);
      toast.error("Password Required", msg);
      return;
    }

    const formData = new FormData();
    formData.append("email", cleanEmail);
    formData.append("password", password);
    formData.append("redirect", redirectTarget);

    startTransition(async () => {
      try {
        const result = await adminSignInAction(null, formData);
        if (result && !result.success) {
          setServerState(result);
          toast.error("Access Denied", result.error || "Invalid administrator credentials.");
        }
      } catch (err: unknown) {
        // Next.js redirect throws a specific NEXT_REDIRECT error that shouldn't be caught as an error
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
          toast.success("Authenticated", "Welcome back. Redirecting to administrator portal...");
          throw err;
        }
        const errMsg = "An unexpected error occurred during authentication. Please try again.";
        setClientError(errMsg);
        toast.error("Authentication Error", errMsg);
      }
    });
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative rounded-[24px] sm:rounded-[28px] bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FFF9F0] border border-[#B8975E]/40 p-7 sm:p-9 md:p-10 shadow-[0_20px_50px_-12px_rgba(184,151,94,0.22),0_4px_16px_-4px_rgba(41,35,34,0.06)] overflow-hidden">
        <CardCornerBrackets color="#B8975E" size={18} />

        {/* Executive Header Lockup */}
        <div className="text-center mb-7 sm:mb-8">
          {/* Monogram Seal */}
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#1F070B] via-[#2A0A10] to-[#150408] border border-[#B8975E]/50 flex items-center justify-center shadow-md mb-4">
            <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#D4AF37]">
              M&middot;S
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-1.5 select-none" aria-hidden="true">
            <span className="text-[6px] text-[#A52232] font-bold">◆</span>
            <span className="font-sans text-[10px] sm:text-[11px] font-bold tracking-[0.24em] text-[#A52232] uppercase">
              EXECUTIVE PORTAL
            </span>
            <span className="text-[6px] text-[#A52232] font-bold">◆</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl text-[#292322] font-normal leading-tight">
            Administrator Sign In
          </h1>

          <p className="font-sans text-xs sm:text-sm text-[#5C5452] mt-2 leading-relaxed">
            Enter your credentials to access wedding operations, headcounts, and guest intelligence.
          </p>

          {/* Security Notice Pill */}
          <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5E6] border border-[#B8975E]/35 text-[10px] font-medium text-[#7D1525] select-none">
            <svg
              className="w-3 h-3 text-[#A52232] shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Authorized Wedding Personnel Only</span>
          </div>
        </div>

        {/* ERROR NOTIFICATION BANNER */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 p-3.5 rounded-xl bg-[#FFF0F2] border border-[#A52232]/30 text-xs sm:text-sm text-[#A52232] flex items-start gap-2.5 animate-fadeIn"
          >
            <svg
              className="w-4 h-4 shrink-0 mt-0.5"
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
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
          {/* Email Field */}
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-sans font-semibold uppercase tracking-wider text-[#292322] mb-1.5"
            >
              Administrator Email <span className="text-[#A52232]">*</span>
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              required
              autoFocus
              autoCapitalize="none"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mithunsakhi.wedding"
              disabled={isPending}
              className="w-full px-4 py-3 rounded-xl bg-white border border-[#B8975E]/40 focus:border-[#A52232] focus:ring-2 focus:ring-[#A52232]/20 focus:outline-none font-sans text-sm text-[#292322] placeholder:text-[#8A8280]/60 transition-all shadow-2xs disabled:opacity-50"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-sans font-semibold uppercase tracking-wider text-[#292322] mb-1.5"
            >
              Password <span className="text-[#A52232]">*</span>
            </label>
            <div className="relative">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isPending}
                className="w-full px-4 py-3 pr-11 rounded-xl bg-white border border-[#B8975E]/40 focus:border-[#A52232] focus:ring-2 focus:ring-[#A52232]/20 focus:outline-none font-sans text-sm text-[#292322] placeholder:text-[#8A8280]/60 transition-all shadow-2xs disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8A8280] hover:text-[#292322] transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 sm:h-13 px-6 rounded-xl bg-gradient-to-r from-[#7D1525] via-[#9B1E30] to-[#6A1220] hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none text-white border border-[#D4AF37]/50 shadow-[0_8px_24px_rgba(155,30,48,0.32)] font-sans font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer"
            >
              {isPending ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <span aria-hidden="true" className="text-base font-light">
                    &rarr;
                  </span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Navigation */}
        <div className="mt-7 pt-4 border-t border-[#B8975E]/20 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#5C5452] hover:text-[#A52232] transition-colors"
          >
            <span>&larr;</span>
            <span>Return to Wedding Celebration</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
