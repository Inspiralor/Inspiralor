"use client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { ProjectCard } from "@/components/ProjectCard";
import Navbar from "@/components/Navbar";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function AdoptedProjectsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [adopted, setAdopted] = useState<
    { id: string; title: string; category: string; status: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdopted = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: adoptions } = await supabase
        .from("adoptions")
        .select("project_id")
        .eq("adopter_id", user.id);
      if (adoptions && adoptions.length > 0) {
        const projectIds = adoptions.map(
          (a: { project_id: string }) => a.project_id
        );
        const { data: adoptedProjects } = await supabase
          .from("projects")
          .select(
            "id, title, description, category, tags, status, files, creator_id"
          )
          .in("id", projectIds);
        setAdopted(adoptedProjects || []);
      } else {
        setAdopted([]);
      }
      setLoading(false);
    };
    fetchAdopted();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Sign in to view your adopted projects.
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background via-surface to-primary/30 flex flex-col items-center py-10 px-4 pt-24">
        <div className="w-full max-w-3xl rounded-xl bg-glass shadow-glass p-8 border border-border backdrop-blur-md">
          <h1 className="text-3xl font-bold mb-6 text-primary">
            Adopted Projects
          </h1>
          {adopted.length === 0 ? (
            <div className="text-muted">
              You have not adopted any projects yet.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {adopted.map((p) => (
                <ProjectCard key={p.id} project={p} adopted={true} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
