"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import Navbar from "@/components/Navbar";

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
  onDelete,
  allowOwnFavourite = false,
}: {
  project: Project;
  delay?: number;
  onDelete?: (id: string) => void;
  allowOwnFavourite?: boolean;
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
      className="relative flex bg-white rounded-xl border border-gray-200 shadow p-0 gap-0 items-stretch mb-0 hover:shadow-lg transition-all overflow-hidden"
    >
      {/* Favourite Button */}
      {!isOwnProject && (
        <button
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors border border-gray-200"
          onClick={() => toggleFavourite(project.id)}
          aria-label={isFavourited ? 'Unfavourite' : 'Favourite'}
        >
          {isFavourited ? (
            <FaHeart className="text-emerald-500 w-6 h-6" />
          ) : (
            <FaRegHeart className="text-gray-400 w-6 h-6" />
          )}
        </button>
      )}
      {/* Image Section */}
      <div className="w-72 min-w-[18rem] h-56 flex-shrink-0 rounded-l-xl overflow-hidden bg-gray-100 border-r border-gray-200 flex items-center justify-center">
        {imageFile ? (
          <Image
            src={imageFile.url}
            alt={imageFile.name}
            width={288}
            height={224}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
            No Image
          </div>
        )}
      </div>
      {/* Info Section */}
      <div className="flex-1 flex flex-col justify-between p-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Link
              href={`/projects/${project.id}`}
              className="text-lg font-bold text-black hover:text-accent hover:underline transition-colors line-clamp-1"
            >
              {project.title}
            </Link>
          </div>
          <div className="text-xs text-gray-500 mb-1">{project.category}</div>
          <div className="text-gray-800 text-sm line-clamp-2 mb-2">
            {project.description}
          </div>
          <div className="flex gap-2 flex-wrap text-xs mb-2">
            {project.tags?.map((tag: string) => (
              <span key={tag} className="bg-gray-100 text-black rounded px-2 py-0.5 border border-gray-200">
                #{tag}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-500 mb-2">Status: {project.status}</div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <Link
            href={`/projects/${project.id}`}
            className="text-emerald-600 underline text-xs font-semibold hover:text-accent transition-colors"
          >
            View Project
          </Link>
        </div>
      </div>
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
    <>
      <Navbar />
      <main className="min-h-screen bg-white pb-20">
        <section className="max-w-5xl mx-auto py-12 px-4">
          <div className="mb-8">
            <div className="uppercase text-xs font-bold text-gray-500 tracking-widest mb-2">Explore Projects</div>
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-1">Browse Our Open Initiatives</h1>
            <div className="text-gray-700 text-sm md:text-base mb-6">Discover a variety of innovative projects seeking passionate collaborators to bring ideas to life.</div>
            {/* Search and Filter Bar */}
            <div className="flex flex-wrap gap-4 mb-8 items-center rounded-xl bg-white border border-gray-200 shadow px-6 py-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-300 bg-white rounded-xl px-4 py-2 text-gray-700 appearance-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="text-gray-700 bg-white">
                    {cat}
                  </option>
                ))}
              </select>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-gray-300 bg-white rounded-xl px-4 py-2 text-gray-700 appearance-none"
              >
                {statuses.map((s) => (
                  <option key={s} value={s} className="text-gray-700 bg-white">
                    {s}
                  </option>
                ))}
              </select>
              <div className="relative flex-1 max-w-xs">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter by tag"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="pl-10 border border-gray-300 bg-white rounded-xl px-4 py-2 text-gray-700 placeholder:text-gray-400 w-full"
                />
              </div>
            </div>
          </div>
          {loading ? (
            <div className="text-center text-muted py-10">Loading...</div>
          ) : (
            <div>
              {projects.length === 0 ? (
                <div className="text-center text-muted">No projects found.</div>
              ) : (
                <div>
                  {projects.map((p, i) => (
                    <div key={p.id}>
                      <ProjectCard project={p} delay={0.05 * i} />
                      {i !== projects.length - 1 && (
                        <hr className="my-8 border-gray-200" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
