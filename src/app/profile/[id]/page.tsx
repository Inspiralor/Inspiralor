"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  name: string;
  unique_id: string;
  email?: string;
};

export default function UserProfileViewPage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      // Try to fetch by unique_id first
      let { data, error } = await supabase
        .from("profiles")
        .select("name, unique_id, email")
        .eq("unique_id", id)
        .single();
      // If not found, try by id
      if ((!data || error) && id) {
        const res = await supabase
          .from("profiles")
          .select("name, unique_id, email")
          .eq("id", id)
          .single();
        data = res.data;
        error = res.error;
      }
      setLoading(false);
      if (error || !data) {
        setError("User not found.");
        return;
      }
      setProfile(data);
    };
    if (id) fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </main>
    );
  }
  if (error || !profile) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error || "User not found."}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-surface to-primary/30 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md rounded-xl bg-glass shadow-glass p-8 border border-gold backdrop-blur-md">
        <h1 className="text-2xl font-bold mb-4 text-primary font-display text-center">
          User Profile
        </h1>
        <div className="mb-2 text-lg text-gold font-mono text-center">
          {profile.name}
        </div>
        <div className="mb-2 text-center">
          ID: <span className="font-mono">{profile.unique_id}</span>
        </div>
        {profile.email && (
          <div className="mb-2 text-center">
            Email: <span className="font-mono">{profile.email}</span>
          </div>
        )}
      </div>
    </main>
  );
}
