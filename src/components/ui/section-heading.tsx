import React from "react";
import { SectionKicker, SectionKickerProps } from "./section-kicker";
import { OrnamentalDivider } from "./ornamental-divider";

export interface SectionHeadingProps
  extends React.HTMLAttributes<HTMLDivElement> {
  kicker?: string;
  kickerVariant?: SectionKickerProps["variant"];
  title: string;
  subtitle?: string;
  align?: "center" | "left" | "right";
  withDivider?: boolean;
}

const alignStyles = {
  center: "text-center items-center",
  left: "text-left items-start",
  right: "text-right items-end",
};

export function SectionHeading({
  kicker,
  kickerVariant = "gold",
  title,
  subtitle,
  align = "center",
  withDivider = false,
  className = "",
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={`flex flex-col ${alignStyles[align]} ${className}`}
      {...props}
    >
      {kicker && (
        <div className="mb-3">
          <SectionKicker variant={kickerVariant}>{kicker}</SectionKicker>
        </div>
      )}

      <h2
        className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight leading-[1.15]"
        style={{ color: "#292322" }}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className="mt-4 text-base sm:text-lg font-sans max-w-2xl leading-relaxed"
          style={{ color: "#5C5452" }}
        >
          {subtitle}
        </p>
      )}

      {withDivider && (
        <div className="w-full mt-2">
          <OrnamentalDivider size="sm" />
        </div>
      )}
    </div>
  );
}
