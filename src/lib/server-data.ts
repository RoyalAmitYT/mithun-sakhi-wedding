import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { PublishedMediaItem } from "@/app/gallery/gallery-view";
import type { ApprovedWish } from "@/components/sections/wishes-preview-wall";

function getPublicSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return null;
  return createClient<Database>(supabaseUrl, supabaseKey);
}

/**
 * Cached fetch for published gallery media.
 * Uses Next.js unstable_cache with a 60-second TTL and 'gallery-media' revalidation tag.
 * Eliminates repetitive database hits and cold-start latency on every visitor navigation.
 */
export const getCachedPublishedMedia = unstable_cache(
  async (): Promise<PublishedMediaItem[]> => {
    try {
      const supabase = getPublicSupabase();
      if (!supabase) return [];
      const { data, error } = await supabase.rpc("get_published_media");
      if (error || !data) return [];
      return data as unknown as PublishedMediaItem[];
    } catch (err) {
      console.warn("getCachedPublishedMedia failed:", err);
      return [];
    }
  },
  ["published-media-cache"],
  { revalidate: 60, tags: ["gallery-media"] }
);

/**
 * Cached fetch for approved public guest wishes.
 * Uses Next.js unstable_cache with a 30-second TTL and 'public-wishes' revalidation tag.
 * Allows instant <1ms server delivery while preserving fresh guest blessings.
 */
export const getCachedPublicWishes = unstable_cache(
  async (): Promise<ApprovedWish[]> => {
    try {
      const supabase = getPublicSupabase();
      if (!supabase) return [];
      const { data, error } = await supabase.rpc("get_public_wishes");
      if (error || !data || !Array.isArray(data)) return [];
      return (data as unknown as Array<{ id: string; author_display_name: string; wish_text: string; created_at: string }>).map((item) => ({
        id: item.id,
        author_display_name: item.author_display_name,
        wish_text: item.wish_text,
        created_at: item.created_at,
      }));
    } catch (err) {
      console.warn("getCachedPublicWishes failed:", err);
      return [];
    }
  },
  ["public-wishes-cache"],
  { revalidate: 30, tags: ["public-wishes"] }
);
