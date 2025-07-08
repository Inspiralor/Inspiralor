"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import Navbar from "@/components/Navbar";

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    // Fetch all messages where user is sender or recipient
    const fetchConversations = async () => {
      // Get all rooms the user is part of
      const { data: messages } = await supabase
        .from("messages")
        .select("room, sender_id, sender_name, text, timestamp")
        .or(`sender_id.eq.${user.id},room.ilike.%${user.id}%`)
        .order("timestamp", { ascending: false });
      if (!messages) {
        setConversations([]);
        setLoading(false);
        return;
      }
      // Group by room, keep only latest message per room
      const roomMap: Record<string, any> = {};
      for (const msg of messages) {
        if (!roomMap[msg.room]) {
          roomMap[msg.room] = msg;
        }
      }
      // Sort by latest message timestamp
      const sorted = Object.values(roomMap).sort(
        (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setConversations(sorted);
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-black p-6 border-b">Messages</h1>
          {loading ? (
            <div className="p-6 text-center text-muted">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-muted">No messages yet.</div>
          ) : (
            <ul className="divide-y">
              {conversations.map((conv, i) => {
                // Figure out the other user's name from the room and sender
                const ids = conv.room.split("-");
                const otherId = ids.find((id: string) => id !== user.id);
                const isOwnMsg = conv.sender_id === user.id;
                return (
                  <li
                    key={conv.room}
                    className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => router.push(`/chat/${otherId}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-base truncate">
                          {isOwnMsg ? "You" : conv.sender_name || "User"}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {conv.timestamp ? new Date(conv.timestamp).toLocaleString() : ""}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {conv.text}
                      </div>
                    </div>
                    {/* Placeholder for notification badge */}
                    <div className="ml-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
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