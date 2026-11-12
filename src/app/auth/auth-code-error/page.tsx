import Link from "next/link";
import type { Metadata } from "next";

export const instant = false;

export const metadata: Metadata = {
  title: "Authentication Error | Mithun & Sakhi Wedding",
  description: "An error occurred during authentication verification.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AuthCodeErrorPage(props: {
  searchParams: Promise<{ error?: string; description?: string }>;
}) {
  const searchParams = await props.searchParams;
  const description =
    searchParams.description ||
    searchParams.error ||
    "The authentication link has expired or is invalid. Please request a new verification or sign-in link.";

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white/80 border border-[#B8975E]/30 rounded-2xl p-8 shadow-sm backdrop-blur-md text-center">
        <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-[#A52232]/10 border border-[#A52232]/30 flex items-center justify-center text-[#A52232]">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#292322] mb-3">
          Verification Link Expired
        </h1>

        <p className="font-sans text-sm text-[#292322]/70 leading-relaxed mb-8">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#A52232] text-white hover:bg-[#8D1B29] transition-colors"
          >
            Return to Login
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-[#B8975E]/40 text-[#292322] hover:bg-[#F7F1E6] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
