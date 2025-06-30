"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";

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
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [links, setLinks] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [socials, setSocials] = useState<{ [key: string]: string }>({
    github: "",
    linkedin: "",
    instagram: "",
    x: "",
    facebook: "",
  });
  const [uploading, setUploading] = useState(false);
  const [favourited, setFavourited] = useState<any[]>([]);

  const isOwnProfile = user && profile && (user.id === profile.id || user.id === profile.unique_id);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

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

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setBio(profile.bio || "");
      setInterests(profile.interests || "");
      setLinks((profile.portfolio_links || []).join(", "));
      setProfileImage(profile.profile_image || null);
      setSocials({
        github: profile.github || "",
        linkedin: profile.linkedin || "",
        instagram: profile.instagram || "",
        x: profile.x || "",
        facebook: profile.facebook || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (isOwnProfile && user) {
      // Fetch favourited projects for the logged-in user
      supabase
        .from("favourites")
        .select("project_id")
        .eq("user_id", user.id)
        .then(({ data }) => {
          if (data && data.length > 0) {
            const ids = data.map((f: any) => f.project_id);
            supabase
              .from("projects")
              .select("*")
              .in("id", ids)
              .then(({ data }) => setFavourited(data || []));
          } else {
            setFavourited([]);
          }
        });
    }
  }, [isOwnProfile, user]);

  const imageSrc = typeof profileImage === 'string' && profileImage ? profileImage : '/images/Icon.jpeg';

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
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background via-surface to-primary/30 flex items-center justify-center py-10 px-4 pt-24">
        <div className="w-full max-w-2xl rounded-xl bg-glass shadow-glass p-8 border border-white backdrop-blur-md flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-12 items-center w-full">
            <div className="relative w-40 h-40">
              <Image
                src={typeof imageSrc === 'string' ? imageSrc : '/images/Icon.jpeg'}
                alt="Profile"
                width={160}
                height={160}
                className="rounded-full object-cover border-4 border-white shadow-lg bg-white"
                style={{ borderRadius: '50%' }}
              />
            </div>
            <div className="flex-1 flex flex-col gap-3 text-lg">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="text-3xl font-bold text-primary font-display">
                  {name || "Profile"}
                </span>
                <span className="ml-4 px-3 py-1 rounded-full bg-bluegray/20 border border-white text-white text-sm font-mono">
                  ID: {profile?.unique_id || profile?.id?.slice(0, 8)}
                </span>
              </div>
              <div className="text-accent text-base">
                Email: <span className="font-mono">{profile?.email}</span>
              </div>
              {editing ? (
                <>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="border border-border bg-surface/60 rounded-xl px-4 py-3 text-white placeholder:text-muted text-2xl font-bold text-center w-full max-w-xs" />
                  <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Short bio" className="border border-border bg-surface/60 rounded-xl px-4 py-3 text-white placeholder:text-muted focus:ring-2 focus:ring-primary outline-none min-h-[80px]" />
                  <input value={interests} onChange={e => setInterests(e.target.value)} placeholder="Areas of interest" className="border border-border bg-surface/60 rounded-xl px-4 py-3 text-white placeholder:text-muted" />
                  <input value={links} onChange={e => setLinks(e.target.value)} placeholder="Portfolio links (comma separated URLs)" className="border border-border bg-surface/60 rounded-xl px-4 py-3 text-white placeholder:text-muted" />
                  {/* Socials editing */}
                  {Object.keys(socials).map(key => (
                    <input key={key} type="url" value={socials[key]} onChange={e => setSocials(s => ({ ...s, [key]: e.target.value }))} placeholder={key.charAt(0).toUpperCase() + key.slice(1) + " URL"} className="border border-border bg-surface/60 rounded-xl px-4 py-2 text-white placeholder:text-muted mt-2" />
                  ))}
                  <button onClick={async () => {
                    // Save logic
                    await supabase.from("profiles").update({
                      name,
                      bio,
                      interests,
                      portfolio_links: links.split(",").map(l => l.trim()).filter(Boolean),
                      profile_image: profileImage,
                      ...socials,
                    }).eq("id", user.id);
                    setEditing(false);
                    setProfile({ ...profile, name, bio, interests, portfolio_links: links.split(",").map(l => l.trim()).filter(Boolean), profile_image: profileImage, ...socials });
                  }} className="bg-primary text-accent px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-white hover:text-primary transition-colors mt-4 text-lg">Save</button>
                  <button onClick={() => setEditing(false)} className="ml-4 bg-red-500 text-white px-6 py-2 rounded font-semibold hover:bg-red-700 transition-colors">Cancel</button>
                </>
              ) : (
                <>
                  <div className="mb-2"><strong>Bio:</strong> {bio || <span className="text-muted">No bio</span>}</div>
                  <div className="mb-2"><strong>Interests:</strong> {interests || <span className="text-muted">No interests</span>}</div>
                  <div className="mb-2"><strong>Portfolio:</strong> {links ? links.split(",").map((l, i) => <a key={i} href={l} className="text-accent underline mr-2" target="_blank" rel="noopener noreferrer">{l}</a>) : <span className="text-muted">No links</span>}</div>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {Object.entries(socials).map(([key, value]) => value ? (
                      <a key={key} href={value} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1 rounded-full bg-bluegray/20 border border-white text-white hover:bg-white hover:text-primary transition-colors shadow"><span className="font-semibold text-sm">{key.charAt(0).toUpperCase() + key.slice(1)}</span></a>
                    ) : null)}
                  </div>
                  {isOwnProfile && <button onClick={() => setEditing(true)} className="mt-4 bg-surface text-accent px-6 py-2 rounded-xl hover:bg-white hover:text-primary transition-colors text-lg font-bold border border-white shadow">Edit</button>}
                </>
              )}
            </div>
          </div>
          {/* Favourited Projects Section */}
          {isOwnProfile && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2 text-primary">Favourited Projects</h2>
              {favourited.length === 0 ? (
                <div className="text-muted">No favourited projects yet.</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {favourited.map((project) => (
                    <div key={project.id} className="flex bg-white/10 rounded-xl border border-border shadow p-4 gap-6 items-center">
                      <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-surface border border-white flex items-center justify-center">
                        {project.files && project.files.length > 0 ? (
                          <Image src={project.files[0].url} alt={project.files[0].name} width={96} height={96} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted text-2xl">No Image</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-bold text-primary">{project.title}</div>
                        <div className="text-sm text-muted mb-1">{project.category}</div>
                        <div className="text-gray-200 line-clamp-2 mb-1">{project.description}</div>
                        <div className="flex gap-2 flex-wrap text-xs mt-1">
                          {project.tags?.map((tag: string) => (
                            <span key={tag} className="bg-glass text-primary rounded px-2 py-0.5">#{tag}</span>
                          ))}
                        </div>
                        <div className="text-xs text-muted mt-1">Status: {project.status}</div>
                        <Link href={`/projects/${project.id}`} className="text-emerald-400 underline text-xs mt-2 inline-block">View Project</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
