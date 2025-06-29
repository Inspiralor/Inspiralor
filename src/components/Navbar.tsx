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

export default function Navbar({ isTransparent = false }: { isTransparent?: boolean }) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isTransparent) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isTransparent]);

  const showTransparent = isTransparent && !scrolled;
  const textColor = showTransparent ? 'text-white' : 'text-white';
  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 flex items-center ${showTransparent ? 'bg-transparent' : 'bg-black'} transition-colors px-8 md:px-32 py-4`}
      style={showTransparent ? { background: 'none', boxShadow: 'none', border: 'none' } : { background: 'black' }}
    >
      {/* Left: Title */}
      <Link href="/" className={`font-extrabold text-2xl tracking-wide ${textColor} flex-1 flex items-center`} style={{minWidth:'220px'}}>
        Project Graveyard
      </Link>
      {/* Center: Nav links */}
      <div className={`flex gap-6 text-base font-medium ${textColor} justify-center flex-1`}>
        <Link href="/about">About Us</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/projects/submit">Submit</Link>
      </div>
      {/* Right: Get Started */}
      <div className="flex-1 flex justify-end">
        <button
          onClick={() => router.push('/login')}
          className="bg-emerald-400 text-white px-6 py-2 rounded font-semibold hover:bg-emerald-500 transition-colors"
        >
          Get Started
        </button>
      </div>
    </nav>
  );
}
