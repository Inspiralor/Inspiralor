"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";

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

export default function SubmitProjectPage({
  isEdit = false,
}: {
  isEdit?: boolean;
}) {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [tools, setTools] = useState("");
  const [reason, setReason] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState(statuses[0]);
  const [links, setLinks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  // --- UNIFIED IMAGE STATE ---
  // Instead of separate existingImages/imageFiles/imageSrcs, use one array:
  // Each item: { file?: File, url: string, name: string, type: string, size?: number, isNew?: boolean }
  const [images, setImages] = useState<any[]>([]); // unified list
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageSrcs, setImageSrcs] = useState<string[]>([]);
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageIdx, setCropImageIdx] = useState<number | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [cardImage, setCardImage] = useState<{
    src: string;
    file: File;
  } | null>(null);
  // --- STATE REFACTOR ---
  // Add state for existing files (edit mode)
  const [existingImages, setExistingImages] = useState<UploadedFile[]>([]); // for images from DB
  const [existingDocs, setExistingDocs] = useState<UploadedFile[]>([]); // for docs from DB
  const [removedDocIdxs, setRemovedDocIdxs] = useState<number[]>([]); // indices of removed existing docs
  // --- UNIFIED DOC STATE ---
  const [docs, setDocs] = useState<any[]>([]); // unified doc list: { file?: File, url: string, name: string, type: string, size?: number, isNew?: boolean }

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
        const { data } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();
        if (data) {
          setTitle(data.title);
          setDescription(data.description);
          setCategory(data.category);
          setTools(data.tools);
          setReason(data.reason_abandoned);
          setTags((data.tags || []).join(", "));
          setStatus(data.status);
          setLinks((data.links || []).join(", "));
          // --- Load files ---
          const files: UploadedFile[] = data.files || [];
          const imgs = files.filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name));
          const docs = files.filter(f => !/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name));
          setImages(imgs.map(f => ({ ...f, isNew: false })));
          setDocs(docs.map(f => ({ ...f, isNew: false })));
        }
      };
      fetchProject();
    }
  }, [isEdit, id]);

  // Update image upload to allow multiple files at once
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      if (images.length + files.length > 100) {
        setErrorMsg("You can upload up to 100 images.");
        return;
      }
      setErrorMsg("");
      const readers = files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      const srcs = await Promise.all(readers);
      const newImgs = files.map((file, i) => ({
        file,
        url: srcs[i],
        name: file.name,
        type: file.type,
        size: file.size,
        isNew: true,
      }));
      setImages(prev => [...prev, ...newImgs]);
      e.target.value = ""; // reset input
    }
  };

  const onDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      if (docs.length + files.length > 5) {
        setErrorMsg("You can upload up to 5 documents only.");
        return;
      }
      setErrorMsg("");
      const newDocs = files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
        size: file.size,
        isNew: true,
      }));
      setDocs(prev => [...prev, ...newDocs]);
      e.target.value = "";
    }
  };

  const openCropModal = (idx: number) => {
    setCropImageIdx(idx);
    setCropModalOpen(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const onCropComplete = (_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // When cropping is saved, update the thumbnail list so the cropped image is first
  const handleCropSave = async () => {
    if (cropImageIdx === null || !croppedAreaPixels) return;
    const img = images[cropImageIdx];
    const src = img.url; // Always use the stored preview URL
    const cropped = await getCroppedImg(src, croppedAreaPixels);
    // Convert base64 to Blob and create a new File for upload
    const res = await fetch(cropped as string);
    const blob = await res.blob();
    const croppedFile = new File(
      [blob],
      (img.name || "cropped") + "_cropped.png",
      { type: "image/png" }
    );
    const croppedImg = {
      file: croppedFile,
      url: cropped as string,
      name: croppedFile.name,
      type: croppedFile.type,
      size: croppedFile.size,
      isNew: true,
    };
    setImages(prev => [croppedImg, ...prev.filter((_, i) => i !== cropImageIdx)]);
    setCropModalOpen(false);
  };

  // --- REMOVE HANDLERS ---
  const handleRemoveImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };
  const handleRemoveNewImage = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImageSrcs(prev => prev.filter((_, i) => i !== idx));
  };
  const handleRemoveExistingDoc = (idx: number) => {
    setRemovedDocIdxs(prev => [...prev, idx]);
  };
  const handleRemoveNewDoc = (idx: number) => {
    setDocFiles(prev => prev.filter((_, i) => i !== idx));
  };
  const handleRemoveDoc = (idx: number) => {
    setDocs(prev => prev.filter((_, i) => i !== idx));
  };

  // --- THUMBNAIL SETTER ---
  const handleSetThumbnail = (idx: number) => {
    if (idx === 0) return;
    setImages(prev => [prev[idx], ...prev.filter((_, i) => i !== idx)]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    // --- Title/Description required check ---
    if (!title.trim() || !description.trim()) {
      setError("Title and Description are required.");
      setLoading(false);
      return;
    }
    // --- Title uniqueness check ---
    const { data: existing, error: titleError } = await supabase
      .from("projects")
      .select("id")
      .eq("title", title.trim());
    if (titleError) {
      setError("Error checking title uniqueness.");
      setLoading(false);
      return;
    }
    if (existing && existing.length > 0 && (!isEdit || existing[0].id !== id)) {
      setError("This title is already used. Please pick another title.");
      setLoading(false);
      return;
    }
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
    const uploadedFiles: UploadedFile[] = [];
    // Handle images: upload new ones, keep existing
    for (const img of images) {
      if (img.isNew && img.file) {
        // upload
        const filePath = `${user.id}/${Date.now()}_${img.file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("project-files")
          .upload(filePath, img.file);
        if (uploadError) {
          setError(`File upload failed: ${uploadError.message}`);
          setLoading(false);
          return;
        }
        const { data: urlData } = supabase.storage
          .from("project-files")
          .getPublicUrl(filePath);
        uploadedFiles.push({
          name: img.file.name,
          url: urlData.publicUrl,
          path: filePath,
          type: img.file.type,
          size: img.file.size,
        });
      } else {
        // keep existing
        uploadedFiles.push(img);
      }
    }
    // Handle docs: upload new ones, keep existing
    for (const doc of docs) {
      if (doc.isNew && doc.file) {
        const filePath = `${user.id}/${Date.now()}_${doc.file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("project-files")
          .upload(filePath, doc.file);
        if (uploadError) {
          setError(`File upload failed: ${uploadError.message}`);
          setLoading(false);
          return;
        }
        const { data: urlData } = supabase.storage
          .from("project-files")
          .getPublicUrl(filePath);
        uploadedFiles.push({
          name: doc.file.name,
          url: urlData.publicUrl,
          path: filePath,
          type: doc.file.type,
          size: doc.file.size,
        });
      } else {
        uploadedFiles.push(doc);
      }
    }
    // Add existing images (not removed)
    // existingImages.forEach((img, idx) => {
    //   if (!removedImageIdxs.includes(idx)) uploadedFiles.push(img);
    // });
    // Add new images (already handled by upload loop)
    // Add existing docs (not removed)
    existingDocs.forEach((doc, idx) => {
      if (!removedDocIdxs.includes(idx)) uploadedFiles.push(doc);
    });
    // Add new docs (already handled by upload loop)
    if (isEdit && id) {
      // Update
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          title,
          description,
          category,
          tools,
          reason_abandoned: reason,
          tags: tagArr,
          status,
          links: linkArr,
          files: uploadedFiles,
        })
        .eq("id", id);
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
        setTimeout(() => router.push("/landing"), 1500);
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
    <>
      <Navbar />
      <main className="min-h-screen flex flex-row bg-black">
        {/* Left: Cropper */}
        <div className="flex-1 flex flex-col items-center justify-center bg-black min-h-screen p-8 overflow-y-auto">
          <label className="flex flex-col items-center justify-center w-full cursor-pointer mb-4">
            <span className="text-white mb-2">
              Upload Project Images (max 100, one by one)
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onFileChange}
              className="hidden"
            />
            <div className="w-72 h-20 border-2 border-dashed border-gray-500 flex items-center justify-center">
              <span className="text-gray-500">Click to upload</span>
            </div>
          </label>
          {errorMsg && (
            <div className="text-red-500 font-semibold mb-2">{errorMsg}</div>
          )}
          {/* IMAGE PREVIEW UI */}
          {images.length > 0 && (
            <>
              <div className="text-yellow-300 text-sm mb-2 text-center">
                Images (click to crop/set as card image, or remove):
              </div>
              <div className="flex flex-col gap-2 w-full items-center">
                {Array.from({ length: Math.ceil(images.length / 10) }).map(
                  (_, rowIdx) => (
                    <div key={rowIdx} className="flex gap-2 mb-2">
                      {images
                        .slice(rowIdx * 10, rowIdx * 10 + 10)
                        .map((img, idx) => {
                          const globalIdx = rowIdx * 10 + idx;
                          const isCard = globalIdx === 0;
                          return (
                            <div key={globalIdx} className="relative group">
                              <img
                                src={img.url}
                                alt={img.name || `Upload ${globalIdx + 1}`}
                                className={`w-16 h-16 object-cover rounded border-2 cursor-pointer ${
                                  isCard
                                    ? "border-8 border-white shadow-lg"
                                    : "border-gray-400"
                                }`}
                                onClick={() => openCropModal(globalIdx)}
                                title="Click to crop and set as card image"
                              />
                              <button
                                type="button"
                                className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100"
                                onClick={() => handleRemoveImage(globalIdx)}
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  )
                )}
              </div>
            </>
          )}
          {/* Cropper Modal */}
          {cropModalOpen && cropImageIdx !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
              <div className="bg-white rounded-lg shadow-lg p-6 relative flex flex-col items-center">
                <div className="w-[400px] h-[300px] relative">
                  <Cropper
                    image={images[cropImageIdx].url} // Always use the stored preview URL
                    crop={crop}
                    zoom={zoom}
                    aspect={288 / 224}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    cropShape="rect"
                    showGrid={true}
                  />
                </div>
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={handleCropSave}
                    className="bg-primary text-black px-4 py-2 rounded shadow"
                  >
                    Crop & Set as Card Image
                  </button>
                  <button
                    onClick={() => setCropModalOpen(false)}
                    className="bg-gray-300 text-black px-4 py-2 rounded shadow"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Right: Form */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-surface to-primary/30 py-10 px-4 pt-32 overflow-y-auto">
          <motion.form
            onSubmit={handleSubmit}
            className="w-full max-w-xl rounded-xl bg-glass shadow-glass p-10 flex flex-col gap-8 border border-white backdrop-blur-md"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-3xl font-extrabold mb-4 text-primary font-display text-center drop-shadow-lg">
              SUBMIT AN ABANDONED IDEA
            </h1>
            <div className="flex flex-col gap-6">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border border-white bg-surface/60 rounded-xl px-6 py-4 text-white placeholder:text-muted focus:ring-2 focus:ring-primary outline-none text-lg"
                required
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border border-white bg-surface/60 rounded-xl px-6 py-4 text-white placeholder:text-muted focus:ring-2 focus:ring-primary outline-none text-lg min-h-[100px]"
                required
              />
              <div className="flex flex-col md:flex-row gap-6">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border border-white bg-surface/60 rounded-xl px-6 py-4 text-white flex-1"
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
                  className="border border-white bg-surface/60 rounded-xl px-6 py-4 text-white flex-1"
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
                className="border border-white bg-surface/60 rounded-xl px-6 py-4 text-white placeholder:text-muted text-lg"
              />
              <textarea
                placeholder="Why was it abandoned?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="border border-white bg-surface/60 rounded-xl px-6 py-4 text-white placeholder:text-muted text-lg min-h-[80px]"
              />
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="border border-white bg-surface/60 rounded-xl px-6 py-4 text-white placeholder:text-muted text-lg"
              />
              <input
                type="text"
                placeholder="Links (comma separated URLs)"
                value={links}
                onChange={(e) => setLinks(e.target.value)}
                className="border border-white bg-surface/60 rounded-xl px-6 py-4 text-white placeholder:text-muted text-lg"
              />
              <label className="flex flex-col items-center justify-center w-full cursor-pointer mb-2">
                <span className="text-white mb-2">
                  Upload Documents (max 5, PDF/DOCX/...)
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                  multiple
                  onChange={onDocChange}
                  className="hidden"
                />
                <div className="w-full h-12 border-2 border-dashed border-gray-500 flex items-center justify-center rounded">
                  <span className="text-gray-500">
                    Click to upload documents
                  </span>
                </div>
              </label>
              {/* DOCUMENTS UI */}
              {docs.length > 0 && (
                <ul className="flex flex-col gap-1 mt-2 list-disc list-inside">
                  {docs.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent underline text-sm font-semibold hover:text-white transition-colors"
                      >
                        {doc.name} ({doc.type || "Unknown type"})
                      </a>
                      <button
                        type="button"
                        className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        onClick={() => handleRemoveDoc(idx)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {error && (
              <div className="text-red-500 font-semibold text-sm">{error}</div>
            )}
            {success && (
              <div className="text-green-500 font-semibold text-sm">
                {success}
              </div>
            )}
            <motion.button
              type="submit"
              className="mt-4 bg-primary text-accent px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-white hover:text-black transition-colors disabled:opacity-50 text-lg"
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.03 }}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Project"}
            </motion.button>
          </motion.form>
        </div>
      </main>
    </>
  );
}
