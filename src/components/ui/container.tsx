import React from "react";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  size?: "wide" | "default" | "editorial" | "reading" | "narrow";
  children: React.ReactNode;
}

const sizeClasses: Record<NonNullable<ContainerProps["size"]>, string> = {
  wide: "max-w-[1440px]",
  default: "max-w-7xl",
  editorial: "max-w-5xl",
  reading: "max-w-3xl",
  narrow: "max-w-xl",
};

export function Container({
  as: Component = "div",
  size = "default",
  className = "",
  children,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={`w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
