import React from "react";
import { connection } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import {
  WishesPreviewWall,
  type ApprovedWish,
} from "./wishes-preview-wall";

export { WishesPreviewSkeleton } from "./wishes-preview-wall";

export async function WishesPreviewSection() {
  await connection();
  let approvedWishes: ApprovedWish[] = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseKey);
      const { data } = await supabase.rpc("get_public_wishes");
      if (data && Array.isArray(data)) {
        approvedWishes = (data as unknown as Array<{id: string; author_display_name: string; wish_text: string; created_at: string}>).map((item) => ({
          id: item.id,
          author_display_name: item.author_display_name,
          wish_text: item.wish_text,
          created_at: item.created_at,
        }));
      }
    }
  } catch (err) {
    console.error("Failed to fetch approved wishes for preview wall:", err);
    approvedWishes = [];
  }

  return <WishesPreviewWall initialWishes={approvedWishes} />;
}


