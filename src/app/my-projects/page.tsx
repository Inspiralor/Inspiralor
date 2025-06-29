"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "@/components/Navbar";

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
  const [author, setAuthor] = useState<{
    name: string;
    unique_id: string;
  } | null>(null);

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
        <button
          onClick={() => onDelete(project.id)}
          className="ml-2 text-red-500 hover:text-red-700 text-lg px-2 py-1 rounded focus:outline-none border border-red-700 bg-red-900/30"
          title="Delete"
        >
          Delete
        </button>
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
      <div className="text-xs mt-2">
        by{" "}
        {author ? (
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
      <main className="min-h-screen bg-gradient-to-br from-background via-surface to-primary/30 pb-20">
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
