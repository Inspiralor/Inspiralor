"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function UserSearchPage() {
  const [input, setInput] = useState("");
  const [user, setUser] = useState<{ name: string; unique_id: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<{ name: string; unique_id: string }[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUser(null);
    setUsers([]);
    // Search by contains (ilike) for all fields
    const { data, error } = await supabase
      .from("profiles")
      .select("name, unique_id")
      .or(
        `unique_id.ilike.%${input}%,id.ilike.%${input}%,email.ilike.%${input}%,name.ilike.%${input}%`
      );
    setLoading(false);
    if (error || !data || data.length === 0) {
      setError("User not found.");
      return;
    }
    if (data.length === 1) {
      setUser(data[0]);
    } else {
      setUsers(data);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-surface to-primary/30 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md rounded-xl bg-glass shadow-glass p-8 border border-gold backdrop-blur-md">
        <h1 className="text-2xl font-bold mb-4 text-primary font-display text-center">
          User Search
        </h1>
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter user ID"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border border-gold bg-surface/60 rounded-xl px-4 py-2 text-white placeholder:text-muted text-lg"
            required
          />
          <button
            type="submit"
            className="bg-gold text-primary font-bold px-4 py-2 rounded-xl hover:bg-accent transition-colors"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {user && (
          <div className="mt-4 text-center">
            <Link
              href={`/profile/${user.unique_id}`}
              className="text-xl text-gold hover:underline font-mono"
            >
              {user.name} ({user.unique_id})
            </Link>
          </div>
        )}
        {users.length > 1 && (
          <div className="mt-4">
            <div className="mb-2 text-primary font-semibold">
              Multiple users found:
            </div>
            <ul className="space-y-2">
              {users.map((u) => (
                <li key={u.unique_id} className="text-center">
                  <Link
                    href={`/profile/${u.unique_id}`}
                    className="text-gold hover:underline font-mono text-lg"
                  >
                    {u.name} ({u.unique_id})
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
