"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { useToast } from "@/components/ui/toast";
import {
  uploadMediaAction,
  createVideoMediaAction,
  deleteMediaAction,
  toggleMediaPublishedAction,
  toggleMediaDownloadAction,
  toggleMediaFeaturedAction,
  extractYouTubeVideoId,
  type MediaCategory,
} from "@/actions/media";

export type AdminMediaItem = {
  id: string;
  media_type: "photo" | "video";
  storage_path: string | null;
  youtube_url: string | null;
  category: MediaCategory;
  caption: string | null;
  is_published: boolean;
  download_enabled: boolean;
  is_featured?: boolean;
  display_order: number;
  file_name: string | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  thumbnail_path: string | null;
  created_at: string;
  uploader_name: string | null;
  uploader_email: string | null;
};

interface AdminMediaManagerProps {
  initialItems: AdminMediaItem[];
}

const CATEGORIES: { label: string; value: MediaCategory }[] = [
  { label: "The Sacred Wedding", value: "wedding" },
  { label: "Haldi Ceremony", value: "haldi" },
  { label: "Mehndi Ceremony", value: "mehndi" },
  { label: "Reception", value: "reception" },
  { label: "Couple Portraits", value: "portraits" },
  { label: "Others", value: "others" },
];

/**
 * Compresses an image file on the client using an off-screen HTML Canvas before upload.
 * Reduces bandwidth and upload latency while preserving high-definition wedding quality
 * and capturing precise image dimensions (width, height) for responsive layout rendering.
 */
async function compressImageClient(
  file: File,
  maxDimension = 1920,
  quality = 0.85
): Promise<{ file: File; width: number; height: number }> {
  // If file is SVG or non-image, return as-is with default zero dimensions
  if (!file.type.startsWith("image/") || file.type.includes("svg")) {
    return { file, width: 0, height: 0 };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.src = event.target?.result as string;
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve({ file, width: img.naturalWidth || width, height: img.naturalHeight || height });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // If compression didn't reduce size, keep original
              resolve({ file, width, height });
            } else {
              const baseName = file.name.replace(/\.[^/.]+$/, "");
              const compressedFile = new File([blob], `${baseName}.webp`, {
                type: "image/webp",
                lastModified: Date.now(),
              });
              resolve({ file: compressedFile, width, height });
            }
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => resolve({ file, width: 0, height: 0 });
    };
    reader.onerror = () => resolve({ file, width: 0, height: 0 });
  });
}

