"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

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

function ProjectCard({
  project,
  delay = 0,
  onDelete,
}: {
  project: Project;
  delay?: number;
  onDelete?: (id: string) => void;
}) {
  const imageFile = project.files?.find((f) =>
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name)
  );
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [author, setAuthor] = useState<{
    name: string;
    unique_id: string;
  } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then((result) => {
      setUser(result.data.user);
    });
  }, []);

  useEffect(() => {
    const fetchFavourites = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("favourites")
        .select("project_id")
        .eq("user_id", user.id);
      setFavourites(
        (data || []).map((f: { project_id: string }) => f.project_id)
      );
    };
    fetchFavourites();
  }, [user]);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!project.creator_id) return;
      const { data } = await supabase
        .from("profiles")
        .select("name, unique_id")
        .eq("id", project.creator_id)
        .single();
      setAuthor(data);
    };
    fetchAuthor();
  }, [project.creator_id]);

  const toggleFavourite = async (projectId: string) => {
    if (!user) return;
    if (favourites.includes(projectId)) {
      await supabase
        .from("favourites")
        .delete()
        .eq("user_id", user.id)
        .eq("project_id", projectId);
      setFavourites(favourites.filter((id) => id !== projectId));
    } else {
      await supabase
        .from("favourites")
        .insert([{ user_id: user.id, project_id: projectId }]);
      setFavourites([...favourites, projectId]);
    }
  };

  const isFavourited = favourites.includes(project.id);
  const isOwnProject = user && user.id === project.creator_id;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, type: "spring" }}
      className="relative flex bg-white rounded-xl border border-gray-200 shadow p-0 gap-0 items-stretch mb-0 hover:shadow-lg transition-all overflow-hidden"
    >
      {/* Favourite Button (hide for own projects) */}
      {!isOwnProject && (
        <button
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors border border-gray-200"
          onClick={() => toggleFavourite(project.id)}
          aria-label={isFavourited ? 'Unfavourite' : 'Favourite'}
        >
          {isFavourited ? (
            <FaHeart className="text-emerald-500 w-6 h-6" />
          ) : (
            <FaRegHeart className="text-gray-400 w-6 h-6" />
          )}
        </button>
      )}
      {/* Image Section */}
      <div className="w-72 min-w-[18rem] h-56 flex-shrink-0 rounded-l-xl overflow-hidden bg-gray-100 border-r border-gray-200 flex items-center justify-center">
        {imageFile ? (
          <Image
            src={imageFile.url}
            alt={imageFile.name}
            width={288}
            height={224}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
            No Image
          </div>
        )}
      </div>
      {/* Info Section */}
      <div className="flex-1 flex flex-col justify-between p-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Link
              href={`/projects/${project.id}`}
              className="text-lg font-bold text-black hover:text-accent hover:underline transition-colors line-clamp-1"
            >
              {project.title}
            </Link>
            {onDelete && (
              <button
                onClick={() => onDelete(project.id)}
                className="ml-2 text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded border border-red-700 bg-red-900/30"
                title="Delete"
              >
                Delete
              </button>
            )}
          </div>
          <div className="text-xs text-gray-500 mb-1">{project.category}</div>
          <div className="text-gray-800 text-sm line-clamp-2 mb-2">
            {project.description}
          </div>
          <div className="flex gap-2 flex-wrap text-xs mb-2">
            {project.tags?.map((tag: string) => (
              <span key={tag} className="bg-gray-100 text-black rounded px-2 py-0.5 border border-gray-200">
                #{tag}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-500 mb-2">Status: {project.status}</div>
          <div className="text-xs mt-2">
            by {author ? (
              <Link
                href={`/profile/${author.unique_id}`}
                className="text-black hover:underline font-mono"
              >
                {author.name || "User"} ({author.unique_id})
              </Link>
            ) : (
              <span>Loading...</span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <Link
            href={`/projects/${project.id}`}
            className="text-emerald-600 underline text-xs font-semibold hover:text-accent transition-colors"
          >
            View Project
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function MyProjectsPage() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

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
      <Navbar />
      <main className="min-h-screen bg-white pb-20">
        <section className="max-w-5xl mx-auto py-12 px-4">
          <h1 className="text-3xl font-bold mb-6 text-primary font-display">
            My Projects
          </h1>
          {loading ? (
            <div>Loading...</div>
          ) : projects.length === 0 ? (
            <div className="text-muted">No projects found.</div>
          ) : (
            <div>
              {projects.map((p, i) => (
                <div key={p.id}>
                  <ProjectCard project={p} delay={0.05 * i} onDelete={handleDelete} />
                  {i !== projects.length - 1 && (
                    <hr className="my-8 border-gray-200" />
                  )}
                </div>
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
            <span className="px-4 py-2 text-black font-bold">Page {page} of {totalPages}</span>
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
