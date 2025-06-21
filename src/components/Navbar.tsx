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
      className="sticky top-0 z-30 bg-glass/80 backdrop-blur-md shadow-glass border-b border-border px-6 py-4 flex gap-6 items-center"
    >
      <Link
        href="/"
        className="font-bold text-xl text-primary hover:text-accent transition-colors"
      >
        Project Graveyard
      </Link>
      <Link href="/projects" className="hover:text-accent transition-colors">
        All Projects
      </Link>
      <Link
        href="/projects/submit"
        className="hover:text-accent transition-colors"
      >
        Submit Project
      </Link>
      <div className="flex-1" />
      {user ? (
        <>
          <Link href="/profile" className="hover:text-accent transition-colors">
            Profile
          </Link>
          <button
            onClick={handleSignOut}
            className="ml-2 px-3 py-1 rounded-xl bg-surface text-white hover:bg-accent transition-colors"
          >
            Sign Out
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className="hover:text-accent transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="hover:text-accent transition-colors">
            Sign Up
          </Link>
        </>
      )}
    </motion.nav>
  );
}
