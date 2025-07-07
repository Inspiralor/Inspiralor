"use client";
import Image from "next/image";

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
}

export function UserAvatar({
  src,
  alt = "Profile",
  size = 40,
  className = "",
}: UserAvatarProps) {
  return (
    <Image
      src={src || "/images/Me/me.jpeg"}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover border-2 border-white shadow-md bg-white hover:scale-105 transition-transform ${className}`}
      priority
    />
  );
}
