"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useAuth } from "@/components/AuthContext";
import { Button } from "@/components/Button";

export type ProjectCardProject = {
  id: string;
  title: string;
  description?: string;
  category: string;
  tags?: string[];
  status: string;
  files?: { name: string; url: string }[];
  creator_id?: string;
};

interface ProjectCardProps {
  project: ProjectCardProject;
  delay?: number;
  onDelete?: (id: string) => void;
  showFavourite?: boolean;
  showDelete?: boolean;
  showAuthor?: boolean;
  adopted?: boolean;
  contactCreatorUrl?: string;
}

export function ProjectCard({
  project,
  delay = 0,
  onDelete,
  showFavourite = true,
  showDelete = false,
  showAuthor = true,
  adopted = false,
  contactCreatorUrl,
}: ProjectCardProps) {
  const imageFiles =
    project.files?.filter((f) =>
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name)
    ) || [];
  const { user } = useAuth();
  const [favourites, setFavourites] = useState<string[]>([]);
  const [author, setAuthor] = useState<{
    name: string;
    unique_id: string;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageIdx, setModalImageIdx] = useState<number | null>(null);
  const [gridModalOpen, setGridModalOpen] = useState(false);

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

  useEffect(() => {
    if (!user) return;
    const fetchFavourites = async () => {
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
    if (!project.creator_id) return;
    const fetchAuthor = async () => {
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
      {showFavourite && !isOwnProject && user && (
        <Button
          variant={isFavourited ? "primary" : "outline"}
          size="sm"
          className="absolute top-4 right-4 z-10 !p-2 !rounded-full border"
          onClick={() => toggleFavourite(project.id)}
          aria-label={isFavourited ? "Unfavourite" : "Favourite"}
        >
          {isFavourited ? (
            <FaHeart className="text-emerald-500 w-6 h-6" />
          ) : (
            <FaRegHeart className="text-gray-400 w-6 h-6" />
          )}
        </Button>
      )}
      {/* Image Section */}
      <div className="w-72 min-w-[18rem] h-56 flex-shrink-0 rounded-l-xl overflow-hidden bg-gray-100 border-r border-gray-200">
        {imageFiles.length > 0 ? (
          <Image
            src={imageFiles[0].url}
            alt={imageFiles[0].name}
            width={288}
            height={224}
            className="object-cover w-full h-full"
            style={{ display: "block" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
            No Image
          </div>
        )}
      </div>
      {/* Info Section */}
      <div className="flex-1 flex flex-col justify-between px-4 pt-4 pb-1">
        <div>
          <div className="flex items-center mb-2 gap-2">
            <div className="flex-1 min-w-0">
              <Link
                href={`/projects/${project.id}`}
                className="text-lg font-bold text-black hover:text-accent hover:underline transition-colors block truncate"
                style={{ wordBreak: "break-word" }}
                title={project.title}
              >
                {project.title.split(" ").slice(0, 6).join(" ")}
                {project.title.split(" ").length > 6 ? "..." : ""}
              </Link>
            </div>
            {showDelete && onDelete && (
              <Button
                variant="danger"
                size="sm"
                className="ml-2"
                onClick={() => onDelete(project.id)}
                title="Delete"
              >
                Delete
              </Button>
            )}
          </div>
          <div className="text-xs text-gray-500 mb-1">{project.category}</div>
          {project.description && (
            <div className="text-gray-800 text-sm line-clamp-2 mb-2">
              {project.description}
            </div>
          )}
          {project.tags && (
            <div className="flex gap-2 flex-wrap text-xs mb-2">
              {project.tags.slice(0, 4).map((tag: string, idx: number) => (
                <span
                  key={tag + idx}
                  className="bg-gray-100 text-black rounded px-2 py-0.5 border border-gray-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <div className="text-xs text-gray-500 mb-2">
            Status: {project.status}
          </div>
          {showAuthor && (
            <div className="text-xs mt-2 text-black">
              by{" "}
              {author ? (
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
          )}
        </div>
        <div className="flex items-center justify-between mt-2 gap-2 w-full">
          {/* Adopted tag (always reserve space) */}
          <div className="flex-1 flex justify-center">
            {adopted ? (
              <span className="text-xs text-green-700 font-semibold bg-green-100 px-2 py-1 rounded">
                Adopted
              </span>
            ) : (
              <span className="invisible text-xs px-2 py-1">Adopted</span>
            )}
          </div>
          {/* Contact the Creator (always reserve space) */}
          <div className="flex-1 flex justify-center">
            {contactCreatorUrl && adopted ? (
              <a
                href={contactCreatorUrl}
                className="text-blue-600 underline text-xs font-semibold hover:text-accent transition-colors bg-blue-50 px-2 py-1 rounded"
              >
                Contact the Creator
              </a>
            ) : (
              <span className="invisible text-xs px-2 py-1">
                Contact the Creator
              </span>
            )}
          </div>
          {/* View Project (always reserve space) */}
          <div className="flex-1 flex justify-center">
            <Link
              href={`/projects/${project.id}`}
              className="text-emerald-600 underline text-xs font-semibold hover:text-accent transition-colors"
            >
              View Project
            </Link>
          </div>
        </div>
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
            className="max-w-[90vw] max-h-[90vh] rounded shadow-lg border-4 border-white"
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
            className="bg-white rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-5 gap-4">
              {imageFiles.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={img.name}
                  className="w-[124px] h-[124px] object-cover rounded cursor-pointer border border-gray-300"
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
    </motion.div>
  );
}
