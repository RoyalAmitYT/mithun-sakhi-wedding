import React, { useId } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className = "", disabled, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold tracking-wider uppercase text-[#292322]"
          >
            {label}
            {props.required && (
              <span className="text-[#A52232] ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={`
            w-full px-4 py-2.5 text-sm rounded-[4px] bg-white text-[#292322]
            border transition-colors duration-200 min-h-[44px]
            placeholder:text-[#8A8280]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E] focus-visible:border-[#B8975E]
            ${
              error
                ? "border-[#A52232] focus-visible:ring-[#A52232]"
                : "border-[rgba(184,151,94,0.3)] hover:border-[rgba(184,151,94,0.6)]"
            }
            ${disabled ? "opacity-50 cursor-not-allowed bg-[#F7F1E6]" : ""}
            ${className}
          `}
          {...props}
        />

        {error && (
          <p id={errorId} role="alert" className="text-xs text-[#A52232] mt-0.5">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="text-xs text-[#5C5452] mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
