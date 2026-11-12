"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for diagnosis in development
    console.error("Application error captured:", error);
  }, [error]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-md mx-auto flex flex-col items-center">
        <span
          className="text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded border"
          style={{
            borderColor: "rgba(165, 34, 50, 0.4)",
            color: "#A52232",
            backgroundColor: "#FFFFFF",
          }}
        >
          Application Error
        </span>
        <h1
          className="text-3xl font-semibold mb-4"
          style={{ color: "#292322" }}
        >
          Something Went Wrong
        </h1>
        <p
          className="text-sm leading-relaxed mb-8"
          style={{ color: "#292322", opacity: 0.8 }}
        >
          An unexpected error occurred. Please try again.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded transition-opacity cursor-pointer"
          style={{
            backgroundColor: "#A52232",
            color: "#FFFFFF",
          }}
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
