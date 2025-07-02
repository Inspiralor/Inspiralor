"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";
import { SparklesIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useInView } from 'react-intersection-observer';
import { FaLinkedin, FaXTwitter, FaFacebook, FaHeart, FaRegHeart } from 'react-icons/fa6';
import { useRouter } from "next/navigation";

// Types
interface ProjectFile {
  name: string;
  url: string;
}
interface Project {
  id: string;
  title: string;
  category: string;
  files?: ProjectFile[];
  creator_id?: string;
}
interface Creator {
  id: string;
  name: string;
  profile_image: string | null;
  count: number;
}
interface Profile {
  id: string;
  name: string;
  profile_image: string | null;
}

function ProjectCard({ project, delay = 0 }: { project: any; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, type: "spring" }}
      className="rounded-xl bg-card/80 shadow-glass p-5 flex flex-col gap-2 border border-border hover:scale-[1.03] hover:shadow-lg transition-transform backdrop-blur-md"
    >
      <Link
        href={`/projects/${project.id}`}
        className="text-xl font-bold text-primary hover:underline"
      >
        {project.title}
      </Link>
      <div className="text-sm text-muted">{project.category}</div>
      <div className="text-gray-200 line-clamp-2">{project.description}</div>
      <div className="flex gap-2 flex-wrap text-xs mt-2">
        {project.tags?.map((tag: string) => (
          <span key={tag} className="bg-glass text-primary rounded px-2 py-0.5">
            #{tag}
          </span>
        ))}
      </div>
      <div className="text-xs text-muted mt-1">Status: {project.status}</div>
    </motion.div>
  );
}

export default function Landing() {
  // User state
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  // Creators state
  const [creators, setCreators] = useState<Creator[]>([]);
  // Favourites state
  const [favourites, setFavourites] = useState<string[]>([]);
  // Search state
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Fetch user and profile
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, name, profile_image")
          .eq("id", user.id)
          .single();
        setProfile(profile);
        // Fetch favourites
        const { data: favs } = await supabase
          .from("favourites")
          .select("project_id")
          .eq("user_id", user.id);
        setFavourites((favs || []).map((f: { project_id: string }) => f.project_id));
      }
    };
    fetchUser();
  }, []);

  // Fetch latest projects
  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from("projects")
        .select("id, title, category, files")
        .order("created_at", { ascending: false })
        .limit(6);
      setProjects((data as Project[]) || []);
    };
    fetchProjects();
  }, []);

  // Fetch top creators (by project count)
  useEffect(() => {
    const fetchCreators = async () => {
      // Get all profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, profile_image");
      // Get all projects
      const { data: projects } = await supabase
        .from("projects")
        .select("creator_id");
      // Count projects per creator
      const counts: Record<string, number> = {};
      (projects || []).forEach((p: { creator_id: string }) => {
        if (p.creator_id) counts[p.creator_id] = (counts[p.creator_id] || 0) + 1;
      });
      const creators = (profiles || []).map((p: any) => ({
        ...p,
        count: counts[p.id] || 0,
      }));
      creators.sort((a: Creator, b: Creator) => b.count - a.count);
      // Repeat if less than 18
      let repeated: Creator[] = [];
      while (repeated.length < 18) {
        repeated = repeated.concat(creators);
      }
      setCreators(repeated.slice(0, 18));
    };
    fetchCreators();
  }, []);

  // Favourite toggle
  const toggleFavourite = async (projectId: string) => {
    if (!user) return;
    if (favourites.includes(projectId)) {
      await supabase
        .from("favourites")
        .delete()
        .eq("user_id", user.id)
        .eq("project_id", projectId);
      setFavourites(favourites.filter(id => id !== projectId));
    } else {
      await supabase
        .from("favourites")
        .insert([{ user_id: user.id, project_id: projectId }]);
      setFavourites([...favourites, projectId]);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <Navbar hideGetStarted={true} />
      {/* Section 1: Welcome & Search */}
      <section className="flex flex-col items-center justify-center h-[60vh]">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center">
          Welcome Back{profile?.name ? `, ${profile.name}` : ""}!
        </h1>
        <div className="w-full max-w-xl flex gap-2">
          <input
            type="text"
            className="w-full px-6 py-4 rounded-xl bg-gray-800 text-lg text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-lg"
            placeholder="Search for projects, creators, type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { router.push(`/projects?search=${encodeURIComponent(search)}`); } }}
          />
          <button
            className="px-6 py-4 rounded-xl bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-600 transition-colors shadow-lg"
            onClick={() => router.push(`/projects?search=${encodeURIComponent(search)}`)}
            aria-label="Search"
          >
            Search
          </button>
        </div>
      </section>

      {/* Section 2: Latest New Projects */}
      <section className="max-w-6xl mx-auto py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Latest New Projects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {projects.map((project, i) => {
            const imageFile = project.files?.find(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name));
            const isFavourited = favourites.includes(project.id);
            const isOwnProject = user && user.id === project.creator_id;
            return (
              <div key={project.id} className="relative bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
                <div className="relative w-full h-48 bg-gray-900">
                  {imageFile ? (
                    <Image src={imageFile.url} alt={imageFile.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl">No Image</div>
                  )}
                  {/* Favourite Button (hide for own projects) */}
                  {!isOwnProject && (
                    <button
                      className="absolute bottom-3 right-3 bg-black/70 rounded-full p-2"
                      onClick={() => toggleFavourite(project.id)}
                    >
                      {isFavourited ? <FaHeart className="text-emerald-400 w-6 h-6" /> : <FaRegHeart className="text-white w-6 h-6" />}
                    </button>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="text-lg font-bold mb-1 line-clamp-1">{project.title}</div>
                  <div className="text-sm text-emerald-400 mb-2">{project.category}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 3: Top Creators */}
      <section className="max-w-6xl mx-auto py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Top Creators</h2>
        <div className="flex flex-col gap-8">
          {[0, 1, 2].map(row => {
            const [isHovered, setIsHovered] = useState(false);
            return (
              <motion.div
                key={row}
                className="flex gap-6"
                animate={isHovered ? { x: 0 } : { x: [0, row % 2 === 0 ? -240 : 240, 0] }}
                transition={isHovered ? undefined : {
                  repeat: Infinity,
                  duration: 16,
                  ease: "linear",
                  repeatType: "loop",
                  delay: row * 0.5,
                }}
                style={{ flexDirection: row % 2 === 0 ? "row" : "row-reverse" }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {creators.slice(row * 6, row * 6 + 6).map((creator, i) => (
                  <div key={creator.id + i} className="bg-gray-800 rounded-xl shadow-lg flex flex-col items-center p-6 min-w-[200px]">
                    <div className="w-16 h-16 rounded-full overflow-hidden mb-3 bg-gray-700">
                      <Image
                        src={creator.profile_image || "/images/Icon.jpeg"}
                        alt={creator.name || "User"}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="font-bold text-lg mb-1 text-center">{creator.name || "Unnamed"}</div>
                    <div className="text-sm text-gray-400 mb-1">{creator.count} posts</div>
                  </div>
                ))}
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
} 