/**
 * Site URL helper respecting canonical production configuration.
 *
 * Rules:
 * 1. If NEXT_PUBLIC_SITE_URL is explicitly configured, use it as the canonical base URL.
 * 2. In Vercel preview environments, VERCEL_URL may provide deployment previews, but is not canonical production.
 * 3. In local development or unconfigured states, fallback to localhost.
 */

export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  // Preview deployment fallback on Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`;
  }

  return "http://localhost:3000";
}

export function isCanonicalProductionConfigured(): boolean {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return Boolean(envUrl && process.env.NODE_ENV === "production");
}

export function getCanonicalUrl(path: string = ""): string {
  const baseUrl = getSiteUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath === "/" ? "" : cleanPath}`;
}
