"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaXTwitter,
  FaFacebook,
} from "react-icons/fa6";
import { data } from "framer-motion/client";
import { nanoid } from "nanoid";

type Project = {
  id: string;
  title: string;
  category: string;
  status: string;
};

type Profile = {
  id: string;
  name: string;
  bio: string;
  interests: string;
  portfolio_links: string[];
  profile_image: string | null;
  github?: string;
  linkedin?: string;
  instagram?: string;
  x?: string;
  facebook?: string;
  [key: string]: string | string[] | null | undefined;
};

const SOCIALS = [
  { key: "github", label: "GitHub", icon: FaGithub },
  { key: "linkedin", label: "LinkedIn", icon: FaLinkedin },
  { key: "instagram", label: "Instagram", icon: FaInstagram },
  { key: "x", label: "X", icon: FaXTwitter },
  { key: "facebook", label: "Facebook", icon: FaFacebook },
];

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posted, setPosted] = useState<Project[]>([]);
  const [adopted, setAdopted] = useState<Project[]>([]);
  const [favourited, setFavourited] = useState<Project[]>([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [links, setLinks] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [socials, setSocials] = useState<{ [key: string]: string }>({
    github: "",
    linkedin: "",
    instagram: "",
    x: "",
    facebook: "",
  });
  const [uploading, setUploading] = useState(false);

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
        const unique_id = nanoid(8);
        await supabase.from("profiles").insert([
          {
            id: user.id,
            unique_id,
            name: "",
            bio: "",
            interests: "",
            portfolio_links: [],
            profile_image: null,
            github: "",
            linkedin: "",
            instagram: "",
            x: "",
            facebook: "",
          },
        ]);
        profile = {
          id: user.id,
          unique_id,
          name: "",
          bio: "",
          interests: "",
          portfolio_links: [],
          profile_image: null,
          github: "",
          linkedin: "",
          instagram: "",
          x: "",
          facebook: "",
        };
      }
      setProfile(profile);
      setName(profile.name || "");
      setBio(profile.bio);
      setInterests(profile.interests);
      setLinks((profile.portfolio_links || []).join(", "));
      setProfileImage(profile.profile_image || null);
      setSocials({
        github: profile.github || "",
        linkedin: profile.linkedin || "",
        instagram: profile.instagram || "",
        x: profile.x || "",
        facebook: profile.facebook || "",
      });
      // Fetch posted projects
      const { data: posted } = await supabase
        .from("projects")
        .select("id, title, category, status")
        .eq("creator_id", user.id);
      setPosted(posted || []);
      // Fetch favourited project ids
      const { data: favs } = await supabase
        .from("favourites")
        .select("project_id")
        .eq("user_id", user.id);
      if (favs && favs.length > 0) {
        const ids = favs.map((f) => f.project_id);
        const { data: favProjects } = await supabase
          .from("projects")
          .select("id, title, category, status")
          .in("id", ids);
        setFavourited(favProjects || []);
      } else {
        setFavourited([]);
      }
      // Fetch adopted projects (placeholder: none yet)
      setAdopted([]);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const file = e.target.files[0];
    const filePath = `${user.id}/${file.name}`;
    const { error } = await supabase.storage
      .from("profile-images")
      .upload(filePath, file);
    if (error) {
      setUploading(false);
      alert("Image upload failed: " + error.message);
      return;
    }
    const { data } = supabase.storage
      .from("profile-images")
      .getPublicUrl(filePath);
    setProfileImage(data.publicUrl);
    await supabase
      .from("profiles")
      .update({ profile_image: data.publicUrl })
      .eq("id", user.id);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        bio,
        interests,
        portfolio_links: links
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
        profile_image: profileImage,
        ...socials,
      })
      .eq("id", user.id);
    if (error) {
      alert("Failed to update profile: " + error.message);
      return;
    }
    setEditing(false);
    setProfile({
      id: user.id,
      name,
      bio,
      interests,
      portfolio_links: links
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
      profile_image: profileImage,
      ...socials,
    });
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this project?")) return;
    await supabase.from("projects").delete().eq("id", projectId);
    setPosted(posted.filter((p) => p.id !== projectId));
  };

  if (loading)
    return (
      <main className="min-h-screen flex items-center justify-center py-10 px-4">
        Loading...
      </main>
    );
  if (!user)
    return (
      <main className="min-h-screen flex items-center justify-center py-10 px-4">
        Sign in to view your profile.
      </main>
    );

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-surface to-primary/30 flex flex-col items-center py-10 px-4 w-full">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-5xl rounded-xl bg-glass shadow-glass p-12 border border-border backdrop-blur-md flex flex-col gap-8"
      >
        <div className="flex flex-col md:flex-row gap-12 items-center w-full">
          <div className="relative w-40 h-40">
            <Image
              src={profile?.profile_image || "/images/Icon.jpeg"}
              alt="Profile"
              fill
              className="rounded-full object-cover border-4 border-gold shadow-lg bg-white"
            />
          </div>
          <div className="flex-1 flex flex-col gap-3 text-lg">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <span className="text-3xl font-bold text-primary font-display">
                {profile?.name ? profile.name : "Profile"}
              </span>
              <span className="ml-4 px-3 py-1 rounded-full bg-bluegray/20 border border-gold text-gold text-sm font-mono">
                ID: {profile?.unique_id || user?.id?.slice(0, 8)}
              </span>
            </div>
            <div className="text-accent text-base">
              Email: <span className="font-mono">{user?.email}</span>
            </div>
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
            <div className="flex flex-wrap gap-4 mt-2">
              {SOCIALS.map(({ key, label, icon: Icon }) =>
                profile && (profile[key] as string) ? (
                  <a
                    key={key}
                    href={profile[key] as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-bluegray/20 border border-gold text-gold hover:bg-gold hover:text-primary transition-colors shadow"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden md:inline font-semibold text-sm">
                      {label}
                    </span>
                  </a>
                ) : null
              )}
            </div>
          </div>
        </div>
        {editing ? (
          <div className="mb-10 flex flex-col gap-6">
            <div className="flex flex-col items-center mb-4 gap-4">
              <div className="relative w-32 h-32">
                <Image
                  src={profileImage || "/images/Icon.jpeg"}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover border-4 border-gold shadow-lg bg-white"
                />
                <label className="absolute bottom-2 right-2 bg-gold text-primary rounded-full px-3 py-1 text-xs font-bold cursor-pointer shadow-md border border-dark">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploading ? "Uploading..." : "Change"}
                </label>
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="border border-border bg-surface/60 rounded-xl px-4 py-3 text-white placeholder:text-muted text-2xl font-bold text-center w-full max-w-xs"
              />
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio"
              className="border border-border bg-surface/60 rounded-xl px-4 py-3 text-white placeholder:text-muted focus:ring-2 focus:ring-primary outline-none min-h-[80px]"
            />
            <input
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Areas of interest"
              className="border border-border bg-surface/60 rounded-xl px-4 py-3 text-white placeholder:text-muted"
            />
            <div className="flex flex-col gap-4 md:flex-row md:gap-8">
              <div className="flex-1 flex flex-col gap-4">
                <input
                  value={links}
                  onChange={(e) => setLinks(e.target.value)}
                  placeholder="Portfolio links (comma separated URLs)"
                  className="border border-border bg-surface/60 rounded-xl px-4 py-3 text-white placeholder:text-muted"
                />
                <div className="flex flex-col gap-2">
                  {SOCIALS.map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center gap-3">
                      <Icon className="w-6 h-6 text-gold" />
                      <input
                        type="url"
                        value={socials[key] || ""}
                        onChange={(e) =>
                          setSocials((s) => ({ ...s, [key]: e.target.value }))
                        }
                        placeholder={label + " URL"}
                        className="flex-1 border border-border bg-surface/60 rounded-xl px-4 py-2 text-white placeholder:text-muted"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <motion.button
              onClick={handleSave}
              className="bg-primary text-accent px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-gold hover:text-primary transition-colors mt-4 text-lg"
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.03 }}
              disabled={uploading}
            >
              Save
            </motion.button>
          </div>
        ) : (
          <motion.button
            onClick={() => setEditing(true)}
            className="bg-surface text-accent px-6 py-2 rounded-xl hover:bg-gold hover:text-primary transition-colors text-lg font-bold border border-gold shadow"
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
          >
            Edit
          </motion.button>
        )}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold mb-2 text-primary">
            Posted Projects
          </h2>
          <Link href="/my-projects" className="text-accent underline text-sm">
            My Projects Page
          </Link>
        </div>
        <div className="mb-6">
          {posted.length === 0 ? (
            <div className="text-muted">No posted projects.</div>
          ) : (
            <ul className="list-disc ml-6">
              {posted.map((p) => (
                <li key={p.id} className="flex items-center gap-2">
                  <Link
                    href={`/projects/${p.id}`}
                    className="text-accent underline"
                  >
                    {p.title}
                  </Link>{" "}
                  <span className="text-xs text-muted">
                    ({p.category}, {p.status})
                  </span>
                  <button
                    className="ml-2 px-2 py-1 text-xs bg-blue-700 text-white rounded hover:bg-blue-800"
                    onClick={() => alert("Edit coming soon!")}
                  >
                    Edit
                  </button>
                  <button
                    className="ml-2 px-2 py-1 text-xs bg-red-700 text-white rounded hover:bg-red-800"
                    onClick={() => handleDeleteProject(p.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-primary">
            Favourited Projects
          </h2>
          {favourited.length === 0 ? (
            <div className="text-muted">No favourited projects yet.</div>
          ) : (
            <ul className="list-disc ml-6">
              {favourited.map((p) => (
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
