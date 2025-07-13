"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaXTwitter,
  FaFacebook,
} from "react-icons/fa6";
import { nanoid } from "nanoid";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";

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
  email?: string;
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
  const { user } = useAuth();
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
      if (!user) return setLoading(false);
      try {
        // Fetch profile
        let { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        }
        if (profile) {
          console.log('Fetched profile:', profile);
          console.log('User object:', user);
          let needsUpdate = false;
          const updates: any = {};
          if (!profile.unique_id) {
            updates.unique_id = nanoid(8);
            needsUpdate = true;
          }
          if ((!profile.name || profile.name === "") && user.email) {
            updates.name = user.email.split("@")[0];
            needsUpdate = true;
          }
          if (profile.email !== user.email) {
            updates.email = user.email ?? "";
            needsUpdate = true;
          }
          if (needsUpdate) {
            console.log('Updating profile with:', updates);
            await supabase
              .from("profiles")
              .update(updates)
              .eq("id", user.id);
            // Refetch updated profile
            const { data: updatedProfile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();
            profile = updatedProfile;
            console.log('Updated profile:', profile);
          }
        } else {
          // If somehow profile is still missing, just set loading false
          setLoading(false);
          return;
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
        
        // Fetch adopted projects using adoptions table
        const { data: adoptions } = await supabase
          .from("adoptions")
          .select("project_id")
          .eq("adopter_id", user.id);
        if (adoptions && adoptions.length > 0) {
          const projectIds = adoptions.map(
            (a: { project_id: string }) => a.project_id
          );
          const { data: adoptedProjects } = await supabase
            .from("projects")
            .select("id, title, category, status")
            .in("id", projectIds);
          setAdopted(adoptedProjects || []);
        } else {
          setAdopted([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error in fetchProfile:', error);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

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
    if (!user || !profile) return;
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
        unique_id: profile.unique_id,
        ...socials,
        email: user.email ?? "",
      })
      .eq("id", user.id);
    if (error) {
      alert("Failed to update profile: " + error.message);
      return;
    }
    setEditing(false);
    setProfile({
      ...profile,
      name,
      bio,
      interests,
      portfolio_links: links
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
      profile_image: profileImage,
      ...socials,
      email: user.email ?? "",
    });
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this project?")) return;
    await supabase.from("projects").delete().eq("id", projectId);
    setPosted(posted.filter((p) => p.id !== projectId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    );
  }
  if (!user)
    return (
      <main className="min-h-screen flex items-center justify-center py-10 px-4">
        Sign in to view your profile.
      </main>
    );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background via-surface to-primary/30 flex items-center justify-center py-10 px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-4xl rounded-xl bg-glass shadow-glass p-12 border border-border backdrop-blur-md"
        >
          {/* Profile Image Row */}
          <div className="flex justify-center mb-8">
            <div className="relative w-48 h-48">
              <Image
                src={
                  typeof profileImage === "string"
                    ? profileImage
                    : "/images/Icon.jpeg"
                }
                alt="Profile"
                fill
                className="rounded-full object-cover border-4 border-white shadow-lg bg-white"
              />
              <label className="absolute bottom-2 right-2 bg-white text-primary rounded-full px-3 py-1 text-xs font-bold cursor-pointer shadow-md border border-dark">
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
          </div>

          {/* Username and ID Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-center gap-4 mb-8">
            <span className="text-3xl font-bold text-primary font-display text-center">
              {profile?.name || "Profile"}
            </span>
            <span className="px-3 py-1 rounded-full bg-bluegray bg-opacity-20 border border-white text-white text-sm font-mono">
              ID: {profile?.unique_id || user?.id?.slice(0, 8)}
            </span>
          </div>

          {/* Bio Row */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-primary mb-2">Bio</h3>
            <p className="text-white">
              {profile?.bio || <span className="text-muted">No bio</span>}
            </p>
          </div>

          {/* Interests Row */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-primary mb-2">Interests</h3>
            <p className="text-white">
              {profile?.interests || (
                <span className="text-muted">No interests</span>
              )}
            </p>
          </div>

          {/* Portfolio Link Row */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-primary mb-2">Portfolio</h3>
            {profile?.portfolio_links?.length ? (
              <div className="flex flex-wrap gap-2">
                {profile.portfolio_links.map((l, i) => (
                  <a
                    key={i}
                    href={l}
                    className="text-accent underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {l}
                  </a>
                ))}
              </div>
            ) : (
              <span className="text-muted">No portfolio links</span>
            )}
          </div>

          {/* Social Media Icons Row */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-primary mb-4">Social Media</h3>
            <div className="flex gap-4">
              {SOCIALS.map(({ key, label, icon: Icon }) =>
                profile && (profile[key] as string) ? (
                  <a
                    key={key}
                    href={profile[key] as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-bluegray bg-opacity-20 border border-white text-white hover:bg-white hover:text-primary transition-colors shadow"
                    title={label}
                  >
                    <Icon className="w-6 h-6" />
                  </a>
                ) : null
              )}
            </div>
          </div>

          {/* Edit Button Row */}
          <div className="mb-8">
            {editing ? (
              <motion.button
                onClick={handleSave}
                className="bg-primary text-accent px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-white hover:text-primary transition-colors text-lg"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.03 }}
                disabled={uploading}
              >
                Save
              </motion.button>
            ) : (
              <motion.button
                onClick={() => setEditing(true)}
                className="bg-surface text-accent px-6 py-2 rounded-xl hover:bg-white hover:text-primary transition-colors text-lg font-bold border border-white shadow"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.03 }}
              >
                Edit
              </motion.button>
            )}
          </div>
          {editing && (
            <div className="mb-10 flex flex-col gap-6">
              <div className="flex flex-col items-center mb-4 gap-4">
                <div className="relative w-32 h-32">
                  <Image
                    src={
                      typeof profileImage === "string"
                        ? profileImage
                        : "/images/Icon.jpeg"
                    }
                    alt="Profile"
                    fill
                    className="rounded-full object-cover border-4 border-white shadow-lg bg-white"
                  />
                  <label className="absolute bottom-2 right-2 bg-white text-primary rounded-full px-3 py-1 text-xs font-bold cursor-pointer shadow-md border border-dark">
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
                        <Icon className="w-6 h-6 text-white" />
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
                className="bg-primary text-accent px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-white hover:text-primary transition-colors mt-4 text-lg"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.03 }}
                disabled={uploading}
              >
                Save
              </motion.button>
            </div>
          )}
          {/* Favourited Projects */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-primary">
              Favourited Projects
            </h2>
            {favourited.length === 0 ? (
              <div className="text-muted">No favourited projects yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favourited.map((p) => (
                  <div key={p.id} className="bg-surface/20 rounded-lg p-4 border border-border">
                    <Link
                      href={`/projects/${p.id}`}
                      className="text-accent underline font-semibold block mb-2"
                    >
                      {p.title}
                    </Link>
                    <span className="text-xs text-muted">
                      {p.category} • {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </>
  );
}
