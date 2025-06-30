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

export default function Navbar({ isTransparent = false, hideGetStarted = false }: { isTransparent?: boolean, hideGetStarted?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isTransparent) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isTransparent]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  const showTransparent = isTransparent && !scrolled;
  const isWhiteNavbar = pathname === "/projects" || pathname === "/my-projects";
  const textColor = isWhiteNavbar ? 'text-black' : (showTransparent ? 'text-white' : 'text-white');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const profileLink = user ? `/profile/${user.id}` : '/profile';

  if (isWhiteNavbar) {
    return (
      <nav className="w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold text-black tracking-tight font-display">Project Graveyard</Link>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-8">
              <Link href="/about" className="text-black hover:text-accent font-semibold px-2">About Us</Link>
              <Link href="/projects" className="text-black hover:text-accent font-semibold px-2">Projects</Link>
              <Link href="/projects/submit" className="text-black hover:text-accent font-semibold px-2">Submit</Link>
              {user && <Link href="/my-projects" className="text-black hover:text-accent font-semibold px-2">My Projects</Link>}
              <Link href="/contact" className="text-black hover:text-accent font-semibold px-2">Contact</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href={profileLink} className="bg-emerald-400 text-black font-bold px-4 py-2 rounded hover:bg-emerald-500 transition-colors">Profile</Link>
                <button
                  onClick={handleSignOut}
                  className="bg-red-500 text-white font-bold px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/signup" className="bg-emerald-400 text-black font-bold px-4 py-2 rounded hover:bg-emerald-500 transition-colors">Get Started</Link>
            )}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 flex items-center ${showTransparent ? 'bg-transparent' : 'bg-black'} transition-colors px-8 md:px-32 py-4`}
      style={showTransparent ? { background: 'none', boxShadow: 'none', border: 'none' } : { background: 'black' }}
    >
      <Link href="/" className={`font-extrabold text-2xl tracking-wide ${textColor} flex-1 flex items-center`} style={{minWidth:'220px'}}>
        Project Graveyard
      </Link>
      <div className={`flex gap-6 text-base font-medium ${textColor} justify-center flex-1`}>
        <Link href="/about">About Us</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/projects/submit">Submit</Link>
        {user && <Link href="/my-projects">My Projects</Link>}
      </div>
      <div className="flex-1 flex justify-end gap-2">
        {user ? (
          <>
            <Link href={profileLink} className="bg-emerald-400 text-white px-6 py-2 rounded font-semibold hover:bg-emerald-500 transition-colors">Profile</Link>
            <button
              onClick={handleSignOut}
              className="bg-red-500 text-white px-6 py-2 rounded font-semibold hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </>
        ) : !hideGetStarted && (
          <button
            onClick={() => router.push('/login')}
            className="bg-emerald-400 text-white px-6 py-2 rounded font-semibold hover:bg-emerald-500 transition-colors"
          >
            Get Started
          </button>
        )}
      </div>
    </nav>
  );
}
