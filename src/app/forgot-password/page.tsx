import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/navigation";
import { EditorialFooter } from "@/components/sections";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description:
    "Request password reset instructions for your wedding guest account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FFFCF6] pt-32 pb-32 sm:pb-28 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <ForgotPasswordForm />
      </main>
      <EditorialFooter />
    </>
  );
}
