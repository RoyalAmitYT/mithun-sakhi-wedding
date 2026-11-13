import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Next.js Dynamic Sitemap Configuration
 *
 * Rules:
 * 1. Generates absolute URLs for genuine public routes only.
 * 2. Excludes internal design preview (/design-preview), future private guest routes, and APIs.
 * 3. Does not fabricate artificial lastModified timestamps.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();

  const publicRoutes = [
    { path: "", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/rsvp", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/wishes", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/gallery", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/privacy", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/terms", priority: 0.5, changeFrequency: "monthly" as const },
  ];

  return publicRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    changeFrequency,
    priority,
  }));
}
