"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/components/AuthContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";

// Types
interface ProjectFile {
  name: string;
  url: string;
}
interface Project {
  id: string;
  title: string;
  category: string;
  files?: ProjectFile[];
  creator_id?: string;
}
interface Creator {
  id: string;
  name: string;
  profile_image: string | null;
  count: number;
}
interface Profile {
  id: string;
  name: string;
  profile_image: string | null;
}

export default function Landing() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  // Creators state
  const [creators, setCreators] = useState<Creator[]>([]);
  // Favourites state
  const [favourites, setFavourites] = useState<string[]>([]);
  // Search state
  const [search, setSearch] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adoptedCount, setAdoptedCount] = useState<number | null>(null);

  // Add at the top of the Landing component, after useState declarations:
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const row3Ref = useRef<HTMLDivElement>(null);
  const [x1, setX1] = useState(0);
  const [x2, setX2] = useState(0);
  const [x3, setX3] = useState(0);
  // Row 1 animation (left)
  useEffect(() => {
    let frame: any;
    const speed = 0.2;
    const direction = -1;
    const animate = () => {
      if (row1Ref.current) {
        setX1((prev) => {
          const width = row1Ref.current ? row1Ref.current.scrollWidth / 2 : 0;
          let next = prev + speed * direction;
          if (Math.abs(next) > width) next = 0;
          return next;
        });
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);
  // Row 2 animation (right)
  useEffect(() => {
    let frame: any;
    const speed = 0.2;
    const direction = 1;
    const animate = () => {
      if (row2Ref.current) {
        setX2((prev) => {
          const width = row2Ref.current ? row2Ref.current.scrollWidth / 2 : 0;
          let next = prev + speed * direction;
          if (next > 0) next = -width;
          return next;
        });
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);
  // Row 3 animation (left)
  useEffect(() => {
    let frame: any;
    const speed = 0.2;
    const direction = -1;
    const animate = () => {
      if (row3Ref.current) {
        setX3((prev) => {
          const width = row3Ref.current ? row3Ref.current.scrollWidth / 2 : 0;
          let next = prev + speed * direction;
          if (Math.abs(next) > width) next = 0;
          return next;
        });
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Fetch user and profile
  useEffect(() => {
    const fetchUser = async () => {
      if (!user) {
        router.replace("/login");
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, name, profile_image")
        .eq("id", user.id)
        .single();
      setProfile(profile);
      // Fetch favourites
      const { data: favs } = await supabase
        .from("favourites")
        .select("project_id")
        .eq("user_id", user.id);
      setFavourites(
        (favs || []).map((f: { project_id: string }) => f.project_id)
      );
      setLoading(false);
    };
    fetchUser();
  }, [user]);

  // Fetch latest projects
  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from("projects")
        .select("id, title, category, files")
        .order("created_at", { ascending: false })
        .limit(6);
      setProjects((data as Project[]) || []);
    };
    fetchProjects();
  }, []);

  // Fetch top creators (by project count)
  useEffect(() => {
    const fetchCreators = async () => {
      // Get all profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, profile_image");
      // Get all projects
      const { data: projects } = await supabase
        .from("projects")
        .select("creator_id");
      // Count projects per creator
      const counts: Record<string, number> = {};
      (projects || []).forEach((p: { creator_id: string }) => {
        if (p.creator_id)
          counts[p.creator_id] = (counts[p.creator_id] || 0) + 1;
      });
      const creators = (profiles || []).map((p: Profile) => ({
        ...p,
        count: counts[p.id] || 0,
      }));
      creators.sort((a: Creator, b: Creator) => b.count - a.count);
      // Repeat if less than 18
      let repeated: Creator[] = [];
      while (repeated.length < 18) {
        repeated = repeated.concat(creators);
      }
      setCreators(repeated.slice(0, 18));
    };
    fetchCreators();
  }, []);

  // Fetch adopted projects count
  useEffect(() => {
    const fetchAdoptedCount = async () => {
      const { count } = await supabase
        .from('adoptions')
        .select('project_id', { count: 'exact', head: true });
      setAdoptedCount(count || 0);
    };
    fetchAdoptedCount();
  }, []);

  // Favourite toggle
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

  // Now do the early return
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Section 1: Welcome & Search */}
      <section className="flex flex-col items-center justify-center h-[60vh]">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center">
          Welcome Back{profile?.name ? `, ${profile.name}` : ""}!
        </h1>
        <div className="w-full max-w-md relative mb-4">
          <input
            type="text"
            className="w-full pl-4 pr-12 py-2 rounded-lg bg-gray-800 text-base text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-lg"
            placeholder="Search for projects, creators, type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                router.push(`/projects?search=${encodeURIComponent(search)}`);
              }
            }}
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors"
            onClick={() =>
              router.push(`/projects?search=${encodeURIComponent(search)}`)
            }
            aria-label="Search"
          >
            <MagnifyingGlassIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </section>

      {/* Section 2: Latest New Projects */}
      <section className="max-w-6xl mx-auto py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Latest New Projects
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {projects.map((project) => {
            const imageFile = project.files?.find((f) =>
              /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name)
            );
            const isFavourited = favourites.includes(project.id);
            const isOwnProject = user && user.id === project.creator_id;
            return (
              <div
                key={project.id}
                className="relative bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col"
              >
                <div className="relative w-full h-48 bg-gray-900">
                  {imageFile ? (
                    <Link href={`/projects/${project.id}`}>
                      <Image
                        src={imageFile.url}
                        alt={imageFile.name}
                        fill
                        className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    </Link>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl">
                      No Image
                    </div>
                  )}
                  {/* Favourite Button (hide for own projects) */}
                  {!isOwnProject && (
                    <button
                      className="absolute bottom-3 right-3 bg-black/70 rounded-full p-2"
                      onClick={() => toggleFavourite(project.id)}
                    >
                      {isFavourited ? (
                        <FaHeart className="text-emerald-400 w-6 h-6" />
                      ) : (
                        <FaRegHeart className="text-white w-6 h-6" />
                      )}
                    </button>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-lg font-bold mb-1 line-clamp-1 hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    {project.title}
                  </Link>
                  <div className="text-sm text-emerald-400 mb-2">
                    {project.category}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 3: Top Creators (animated rows) */}
      <section className="max-w-6xl mx-auto py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Top Creators</h2>
        <div className="flex flex-col gap-8">
          {/* Row 1 */}
          <div className="relative overflow-hidden" style={{ width: "100%" }}>
            <div
              className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10"
              style={{
                background:
                  "linear-gradient(to right, rgba(17,17,17,0.7) 60%, rgba(17,17,17,0.1) 90%, transparent 100%)",
              }}
            />
            <div
              className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10"
              style={{
                background:
                  "linear-gradient(to left, rgba(17,17,17,0.7) 60%, rgba(17,17,17,0.1) 90%, transparent 100%)",
              }}
            />
            <div
              ref={row1Ref}
              className="flex gap-6"
              style={{
                transform: `translateX(${x1}px)`,
                width: `${Math.min(creators.length, 6) * 2 * 220}px`,
              }}
            >
              {[...creators.slice(0, 6), ...creators.slice(0, 6)].map(
                (creator, i) => (
                  <Link
                    key={creator.id + i}
                    href={`/profile/${creator.id}`}
                    className="bg-gray-800 rounded-xl shadow-lg flex flex-col items-center p-6 min-w-[200px] cursor-pointer hover:bg-emerald-900 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden mb-3 bg-gray-700">
                      <Image
                        src={creator.profile_image || "/images/Me/me.jpeg"}
                        alt={creator.name || "User"}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="font-bold text-lg mb-1 text-center">
                      {creator.name || "Unnamed"}
                    </div>
                    <div className="text-sm text-gray-400 mb-1">
                      {creator.count} posts
                    </div>
                  </Link>
                )
              )}
            </div>
          </div>
          {/* Row 2 */}
          <div className="relative overflow-hidden" style={{ width: "100%" }}>
            <div
              className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10"
              style={{
                background:
                  "linear-gradient(to right, rgba(17,17,17,0.7) 60%, rgba(17,17,17,0.1) 90%, transparent 100%)",
              }}
            />
            <div
              className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10"
              style={{
                background:
                  "linear-gradient(to left, rgba(17,17,17,0.7) 60%, rgba(17,17,17,0.1) 90%, transparent 100%)",
              }}
            />
            <div
              ref={row2Ref}
              className="flex gap-6"
              style={{
                transform: `translateX(${x2}px)`,
                width: `${Math.min(creators.length, 6) * 2 * 220}px`,
              }}
            >
              {[...creators.slice(6, 12), ...creators.slice(6, 12)].map(
                (creator, i) => (
                  <Link
                    key={creator.id + i}
                    href={`/profile/${creator.id}`}
                    className="bg-gray-800 rounded-xl shadow-lg flex flex-col items-center p-6 min-w-[200px] cursor-pointer hover:bg-emerald-900 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden mb-3 bg-gray-700">
                      <Image
                        src={creator.profile_image || "/images/Me/me.jpeg"}
                        alt={creator.name || "User"}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="font-bold text-lg mb-1 text-center">
                      {creator.name || "Unnamed"}
                    </div>
                    <div className="text-sm text-gray-400 mb-1">
                      {creator.count} posts
                    </div>
                  </Link>
                )
              )}
            </div>
          </div>
          {/* Row 3 */}
          <div className="relative overflow-hidden" style={{ width: "100%" }}>
            <div
              className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10"
              style={{
                background:
                  "linear-gradient(to right, rgba(17,17,17,0.7) 60%, rgba(17,17,17,0.1) 90%, transparent 100%)",
              }}
            />
            <div
              className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10"
              style={{
                background:
                  "linear-gradient(to left, rgba(17,17,17,0.7) 60%, rgba(17,17,17,0.1) 90%, transparent 100%)",
              }}
            />
            <div
              ref={row3Ref}
              className="flex gap-6"
              style={{
                transform: `translateX(${x3}px)`,
                width: `${Math.min(creators.length, 6) * 2 * 220}px`,
              }}
            >
              {[...creators.slice(12, 18), ...creators.slice(12, 18)].map(
                (creator, i) => (
                  <Link
                    key={creator.id + i}
                    href={`/profile/${creator.id}`}
                    className="bg-gray-800 rounded-xl shadow-lg flex flex-col items-center p-6 min-w-[200px] cursor-pointer hover:bg-emerald-900 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden mb-3 bg-gray-700">
                      <Image
                        src={creator.profile_image || "/images/Me/me.jpeg"}
                        alt={creator.name || "User"}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="font-bold text-lg mb-1 text-center">
                      {creator.name || "Unnamed"}
                    </div>
                    <div className="text-sm text-gray-400 mb-1">
                      {creator.count} posts
                    </div>
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
