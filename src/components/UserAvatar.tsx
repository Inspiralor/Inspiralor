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
    <div
      style={{ width: size, height: size }}
      className={`rounded-full overflow-hidden border-2 border-white shadow-md bg-white flex items-center justify-center ${className}`}
    >
      <Image
        src={src || "/images/Me/me.jpeg"}
        alt={alt}
        width={size}
        height={size}
        className="object-cover w-full h-full"
        priority
      />
    </div>
  );
}
