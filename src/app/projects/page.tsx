"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ProjectCard } from "@/components/ProjectCard";
import { useAuth } from "@/components/AuthContext";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

const categories = [
  "All",
  "Code",
  "Art",
  "Writing",
  "Design",
  "Research",
  "Music",
  "Business Idea",
  "Game",
  "Invention",
  "Other",
];
const statuses = [
  "All",
  "Looking for Help",
  "Free to Take",
  "Inspiration Only",
];

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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const query = supabase.from("projects").select("*", { count: "exact" });
      // Fetch all projects, then filter/shuffle/paginate client-side
      const { data, error } = await query;
      if (error) {
        setProjects([]);
        setLoading(false);
        return;
      }
      let filtered: Project[] = data || [];
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (p: Project) =>
            p.title.toLowerCase().includes(s) ||
            p.description?.toLowerCase().includes(s) ||
            (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(s)))
        );
      }
      // Shuffle
      for (let i = filtered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
      }
      setTotalPages(Math.max(1, Math.ceil(filtered.length / 10)));
      setProjects(filtered.slice((page - 1) * 10, page * 10));
      setLoading(false);
    };
    fetchProjects();
  }, [search, page]);

  const { user } = useAuth();
  const [adoptersMap, setAdoptersMap] = useState<
    Record<string, { id: string; name: string }[]>
  >({});
  const [authorMap, setAuthorMap] = useState<
    Record<string, { id: string }>
  >({});

  useEffect(() => {
    // Fetch adopters and authors for all projects
    const fetchAdoptersAndAuthors = async () => {
      if (projects.length === 0) return;
      // Adopters
      const projectIds = projects.map((p) => p.id);
      const { data: adoptions } = await supabase
        .from("adoptions")
        .select("project_id, adopter_id");
      const adoptersByProject: Record<string, string[]> = {};
      (adoptions || []).forEach(
        (a: { project_id: string; adopter_id: string }) => {
          if (!adoptersByProject[a.project_id])
            adoptersByProject[a.project_id] = [];
          adoptersByProject[a.project_id].push(a.adopter_id);
        }
      );
      // Fetch adopter profiles
      const allAdopterIds = Array.from(
        new Set(
          (adoptions || []).map((a: { adopter_id: string }) => a.adopter_id)
        )
      );
      let adopterProfiles: { id: string; name: string }[] = [];
      if (allAdopterIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", allAdopterIds);
        adopterProfiles = profiles || [];
      }
      const adoptersMap: Record<string, { id: string; name: string }[]> = {};
      for (const pid of projectIds) {
        adoptersMap[pid] = (adoptersByProject[pid] || []).map(
          (aid) =>
            adopterProfiles.find((p) => p.id === aid) || {
              id: aid,
              name: "User",
            }
        );
      }
      setAdoptersMap(adoptersMap);
      // Authors
      const creatorIds = Array.from(
        new Set(projects.map((p) => p.creator_id).filter(Boolean))
      );
      let authorProfiles: { id: string; unique_id: string }[] = [];
      if (creatorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, unique_id")
          .in("id", creatorIds);
        authorProfiles = profiles || [];
      }
      const authorMap: Record<string, { id: string }> = {};
      for (const p of projects) {
        const author = authorProfiles.find((a) => a.id === p.creator_id);
        if (author) authorMap[p.id] = { id: author.id };
      }
      setAuthorMap(authorMap);
    };
    fetchAdoptersAndAuthors();
  }, [projects]);

  return (
    <>
      <main className="min-h-screen bg-white pb-20 pt-24">
        <section className="max-w-5xl mx-auto py-12 px-4">
          <div className="mb-8">
            <div className="uppercase text-xs font-bold text-gray-500 tracking-widest mb-2">
              Explore Projects
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-1">
              Browse Our Open Initiatives
            </h1>
            <div className="text-gray-700 text-sm md:text-base mb-6">
              Discover a variety of innovative projects seeking passionate
              collaborators to bring ideas to life.
            </div>
            {/* Search and Filter Bar */}
            <div className="flex flex-wrap gap-4 mb-8 items-center rounded-xl bg-white border border-gray-200 shadow px-6 py-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-300 bg-white rounded-xl px-4 py-2 text-gray-700 appearance-none"
              >
                {categories.map((cat) => (
                  <option
                    key={cat}
                    value={cat}
                    className="text-gray-700 bg-white"
                  >
                    {cat}
                  </option>
                ))}
              </select>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-gray-300 bg-white rounded-xl px-4 py-2 text-gray-700 appearance-none"
              >
                {statuses.map((s) => (
                  <option key={s} value={s} className="text-gray-700 bg-white">
                    {s}
                  </option>
                ))}
              </select>
              <div className="relative flex-1 max-w-xs">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter by tag"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="pl-10 border border-gray-300 bg-white rounded-xl px-4 py-2 text-gray-700 placeholder:text-gray-400 w-full"
                />
              </div>
            </div>
          </div>
          {loading ? (
            <div className="text-center text-muted py-10">Loading...</div>
          ) : (
            <div>
              {projects.length === 0 ? (
                <div className="text-center text-muted">No projects found.</div>
              ) : (
                <div>
                  {projects.map((p, i) => {
                    const author = authorMap[p.id];
                    const adopters = adoptersMap[p.id] || [];
                    const adopted = adopters.length > 0;
                    const hasAdopted = user ? adopters.some(a => a.id === user.id) : false;
                    const contactCreatorUrl =
                      author && user && user.id !== p.creator_id && hasAdopted
                        ? `/chat/${author.id}`
                        : undefined;
                    return (
                      <div key={p.id}>
                        <ProjectCard
                          project={p}
                          delay={0.05 * i}
                          adopters={adopters}
                          adopted={adopted}
                          contactCreatorUrl={contactCreatorUrl}
                        />
                        {i !== projects.length - 1 && (
                          <hr className="my-8 border-gray-200" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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
