import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navigation";
import { EditorialFooter } from "@/components/sections";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { getAuthenticatedUser } from "@/lib/supabase/auth-helpers";

export const instant = false;

export const metadata: Metadata = {
  title: "Update Password",
  description: "Set a new password for your wedding guest account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function UpdatePasswordPage() {
  const user = await getAuthenticatedUser();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FFFCF6] pt-32 pb-32 sm:pb-28 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        {user ? (
          <UpdatePasswordForm />
        ) : (
          <div className="w-full max-w-md mx-auto bg-white/90 border border-[#B8975E]/30 rounded-2xl p-8 sm:p-10 shadow-sm backdrop-blur-md text-center">
            <h1 className="font-serif text-2xl font-light text-[#292322] mb-3">
              Session Expired
            </h1>
            <p className="font-sans text-xs text-[#292322]/70 leading-relaxed mb-6">
              Your password reset session has expired or is invalid. Please
              request a new password reset link.
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#A52232] text-white hover:bg-[#8D1B29] transition-colors"
            >
              Request Reset Link
            </Link>
          </div>
        )}
      </main>
      <EditorialFooter />
    </>
  );
}
