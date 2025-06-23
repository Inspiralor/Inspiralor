"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const categories = [
  "All",
  "Code",
  "Art",
  "Writing",
  "Design",
  "Research",
  "Music",
  "Business Idea",
  "Game",
  "Invention",
  "Other",
];
const statuses = [
  "All",
  "Looking for Help",
  "Free to Take",
  "Inspiration Only",
];

type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: string;
  files?: { name: string; url: string }[];
  creator_id?: string;
};

function ProjectCard({
  project,
  delay = 0,
}: {
  project: Project;
  delay?: number;
}) {
  const imageFile = project.files?.find((f) =>
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name)
  );
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [author, setAuthor] = useState<{
    name: string;
    unique_id: string;
  } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then((result) => {
      setUser(result.data.user);
    });
  }, []);

  useEffect(() => {
    const fetchFavourites = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("favourites")
        .select("project_id")
        .eq("user_id", user.id);
      setFavourites(
        (data || []).map((f: { project_id: string }) => f.project_id)
      );
    };
    fetchFavourites();
  }, [user]);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!project.creator_id) return;
      const { data } = await supabase
        .from("profiles")
        .select("name, unique_id")
        .eq("id", project.creator_id)
        .single();
      setAuthor(data);
    };
    fetchAuthor();
  }, [project.creator_id]);

  const toggleFavourite = async (projectId: string) => {
    if (!user) return;
    if (favourites.includes(projectId)) {
      await supabase
        .from("favourites")
        .delete()
        .eq("user_id", user.id)
        .eq("project_id", projectId);
      setFavourites(favourites.filter((id) => id !== projectId));
    } else {
      await supabase
        .from("favourites")
        .insert([{ user_id: user.id, project_id: projectId }]);
      setFavourites([...favourites, projectId]);
    }
  };

  const isFavourited = favourites.includes(project.id);
  const isOwnProject = user && user.id === project.creator_id;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, type: "spring" }}
      className="rounded-xl bg-card/80 shadow-glass p-5 flex flex-col gap-3 border border-border hover:scale-[1.03] hover:shadow-lg transition-transform backdrop-blur-md"
    >
      <div className="w-full flex justify-center mb-2">
        <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-gold bg-surface flex items-center justify-center">
          {imageFile ? (
            <Image
              src={imageFile.url}
              alt={imageFile.name}
              width={112}
              height={112}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted text-2xl">
              <span>No Image</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Link
          href={`/projects/${project.id}`}
          className="text-xl font-bold text-primary hover:text-accent hover:underline transition-colors"
        >
          {project.title}
        </Link>
        {user && !isOwnProject && (
          <button
            onClick={() => toggleFavourite(project.id)}
            className="ml-2 text-gold hover:text-red-500 text-2xl focus:outline-none"
            title={isFavourited ? "Unfavourite" : "Favourite"}
          >
            {isFavourited ? <FaHeart /> : <FaRegHeart />}
          </button>
        )}
      </div>
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
      {author && (
        <div className="text-xs mt-2">
          by{" "}
          <Link
            href={`/profile/${author.unique_id}`}
            className="text-gold hover:underline font-mono"
          >
            {author.name || "User"} ({author.unique_id})
          </Link>
        </div>
      )}
    </motion.div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [tag, setTag] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      let query = supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (category !== "All") query = query.eq("category", category);
      if (status !== "All") query = query.eq("status", status);
      const { data } = await query;
      let filtered = data || [];
      if (tag)
        filtered = filtered.filter((p: Project) => p.tags?.includes(tag));
      setProjects(filtered);
      setLoading(false);
    };
    fetchProjects();
  }, [category, status, tag]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-surface to-primary/30 pb-20">
      <section className="max-w-5xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap gap-4 mb-8 items-center rounded-xl bg-glass border border-border shadow-glass px-6 py-4 backdrop-blur-md"
        >
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-border bg-surface/60 rounded-xl px-4 py-2 text-white"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-border bg-surface/60 rounded-xl px-4 py-2 text-white"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="relative flex-1 max-w-xs">
            <MagnifyingGlassIcon className="w-5 h-5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="pl-10 border border-border bg-surface/60 rounded-xl px-4 py-2 text-white placeholder:text-muted w-full"
            />
          </div>
        </motion.div>
        {loading ? (
          <div className="text-center text-muted py-10">Loading...</div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {projects.length === 0 && (
              <div className="col-span-full text-center text-muted">
                No projects found.
              </div>
            )}
            {projects.map((p, i) => (
              <ProjectCard key={p.id} project={p} delay={0.05 * i} />
            ))}
          </motion.div>
        )}
      </section>
    </main>
  );
}
