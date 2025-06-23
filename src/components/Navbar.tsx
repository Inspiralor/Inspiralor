"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import type {
  AuthChangeEvent,
  Session,
  UserResponse,
} from "@supabase/supabase-js";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
      }
    );
    supabase.auth
      .getUser()
      .then(({ data }: UserResponse) => setUser(data?.user ?? null));
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="sticky top-0 z-30 bg-gradient-to-r from-primary via-bluegray to-secondary/80 backdrop-blur-lg shadow-glass border-b border-gold px-10 py-6 flex gap-10 items-center min-h-[90px]"
    >
      <div className="flex items-center gap-4">
        <Image
          src="/images/Icon.jpeg"
          alt="Logo"
          width={56}
          height={56}
          className="rounded-full border-4 border-gold shadow-lg bg-white"
        />
        <Link
          href="/"
          className="font-extrabold text-3xl md:text-4xl text-accent font-display tracking-wide drop-shadow-lg focus:outline-none"
        >
          Project Graveyard
        </Link>
      </div>
      <Link
        href="/projects"
        className="hover:text-highlight text-lg font-semibold transition-colors px-3 py-2 rounded-xl hover:bg-accent/20"
      >
        All Projects
      </Link>
      <Link
        href="/projects/submit"
        className="hover:text-highlight text-lg font-semibold transition-colors px-3 py-2 rounded-xl hover:bg-accent/20"
      >
        Submit Project
      </Link>
      <div className="flex-1" />
      {user ? (
        <>
          <Link
            href="/my-projects"
            className="hover:text-highlight text-lg font-semibold transition-colors px-3 py-2 rounded-xl hover:bg-accent/20"
          >
            My Projects
          </Link>
          <Link
            href="/profile"
            className="hover:text-highlight text-lg font-semibold transition-colors px-3 py-2 rounded-xl hover:bg-accent/20"
          >
            Profile
          </Link>
          <Link
            href="/user-search"
            className="hover:text-highlight text-lg font-semibold transition-colors px-3 py-2 rounded-xl hover:bg-accent/20"
          >
            User Search
          </Link>
          <button
            onClick={handleSignOut}
            className="ml-2 px-4 py-2 rounded-xl bg-dark text-accent font-bold hover:bg-gold hover:text-primary transition-colors shadow-md border border-gold"
          >
            Sign Out
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="hover:text-highlight text-lg font-semibold transition-colors px-3 py-2 rounded-xl hover:bg-accent/20"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="hover:text-highlight text-lg font-semibold transition-colors px-3 py-2 rounded-xl hover:bg-accent/20"
          >
            Sign Up
          </Link>
        </>
      )}
    </motion.nav>
  );
}
