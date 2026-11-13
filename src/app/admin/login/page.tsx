import React from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navigation";
import { EditorialFooter } from "@/components/sections";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { SectionHeaderFiligree } from "@/components/ui/decorative-surfaces";
import { getAdminContext } from "@/lib/supabase/auth-helpers";

export const instant = false;

export const metadata: Metadata = {
  title: "Executive Sign In | Admin Portal",
  description: "Secure administrative sign-in portal for wedding management and operations.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage(props: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  await connection();
  const searchParams = await props.searchParams;

  // If already authenticated with active administrator privileges, redirect directly to dashboard
  const adminCtx = await getAdminContext();
  if (adminCtx) {
    redirect(searchParams.redirect || "/admin");
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB] pt-28 sm:pt-36 pb-28 sm:pb-36 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden">
        {/* Soft Decorative Filigree Background */}
        <SectionHeaderFiligree color="#B8975E" opacity={0.16} />

        {/* Ambient Warm Golden Glow */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.07)_0%,rgba(184,151,94,0.02)_60%,transparent_80%)]" />
        </div>

        <div className="relative z-10 w-full py-4">
          <AdminLoginForm
            redirectTarget={searchParams.redirect}
            initialError={searchParams.error}
          />
        </div>
      </main>

      <EditorialFooter />
    </>
  );
}
