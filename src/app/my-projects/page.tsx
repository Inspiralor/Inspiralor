"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyProjectsPage() {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchProjects = async () => {
      const { data } = await supabase
        .from("projects")
        .select("id, title, category, status")
        .eq("creator_id", user.id);
      setProjects(data || []);
      setLoading(false);
    };
    fetchProjects();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    await supabase.from("projects").delete().eq("id", id);
    setProjects(projects.filter(p => p.id !== id));
  };

  if (!user && !loading) {
    return <main className="max-w-2xl mx-auto py-10 px-4">Sign in to view your projects.</main>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-surface to-primary/30 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-2xl rounded-xl bg-glass shadow-glass p-8 border border-border backdrop-blur-md">
        <h1 className="text-3xl font-bold mb-6 text-primary font-display">My Projects</h1>
        {loading ? (
          <div>Loading...</div>
        ) : projects.length === 0 ? (
          <div className="text-muted">No projects found.</div>
        ) : (
          <ul className="list-disc ml-6">
            {projects.map((p) => (
              <li key={p.id} className="flex items-center gap-2 mb-2">
                <Link href={`/projects/${p.id}`} className="text-accent underline">
                  {p.title}
                </Link>
                <span className="text-xs text-muted">({p.category}, {p.status})</span>
                <button
                  className="ml-2 px-2 py-1 text-xs bg-blue-700 text-white rounded hover:bg-blue-800"
                  onClick={() => router.push(`/projects/${p.id}/edit`)}
                >
                  Edit
                </button>
                <button
                  className="ml-2 px-2 py-1 text-xs bg-red-700 text-white rounded hover:bg-red-800"
                  onClick={() => handleDelete(p.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
} 