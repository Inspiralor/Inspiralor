"use client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { ProjectCard } from "@/components/ProjectCard";
import Navbar from "@/components/Navbar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/components/AuthContext";

export default function AdoptedProjectsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [adopted, setAdopted] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatorMap, setCreatorMap] = useState<Record<string, string>>({});

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
        // Fetch creator full UUIDs
        const creatorIds = Array.from(new Set((adoptedProjects || []).map((p: any) => p.creator_id).filter(Boolean)));
        let creatorProfiles: { id: string; unique_id: string }[] = [];
        if (creatorIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id")
            .in("id", creatorIds);
          creatorProfiles = profiles || [];
        }
        const creatorMap: Record<string, string> = {};
        for (const p of adoptedProjects || []) {
          const creator = creatorProfiles.find((a) => a.id === p.creator_id);
          if (creator) creatorMap[p.id] = creator.id;
        }
        setCreatorMap(creatorMap);
      } else {
        setAdopted([]);
        setCreatorMap({});
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
              YOUR CONTRIBUTIONS IN ACTION
            </h1>
            <div className="text-gray-700 text-sm md:text-base mb-6">
              View the projects you’ve joined and continue shaping with your skills and passion.
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
                  contactCreatorUrl={creatorMap[p.id] ? `/chat/${creatorMap[p.id]}` : undefined}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
