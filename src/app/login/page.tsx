import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/navigation";
import { EditorialFooter } from "@/components/sections";
import { UnifiedAuthCard, type AuthMode } from "@/components/auth/unified-auth-card";
import { SectionHeaderFiligree } from "@/components/ui/decorative-surfaces";

export const instant = false;

export const metadata: Metadata = {
  title: "Guest Sign In & Registration — Mithun & Sakhi",
  description:
    "Sign in or register for your private wedding guest account to manage family members and confirm RSVPs for Mithun & Sakhi's celebrations.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage(props: {
  searchParams: Promise<{ redirect?: string; mode?: string }>;
}) {
  const searchParams = await props.searchParams;
  const initialMode: AuthMode = searchParams.mode === "register" ? "register" : "login";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB] pt-32 sm:pt-36 pb-32 sm:pb-36 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden">
        {/* Background Corner Filigree */}
        <SectionHeaderFiligree color="#B8975E" opacity={0.16} />

        {/* Subtle Ambient Golden Glow in Background */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.08)_0%,rgba(184,151,94,0.02)_60%,transparent_80%)]" />
        </div>

        <div className="relative z-10 w-full">
          <UnifiedAuthCard
            initialMode={initialMode}
            redirectTarget={searchParams.redirect}
          />
        </div>
      </main>
      <EditorialFooter />
    </>
  );
}
