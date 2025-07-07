"use client";

export function ErrorMessage({
  message,
  className = "",
}: {
  message: string;
  className?: string;
}) {
  if (!message) return null;
  return (
    <div className={`text-red-500 font-semibold text-sm ${className}`}>
      {message}
    </div>
  );
}
