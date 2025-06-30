"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { FaHeart, FaRegHeart } from "react-icons/fa";

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
}: {
  project: Project;
  delay?: number;
  onDelete: (id: string) => void;
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, type: "spring" }}
      className="relative flex bg-white/10 rounded-xl border border-border shadow p-0 gap-0 items-stretch mb-8 hover:shadow-lg transition-all overflow-hidden"
    >
      {/* Favourite Button */}
      <button
        className="absolute top-4 right-4 z-10 bg-white/80 rounded-full p-2 shadow-md hover:bg-accent/80 transition-colors"
        onClick={() => toggleFavourite(project.id)}
        aria-label={isFavourited ? 'Unfavourite' : 'Favourite'}
      >
        {isFavourited ? (
          <FaHeart className="text-emerald-500 w-6 h-6" />
        ) : (
          <FaRegHeart className="text-gray-400 w-6 h-6" />
        )}
      </button>
      {/* Image Section */}
      <div className="w-72 min-w-[18rem] h-56 flex-shrink-0 rounded-l-xl overflow-hidden bg-surface border-r border-gold flex items-center justify-center">
        {imageFile ? (
          <Image
            src={imageFile.url}
            alt={imageFile.name}
            width={288}
            height={224}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-2xl">
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
              className="text-lg font-bold text-primary hover:text-accent hover:underline transition-colors line-clamp-1"
            >
              {project.title}
            </Link>
            <button
              onClick={() => onDelete(project.id)}
              className="ml-2 text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded border border-red-700 bg-red-900/30"
              title="Delete"
            >
              Delete
            </button>
          </div>
          <div className="text-xs text-muted mb-1">{project.category}</div>
          <div className="text-gray-200 text-sm line-clamp-2 mb-2">
            {project.description}
          </div>
          <div className="flex gap-2 flex-wrap text-xs mb-2">
            {project.tags?.map((tag: string) => (
              <span key={tag} className="bg-glass text-primary rounded px-2 py-0.5">
                #{tag}
              </span>
            ))}
          </div>
          <div className="text-xs text-muted mb-2">Status: {project.status}</div>
          <div className="text-xs mt-2">
            by {author ? (
              <Link
                href={`/profile/${author.unique_id}`}
                className="text-gold hover:underline font-mono"
              >
                {author.name || "User"} ({author.unique_id})
              </Link>
            ) : (
              <span>Loading...</span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <Link
            href={`/projects/${project.id}`}
            className="text-emerald-400 underline text-xs font-semibold hover:text-accent transition-colors"
          >
            View Project
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function MyProjectsPage() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then((result) => {
      setUser(result.data.user);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchProjects = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("creator_id", user.id);
      setProjects(data || []);
      setLoading(false);
    };
    fetchProjects();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    await supabase.from("projects").delete().eq("id", id);
    setProjects(projects.filter((p) => p.id !== id));
  };

  if (!user && !loading) {
    return (
      <main className="max-w-2xl mx-auto py-10 px-4">
        Sign in to view your projects.
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pb-20">
        <section className="max-w-5xl mx-auto py-12 px-4">
          <h1 className="text-3xl font-bold mb-6 text-primary font-display">
            My Projects
          </h1>
          {loading ? (
            <div>Loading...</div>
          ) : projects.length === 0 ? (
            <div className="text-muted">No projects found.</div>
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
              {projects.map((p, i) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  delay={0.05 * i}
                  onDelete={handleDelete}
                />
              ))}
            </motion.div>
          )}
        </section>
      </main>
    </>
  );
}
