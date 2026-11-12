import React from "react";

export interface SectionKickerProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "gold" | "sindoor" | "maroon" | "framed";
  showDiamonds?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<NonNullable<SectionKickerProps["variant"]>, string> = {
  gold: "text-[#B8975E]",
  sindoor: "text-[#A52232]",
  maroon: "text-[#481923]",
  framed:
    "text-[#B8975E] bg-white border border-[rgba(184,151,94,0.35)] px-3 py-1 rounded-[2px] shadow-sm",
};

export function SectionKicker({
  variant = "gold",
  showDiamonds = true,
  className = "",
  children,
  ...props
}: SectionKickerProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase select-none ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {showDiamonds && (
        <span className="text-[8px] opacity-75" aria-hidden="true">
          ◆
        </span>
      )}
      <span>{children}</span>
      {showDiamonds && (
        <span className="text-[8px] opacity-75" aria-hidden="true">
          ◆
        </span>
      )}
    </span>
  );
}
