"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";
import { SparklesIcon } from "@heroicons/react/24/solid";

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

export default function Home() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setProjects(data);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  // Curated views (simple demo logic)
  const mostInteresting = projects.slice(0, 3);
  const mostAdopted = projects.slice(3, 6); // Placeholder logic
  const hiddenGems = projects.slice(6, 9); // Placeholder logic

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-surface to-primary/30 pb-20">
      <section className="max-w-4xl mx-auto pt-16 pb-12 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-glass shadow-glass border border-border backdrop-blur-md"
        >
          <SparklesIcon className="w-6 h-6 text-accent animate-pulse" />
          <span className="font-display text-lg text-primary font-semibold tracking-wide">
            Project Graveyard
          </span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold font-display bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4"
        >
          Adopt, Remix, and Revive Unfinished Ideas
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-8 text-lg text-muted max-w-2xl mx-auto"
        >
          A creative adoption hub for unfinished projects in code, art, writing,
          research, games, designs, inventions, and more. Discover, adopt, and
          remix abandoned works from all fields.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex justify-center gap-4"
        >
          <Link
            href="/projects"
            className="px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-lg hover:bg-accent transition-colors"
          >
            Browse Projects
          </Link>
          <Link
            href="/projects/submit"
            className="px-6 py-3 rounded-xl bg-glass border border-primary text-primary font-bold shadow-lg hover:bg-primary hover:text-white transition-colors"
          >
            Submit Project
          </Link>
        </motion.div>
      </section>
      <section className="max-w-5xl mx-auto px-4 grid md:grid-cols-3 gap-8 mt-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold mb-3 text-primary">
            Most Interesting
          </h2>
          <div className="grid gap-4">
            {loading ? (
              <div>Loading...</div>
            ) : (
              mostInteresting.map((p, i) => (
                <ProjectCard key={p.id} project={p} delay={0.1 * i} />
              ))
            )}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold mb-3 text-accent">
            Most Adopted
          </h2>
          <div className="grid gap-4">
            {loading ? (
              <div>Loading...</div>
            ) : (
              mostAdopted.map((p, i) => (
                <ProjectCard key={p.id} project={p} delay={0.1 * i} />
              ))
            )}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-semibold mb-3 text-primary">
            Hidden Gems
          </h2>
          <div className="grid gap-4">
            {loading ? (
              <div>Loading...</div>
            ) : (
              hiddenGems.map((p, i) => (
                <ProjectCard key={p.id} project={p} delay={0.1 * i} />
              ))
            )}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
