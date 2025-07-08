"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthContext";

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
  const [messages, setMessages] = useState<{ user: string; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState<string | null>(null);

  useEffect(() => {
    if (otherUserId) {
      supabase
        .from("profiles")
        .select("id, name")
        .eq("id", otherUserId)
        .single()
        .then(({ data }) => {
          if (data) setOtherUser({ id: data.id, name: data.name || "User" });
        });
    }
  }, [otherUserId]);

  useEffect(() => {
    if (user && otherUserId) {
      // Create a unique room for the two users (sorted ids)
      const roomName = [user.id, otherUserId].sort().join("-");
      setRoom(roomName);
      if (!socket) {
        socket = io();
      }
      socket.emit("join", roomName);
      socket.on(
        "chat message",
        (msg: { user: string; text: string; room: string }) => {
          if (msg.room === roomName) {
            setMessages((prev) => [
              ...prev,
              { user: msg.user, text: msg.text },
            ]);
          }
        }
      );
      // Fetch chat history from Supabase
      (async () => {
        const { data, error } = await supabase
          .from("messages")
          .select("sender_name, text, timestamp")
          .eq("room", roomName)
          .order("timestamp", { ascending: true });
        if (data) {
          setMessages(
            data.map((m: any) => ({ user: m.sender_name, text: m.text }))
          );
        }
      })();
      return () => {
        socket?.emit("leave", roomName);
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
    if (!input.trim() || !user || !room) return;
    const msg = { user: userName || "You", text: input };
    // Save to Supabase
    await supabase.from("messages").insert([
      {
        room,
        sender_id: user.id,
        sender_name: userName || "You",
        text: input,
        // timestamp will default to now()
      },
    ]);
    // Emit via socket.io
    socket?.emit("chat message", { ...msg, room });
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-surface to-primary/30 pt-24 px-4">
        <div className="w-full max-w-xl bg-glass rounded-xl shadow-lg border border-border p-6 flex flex-col h-[70vh]">
          <h2 className="text-2xl font-bold mb-4 text-primary">
            Chat with {otherUser?.name || "User"}
          </h2>
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
                <span
                  className={`inline-block px-4 py-2 rounded-lg max-w-[70%] break-words shadow ${
                    msg.user === userName
                      ? "bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white"
                      : "bg-white text-black"
                  }`}
                >
                  <span className="block text-xs font-bold mb-1">
                    {msg.user === userName ? "You" : msg.user}
                  </span>
                  {msg.text}
                </span>
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
