"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";
import { SparklesIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

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
  const [totalProjects, setTotalProjects] = useState(0);
  const [adoptedProjects, setAdoptedProjects] = useState(0);
  const [remixedProjects, setRemixedProjects] = useState(0);
  useEffect(() => {
    const fetchStats = async () => {
      const { count: total } = await supabase.from("projects").select("id", { count: "exact", head: true });
      setTotalProjects(total || 0);
      const { count: adopted } = await supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "Adopted");
      setAdoptedProjects(adopted || 0);
      const { count: remixed } = await supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "Remixed");
      setRemixedProjects(remixed || 0);
    };
    fetchStats();
  }, []);
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-surface to-primary/30 pb-20 w-full">
      <div className="flex flex-col md:flex-row w-full h-full min-h-[60vh] gap-4 md:gap-x-8 px-4 md:px-32">
        {/* Left: Slogan, text */}
        <div className="flex-1 flex flex-col justify-start md:justify-center py-16 gap-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-extrabold font-display text-highlight drop-shadow-lg mb-4 text-left"
          >
            Adopt, Remix, and Revive Unfinished Ideas
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg text-accent max-w-2xl mb-2 text-left"
          >
            Project Graveyard is a platform dedicated to breathing new life into unfinished, abandoned, or forgotten projects. Whether you are a developer, artist, writer, designer, or innovator, our mission is to connect creative minds and foster a culture of collaboration and reinvention. By sharing your incomplete works, you open the door for others to learn from, build upon, or transform your ideas into something extraordinary. We believe that every project, no matter how incomplete, has the potential to inspire and spark new journeys.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg text-accent max-w-2xl text-left"
          >
            Our platform offers a seamless experience for uploading and discovering projects, complete with rich media, detailed descriptions, and tagging. Users can create personalized profiles, showcase their interests, and link their social accounts to connect with like-minded creators. The adoption and remixing features empower users to take ownership of projects, contribute improvements, or spin off entirely new works. Join our growing community to collaborate, learn, and make an impact by giving unfinished ideas a second chance.
          </motion.p>
        </div>
        {/* Right: Hero image */}
        <div className="flex-1 flex items-start md:items-center justify-center py-16">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="w-full max-w-[500px] h-auto rounded-2xl overflow-hidden border-4 border-gold shadow-xl bg-surface"
          >
            <Image
              src="/images/Image1.jpg"
              alt="Hero Image"
              width={500}
              height={340}
              className="w-full h-auto object-cover object-center"
              priority
            />
          </motion.div>
        </div>
      </div>
      {/* Stats row */}
      <section className="w-full flex flex-col md:flex-row gap-8 mt-8 px-4 md:px-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex-1 bg-glass border border-gold rounded-xl px-8 py-8 text-center shadow-lg min-w-[220px]"
        >
          <div className="text-4xl font-bold text-gold mb-2">{totalProjects}</div>
          <div className="text-xl text-accent font-semibold">Total Projects</div>
          <div className="text-md text-muted mt-2 max-w-xs mx-auto">A growing collection of creative works from all disciplines, waiting to be adopted, remixed, or completed. Every project is an opportunity for learning, collaboration, and innovation.</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex-1 bg-glass border border-gold rounded-xl px-8 py-8 text-center shadow-lg min-w-[220px]"
        >
          <div className="text-4xl font-bold text-gold mb-2">{adoptedProjects}</div>
          <div className="text-xl text-accent font-semibold">Adopted Projects</div>
          <div className="text-md text-muted mt-2 max-w-xs mx-auto">Projects that have found new owners and are on their way to completion or transformation. Adopting a project is a great way to contribute, learn, and make a difference in the community.</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex-1 bg-glass border border-gold rounded-xl px-8 py-8 text-center shadow-lg min-w-[220px]"
        >
          <div className="text-4xl font-bold text-gold mb-2">{remixedProjects}</div>
          <div className="text-xl text-accent font-semibold">Remixed Projects</div>
          <div className="text-md text-muted mt-2 max-w-xs mx-auto">Projects that have been reimagined, extended, or transformed into something new. Remixing is at the heart of creative evolution and cross-disciplinary innovation.</div>
        </motion.div>
      </section>
    </main>
  );
}
