"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthContext";

type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  tools: string;
  reason_abandoned: string;
  tags: string[];
  status: string;
  links: string[];
  files: { name: string; url: string }[];
  creator_id: string;
  created_at: string;
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [author, setAuthor] = useState<{
    name: string;
    unique_id: string;
  } | null>(null);
  const [adopters, setAdopters] = useState<{ id: string; name: string }[]>([]);
  const [hasAdopted, setHasAdopted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) setProject(data);
      setLoading(false);
    };
    if (id) fetchProject();
  }, [id]);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!project?.creator_id) return;
      const { data } = await supabase
        .from("profiles")
        .select("name, unique_id")
        .eq("id", project.creator_id)
        .single();
      setAuthor(data);
    };
    if (project) fetchAuthor();
  }, [project]);

  // Fetch all adopters for this project
  useEffect(() => {
    const fetchAdopters = async () => {
      if (!project?.id) return;
      // Get all adoptions for this project
      const { data: adoptions } = await supabase
        .from("adoptions")
        .select("adopter_id")
        .eq("project_id", project.id);
      if (adoptions && adoptions.length > 0) {
        const adopterIds = adoptions.map(
          (a: { adopter_id: string }) => a.adopter_id
        );
        // Get adopter profiles
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", adopterIds);
        setAdopters(profiles || []);
        if (user) setHasAdopted(adopterIds.includes(user.id));
      } else {
        setAdopters([]);
        setHasAdopted(false);
      }
    };
    fetchAdopters();
  }, [project, user]);

  if (loading)
    return (
      <main className="max-w-2xl mx-auto py-10 px-4 text-black">
        Loading...
      </main>
    );
  if (!project)
    return (
      <main className="max-w-2xl mx-auto py-10 px-4">Project not found.</main>
    );

  const handleDelete = async () => {
    if (!project) return;
    if (!confirm("Are you sure you want to delete this project?")) return;
    await supabase.from("projects").delete().eq("id", project.id);
    router.push("/projects");
  };

  // In handleAdopt, update the adopted_by array in the database
  const handleAdopt = async () => {
    if (!user || !project) return;
    if (hasAdopted) return;
    // Insert into adoptions table
    const { error: insertError } = await supabase
      .from("adoptions")
      .insert([{ project_id: project.id, adopter_id: user.id }]);
    if (insertError) {
      alert("Failed to adopt project: " + insertError.message);
      return;
    }
    // Optionally, update project status if you want
    // await supabase.from("projects").update({ status: "restarted" }).eq("id", project.id);
    // Send email to creator (placeholder for API call)
    try {
      const res = await fetch("/api/adopt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          creatorId: project.creator_id,
          adopterId: user.id,
        }),
      });
      if (!res.ok) throw new Error("Failed to send email");
      alert("Project adopted! The creator has been notified.");
      setHasAdopted(true);
      // Optionally, refresh adopters
      const { data: adoptions } = await supabase
        .from("adoptions")
        .select("adopter_id")
        .eq("project_id", project.id);
      if (adoptions && adoptions.length > 0) {
        const adopterIds = adoptions.map(
          (a: { adopter_id: string }) => a.adopter_id
        );
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", adopterIds);
        setAdopters(profiles || []);
      }
    } catch {
      alert("Project adopted, but failed to send email notification.");
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background via-surface to-primary/30 flex items-center justify-center py-10 px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-2xl rounded-xl bg-glass shadow-glass p-8 border border-border backdrop-blur-md"
        >
          <h1 className="text-4xl font-bold mb-2 text-primary font-display">
            {project.title}
            {hasAdopted && (
              <span className="ml-4 px-3 py-1 rounded-full bg-green-600 text-white text-sm font-semibold align-middle">
                Adopted
              </span>
            )}
          </h1>
          <div className="mb-2 text-muted">Category: {project.category}</div>
          <div className="mb-2 text-muted">Status: {project.status}</div>
          <div className="mb-2 text-muted">Tools/Medium: {project.tools}</div>
          <div className="mb-2 text-muted">
            Tags:{" "}
            {project.tags?.map((t) => (
              <span
                key={t}
                className="inline-block bg-glass text-primary rounded px-2 py-0.5 mr-1"
              >
                #{t}
              </span>
            ))}
          </div>
          <div className="mb-2 text-muted">
            Author:{" "}
            {author ? (
              <Link
                href={`/profile/${author.unique_id}`}
                className="text-muted hover:underline font-mono"
              >
                {author.name || "User"} ({author.unique_id})
              </Link>
            ) : (
              <span>Loading...</span>
            )}
          </div>
          <div className="mb-2 text-muted">
            Posted: {new Date(project.created_at).toLocaleString()}
          </div>
          <div className="mb-4 text-gray-200 whitespace-pre-line">
            {project.description}
          </div>
          <div className="mb-4 text-gray-200 whitespace-pre-line">
            <strong className="text-accent">Why was it abandoned?</strong>
            <div>{project.reason_abandoned}</div>
          </div>
          {project.links?.length > 0 && (
            <div className="mb-4">
              <strong className="text-primary">Links:</strong>
              <ul className="list-disc ml-6">
                {project.links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link}
                      className="text-accent underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {project.files?.length > 0 && (
            <div className="mb-4">
              <strong className="text-primary">Files:</strong>
              <ul className="list-disc ml-6 flex flex-col gap-3 mt-2">
                {project.files.map((file, i) => {
                  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(
                    file.name
                  );
                  return (
                    <li key={i} className="flex items-center gap-4">
                      {isImage ? (
                        <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-black bg-surface flex items-center justify-center">
                          <Image
                            src={file.url}
                            alt={file.name}
                            width={128}
                            height={128}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : null}
                      <a
                        href={file.url}
                        className="text-accent underline text-lg font-semibold hover:text-black transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {file.name}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div className="flex gap-4 mt-6">
            {user && user.id !== project.creator_id && (
              <>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.03 }}
                  className={`bg-green-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-colors ${
                    hasAdopted
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-accent"
                  }`}
                  onClick={hasAdopted ? undefined : handleAdopt}
                  disabled={hasAdopted}
                >
                  {hasAdopted ? "You Adopted This Project" : "Adopt Project"}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.03 }}
                  className="bg-blue-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-accent transition-colors"
                >
                  Remix / Continue
                </motion.button>
              </>
            )}
            {user && project && user.id === project.creator_id && (
              <>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.03 }}
                  className="bg-yellow-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-white hover:text-primary transition-colors"
                  onClick={() => router.push(`/projects/${project.id}/edit`)}
                >
                  Edit
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.03 }}
                  className="bg-red-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-red-900 transition-colors"
                  onClick={handleDelete}
                >
                  Delete
                </motion.button>
              </>
            )}
          </div>
          {/* List of adopters inside the project card */}
          {adopters.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-green-700 mb-2">
                Adopted by:
              </h3>
              <ul className="list-disc ml-6">
                {adopters.map((a) => (
                  <li key={a.id} className="text-green-800 font-semibold">
                    {a.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-2 text-primary">
              Remix Tree
            </h2>
            <div className="p-4 border rounded-xl bg-glass text-muted">
              Remix tree coming soon.
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}
