import React from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { Navbar } from "@/components/navigation";
import { EditorialFooter } from "@/components/sections";
import { SectionHeaderFiligree } from "@/components/ui/decorative-surfaces";
import { PageTransition } from "@/components/motion/page-transition";
import { WishesView } from "./wishes-view";
import type { ApprovedWish } from "@/components/sections/wishes-preview-wall";

export const instant = false;

export const metadata: Metadata = {
  title: "Guest Blessings & Wishes",
  description:
    "Read heartfelt prayers, blessings, and warm congratulations bestowed upon Mithun & Sakhi by family, elders, and cherished friends for their wedding in Purulia.",
  openGraph: {
    title: "Guest Blessings & Wishes — Mithun & Sakhi Wedding",
    description:
      "Read heartfelt prayers, blessings, and warm congratulations bestowed upon Mithun & Sakhi by family, elders, and cherished friends.",
  },
};

export default async function WishesPage() {
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
        approvedWishes = (data as unknown as Array<{ id: string; author_display_name: string; wish_text: string; created_at: string }>).map((item) => ({
          id: item.id,
          author_display_name: item.author_display_name,
          wish_text: item.wish_text,
          created_at: item.created_at,
        }));
      }
    }
  } catch (err) {
    console.error("Failed to fetch approved wishes for wishes page:", err);
    approvedWishes = [];
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB] pt-28 sm:pt-36 pb-32 sm:pb-36 relative overflow-hidden">
        <PageTransition>
          <SectionHeaderFiligree color="#B8975E" opacity={0.16} />

          {/* Golden Ambient Flow Waves */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            <svg
              className="absolute -top-12 left-0 w-[140%] max-w-none h-96 opacity-25"
              viewBox="0 0 1600 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path
                d="M-100,120 C300,260 650,20 1050,180 C1350,300 1550,140 1800,220 L1800,0 L-100,0 Z"
                fill="url(#gold-wave-wishes)"
              />
              <defs>
                <linearGradient id="gold-wave-wishes" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#B8975E" stopOpacity="0.12" />
                  <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#F5ECE0" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <WishesView initialWishes={approvedWishes} />
        </PageTransition>
      </main>

      <EditorialFooter />
    </>
  );
}
