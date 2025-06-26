"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  id: string;
  name: string;
  unique_id: string;
  email?: string;
  bio?: string;
  interests?: string;
  portfolio_links?: string[];
  profile_image?: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
  x?: string;
  facebook?: string;
  [key: string]: string | string[] | undefined;
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
      console.log("Profile page param id:", id);
      // Try to fetch by unique_id first
      let { data, error } = await supabase
        .from("profiles")
        .select(
          "id, name, unique_id, email, bio, interests, portfolio_links, profile_image, github, linkedin, instagram, x, facebook"
        )
        .eq("unique_id", id)
        .single();
      if (error) {
        console.error("Supabase error (unique_id):", error);
      }
      // If not found, try by id
      if ((!data || error) && id) {
        const res = await supabase
          .from("profiles")
          .select(
            "id, name, unique_id, email, bio, interests, portfolio_links, profile_image, github, linkedin, instagram, x, facebook"
          )
          .eq("id", id)
          .single();
        data = res.data;
        error = res.error;
        if (error) {
          console.error("Supabase error (id):", error);
        }
      }
      setLoading(false);
      if (error || !data) {
        setError("User not found.");
        return;
      }
      setProfile(data);
      console.log("Fetched profile:", data);
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

  // Socials array for rendering
  const SOCIALS = [
    { key: "github", label: "GitHub" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "instagram", label: "Instagram" },
    { key: "x", label: "X" },
    { key: "facebook", label: "Facebook" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-surface to-primary/30 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-2xl rounded-xl bg-glass shadow-glass p-8 border border-gold backdrop-blur-md flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-12 items-center w-full">
          <div className="relative w-40 h-40">
            <img
              src={profile.profile_image || "/images/Icon.jpeg"}
              alt="Profile"
              className="rounded-full object-cover border-4 border-gold shadow-lg bg-white w-40 h-40"
            />
          </div>
          <div className="flex-1 flex flex-col gap-3 text-lg">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <span className="text-3xl font-bold text-primary font-display">
                {profile.name ? profile.name : "Profile"}
              </span>
              <span className="ml-4 px-3 py-1 rounded-full bg-bluegray/20 border border-gold text-gold text-sm font-mono">
                ID: {profile.unique_id || profile.id?.slice(0, 8)}
              </span>
            </div>
            <div className="text-accent text-base">
              Email: <span className="font-mono">{profile.email}</span>
            </div>
            <div className="mb-2">
              <strong>Bio:</strong>{" "}
              {profile.bio || <span className="text-muted">No bio</span>}
            </div>
            <div className="mb-2">
              <strong>Interests:</strong>{" "}
              {profile.interests || (
                <span className="text-muted">No interests</span>
              )}
            </div>
            <div className="mb-2">
              <strong>Portfolio:</strong>{" "}
              {profile.portfolio_links && profile.portfolio_links.length ? (
                profile.portfolio_links.map((l: string, i: number) => (
                  <a
                    key={i}
                    href={l}
                    className="text-accent underline mr-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {l}
                  </a>
                ))
              ) : (
                <span className="text-muted">No links</span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-2">
              {SOCIALS.map(({ key, label }) =>
                profile[key] ? (
                  <a
                    key={key}
                    href={profile[key] as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-bluegray/20 border border-gold text-gold hover:bg-gold hover:text-primary transition-colors shadow"
                  >
                    <span className="font-semibold text-sm">{label}</span>
                  </a>
                ) : null
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
