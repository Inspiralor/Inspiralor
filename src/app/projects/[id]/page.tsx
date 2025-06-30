"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

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
  const [user, setUser] = useState<any>(null);
  const [author, setAuthor] = useState<{
    name: string;
    unique_id: string;
  } | null>(null);
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
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

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

  if (loading)
    return <main className="max-w-2xl mx-auto py-10 px-4">Loading...</main>;
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-surface to-primary/30 flex items-center justify-center py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-2xl rounded-xl bg-glass shadow-glass p-8 border border-border backdrop-blur-md"
      >
        <h1 className="text-4xl font-bold mb-2 text-primary font-display">
          {project.title}
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
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
            className="bg-green-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-accent transition-colors"
          >
            Adopt Project
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
            className="bg-blue-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-accent transition-colors"
          >
            Remix / Continue
          </motion.button>
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
  );
}
