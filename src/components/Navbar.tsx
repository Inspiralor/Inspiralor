"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/UserAvatar";
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";

interface NavbarProps {
  hideGetStarted?: boolean;
}

export default function Navbar({ hideGetStarted = false }: NavbarProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  // Remove unreadCount state and all related logic

  useEffect(() => {
    if (!user) {
      setProfileImage(null);
      return;
    }
    let isMounted = true;
    supabase
      .from("profiles")
      .select("profile_image")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (isMounted) setProfileImage(data?.profile_image || null);
      });
    // Remove unreadCount state and all related logic
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Optionally, poll for unread count every 10 seconds
  // Remove unreadCount state and all related logic
  useEffect(() => {
    if (!user) return;
    // Remove unreadCount state and all related logic
  }, [user]);

  const profileLink = user ? `/profile/${user.id}` : "/profile";

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push("/landing");
    } else {
      router.push("/");
    }
  };

  if (loading) return null;
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black transition-colors px-4 md:px-16 py-3 flex items-center justify-between">
      {/* Left: Nav Items */}
      <div className="flex items-center gap-5 min-w-[220px]">
        {!user && (
          <Link
            href="/about"
            className="text-white font-medium text-base hover:underline"
          >
            About Us
          </Link>
        )}
        <Link
          href="/projects"
          className="text-white font-medium text-base hover:underline"
        >
          Projects
        </Link>
        {user && (
          <>
            <Link
              href="/my-projects"
              className="text-white font-medium text-base hover:underline"
            >
              My Projects
            </Link>
            <Link
              href="/adopted-projects"
              className="text-white font-medium text-base hover:underline"
            >
              Adopted Projects
            </Link>
          </>
        )}
        <Link
          href="/projects/submit"
          className="text-white font-medium text-base hover:underline"
        >
          Submit
        </Link>
        {user && (
          <Link
            href="/messages"
            className="text-white font-medium text-base hover:underline"
          >
            Messages
          </Link>
        )}
      </div>
      {/* Center: Title */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
        <Link
          href="/"
          className="font-extrabold text-2xl tracking-wide text-white flex items-center"
          style={{ minWidth: "220px" }}
          onClick={handleLogoClick}
        >
          Inspiralor
        </Link>
      </div>
      {/* Right: Auth/Profile Actions */}
      <div className="flex items-center gap-4 min-w-[160px] justify-end">
        {user ? (
          <>
            <Link href={profileLink} className="flex items-center">
              {profileImage !== null ? (
                <UserAvatar src={profileImage} size={40} />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              )}
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/");
              }}
              className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white px-4 py-2 rounded text-sm font-semibold shadow-md hover:from-red-600 hover:to-rose-600 transition-colors flex items-center gap-2"
            >
              Logout <FaSignOutAlt size={14} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push("/login")}
              className="text-white px-4 py-2 rounded text-sm font-semibold shadow-md bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:to-pink-600 flex items-center gap-2"
            >
              Login <FaSignInAlt size={14} />
            </button>
            {!hideGetStarted && (
              <button
                onClick={() => router.push("/signup")}
                className="bg-emerald-400 hover:bg-emerald-500 transition-colors text-white px-3 py-2 rounded text-sm font-semibold shadow-md"
              >
                Get Started
              </button>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
