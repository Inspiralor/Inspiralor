"use client";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

const base =
  "rounded px-4 py-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";
const variants = {
  primary:
    "bg-primary text-white hover:bg-accent focus:ring-primary border border-primary",
  secondary:
    "bg-gray-200 text-black hover:bg-gray-300 focus:ring-gray-400 border border-gray-300",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-red-700",
  outline:
    "bg-transparent text-black border border-gray-400 hover:bg-gray-100 focus:ring-gray-400",
};
const sizes = {
  sm: "text-xs py-1 px-3",
  md: "text-sm py-2 px-4",
  lg: "text-base py-3 px-6",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      className = "",
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full align-middle" />
      ) : null}
      {children}
    </button>
  )
);
Button.displayName = "Button";
