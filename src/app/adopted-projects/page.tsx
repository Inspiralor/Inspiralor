"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function AdoptedProjectsPage() {
  const [user, setUser] = useState<any>(null);
  const [adopted, setAdopted] = useState<any[]>([]);
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
      const { data } = await supabase
        .from("projects")
        .select("id, title, category, status")
        .eq("adopter_id", user.id);
      setAdopted(data || []);
      setLoading(false);
    };
    fetchAdopted();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
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
            <ul className="list-disc ml-6">
              {adopted.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.id}`}
                    className="text-accent underline"
                  >
                    {p.title}
                  </Link>{" "}
                  <span className="text-xs text-muted">
                    ({p.category}, {p.status})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
