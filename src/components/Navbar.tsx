"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";
import type {
  AuthChangeEvent,
  Session,
  UserResponse,
  User,
} from "@supabase/supabase-js";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const profileLink = user ? `/profile/${user.id}` : "/profile";

  const handleLogoClick = (e: React.MouseEvent) => {
    if (user) {
      e.preventDefault();
      router.push("/landing");
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center bg-black transition-colors px-8 md:px-32 py-4">
      <Link
        href="/"
        className="font-extrabold text-2xl tracking-wide text-white flex items-center"
        style={{ minWidth: "220px" }}
        onClick={handleLogoClick}
      >
        Inspiralor
      </Link>
      <div className="flex gap-5 text-base font-medium text-white justify-center flex-grow">
        <Link href="/about">About Us</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/projects/submit">Submit</Link>
        {user && <Link href="/my-projects">My Projects</Link>}
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link
              href={profileLink}
              className="text-white px-4 py-1 rounded text-sm font-semibold shadow-md bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 hover:from-sky-500 hover:to-indigo-700"
            >
              Profile
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/");
              }}
              className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white px-4 py-1 rounded text-sm font-semibold shadow-md hover:from-red-600 hover:to-rose-600 transition-colors"
            >
              Sign Out
            </button>
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
