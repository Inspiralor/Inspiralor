"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        // Fetch profile image from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("profile_image")
          .eq("id", data.user.id)
          .single();
        setProfileImage(profile?.profile_image || null);
      } else {
        setProfileImage(null);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("profile_image")
            .eq("id", session.user.id)
            .single();
          setProfileImage(profile?.profile_image || null);
        } else {
          setProfileImage(null);
        }
      }
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const profileLink = user ? `/profile/${user.id}` : "/profile";

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push("/landing");
    } else {
      router.push("/");
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black transition-colors px-4 md:px-16 py-3 flex items-center justify-between">
      {/* Left: Nav Items */}
      <div className="flex items-center gap-5 min-w-[220px]">
        <Link
          href="/about"
          className="text-white font-medium text-base hover:underline"
        >
          About Us
        </Link>
        <Link
          href="/projects"
          className="text-white font-medium text-base hover:underline"
        >
          Projects
        </Link>
        <Link
          href="/projects/submit"
          className="text-white font-medium text-base hover:underline"
        >
          Submit
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
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/");
              }}
              className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white px-4 py-1 rounded text-sm font-semibold shadow-md hover:from-red-600 hover:to-rose-600 transition-colors"
            >
              Sign Out
            </button>
            <Link href={profileLink} className="flex items-center">
              <Image
                src={profileImage || "/images/Me/me.jpeg"}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full object-cover border-2 border-white shadow-md bg-white hover:scale-105 transition-transform"
                priority
              />
            </Link>
          </>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="text-white px-4 py-1 rounded text-sm font-semibold shadow-md bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:to-pink-600"
          >
            Get Started
          </button>
        )}
      </div>
    </nav>
  );
}
