"use client";

import React from "react";

export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  isSuccess?: boolean;
  successText?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      children,
      isLoading = false,
      loadingText,
      isSuccess = false,
      successText,
      variant = "primary",
      size = "md",
      icon,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    // Base classes ensure touch targets >= 44px
    const baseClasses =
      "relative inline-flex items-center justify-center font-sans font-semibold rounded-full transition-all duration-200 select-none cursor-pointer disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

    const sizeClasses = {
      sm: "min-h-[44px] px-4 py-2 text-xs gap-1.5",
      md: "min-h-[44px] sm:min-h-[46px] px-5 sm:px-6 py-2.5 text-xs sm:text-sm gap-2",
      lg: "min-h-[48px] sm:min-h-[52px] px-7 py-3 text-sm sm:text-base gap-2.5",
    }[size];

    const variantClasses = {
      primary:
        "bg-gradient-to-r from-[#7D1525] via-[#9B1E30] to-[#6A1220] hover:brightness-110 text-white border border-[#D4AF37]/50 shadow-[0_6px_20px_rgba(125,21,37,0.28)] disabled:opacity-50",
      secondary:
        "bg-[#292322] hover:bg-[#3E3533] text-[#FFFDF9] border border-[#B8975E]/30 shadow-xs disabled:opacity-50",
      outline:
        "bg-white/80 hover:bg-[#F7F1E6] text-[#8E6D38] border border-[#B8975E]/40 hover:border-[#B8975E] shadow-2xs disabled:opacity-40",
      ghost:
        "bg-transparent hover:bg-[#B8975E]/10 text-[#292322]/80 hover:text-[#292322] disabled:opacity-40",
      danger:
        "bg-red-600 hover:bg-red-700 text-white border border-red-700/30 shadow-xs disabled:opacity-50",
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        aria-live="polite"
        className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="w-4 h-4 animate-spin shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <path
                className="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span>{loadingText || children}</span>
          </>
        ) : isSuccess ? (
          <>
            <svg
              className="w-4 h-4 shrink-0 text-emerald-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>{successText || children}</span>
          </>
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            <span>{children}</span>
          </>
        )}
      </button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";