export function AdminMediaManager({ initialItems }: AdminMediaManagerProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<AdminMediaItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState<"all" | "photo" | "video">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Upload Form State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<MediaCategory>("wedding");
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadIsPublished, setUploadIsPublished] = useState(false); // Default to draft for review
  const [uploadDownloadEnabled, setUploadDownloadEnabled] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Video Form State
  const [videoUrl, setVideoUrl] = useState("");
  const [videoCategory, setVideoCategory] = useState<MediaCategory>("wedding");
  const [videoCaption, setVideoCaption] = useState("");
  const [videoIsPublished, setVideoIsPublished] = useState(true);

  // Filter items
  const filteredItems = items.filter((item) => {
    if (activeTab !== "all" && item.media_type !== activeTab) return false;
    if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
    return true;
  });

  // Handle Photo File Upload
  const handlePhotoUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setStatusMessage({ type: "error", text: "Please select at least one photograph to upload." });
      return;
    }

    setIsCompressing(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.set("category", uploadCategory);
      formData.set("caption", uploadCaption);
      formData.set("is_published", String(uploadIsPublished));
      formData.set("download_enabled", String(uploadDownloadEnabled));

      // Client-side compression and dimension capture for each image
      for (const file of selectedFiles) {
        const { file: compressed, width, height } = await compressImageClient(file);
        formData.append("files", compressed);
        if (width > 0) formData.append("widths", String(width));
        if (height > 0) formData.append("heights", String(height));
      }

      setIsCompressing(false);

      startTransition(async () => {
        const result = await uploadMediaAction(formData);
        if (result.success) {
          setStatusMessage({
            type: "success",
            text: `Successfully uploaded ${result.count} photograph(s) as ${uploadIsPublished ? "published" : "private draft"}.`,
          });
          setShowUploadModal(false);
          setSelectedFiles([]);
          setUploadCaption("");
          // Refetch or update optimistic state
          window.location.reload();
        } else {
          setStatusMessage({ type: "error", text: result.error || "Upload failed." });
        }
      });
    } catch (err: unknown) {
      setIsCompressing(false);
      const msg = err instanceof Error ? err.message : "Client compression failed.";
      setStatusMessage({ type: "error", text: msg });
    }
  };

  // Handle YouTube Video Registration
  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      setStatusMessage({
        type: "error",
        text: "Please provide a valid YouTube video URL or ID (e.g. https://www.youtube.com/watch?v=...).",
      });
      return;
    }

    startTransition(async () => {
      const result = await createVideoMediaAction({
        youtube_url: videoUrl,
        category: videoCategory,
        caption: videoCaption,
        is_published: videoIsPublished,
      });

      if (result.success) {
        setStatusMessage({
          type: "success",
          text: `Wedding film successfully registered and ${videoIsPublished ? "published" : "saved as draft"}.`,
        });
        setShowVideoModal(false);
        setVideoUrl("");
        setVideoCaption("");
        window.location.reload();
      } else {
        setStatusMessage({ type: "error", text: result.error || "Failed to register video." });
      }
    });
  };

  // Handle Publication Toggle
  const handleTogglePublished = (id: string) => {
    setActiveActionId(`publish-${id}`);
    startTransition(async () => {
      try {
        const result = await toggleMediaPublishedAction(id);
        if (result.success) {
          setItems((prev) =>
            prev.map((it) => (it.id === id ? { ...it, is_published: Boolean(result.is_published) } : it))
          );
          const msg = `Item is now ${result.is_published ? "Published to Public Gallery" : "Moved to Private Draft"}.`;
          setStatusMessage({ type: "success", text: msg });
          toast.success("Publication Updated", msg);
        } else {
          const err = result.error || "Failed to toggle publication.";
          setStatusMessage({ type: "error", text: err });
          toast.error("Update Failed", err);
        }
      } finally {
        setActiveActionId(null);
      }
    });
  };

  // Handle Download Permission Toggle
  const handleToggleDownload = (id: string) => {
    setActiveActionId(`download-${id}`);
    startTransition(async () => {
      try {
        const result = await toggleMediaDownloadAction(id);
        if (result.success) {
          setItems((prev) =>
            prev.map((it) =>
              it.id === id ? { ...it, download_enabled: Boolean(result.download_enabled) } : it
            )
          );
          const msg = `Public download is now ${result.download_enabled ? "Enabled" : "Disabled"}.`;
          setStatusMessage({ type: "success", text: msg });
          toast.info("Download Preference", msg);
        } else {
          const err = result.error || "Failed to toggle download permission.";
          setStatusMessage({ type: "error", text: err });
          toast.error("Update Failed", err);
        }
      } finally {
        setActiveActionId(null);
      }
    });
  };

  // Handle Homepage Featured Toggle (Max 12 items)
  const handleToggleFeatured = (id: string) => {
    setActiveActionId(`feature-${id}`);
    startTransition(async () => {
      try {
        const result = await toggleMediaFeaturedAction(id);
        if (result.success) {
          setItems((prev) =>
            prev.map((it) =>
              it.id === id ? { ...it, is_featured: Boolean(result.is_featured) } : it
            )
          );
          const msg = result.is_featured
            ? "Photograph featured on homepage Wedding Memories (up to 12 curated)."
            : "Photograph removed from homepage featured collection.";
          setStatusMessage({ type: "success", text: msg });
          toast.success("Featured Status", msg);
        } else {
          const err = result.error || "Failed to toggle homepage featured status.";
          setStatusMessage({ type: "error", text: err });
          toast.error("Update Failed", err);
        }
      } finally {
        setActiveActionId(null);
      }
    });
  };

  // Handle Deletion
  const handleDeleteItem = (id: string) => {
    setActiveActionId(`delete-${id}`);
    startTransition(async () => {
      try {
        const result = await deleteMediaAction(id);
        if (result.success) {
          setItems((prev) => prev.filter((it) => it.id !== id));
          setStatusMessage({ type: "success", text: "Media item deleted successfully." });
          toast.success("Media Deleted", "The item was permanently removed.");
          setConfirmDeleteId(null);
        } else {
          const err = result.error || "Failed to delete item.";
          setStatusMessage({ type: "error", text: err });
          toast.error("Deletion Failed", err);
        }
      } finally {
        setActiveActionId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Action Notification Alert */}
      {statusMessage && (
        <div
          role="alert"
          className={`p-4 rounded-xl text-xs font-sans border flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-[#69765D]/10 text-[#3F4837] border-[#69765D]/30"
              : "bg-[#A52232]/10 text-[#A52232] border-[#A52232]/30"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-semibold hover:opacity-70 ml-4 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Control Bar: Primary Actions & Search / Filter */}
      <div className="bg-white/80 border border-[#B8975E]/30 rounded-2xl p-4 sm:p-5 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        {/* Left: View Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-sans font-medium transition-colors flex items-center justify-center ${
              activeTab === "all"
                ? "bg-[#292322] text-white shadow-xs"
                : "bg-[#FFFCF6] text-[#292322]/70 hover:bg-white border border-[#B8975E]/30"
            }`}
          >
            All Media ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("photo")}
            className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-sans font-medium transition-colors flex items-center justify-center ${
              activeTab === "photo"
                ? "bg-[#292322] text-white shadow-xs"
                : "bg-[#FFFCF6] text-[#292322]/70 hover:bg-white border border-[#B8975E]/30"
            }`}
          >
            Photographs ({items.filter((i) => i.media_type === "photo").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("video")}
            className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-sans font-medium transition-colors flex items-center justify-center ${
              activeTab === "video"
                ? "bg-[#292322] text-white shadow-xs"
                : "bg-[#FFFCF6] text-[#292322]/70 hover:bg-white border border-[#B8975E]/30"
            }`}
          >
            Wedding Films ({items.filter((i) => i.media_type === "video").length})
          </button>

          {/* Ceremony Category Selector */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="min-h-[44px] px-3.5 py-2 rounded-full text-xs font-sans border border-[#B8975E]/30 bg-white text-[#292322] focus:outline-hidden focus:ring-1 focus:ring-[#B8975E]"
          >
            <option value="all">All Ceremonies</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Upload & Register CTAs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="min-h-[44px] px-4 sm:px-5 py-2.5 rounded-full text-xs font-sans font-semibold bg-[#A52232] text-white hover:bg-[#8B1C2A] active:scale-[0.98] transition-all shadow-xs inline-flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Upload Photos</span>
          </button>

          <button
            type="button"
            onClick={() => setShowVideoModal(true)}
            className="min-h-[44px] px-4 sm:px-5 py-2.5 rounded-full text-xs font-sans font-semibold border border-[#B8975E]/40 text-[#8E6D38] hover:bg-[#B8975E]/10 active:scale-[0.98] transition-all inline-flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <span>Add YouTube Film</span>
          </button>
        </div>
      </div>

      {/* Media Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white/80 border border-[#B8975E]/20 rounded-2xl p-12 text-center backdrop-blur-md">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F7F1E6] flex items-center justify-center text-[#B8975E]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <h3 className="font-serif text-xl font-light text-[#292322]">No media found in this view</h3>
          <p className="font-sans text-xs text-[#292322]/60 mt-1 max-w-sm mx-auto">
            Upload ceremony photographs or add YouTube wedding films to begin curating Mithun &amp; Sakhi&apos;s gallery.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isVideo = item.media_type === "video";
            const videoId = isVideo && item.youtube_url ? extractYouTubeVideoId(item.youtube_url) : null;
            const previewUrl = isVideo
              ? videoId
                ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='100%25' height='100%25' fill='%231F0A10'/%3E%3Cpath d='M170 110 L250 150 L170 190 Z' fill='%23C5A880'/%3E%3C/svg%3E"
              : `/api/media/${item.id}`;

            return (
              <div
                key={item.id}
                className="bg-white/90 border border-[#B8975E]/30 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow"
              >
                {/* Visual Preview */}
                <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                  <Image
                    src={previewUrl}
                    alt={item.caption || item.file_name || "Wedding media preview"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                    unoptimized
                  />

                  {/* Status Badges Overlay */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider ${
                        item.is_published
                          ? "bg-[#69765D]/90 text-white backdrop-blur-xs"
                          : "bg-[#292322]/80 text-[#FFFCF6] backdrop-blur-xs"
                      }`}
                    >
                      {item.is_published ? "Published" : "Private Draft"}
                    </span>

                    {item.is_featured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-[#A67C1E] text-white border border-[#B8975E] backdrop-blur-xs shadow-xs">
                        ★ Homepage
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-white/90 text-[#8E6D38] border border-[#B8975E]/40 backdrop-blur-xs uppercase">
                      {item.category}
                    </span>
                  </div>

                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-[#A52232]/90 text-white flex items-center justify-center shadow-md">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif text-base font-light text-[#292322] line-clamp-1">
                      {item.caption || item.file_name || (isVideo ? "Wedding Film" : "Untitled Photograph")}
                    </h4>
                    <p className="font-sans text-[11px] text-[#292322]/50 mt-0.5">
                      Added {new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      {item.uploader_name ? ` by ${item.uploader_name}` : ""}
                    </p>
                  </div>

                  {/* Operational Toggles */}
                  <div className="pt-3 border-t border-[#B8975E]/15 flex flex-wrap items-center justify-between gap-2">
                    {/* Publication Toggle */}
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleTogglePublished(item.id)}
                      className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-sans font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        item.is_published
                          ? "bg-[#69765D]/15 text-[#525D48] hover:bg-[#69765D]/25"
                          : "bg-[#B8975E]/15 text-[#8E6D38] hover:bg-[#B8975E]/25"
                      }`}
                      title={item.is_published ? "Click to move to Draft" : "Click to Publish to public gallery"}
                    >
                      {activeActionId === `publish-${item.id}` ? (
                        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : null}
                      <span>{item.is_published ? "Unpublish" : "Publish"}</span>
                    </button>

                    {/* Homepage Featured Toggle */}
                    <button
                      type="button"
                      disabled={isPending || !item.is_published}
                      onClick={() => handleToggleFeatured(item.id)}
                      className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-sans font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        item.is_featured
                          ? "bg-[#A67C1E]/20 text-[#8E6D38] border border-[#B8975E]/50 hover:bg-[#A67C1E]/30"
                          : item.is_published
                          ? "text-[#292322]/70 hover:bg-[#B8975E]/15 border border-transparent hover:border-[#B8975E]/30"
                          : "text-[#292322]/30 cursor-not-allowed border border-transparent"
                      }`}
                      title={
                        !item.is_published
                          ? "Publish first to feature on homepage"
                          : item.is_featured
                          ? "Featured on homepage. Click to unfeature."
                          : "Click to feature on homepage (max 12 curated)."
                      }
                    >
                      {activeActionId === `feature-${item.id}` ? (
                        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : null}
                      <span>{item.is_featured ? "★ Featured" : "☆ Feature"}</span>
                    </button>

                    {/* Download Toggle (Photos only) */}
                    {!isVideo && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleToggleDownload(item.id)}
                        className={`min-h-[40px] px-2.5 py-1.5 rounded-xl text-xs font-sans font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          item.download_enabled
                            ? "text-[#69765D] hover:bg-[#69765D]/10"
                            : "text-[#A52232] hover:bg-[#A52232]/10"
                        }`}
                        title={
                          item.download_enabled
                            ? "Downloads allowed. Click to disable download button."
                            : "Downloads disabled. Click to enable download button."
                        }
                      >
                        {activeActionId === `download-${item.id}` ? (
                          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : null}
                        <span>{item.download_enabled ? "Downloads: On" : "Downloads: Off"}</span>
                      </button>
                    )}

                    {/* Delete Action with Inline Confirmation */}
                    {confirmDeleteId === item.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={activeActionId === `delete-${item.id}`}
                          onClick={() => handleDeleteItem(item.id)}
                          className="min-h-[40px] px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-sans font-semibold hover:bg-red-700 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {activeActionId === `delete-${item.id}` ? (
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            "Confirm"
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="min-h-[40px] px-2.5 py-1.5 rounded-xl border border-gray-300 text-xs font-sans text-gray-600 hover:bg-gray-100 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors cursor-pointer"
                        title="Permanently Delete Media Item"
                        aria-label="Delete media item"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Photos Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowUploadModal(false);
          }}
        >
          <div className="relative bg-[#FFFCF6] border border-[#B8975E]/40 rounded-2xl p-5 sm:p-7 max-w-lg w-full max-h-[min(90dvh,calc(100vh-2rem))] overflow-y-auto overscroll-contain space-y-5 sm:space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#B8975E]/20 pb-3">
              <div>
                <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-[#B8975E] block">
                  Media Pipeline
                </span>
                <h3 className="font-serif text-2xl font-light text-[#292322]">Upload Photographs</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-[#292322]/60 hover:text-[#292322] hover:bg-black/5 transition-colors text-2xl font-serif cursor-pointer"
                aria-label="Close dialog"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handlePhotoUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-medium text-[#292322] mb-1">
                  Ceremony Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as MediaCategory)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-sans border border-[#B8975E]/30 bg-white text-[#292322] focus:ring-1 focus:ring-[#B8975E]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-sans font-medium text-[#292322] mb-1">
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  maxLength={500}
                  placeholder="e.g. Sacred Vedic Saat Phere vows at the Mandap"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-sans border border-[#B8975E]/30 bg-white text-[#292322] focus:ring-1 focus:ring-[#B8975E]"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-medium text-[#292322] mb-1">
                  Select Photographs (JPEG, PNG, WebP)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setSelectedFiles(files);
                  }}
                  className="w-full text-xs font-sans file:mr-3 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#B8975E]/15 file:text-[#8E6D38] hover:file:bg-[#B8975E]/25 file:cursor-pointer"
                />
                <p className="text-[11px] font-sans text-[#292322]/50 mt-1">
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} file(s) selected. Images will be optimized on client before upload.`
                    : "You may select multiple photographs."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
                <label className="min-h-[44px] flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uploadIsPublished}
                    onChange={(e) => setUploadIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded border-[#B8975E]/40 text-[#A52232] focus:ring-[#B8975E]"
                  />
                  <span className="text-xs font-sans text-[#292322]">Publish immediately</span>
                </label>

                <label className="min-h-[44px] flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uploadDownloadEnabled}
                    onChange={(e) => setUploadDownloadEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-[#B8975E]/40 text-[#A52232] focus:ring-[#B8975E]"
                  />
                  <span className="text-xs font-sans text-[#292322]">Allow guest downloads</span>
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#B8975E]/20">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="min-h-[44px] px-5 py-2.5 rounded-full text-xs font-sans text-[#292322]/70 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || isCompressing || selectedFiles.length === 0}
                  className="min-h-[44px] px-6 py-2.5 rounded-full text-xs font-sans font-semibold bg-[#A52232] text-white hover:bg-[#8B1C2A] disabled:opacity-50 active:scale-[0.98] transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {isCompressing ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Compressing Images...</span>
                    </>
                  ) : isPending ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Upload {selectedFiles.length} Photograph(s)</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add YouTube Video Modal */}
      {showVideoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowVideoModal(false);
          }}
        >
          <div className="relative bg-[#FFFCF6] border border-[#B8975E]/40 rounded-2xl p-5 sm:p-7 max-w-lg w-full max-h-[min(90dvh,calc(100vh-2rem))] overflow-y-auto overscroll-contain space-y-5 sm:space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#B8975E]/20 pb-3">
              <div>
                <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-[#B8975E] block">
                  Cinematic Integration
                </span>
                <h3 className="font-serif text-2xl font-light text-[#292322]">Add YouTube Film</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-[#292322]/60 hover:text-[#292322] hover:bg-black/5 transition-colors text-2xl font-serif cursor-pointer"
                aria-label="Close dialog"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleVideoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-medium text-[#292322] mb-1">
                  YouTube Video or Unlisted Link
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-sans border border-[#B8975E]/30 bg-white text-[#292322] focus:ring-1 focus:ring-[#B8975E]"
                />
                <p className="text-[11px] font-sans text-[#292322]/50 mt-1">
                  Supports standard YouTube links, unlisted ceremonial videos, and Shorts.
                </p>
              </div>

              <div>
                <label className="block text-xs font-sans font-medium text-[#292322] mb-1">
                  Ceremony Category
                </label>
                <select
                  value={videoCategory}
                  onChange={(e) => setVideoCategory(e.target.value as MediaCategory)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-sans border border-[#B8975E]/30 bg-white text-[#292322] focus:ring-1 focus:ring-[#B8975E]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-sans font-medium text-[#292322] mb-1">
                  Film Title / Caption
                </label>
                <input
                  type="text"
                  maxLength={500}
                  placeholder="e.g. Official Cinematic Teaser — The Sacred Union"
                  value={videoCaption}
                  onChange={(e) => setVideoCaption(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-sans border border-[#B8975E]/30 bg-white text-[#292322] focus:ring-1 focus:ring-[#B8975E]"
                />
              </div>

              <div className="pt-2">
                <label className="min-h-[44px] flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={videoIsPublished}
                    onChange={(e) => setVideoIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded border-[#B8975E]/40 text-[#A52232] focus:ring-[#B8975E]"
                  />
                  <span className="text-xs font-sans text-[#292322]">Publish to gallery immediately</span>
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#B8975E]/20">
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="min-h-[44px] px-5 py-2.5 rounded-full text-xs font-sans text-[#292322]/70 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !videoUrl}
                  className="min-h-[44px] px-6 py-2.5 rounded-full text-xs font-sans font-semibold bg-[#A52232] text-white hover:bg-[#8B1C2A] disabled:opacity-50 active:scale-[0.98] transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <span>Add Video Film</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
