/**
 * Validates redirect URLs to prevent open-redirect vulnerabilities.
 * Permits only safe internal relative paths.
 */
export function getSafeRedirectUrl(
  targetUrl: string | null | undefined,
  fallback = "/account"
): string {
  if (!targetUrl || typeof targetUrl !== "string") {
    return fallback;
  }

  const trimmed = targetUrl.trim();

  // Reject protocol-relative URLs (//evil.com), scheme URLs (http://, https://, javascript:), or backslashes
  if (
    trimmed.startsWith("//") ||
    trimmed.startsWith("\\\\") ||
    trimmed.includes("://") ||
    /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed) ||
    /[\r\n]/.test(trimmed)
  ) {
    return fallback;
  }

  // Ensure it is an absolute path relative to domain root
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  return fallback;
}
