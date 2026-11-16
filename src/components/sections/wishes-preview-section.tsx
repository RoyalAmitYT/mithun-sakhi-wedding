import React from "react";
import { connection } from "next/server";
import { getCachedPublicWishes } from "@/lib/server-data";
import {
  WishesPreviewWall,
  type ApprovedWish,
} from "./wishes-preview-wall";

export { WishesPreviewSkeleton } from "./wishes-preview-wall";

export async function WishesPreviewSection() {
  await connection();
  let approvedWishes: ApprovedWish[] = [];

  try {
    approvedWishes = await getCachedPublicWishes();
  } catch (err) {
    console.error("Failed to fetch approved wishes for preview wall:", err);
    approvedWishes = [];
  }

  return <WishesPreviewWall initialWishes={approvedWishes} />;
}


