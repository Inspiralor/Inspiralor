"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";

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

export default function MyProjectsPage() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    supabase.auth.getUser().then((result) => {
      setUser(result.data.user);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchProjects = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("creator_id", user.id);
      if (error) {
        setProjects([]);
        setLoading(false);
        return;
      }
      setTotalPages(Math.max(1, Math.ceil((data?.length || 0) / 10)));
      setProjects((data || []).slice((page - 1) * 10, page * 10));
      setLoading(false);
    };
    fetchProjects();
  }, [user, page]);

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
      <main className="min-h-screen bg-white pb-20 pt-24">
        <section className="max-w-5xl mx-auto py-12 px-4">
            <div className="uppercase text-xs font-bold text-gray-500 tracking-widest mb-2">
              My Projects
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-1">
              YOUR CREATIVE SPACE
            </h1>
            <div className="text-gray-700 text-sm md:text-base mb-6">
              Track and manage the projects you’ve created, from concept to collaboration.
            </div>
          {loading ? (
            <div>Loading...</div>
          ) : projects.length === 0 ? (
            <div className="text-muted">No projects found.</div>
          ) : (
            <div className="flex flex-col gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleDelete}
                  showDelete={true}
                />
              ))}
            </div>
          )}
          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              className="p-2 rounded-full bg-gray-200 text-black disabled:opacity-50 flex items-center justify-center"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous Page"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-black font-bold">
              Page {page} of {totalPages}
            </span>
            <button
              className="p-2 rounded-full bg-gray-200 text-black disabled:opacity-50 flex items-center justify-center"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next Page"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
