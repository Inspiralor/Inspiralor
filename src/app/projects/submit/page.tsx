"use client";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";

const categories = [
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
const statuses = ["Looking for Help", "Free to Take", "Inspiration Only"];

type UploadedFile = {
  name: string;
  url: string;
  path: string;
  type: string;
  size: number;
};

export default function SubmitProjectPage({ isEdit = false }: { isEdit?: boolean }) {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [tools, setTools] = useState("");
  const [reason, setReason] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState(statuses[0]);
  const [links, setLinks] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login?message=login_required");
      } else {
        setUser(data.user);
      }
      setCheckingAuth(false);
    });
  }, [router]);

  useEffect(() => {
    if (isEdit && id) {
      const fetchProject = async () => {
        const { data } = await supabase.from("projects").select("*").eq("id", id).single();
        if (data) {
          setTitle(data.title);
          setDescription(data.description);
          setCategory(data.category);
          setTools(data.tools);
          setReason(data.reason_abandoned);
          setTags((data.tags || []).join(", "));
          setStatus(data.status);
          setLinks((data.links || []).join(", "));
          // files: skip for now
        }
      };
      fetchProject();
    }
  }, [isEdit, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    if (!user) {
      setError("You must be signed in to submit a project.");
      setLoading(false);
      return;
    }
    const tagArr = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const linkArr = links
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);
    let uploadedFiles: UploadedFile[] = [];
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("project-files")
          .upload(filePath, file);
        if (uploadError) {
          setError(`File upload failed: ${uploadError.message}`);
          setLoading(false);
          return;
        }
        const { data: urlData } = supabase.storage
          .from("project-files")
          .getPublicUrl(filePath);
        uploadedFiles.push({
          name: file.name,
          url: urlData.publicUrl,
          path: filePath,
          type: file.type,
          size: file.size,
        });
      }
    }
    if (isEdit && id) {
      // Update
      const { error: updateError } = await supabase.from("projects").update({
        title,
        description,
        category,
        tools,
        reason_abandoned: reason,
        tags: tagArr,
        status,
        links: linkArr,
        ...(uploadedFiles.length > 0 ? { files: uploadedFiles } : {}),
      }).eq("id", id);
      setLoading(false);
      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess("Project updated successfully!");
        setTimeout(() => router.push(`/projects/${id}`), 1500);
      }
    } else {
      // Insert (original logic)
      const { error: insertError } = await supabase.from("projects").insert([
        {
          title,
          description,
          category,
          tools,
          reason_abandoned: reason,
          tags: tagArr,
          status,
          links: linkArr,
          files: uploadedFiles,
          creator_id: user.id,
        },
      ]);
      setLoading(false);
      if (insertError) {
        setError(insertError.message);
      } else {
        setSuccess("Project submitted successfully!");
        setTimeout(() => router.push("/"), 1500);
      }
    }
  };

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-surface to-primary/30">
        <div className="text-muted text-lg">Checking authentication...</div>
      </main>
    );
  }
  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-surface to-primary/30 flex items-center justify-center py-10 px-4">
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-xl bg-glass shadow-glass p-10 flex flex-col gap-8 border border-gold backdrop-blur-md"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="text-3xl font-extrabold mb-4 text-primary font-display text-center drop-shadow-lg">
          Submit an Abandoned Project
        </h1>
        <div className="flex flex-col gap-6">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gold bg-surface/60 rounded-xl px-6 py-4 text-white placeholder:text-muted focus:ring-2 focus:ring-primary outline-none text-lg"
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gold bg-surface/60 rounded-xl px-6 py-4 text-white placeholder:text-muted focus:ring-2 focus:ring-primary outline-none text-lg min-h-[100px]"
            required
          />
          <div className="flex flex-col md:flex-row gap-6">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gold bg-surface/60 rounded-xl px-6 py-4 text-white flex-1"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-gold bg-surface/60 rounded-xl px-6 py-4 text-white flex-1"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Tools or Medium Used"
            value={tools}
            onChange={(e) => setTools(e.target.value)}
            className="border border-gold bg-surface/60 rounded-xl px-6 py-4 text-white placeholder:text-muted text-lg"
          />
          <textarea
            placeholder="Why was it abandoned?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="border border-gold bg-surface/60 rounded-xl px-6 py-4 text-white placeholder:text-muted text-lg min-h-[80px]"
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="border border-gold bg-surface/60 rounded-xl px-6 py-4 text-white placeholder:text-muted text-lg"
          />
          <input
            type="text"
            placeholder="Links (comma separated URLs)"
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            className="border border-gold bg-surface/60 rounded-xl px-6 py-4 text-white placeholder:text-muted text-lg"
          />
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={(e) => setFiles(e.target.files)}
            className="border border-gold bg-surface/60 rounded-xl px-6 py-4 text-white text-lg"
          />
        </div>
        {error && (
          <div className="text-red-500 font-semibold text-sm">{error}</div>
        )}
        {success && (
          <div className="text-green-500 font-semibold text-sm">{success}</div>
        )}
        <motion.button
          type="submit"
          className="mt-4 bg-primary text-accent px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-gold hover:text-primary transition-colors disabled:opacity-50 text-lg"
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.03 }}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Project"}
        </motion.button>
      </motion.form>
    </main>
  );
}
