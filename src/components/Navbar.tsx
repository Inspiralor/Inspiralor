"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/UserAvatar";
import { useCallback } from "react";

export default function Navbar() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    // Get all rooms for the user
    const { data: rooms } = await supabase
      .from("rooms")
      .select("id")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
    if (!rooms || rooms.length === 0) {
      setUnreadCount(0);
      return;
    }
    const roomIds = rooms.map((r: any) => r.id);
    // Get last read timestamps
    const { data: reads } = await supabase
      .from("message_reads")
      .select("room_id, last_read_timestamp")
      .eq("user_id", user.id);
    const lastReadMap: Record<string, string> = {};
    (reads || []).forEach((r: any) => {
      lastReadMap[r.room_id] = r.last_read_timestamp;
    });
    // Get unread messages
    const { data: messages } = await supabase
      .from("messages")
      .select("room_id, timestamp, sender_id")
      .in("room_id", roomIds);
    let count = 0;
    (messages || []).forEach((msg: any) => {
      if (msg.sender_id === user.id) return; // Don't count own messages
      const lastRead = lastReadMap[msg.room_id];
      if (!lastRead || new Date(msg.timestamp) > new Date(lastRead)) {
        count++;
      }
    });
    setUnreadCount(count);
  }, [user]);

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
    fetchUnreadCount();
    return () => {
      isMounted = false;
    };
  }, [user, fetchUnreadCount]);

  // Optionally, poll for unread count every 10 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

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
            className="relative text-white font-medium text-base hover:underline"
          >
            Messages
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 flex items-center justify-center min-w-[20px] min-h-[20px] border-2 border-black">
                {unreadCount}
              </span>
            )}
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
              {profileImage !== null ? (
                <UserAvatar src={profileImage} size={40} />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              )}
            </Link>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push("/login")}
              className="text-white px-4 py-1 rounded text-sm font-semibold shadow-md bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:to-pink-600"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="text-white px-4 py-1 rounded text-sm font-semibold shadow-md bg-gradient-to-r from-emerald-500 via-green-600 to-lime-500 hover:from-emerald-600 hover:to-lime-600 ml-2"
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
