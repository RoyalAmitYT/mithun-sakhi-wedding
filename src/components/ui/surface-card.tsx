import React from "react";
import { CardCornerBrackets } from "./decorative-surfaces";

export interface SurfaceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "editorial" | "soft" | "dramatic" | "outlined";
  hoverEffect?: boolean;
  withCornerBrackets?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<NonNullable<SurfaceCardProps["variant"]>, string> = {
  editorial:
    "bg-gradient-to-b from-[#FFFDF9] via-[#FAF6ED] to-[#F7F1E6] text-[#292322] border border-[#B8975E]/30 shadow-[0_12px_36px_rgba(41,35,34,0.06)]",
  soft:
    "bg-gradient-to-b from-[#FCF9EE] to-[#FAF5E6] text-[#292322] border border-[#B8975E]/35 shadow-[0_12px_40px_rgba(184,151,94,0.08)]",
  dramatic:
    "bg-gradient-to-b from-[#541A25] via-[#481923] to-[#38121A] text-white border border-[#B8975E]/40 shadow-[0_16px_48px_rgba(72,25,35,0.28)]",
  outlined:
    "bg-white/60 backdrop-blur-xs text-[#292322] border border-[#B8975E]/35 shadow-xs",
};

export function SurfaceCard({
  variant = "editorial",
  hoverEffect = false,
  withCornerBrackets = false,
  className = "",
  children,
  ...props
}: SurfaceCardProps) {
  const bracketColor = variant === "dramatic" ? "#D8BE8D" : "#B8975E";

  return (
    <div
      className={`
        relative p-6 sm:p-8 rounded-2xl transition-all duration-300 overflow-hidden
        ${variantStyles[variant]}
        ${hoverEffect ? "hover:-translate-y-0.5 hover:border-[#B8975E]/60 hover:shadow-[0_16px_48px_rgba(184,151,94,0.12)]" : ""}
        ${className}
      `}
      {...props}
    >
      {withCornerBrackets && <CardCornerBrackets color={bracketColor} />}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
