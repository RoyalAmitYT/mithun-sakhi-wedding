import type { MetadataRoute } from "next";
import { getSiteUrl, isCanonicalProductionConfigured } from "@/lib/site-url";

/**
 * Next.js Robots Configuration
 *
 * Rules:
 * 1. Only allow indexing when in production AND canonical NEXT_PUBLIC_SITE_URL is explicitly configured.
 * 2. In local development or unverified preview deployments, prevent unintended crawler indexing.
 * 3. Explicitly exclude internal verification routes (/design-preview) and future private route paths.
 * Note: robots directives are a crawler guide, not an authorization or security boundary.
 */
export default function robots(): MetadataRoute.Robots {
  const isProd = isCanonicalProductionConfigured();
  const siteUrl = getSiteUrl();

  if (!isProd) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/design-preview",
          "/api/",
          "/admin/",
          "/dashboard/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
