"use client";

export function LoadingSpinner({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-block animate-spin border-2 border-primary border-t-transparent rounded-full align-middle ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
