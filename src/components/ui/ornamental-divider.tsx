import React from "react";

export interface OrnamentalDividerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "gold" | "maroon" | "sindoor" | "subtle";
  size?: "sm" | "md" | "lg" | "full";
}

const colorMap = {
  gold: "#B8975E",
  maroon: "#481923",
  sindoor: "#A52232",
  subtle: "rgba(184, 151, 94, 0.35)",
};

const widthMap = {
  sm: "max-w-[200px]",
  md: "max-w-[320px]",
  lg: "max-w-[480px]",
  full: "w-full",
};

export function OrnamentalDivider({
  variant = "gold",
  size = "md",
  className = "",
  ...props
}: OrnamentalDividerProps) {
  const color = colorMap[variant];

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={`flex items-center justify-center my-6 mx-auto ${widthMap[size]} ${className}`}
      {...props}
    >
      {/* Left Tapered Line */}
      <div
        className="flex-1 h-[1px]"
        style={{
          background: `linear-gradient(to right, transparent, ${color})`,
        }}
      />

      {/* Center Royal Indian Diamond & Mandala Motif */}
      <div className="flex items-center gap-1.5 px-3">
        <span
          className="w-1.5 h-1.5 rotate-45 transform"
          style={{ backgroundColor: color, opacity: 0.7 }}
        />
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Outer Diamond */}
          <path
            d="M12 2L22 12L12 22L2 12L12 2Z"
            stroke={color}
            strokeWidth="1.2"
          />
          {/* Inner Mandala Floret */}
          <circle cx="12" cy="12" r="3" fill={color} />
          <path
            d="M12 6V9M12 15V18M6 12H9M15 12H18"
            stroke={color}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        <span
          className="w-1.5 h-1.5 rotate-45 transform"
          style={{ backgroundColor: color, opacity: 0.7 }}
        />
      </div>

      {/* Right Tapered Line */}
      <div
        className="flex-1 h-[1px]"
        style={{
          background: `linear-gradient(to left, transparent, ${color})`,
        }}
      />
    </div>
  );
}
