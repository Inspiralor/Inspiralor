"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";

type Project = {
  id: string;
  title: string;
  category: string;
  status: string;
};

type Profile = {
  id: string;
  bio: string;
  interests: string;
  portfolio_links: string[];
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posted, setPosted] = useState<Project[]>([]);
  const [adopted, setAdopted] = useState<Project[]>([]);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [links, setLinks] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (!user) return setLoading(false);
      // Fetch profile
      let { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (!profile) {
        // Create empty profile if not exists
        await supabase
          .from("profiles")
          .insert([
            { id: user.id, bio: "", interests: "", portfolio_links: [] },
          ]);
        profile = { id: user.id, bio: "", interests: "", portfolio_links: [] };
      }
      setProfile(profile);
      setBio(profile.bio);
      setInterests(profile.interests);
      setLinks((profile.portfolio_links || []).join(", "));
      // Fetch posted projects
      const { data: posted } = await supabase
        .from("projects")
        .select("id, title, category, status")
        .eq("creator_id", user.id);
      setPosted(posted || []);
      // Fetch adopted projects (placeholder: none yet)
      setAdopted([]);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    await supabase.from("profiles").upsert({
      id: user.id,
      bio,
      interests,
      portfolio_links: links
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
    });
    setEditing(false);
    setProfile({
      id: user.id,
      bio,
      interests,
      portfolio_links: links
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
    });
  };

  if (loading)
    return <main className="max-w-2xl mx-auto py-10 px-4">Loading...</main>;
  if (!user)
    return (
      <main className="max-w-2xl mx-auto py-10 px-4">
        Sign in to view your profile.
      </main>
    );

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-surface to-primary/30 flex items-center justify-center py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-2xl rounded-xl bg-glass shadow-glass p-8 border border-border backdrop-blur-md"
      >
        <h1 className="text-4xl font-bold mb-6 text-primary font-display">
          Your Profile
        </h1>
        {editing ? (
          <div className="mb-6 flex flex-col gap-3">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio"
              className="border border-border bg-surface/60 rounded-xl px-4 py-2 text-white placeholder:text-muted focus:ring-2 focus:ring-primary outline-none"
            />
            <input
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Areas of interest"
              className="border border-border bg-surface/60 rounded-xl px-4 py-2 text-white placeholder:text-muted"
            />
            <input
              value={links}
              onChange={(e) => setLinks(e.target.value)}
              placeholder="Portfolio links (comma separated URLs)"
              className="border border-border bg-surface/60 rounded-xl px-4 py-2 text-white placeholder:text-muted"
            />
            <motion.button
              onClick={handleSave}
              className="bg-primary text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-accent transition-colors mt-2"
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.03 }}
            >
              Save
            </motion.button>
          </div>
        ) : (
          <div className="mb-6">
            <div className="mb-2">
              <strong>Bio:</strong>{" "}
              {profile?.bio || <span className="text-muted">No bio</span>}
            </div>
            <div className="mb-2">
              <strong>Interests:</strong>{" "}
              {profile?.interests || (
                <span className="text-muted">No interests</span>
              )}
            </div>
            <div className="mb-2">
              <strong>Portfolio:</strong>{" "}
              {profile?.portfolio_links?.length ? (
                profile.portfolio_links.map((l, i) => (
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
            <motion.button
              onClick={() => setEditing(true)}
              className="bg-surface text-white px-4 py-1 rounded-xl hover:bg-accent transition-colors"
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.03 }}
            >
              Edit
            </motion.button>
          </div>
        )}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-primary">
            Posted Projects
          </h2>
          {posted.length === 0 ? (
            <div className="text-muted">No posted projects.</div>
          ) : (
            <ul className="list-disc ml-6">
              {posted.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.id}`}
                    className="text-accent underline"
                  >
                    {p.title}
                  </Link>{" "}
                  <span className="text-xs text-muted">
                    ({p.category}, {p.status})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2 text-primary">
            Adopted Projects
          </h2>
          {adopted.length === 0 ? (
            <div className="text-muted">No adopted projects yet.</div>
          ) : (
            <ul className="list-disc ml-6">
              {adopted.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.id}`}
                    className="text-accent underline"
                  >
                    {p.title}
                  </Link>{" "}
                  <span className="text-xs text-muted">
                    ({p.category}, {p.status})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </main>
  );
}
