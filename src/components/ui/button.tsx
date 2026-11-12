import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline-gold"
    | "outline-maroon"
    | "ghost"
    | "link";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[#A52232] text-white hover:bg-[#8E1B29] active:bg-[#781521] border border-transparent shadow-sm",
  secondary:
    "bg-[#F7F1E6] text-[#292322] hover:bg-[#EFE7D8] border border-[rgba(184,151,94,0.3)] hover:border-[#B8975E] shadow-sm",
  "outline-gold":
    "bg-[#FBF8F2] text-[#292322] border border-[#B8975E]/70 hover:bg-[#B8975E] hover:text-white hover:border-[#B8975E] active:bg-[#9B7D48] shadow-xs",
  "outline-maroon":
    "bg-transparent text-[#481923] border border-[#481923] hover:bg-[#481923] hover:text-white",
  ghost:
    "bg-transparent text-[#292322] hover:bg-[rgba(184,151,94,0.1)] border border-transparent",
  link:
    "bg-transparent text-[#A52232] hover:text-[#8E1B29] underline underline-offset-4 p-0 min-h-0 border-none shadow-none",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3.5 py-2 text-xs min-h-[44px]",
  md: "px-5 py-2.5 text-sm min-h-[44px]",
  lg: "px-7 py-3 text-base min-h-[48px]",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const isInteractive = !disabled && !isLoading;
    const isLinkVariant = variant === "link";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={`
          inline-flex items-center justify-center font-medium transition-all duration-200 ease-out
          rounded-[4px] select-none
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFCF6]
          ${variantStyles[variant]}
          ${isLinkVariant ? "" : sizeStyles[size]}
          ${isInteractive ? (isLinkVariant ? "cursor-pointer" : "cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]") : "opacity-50 cursor-not-allowed"}
          ${className}
        `}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";
