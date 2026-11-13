import React from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  GalleryPreviewClient,
  type PublishedPhotoItem,
  type GalleryPreviewState,
} from "./gallery-preview-client";

export {
  GalleryPreviewClient,
  type PublishedPhotoItem,
  type GalleryPreviewState,
  REFERENCE_CURATED_PHOTOS,
} from "./gallery-preview-client";

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  wedding: "The Sacred Wedding",
  haldi: "Haldi Ceremony",
  mehndi: "Mehndi Ceremony",
  reception: "Reception",
  portraits: "Couple Portraits",
  others: "Wedding Moments",
};

export interface GalleryPreviewSectionProps {
  initialState?: GalleryPreviewState;
  simulatedCount?: number;
}

export function GalleryPreviewSkeleton() {
  return (
    <section
      id="gallery-skeleton"
      aria-label="Loading Wedding Memories Gallery"
      className="relative pt-24 sm:pt-28 md:pt-32 pb-20 sm:pb-24 md:pb-28 bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB] border-t border-[rgba(184,151,94,0.2)] scroll-mt-24 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="h-4 w-36 mx-auto bg-[#B8975E]/20 rounded-full animate-pulse mb-3" />
        <div className="h-10 w-64 mx-auto bg-[#B8975E]/15 rounded-md animate-pulse mb-4" />
        <div className="h-4 w-80 mx-auto bg-[#B8975E]/10 rounded-full animate-pulse mb-10" />
        <div className="h-[440px] w-full bg-[#FAF6EE] rounded-3xl border border-[rgba(184,151,94,0.3)] animate-pulse shadow-sm" />
      </div>
    </section>
  );
}

export async function GalleryPreviewSection({
  initialState,
  simulatedCount,
}: GalleryPreviewSectionProps = {}) {
  if (initialState) {
    return <GalleryPreviewClient state={initialState} simulatedCount={simulatedCount} />;
  }

  // Fast path for simulated visual QA testing
  if (typeof simulatedCount === "number" && simulatedCount > 0) {
    return <GalleryPreviewClient simulatedCount={simulatedCount} />;
  }

  await connection();
  let state: GalleryPreviewState = { status: "empty" };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_published_media");

    if (error) {
      console.error("Failed to fetch published gallery media for homepage:", error);
      state = { status: "error", message: error.message };
    } else if (Array.isArray(data)) {
      // Filter strictly for photographs with a valid storage path (excludes YouTube/video items)
      const photos: PublishedPhotoItem[] = (
        data as Array<Record<string, unknown>>
      )
        .filter(
          (item) =>
            item.media_type === "photo" &&
            typeof item.storage_path === "string" &&
            item.storage_path.trim() !== ""
        )
        .map((item, index) => {
          const rawCat = (
            typeof item.category === "string" ? item.category : "wedding"
          ).toLowerCase();
          const categoryLabel =
            CATEGORY_DISPLAY_NAMES[rawCat] ||
            rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
          const caption =
            typeof item.caption === "string" && item.caption.trim()
              ? item.caption.trim()
              : null;

          return {
            id: String(item.id),
            src: `/api/media/${item.id}`,
            fullSrc: `/api/media/${item.id}`,
            alt:
              caption ||
              `${categoryLabel} photograph — Mithun & Sakhi Wedding Celebrations`,
            title: caption || categoryLabel,
            category: categoryLabel,
            rawCategory: rawCat,
            caption: caption || undefined,
            isTall: index === 0,
            displayOrder:
              typeof item.display_order === "number"
                ? item.display_order
                : index,
            createdAt:
              typeof item.created_at === "string" ? item.created_at : "",
          };
        });

      if (photos.length > 0) {
        state = { status: "published", photos };
      } else {
        state = { status: "empty" };
      }
    }
  } catch (err: unknown) {
    console.error(
      "Error connecting to Supabase for homepage gallery preview:",
      err
    );
    state = {
      status: "error",
      message:
        err instanceof Error ? err.message : "Database connection failed",
    };
  }

  return <GalleryPreviewClient state={state} simulatedCount={simulatedCount} />;
}
