"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthContext";
import { Button } from "@/components/Button";
import { LoadingSpinner } from "@/components/LoadingSpinner";

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
  // Move these hooks to the top level
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageIdx, setModalImageIdx] = useState<number | null>(null);
  const [gridModalOpen, setGridModalOpen] = useState(false);

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
      <main className="max-w-2xl mx-auto py-10 px-4 text-black flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size={32} />
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

  const imageFiles =
    project.files?.filter((f) =>
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name)
    ) || [];
  const openImageModal = (idx: number) => {
    setModalImageIdx(idx);
    setModalOpen(true);
  };
  const closeImageModal = () => {
    setModalOpen(false);
    setModalImageIdx(null);
  };
  const openGridModal = () => {
    setGridModalOpen(true);
  };
  const closeGridModal = () => {
    setGridModalOpen(false);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full bg-gradient-to-br from-background via-surface to-primary/30 flex flex-col items-center py-10 px-4 pt-24">
        <Navbar />
        <div className="w-full max-w-4xl mx-auto px-4 flex flex-col items-center">
          <h1 className="text-4xl font-extrabold mb-10 text-primary font-display drop-shadow-lg text-center tracking-tight">
            {project.title}
            {hasAdopted && (
              <span className="ml-4 px-3 py-1 rounded-full bg-green-600 text-white text-base font-semibold align-middle">
                Adopted
              </span>
            )}
          </h1>
          {/* Outer border for all content except title */}
          <div className="w-full border-4 border-primary/30 rounded-3xl p-6 bg-transparent flex flex-col items-center">
            {/* Main image and description side by side */}
            <div className="w-full flex flex-col md:flex-row gap-10 justify-center items-start mb-8">
              {/* Main image */}
              <div className="flex flex-col items-center w-full md:w-[340px]">
                {imageFiles.length > 0 && (
                  <img
                    src={imageFiles[0].url}
                    alt={imageFiles[0].name}
                    className="w-[320px] h-[250px] object-cover border-4 border-white shadow-2xl mb-4 rounded-2xl"
                  />
                )}
              </div>
              {/* Info box to the right */}
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full bg-white/20 border-2 border-white/60 shadow-lg p-6 mb-4 relative">
                  <div className="absolute inset-0 border-2 border-primary/30 pointer-events-none"></div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row items-center mt-2">
                      <span className="font-bold text-base text-primary">
                        Category:
                      </span>
                      <span className="text-sm text-white font-normal pl-2">
                        {project.category}
                      </span>
                    </div>
                    <div className="flex flex-row items-center mt-2">
                      <span className="font-bold text-base text-primary">
                        Status:
                      </span>
                      <span className="text-sm text-white font-normal pl-2">
                        {project.status}
                      </span>
                    </div>
                    <div className="flex flex-row items-center mt-2">
                      <span className="font-bold text-base text-primary">
                        Tools/Medium:
                      </span>
                      <span className="text-sm text-white font-normal pl-2">
                        {project.tools}
                      </span>
                    </div>

                    <div className="flex flex-row flex-wrap items-center mt-2">
                      <span className="font-bold text-base text-primary">
                        Tags:
                      </span>
                      {project.tags?.map((t) => (
                        <span
                          key={t}
                          className="inline-block bg-white/40 border border-white/60 text-primary px-2 py-0.5 font-semibold text-xs shadow ml-1 rounded"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Description box (now full width) */}
            <div className="w-full bg-white/20 border-2 border-white/60 shadow-lg p-8 mb-8 relative">
              <div className="absolute inset-0 border-2 border-primary/30 pointer-events-none"></div>
              <div className="font-bold text-primary text-lg mb-4">
                Description
              </div>
              <div className="whitespace-pre-line text-sm text-white font-normal leading-relaxed">
                {project.description}
              </div>
            </div>
            {/* Why abandoned box */}
            <div className="w-full bg-white/20 border-2 border-white/60 shadow-lg p-8 mb-8 relative">
              <div className="absolute inset-0 border-2 border-accent/30 pointer-events-none"></div>
              <div className="font-bold text-accent text-lg mb-2">
                Why was it abandoned?
              </div>
              <div className="whitespace-pre-line text-sm text-white font-normal leading-relaxed">
                {project.reason_abandoned}
              </div>
            </div>
            {/* Links box */}
            {project.links?.length > 0 && (
              <div className="w-full bg-white/20 border-2 border-white/60 shadow-lg p-8 mb-8 relative">
                <div className="absolute inset-0 border-2 border-primary/30 pointer-events-none"></div>
                <div className="font-bold text-primary text-lg mb-2">Links</div>
                <ul className="list-disc ml-6 text-sm">
                  {project.links.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link}
                        className="text-accent underline font-semibold hover:text-black transition-colors"
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
            {/* Files box (non-image files) */}
            {project.files?.filter(
              (file) => !/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)
            ).length > 0 && (
              <div className="w-full bg-white/20 border-2 border-white/60 shadow-lg p-8 mb-8 relative">
                <div className="absolute inset-0 border-2 border-primary/30 pointer-events-none"></div>
                <div className="font-bold text-primary text-lg mb-2">Files</div>
                <ul className="list-disc ml-6 text-base">
                  {project.files
                    .filter(
                      (file) =>
                        !/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)
                    )
                    .map((file, i) => (
                      <li key={i} className="flex items-center gap-4">
                        <a
                          href={file.url}
                          className="text-accent underline font-semibold hover:text-black transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {file.name}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            )}
            {/* Images box (thumbnails, grid, modal) */}
            {imageFiles.length > 0 && (
              <div className="w-full bg-white/20 border-2 border-white/60 shadow-lg p-8 mb-8 relative">
                <div className="absolute inset-0 border-2 border-primary/30 pointer-events-none"></div>
                <div className="font-bold text-primary text-lg mb-4">
                  Project Images
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                  {imageFiles.slice(0, 10).map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={img.url}
                        alt={img.name}
                        className={`w-[124px] h-[124px] object-cover rounded-xl cursor-pointer border border-gray-300 ${
                          idx === 0
                            ? "border-8 border-white shadow-lg"
                            : "border-2 border-gray-400"
                        }`}
                        onClick={() => openImageModal(idx)}
                      />
                      {imageFiles.length > 10 && idx === 9 && (
                        <div
                          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-xl cursor-pointer"
                          onClick={openGridModal}
                        >
                          <span className="text-white text-lg font-bold select-none">
                            10+
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Full Image Modal */}
                {modalOpen && modalImageIdx !== null && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
                    onClick={closeImageModal}
                  >
                    <img
                      src={imageFiles[modalImageIdx].url}
                      alt={imageFiles[modalImageIdx].name}
                      className="max-w-[90vw] max-h-[90vh] shadow-2xl border-8 border-white rounded-2xl"
                      style={{ zIndex: 60 }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
                {/* Grid Modal for all images */}
                {gridModalOpen && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
                    onClick={closeGridModal}
                  >
                    <div
                      className="bg-white shadow-2xl p-8 max-h-[90vh] overflow-y-auto rounded-2xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="grid grid-cols-5 gap-6">
                        {imageFiles.map((img, idx) => (
                          <img
                            key={idx}
                            src={img.url}
                            alt={img.name}
                            className="w-[124px] h-[124px] object-cover rounded-xl cursor-pointer border-2 border-gray-300"
                            onClick={() => {
                              setModalImageIdx(idx);
                              setModalOpen(true);
                              setGridModalOpen(false);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Action buttons and adopters section remain unchanged */}
            <div className="flex gap-6 mt-10 justify-center">
              {user && user.id !== project.creator_id && (
                <>
                  <Button
                    variant="primary"
                    size="md"
                    className="font-bold shadow-lg"
                    onClick={hasAdopted ? undefined : handleAdopt}
                    disabled={hasAdopted}
                  >
                    {hasAdopted ? "You Adopted This Project" : "Adopt Project"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    className="font-bold shadow-lg"
                    disabled
                  >
                    Remix / Continue
                  </Button>
                </>
              )}
              {user && project && user.id === project.creator_id && (
                <>
                  <Button
                    variant="secondary"
                    size="md"
                    className="font-bold shadow-lg"
                    onClick={() => router.push(`/projects/${project.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="md"
                    className="font-bold shadow-lg"
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
            {/* List of adopters inside the project card */}
            {adopters.length > 0 && (
              <div className="mt-6">
                <h3 className="text-base font-semibold text-green-700 mb-2">
                  Adopted by:
                </h3>
                <ul className="list-disc ml-6">
                  {adopters.map((a) => (
                    <li
                      key={a.id}
                      className="text-green-800 font-semibold text-sm"
                    >
                      {a.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
