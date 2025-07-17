"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import Navbar from "@/components/Navbar";
import { UserAvatar } from "@/components/UserAvatar";

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [profileImages, setProfileImages] = useState<Record<string, string>>(
    {}
  );
  // Add state for other user names
  const [otherUserNames, setOtherUserNames] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      // Get all rooms where the user is a participant
      const { data: rooms } = await supabase
        .from("rooms")
        .select("id, user1_id, user2_id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
      if (!rooms) {
        setConversations([]);
        setLoading(false);
        return;
      }
      // For each room, fetch the latest message
      const roomIds = rooms.map((r: any) => r.id);
      let latestMessages: any[] = [];
      if (roomIds.length > 0) {
        const { data: messages } = await supabase
          .from("messages")
          .select("room_id, sender_id, sender_name, text, timestamp")
          .in("room_id", roomIds)
          .order("timestamp", { ascending: false });
        // For each room, keep only the latest message
        const msgMap: Record<string, any> = {};
        for (const msg of messages || []) {
          if (!msgMap[msg.room_id]) {
            msgMap[msg.room_id] = msg;
          }
        }
        latestMessages = Object.values(msgMap);
      }
      // Merge room info with latest message
      const conversations = rooms
        .map((room: any) => {
          const msg = latestMessages.find((m: any) => m.room_id === room.id);
          return {
            room_id: room.id,
            user1_id: room.user1_id,
            user2_id: room.user2_id,
            ...msg,
          };
        })
        .filter((c: any) => c.text); // Only show rooms with messages
      // Sort by latest message timestamp
      conversations.sort(
        (a: any, b: any) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setConversations(conversations);
      setLoading(false);
      // Fetch profile images for other users
      const otherUserIds = conversations.map((conv: any) =>
        conv.user1_id === user.id ? conv.user2_id : conv.user1_id
      );
      if (otherUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, profile_image, name")
          .in("id", otherUserIds);
        const imgMap: Record<string, string> = {};
        const nameMap: Record<string, string> = {};
        (profiles || []).forEach((p: any) => {
          imgMap[p.id] = p.profile_image || "/images/Me/me.jpeg";
          nameMap[p.id] = p.name || "User";
        });
        setProfileImages(imgMap);
        setOtherUserNames(nameMap);
      }
    };
    fetchConversations();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Please sign in to view your messages.
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-24 pb-10 text-black">
        <section className="max-w-2xl mx-auto bg-white rounded-xl shadow border p-0">
          <h1 className="text-2xl font-bold text-black p-6 border-b">
            Messages
          </h1>
          {loading ? (
            <div className="p-6 text-center text-muted">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="text-muted text-center py-12 text-xs">
              No messages yet.
            </div>
          ) : (
            <ul className="divide-y">
              {conversations.map((conv, i) => {
                // The other user is the one that is not the current user
                const otherId =
                  conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
                // In the conversation list, always show the other user's actual name
                const otherName = otherUserNames[otherId] || "User";
                return (
                  <li
                    key={conv.room_id}
                    className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => router.push(`/chat/${otherId}`)}
                  >
                    {/* Always show the other user's avatar */}
                    {profileImages[otherId] ? (
                      <UserAvatar src={profileImages[otherId]} size={40} />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-base truncate">
                          {otherName}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {conv.timestamp
                            ? new Date(conv.timestamp).toLocaleString()
                            : ""}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {conv.text}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
