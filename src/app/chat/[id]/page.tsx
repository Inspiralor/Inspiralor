"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";

let socket: Socket | null = null;

export default function DirectChatPage() {
  const { id: otherUserId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [userName, setUserName] = useState<string>("You");
  const [otherUser, setOtherUser] = useState<{
    id: string;
    name: string;
    profile_image: string | null;
  } | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [otherUserName, setOtherUserName] = useState<string>("");

  useEffect(() => {
    if (otherUserId) {
      supabase
        .from("profiles")
        .select("id, name, profile_image")
        .eq("id", otherUserId)
        .single()
        .then(({ data }) => {
          if (data) setOtherUser({ id: data.id, name: data.name || "User", profile_image: data.profile_image || "/images/Me/me.jpeg" });
        });
    }
  }, [otherUserId]);

  useEffect(() => {
    if (user && otherUserId) {
      // Ensure otherUserId is a full UUID
      let resolvedOtherUserId = otherUserId;
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      (async () => {
        if (!uuidRegex.test(otherUserId)) {
          // Look up by unique_id
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("unique_id", otherUserId)
            .single();
          if (profile && profile.id) {
            resolvedOtherUserId = profile.id;
          }
        }
        // Always use the full UUID for both users
        const ids = [user.id, resolvedOtherUserId].sort();
        const user1_id = ids[0];
        const user2_id = ids[1];
        let { data: room, error } = await supabase
          .from("rooms")
          .select("id")
          .eq("user1_id", user1_id)
          .eq("user2_id", user2_id)
          .single();
        if (!room) {
          // Create the room if it doesn't exist
          const { data: newRoom, error: createError } = await supabase
            .from("rooms")
            .insert([{ user1_id, user2_id }])
            .select("id")
            .single();
          room = newRoom;
        }
        setRoomId(room.id);
        if (!socket) {
          socket = io();
        }
        socket.emit("join", room.id);
        // Fetch chat history from Supabase
        const { data: messages } = await supabase
          .from("messages")
          .select("sender_name, text, timestamp, sender_id, room_id")
          .eq("room_id", room.id)
          .order("timestamp", { ascending: true });
        if (messages) {
          setMessages(
            messages.map((m: any) => ({
              user: m.sender_name,
              text: m.text,
              timestamp: m.timestamp,
              sender_id: m.sender_id,
              room_id: m.room_id,
            }))
          );
        }
        socket.on(
          "chat message",
          (msg: { user: string; text: string; room_id: string; timestamp?: string; sender_id?: string }) => {
            if (msg.room_id === room.id) {
              setMessages((prev) => {
                if (prev.some(m => m.timestamp === msg.timestamp && m.sender_id === msg.sender_id)) return prev;
                return [...prev, { user: msg.user, text: msg.text, timestamp: msg.timestamp, sender_id: msg.sender_id }];
              });
            }
          }
        );
      })();
      return () => {
        if (roomId) socket?.emit("leave", roomId);
        socket?.off("chat message");
      };
    }
  }, [user, otherUserId]);

  useEffect(() => {
    if (!user) return;
    // Fetch profile for name
    supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setUserName(data?.name || "You");
      });
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !roomId) return;
    const now = new Date().toISOString();
    await supabase.from("messages").insert([
      {
        room_id: roomId,
        sender_id: user.id,
        sender_name: userName || "You",
        text: input,
        timestamp: now,
      },
    ]);
    socket?.emit("chat message", { user: userName || "You", text: input, room_id: roomId, timestamp: now, sender_id: user.id });
    setInput("");
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-surface to-primary/30 pt-24 px-4">
        <div className="w-full max-w-xl bg-glass rounded-xl shadow-lg border border-border p-6 flex flex-col h-[70vh]">
          <h2 className="text-2xl font-bold mb-2 text-primary flex items-center gap-3">
            <UserAvatar src={otherUser?.profile_image} size={40} />
            Chat with {otherUser?.name || otherUserName || "User"}
          </h2>
          <div className="text-xs text-gray-500 mb-4">
            Room: {roomId}
          </div>
          <div
            className="flex-1 overflow-y-auto mb-4 bg-black bg-opacity-30 rounded p-3"
            style={{ minHeight: 0 }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-2 flex ${
                  msg.user === userName ? "justify-end" : "justify-start"
                }`}
              >
                {/* Show avatar for received messages */}
                {msg.user !== userName && (
                  <div className="mr-2 flex-shrink-0">
                    <UserAvatar src={otherUser?.profile_image} size={32} />
                  </div>
                )}
                <div className="flex flex-col max-w-[70%]">
                  {/* Sender name above the message, small font */}
                  <span className="block text-xs font-bold mb-1 text-gray-500">
                    {msg.user === userName ? "You" : msg.user}
                  </span>
                  <span
                    className={`inline-block px-4 py-2 rounded-lg break-words shadow ${
                      msg.user === userName
                        ? "bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    {msg.text}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-surface text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!user}
            />
            <button
              type="submit"
              className="bg-primary text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-white hover:text-primary transition-colors"
              disabled={!user || !input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
