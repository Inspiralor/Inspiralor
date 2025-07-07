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
      <main className="min-h-screen bg-white pb-20 pt-24">
        <section className="max-w-5xl mx-auto py-12 px-4">
          <div className="mb-8">
            <div className="uppercase text-xs font-bold text-gray-500 tracking-widest mb-2">
              Adopted Projects
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-1">
              Browse Your Adopted Projects
            </h1>
            <div className="text-gray-700 text-sm md:text-base mb-6">
              All the projects you have adopted are listed below.
            </div>
          </div>
          {adopted.length === 0 ? (
            <div className="text-center text-muted">
              You have not adopted any projects yet.
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {adopted.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  adopted={true}
                  showAdopterNames={true}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
