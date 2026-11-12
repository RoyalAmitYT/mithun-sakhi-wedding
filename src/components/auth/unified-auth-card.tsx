"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { signUpAction, signInAction, type AuthActionResult } from "@/actions/auth";
import { GoogleSignInButton } from "./google-sign-in-button";
import {
  CardCornerBrackets,
  CardMandalaWatermark,
} from "@/components/ui/decorative-surfaces";

export type AuthMode = "register" | "login";

interface UnifiedAuthCardProps {
  initialMode?: AuthMode;
  redirectTarget?: string;
  isMemories?: boolean;
}

export function UnifiedAuthCard({
  initialMode = "register",
  redirectTarget,
  isMemories = false,
}: UnifiedAuthCardProps) {
  // If memories mode is active, registrations are closed; default to login
  const [mode, setMode] = useState<AuthMode>(isMemories ? "login" : initialMode);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form field states for instant validation & confirmation
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  // Error & Status states
  const [clientError, setClientError] = useState<string | null>(null);
  const [serverState, setServerState] = useState<AuthActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const shouldReduceMotion = useReducedMotion();

  // Switch between Register and Sign In mode smoothly
  const handleModeChange = (newMode: AuthMode) => {
    if (newMode === "register" && isMemories) return;
    setMode(newMode);
    setClientError(null);
    setServerState(null);

    // Gracefully update browser URL without triggering full page refresh
    if (typeof window !== "undefined") {
      const currentUrl = new URL(window.location.href);
      const targetPath = newMode === "register" ? "/register" : "/login";
      currentUrl.pathname = targetPath;
      if (redirectTarget) {
        currentUrl.searchParams.set("redirect", redirectTarget);
      }
      window.history.replaceState({}, "", currentUrl.toString());
    }
  };

  // Submit Handler for Registration
  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setClientError(null);
    setServerState(null);

    // Client-side validations
    if (fullName.trim().length < 2) {
      setClientError("Please enter your full name (at least 2 characters).");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setClientError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setClientError("Password must be at least 6 characters in length.");
      return;
    }
    if (password !== confirmPassword) {
      setClientError("Passwords do not match. Please ensure both fields are identical.");
      return;
    }

    const formData = new FormData();
    formData.append("full_name", fullName.trim());
    formData.append("email", email.trim().toLowerCase());
    formData.append("password", password);
    if (mobileNumber.trim()) {
      formData.append("mobile_number", mobileNumber.trim());
    }

    startTransition(async () => {
      try {
        const result = await signUpAction(null, formData);
        if (result) {
          setServerState(result);
        }
      } catch (err: unknown) {
        // Next.js redirect throws a special NEXT_REDIRECT error which is expected on successful login/registration
        if (err instanceof Error && err.message === "NEXT_REDIRECT") {
          throw err;
        }
        setClientError("An unexpected error occurred. Please try again.");
      }
    });
  };

  // Submit Handler for Login
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setClientError(null);
    setServerState(null);

    if (!email.trim() || !password) {
      setClientError("Please enter both your email address and password.");
      return;
    }

    const formData = new FormData();
    formData.append("email", email.trim().toLowerCase());
    formData.append("password", password);
    formData.append("redirect", redirectTarget || "/account");

    startTransition(async () => {
      try {
        const result = await signInAction(null, formData);
        if (result) {
          setServerState(result);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "NEXT_REDIRECT") {
          throw err;
        }
        setClientError("An unexpected error occurred. Please try again.");
      }
    });
  };

  const activeError = clientError || serverState?.error;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* 1. EDITORIAL HEADER LOCKUP (Above Card) */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center gap-2 mb-2">
          <span className="text-[#B8975E] text-[10px]">◆</span>
          <span className="font-sans text-[11px] sm:text-xs font-semibold uppercase tracking-[0.26em] text-[#8E6D38]">
            A CELEBRATION TO REMEMBER
          </span>
          <span className="text-[#B8975E] text-[10px]">◆</span>
        </div>

        <p className="font-serif italic text-sm sm:text-base text-[#5C5452]">
          Mithun &amp; Sakhi &middot; 19–22 November 2026 &middot; Purulia, West Bengal
        </p>

        {/* Minimal ornamental gold divider */}
        <div className="flex items-center justify-center gap-2.5 my-4" aria-hidden="true">
          <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-[#B8975E]/40" />
          <span className="text-[#B8975E]/60 text-[8px]">◆</span>
          <span className="text-[#B8975E] text-[11px]">◆</span>
          <span className="text-[#B8975E]/60 text-[8px]">◆</span>
          <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-[#B8975E]/40" />
        </div>
      </div>

      {/* 2. MAIN LUXURY AUTHENTICATION CARD */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF6ED] to-[#F7F1E6] border border-[#B8975E]/35 shadow-[0_20px_60px_rgba(41,35,34,0.08)] p-6 sm:p-9 md:p-10 transition-all overflow-hidden">
        {/* Signature Architectural Corner Brackets */}
        <CardCornerBrackets color="#B8975E" size={18} />

        {/* Faint Radial Mandala Watermark */}
        <CardMandalaWatermark strokeColor="#B8975E" opacity={0.14} position="right" />
        <CardMandalaWatermark strokeColor="#B8975E" opacity={0.1} position="left" />

        {/* M·S Monogram Emblem */}
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 rounded-full bg-[#FAF5EC] border border-[#DFCBB5] flex items-center justify-center text-[#7D1525] shadow-xs">
            <span className="font-serif text-sm font-semibold tracking-wider">M&middot;S</span>
          </div>
        </div>

        {/* 3. PROMINENT SEGMENTED SWITCHER (REGISTER | SIGN IN) */}
        <div className="mb-8">
          <div
            role="tablist"
            aria-label="Authentication Mode"
            className="w-full p-1.5 rounded-full bg-[#FAF5EC] border border-[#DFCBB5] shadow-xs flex relative"
          >
            {/* REGISTER TAB */}
            <button
              type="button"
              role="tab"
              id="auth-tab-register"
              aria-selected={mode === "register"}
              aria-controls="auth-panel-register"
              disabled={isMemories}
              onClick={() => handleModeChange("register")}
              className={`
                relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-full text-xs sm:text-[13px] font-sans transition-colors duration-200 min-h-[44px] cursor-pointer
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]
                ${isMemories ? "opacity-40 cursor-not-allowed" : ""}
                ${
                  mode === "register"
                    ? "text-white font-semibold"
                    : "text-[#5C5452] hover:text-[#292322] font-medium"
                }
              `}
            >
              {mode === "register" && (
                <motion.div
                  layoutId="auth-switcher-active"
                  className="absolute inset-0 bg-gradient-to-r from-[#7D1525] via-[#8C1B2E] to-[#6A1220] rounded-full shadow-md shadow-[#7D1525]/25 -z-10"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 450, damping: 35 }
                  }
                />
              )}
              {/* User Plus SVG Icon */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              <span>REGISTER</span>
            </button>

            {/* SIGN IN TAB */}
            <button
              type="button"
              role="tab"
              id="auth-tab-login"
              aria-selected={mode === "login"}
              aria-controls="auth-panel-login"
              onClick={() => handleModeChange("login")}
              className={`
                relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-full text-xs sm:text-[13px] font-sans transition-colors duration-200 min-h-[44px] cursor-pointer
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]
                ${
                  mode === "login"
                    ? "text-white font-semibold"
                    : "text-[#5C5452] hover:text-[#292322] font-medium"
                }
              `}
            >
              {mode === "login" && (
                <motion.div
                  layoutId="auth-switcher-active"
                  className="absolute inset-0 bg-gradient-to-r from-[#7D1525] via-[#8C1B2E] to-[#6A1220] rounded-full shadow-md shadow-[#7D1525]/25 -z-10"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 450, damping: 35 }
                  }
                />
              )}
              {/* Lock / Key SVG Icon */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>SIGN IN</span>
            </button>
          </div>
        </div>

        {/* 4. VERIFICATION NOTIFICATION (If sign-up required email confirmation) */}
        {serverState?.requiresVerification ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#FAF5EC] border border-[#DFCBB5] flex items-center justify-center text-[#7D1525] shadow-xs">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#292322] mb-2">
              Verification Email Dispatched
            </h2>
            <p className="font-serif italic text-sm text-[#5C5452] max-w-sm mx-auto leading-relaxed mb-6">
              {serverState.message || "Please check your email inbox to verify your account."}
            </p>
            <button
              type="button"
              onClick={() => handleModeChange("login")}
              className="inline-flex items-center justify-center px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#7D1525] text-white hover:bg-[#68111E] transition-colors shadow-sm cursor-pointer"
            >
              Proceed to Sign In &rarr;
            </button>
          </div>
        ) : (
          <>
            {/* 5. ACTIVE ERROR BANNER */}
            {activeError && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-xl bg-[#7D1525]/10 border border-[#7D1525]/30 text-xs text-[#7D1525] leading-relaxed flex items-start gap-3 animate-in fade-in duration-200"
              >
                <svg
                  className="w-4 h-4 shrink-0 mt-0.5 text-[#7D1525]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{activeError}</span>
              </div>
            )}

            {/* 6. ANIMATED CONTENT (Crossfade between Register & Login) */}
            <AnimatePresence mode="wait">
              {mode === "register" ? (
                /* REGISTER MODE */
                <motion.div
                  key="auth-mode-register"
                  id="auth-panel-register"
                  role="tabpanel"
                  aria-labelledby="auth-tab-register"
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-center mb-6">
                    <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#292322] tracking-tight">
                      Create Your Guest Account
                    </h2>
                    <p className="font-serif italic text-sm text-[#5C5452] mt-1.5">
                      Join the celebration and confirm your family&apos;s attendance.
                    </p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label
                        htmlFor="reg-full-name"
                        className="block text-xs font-sans font-semibold uppercase tracking-wider text-[#4A3E3D] mb-1.5"
                      >
                        Full Name <span className="text-[#7D1525]">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E6D38]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <input
                          id="reg-full-name"
                          name="full_name"
                          type="text"
                          required
                          autoComplete="name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g., Alok Mukherjee"
                          className="w-full pl-10 pr-4 py-3 min-h-[48px] rounded-xl border border-[#DFCBB5] bg-[#FFFCF6] text-[#292322] text-sm placeholder:text-[#5C5452]/40 focus:outline-none focus:ring-2 focus:ring-[#B8975E]/50 focus:border-[#B8975E] transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label
                        htmlFor="reg-email"
                        className="block text-xs font-sans font-semibold uppercase tracking-wider text-[#4A3E3D] mb-1.5"
                      >
                        Email Address <span className="text-[#7D1525]">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E6D38]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                        </div>
                        <input
                          id="reg-email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="guest@example.com"
                          className="w-full pl-10 pr-4 py-3 min-h-[48px] rounded-xl border border-[#DFCBB5] bg-[#FFFCF6] text-[#292322] text-sm placeholder:text-[#5C5452]/40 focus:outline-none focus:ring-2 focus:ring-[#B8975E]/50 focus:border-[#B8975E] transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label
                        htmlFor="reg-password"
                        className="block text-xs font-sans font-semibold uppercase tracking-wider text-[#4A3E3D] mb-1.5"
                      >
                        Password <span className="text-[#7D1525]">*</span>{" "}
                        <span className="text-[11px] font-normal text-[#7A6F6D]">(min 6 characters)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E6D38]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </div>
                        <input
                          id="reg-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={6}
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-11 py-3 min-h-[48px] rounded-xl border border-[#DFCBB5] bg-[#FFFCF6] text-[#292322] text-sm placeholder:text-[#5C5452]/40 focus:outline-none focus:ring-2 focus:ring-[#B8975E]/50 focus:border-[#B8975E] transition-all shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8E6D38] hover:text-[#7D1525] transition-colors cursor-pointer"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="reg-confirm-password"
                          className="block text-xs font-sans font-semibold uppercase tracking-wider text-[#4A3E3D]"
                        >
                          Confirm Password <span className="text-[#7D1525]">*</span>
                        </label>
                        {password && confirmPassword && (
                          <span
                            className={`text-[11px] font-sans font-medium ${
                              password === confirmPassword ? "text-[#58734C]" : "text-[#7D1525]"
                            }`}
                          >
                            {password === confirmPassword ? "✓ Match" : "Must match"}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E6D38]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                        </div>
                        <input
                          id="reg-confirm-password"
                          name="confirm_password"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          minLength={6}
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-11 py-3 min-h-[48px] rounded-xl border border-[#DFCBB5] bg-[#FFFCF6] text-[#292322] text-sm placeholder:text-[#5C5452]/40 focus:outline-none focus:ring-2 focus:ring-[#B8975E]/50 focus:border-[#B8975E] transition-all shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8E6D38] hover:text-[#7D1525] transition-colors cursor-pointer"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Mobile Number (Optional) */}
                    <div>
                      <label
                        htmlFor="reg-mobile"
                        className="block text-xs font-sans font-semibold uppercase tracking-wider text-[#4A3E3D] mb-1.5"
                      >
                        Mobile Number <span className="text-[11px] font-normal text-[#7A6F6D]">(Optional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E6D38]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        </div>
                        <input
                          id="reg-mobile"
                          name="mobile_number"
                          type="tel"
                          autoComplete="tel"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-4 py-3 min-h-[48px] rounded-xl border border-[#DFCBB5] bg-[#FFFCF6] text-[#292322] text-sm placeholder:text-[#5C5452]/40 focus:outline-none focus:ring-2 focus:ring-[#B8975E]/50 focus:border-[#B8975E] transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3.5 px-6 min-h-[50px] rounded-full bg-gradient-to-r from-[#7D1525] via-[#8C1B2E] to-[#6A1220] text-white font-sans text-xs sm:text-[13px] font-semibold uppercase tracking-[0.16em] hover:brightness-110 active:scale-[0.99] transition-all shadow-md shadow-[#7D1525]/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isPending ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Creating Guest Account...</span>
                          </>
                        ) : (
                          <>
                            <span>CREATE ACCOUNT &amp; CONTINUE</span>
                            <span aria-hidden="true">&rarr;</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#DFCBB5]/60" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#FFFDF9] px-3 font-sans text-[11px] tracking-widest text-[#7A6F6D]">
                        or
                      </span>
                    </div>
                  </div>

                  {/* Google Sign In */}
                  <GoogleSignInButton redirectTarget={redirectTarget} />

                  {/* Switch to Login */}
                  <div className="mt-7 text-center">
                    <p className="font-sans text-xs text-[#5C5452]">
                      Already have a guest account?{" "}
                      <button
                        type="button"
                        onClick={() => handleModeChange("login")}
                        className="text-[#7D1525] font-semibold hover:underline cursor-pointer"
                      >
                        Sign in here &rarr;
                      </button>
                    </p>
                  </div>
                </motion.div>
              ) : (
                /* LOGIN MODE */
                <motion.div
                  key="auth-mode-login"
                  id="auth-panel-login"
                  role="tabpanel"
                  aria-labelledby="auth-tab-login"
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-center mb-6">
                    <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#292322] tracking-tight">
                      Welcome Back
                    </h2>
                    <p className="font-serif italic text-sm text-[#5C5452] mt-1.5">
                      Sign in to continue to your wedding account and RSVP details.
                    </p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <input type="hidden" name="redirect" value={redirectTarget || "/account"} />

                    {/* Email Address */}
                    <div>
                      <label
                        htmlFor="login-email"
                        className="block text-xs font-sans font-semibold uppercase tracking-wider text-[#4A3E3D] mb-1.5"
                      >
                        Email Address <span className="text-[#7D1525]">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E6D38]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                        </div>
                        <input
                          id="login-email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="guest@example.com"
                          className="w-full pl-10 pr-4 py-3 min-h-[48px] rounded-xl border border-[#DFCBB5] bg-[#FFFCF6] text-[#292322] text-sm placeholder:text-[#5C5452]/40 focus:outline-none focus:ring-2 focus:ring-[#B8975E]/50 focus:border-[#B8975E] transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="login-password"
                          className="block text-xs font-sans font-semibold uppercase tracking-wider text-[#4A3E3D]"
                        >
                          Password <span className="text-[#7D1525]">*</span>
                        </label>
                        <Link
                          href="/forgot-password"
                          className="text-xs font-sans font-medium text-[#8E6D38] hover:text-[#7D1525] transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E6D38]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </div>
                        <input
                          id="login-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-11 py-3 min-h-[48px] rounded-xl border border-[#DFCBB5] bg-[#FFFCF6] text-[#292322] text-sm placeholder:text-[#5C5452]/40 focus:outline-none focus:ring-2 focus:ring-[#B8975E]/50 focus:border-[#B8975E] transition-all shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8E6D38] hover:text-[#7D1525] transition-colors cursor-pointer"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                        className="w-full py-3.5 px-6 min-h-[50px] rounded-full bg-gradient-to-r from-[#7D1525] via-[#8C1B2E] to-[#6A1220] text-white font-sans text-xs sm:text-[13px] font-semibold uppercase tracking-[0.16em] hover:brightness-110 active:scale-[0.99] transition-all shadow-md shadow-[#7D1525]/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isPending ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Signing In...</span>
                          </>
                        ) : (
                          <>
                            <span>SIGN IN TO YOUR ACCOUNT</span>
                            <span aria-hidden="true">&rarr;</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#DFCBB5]/60" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#FFFDF9] px-3 font-sans text-[11px] tracking-widest text-[#7A6F6D]">
                        or
                      </span>
                    </div>
                  </div>

                  {/* Google Sign In */}
                  <GoogleSignInButton redirectTarget={redirectTarget} />

                  {/* Switch to Register */}
                  {!isMemories && (
                    <div className="mt-7 text-center">
                      <p className="font-sans text-xs text-[#5C5452]">
                        First-time attending as a guest?{" "}
                        <button
                          type="button"
                          onClick={() => handleModeChange("register")}
                          className="text-[#7D1525] font-semibold hover:underline cursor-pointer"
                        >
                          Create your account &rarr;
                        </button>
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
