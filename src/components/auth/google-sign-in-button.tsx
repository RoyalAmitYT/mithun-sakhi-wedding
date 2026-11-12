"use client";

import { useState } from "react";
import { getGoogleOAuthUrl } from "@/actions/auth";

interface GoogleSignInButtonProps {
  redirectTarget?: string;
}

export function GoogleSignInButton({ redirectTarget }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  async function handleGoogleClick() {
    setLoading(true);
    setInfoMessage(null);
    try {
      const res = await getGoogleOAuthUrl(redirectTarget);
      if (res.error) {
        setInfoMessage(res.error);
        setLoading(false);
        return;
      }
      if (res.url) {
        window.location.href = res.url;
      }
    } catch {
      setInfoMessage(
        "Google sign-in is not configured in this local environment. Please use email and password."
      );
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-full border border-[#B8975E]/40 bg-white/90 text-[#292322] hover:bg-[#F7F1E6] hover:border-[#B8975E] transition-all text-sm font-medium shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-[#B8975E]/50 disabled:opacity-50"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
          />
          <path
            fill="#FBBC05"
            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
          />
        </svg>
        <span>{loading ? "Connecting to Google..." : "Continue with Google"}</span>
      </button>

      {infoMessage && (
        <p className="mt-2 text-xs text-[#A52232] text-center leading-relaxed">
          {infoMessage}
        </p>
      )}
    </div>
  );
}
