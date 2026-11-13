import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminContext } from "@/lib/supabase/auth-helpers";

export const instant = false;

const STORAGE_BUCKET = "wedding-media";
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: "Media item not found or access unauthorized." },
      { status: 404 }
    );
  }

  const url = new URL(request.url);
  const isDownload = url.searchParams.get("download") === "1";

  const supabase = await createClient();
  const adminCtx = await getAdminContext();
  const hasPhotosAdmin = Boolean(
    adminCtx && (adminCtx.isSuperAdmin || adminCtx.hasPermission("photos"))
  );

  // Query media item metadata from database before accessing Storage (RLS enforced)
  const { data: item, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !item) {
    // Unapproved/draft media items are strictly hidden from public and non-photo admins
    return NextResponse.json(
      { error: "Media item not found or access unauthorized." },
      { status: 404 }
    );
  }

  // 1. Private Draft Isolation (TC-MED-01)
  // If item is not published, strictly require photos admin or Super Admin
  if (!item.is_published && !hasPhotosAdmin) {
    return NextResponse.json(
      { error: "Forbidden: Unapproved media drafts cannot be accessed." },
      { status: 403 }
    );
  }

  // If item is a video, redirect to YouTube URL
  if (item.media_type === "video") {
    if (!item.youtube_url) {
      return NextResponse.json({ error: "Video URL not configured." }, { status: 404 });
    }
    return NextResponse.redirect(item.youtube_url);
  }

  // 2. Download Toggle Enforcement (TC-MED-02)
  if (isDownload && !item.download_enabled && !hasPhotosAdmin) {
    return NextResponse.json(
      { error: "Forbidden: Direct download is disabled for this photograph." },
      { status: 403 }
    );
  }

  if (!item.storage_path) {
    return NextResponse.json({ error: "Storage path not found." }, { status: 404 });
  }

  // Preserve full relative object key inside wedding-media bucket (e.g. "{category}/{mediaId}.webp")
  const storagePath = item.storage_path.replace(/^\/+/, "");
  if (!storagePath || storagePath.includes("..")) {
    return NextResponse.json({ error: "Invalid storage path." }, { status: 400 });
  }

  // Download object via the request-scoped Supabase client (no service-role key, no exposed Storage URL)
  const { data: fileBlob, error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(storagePath);

  if (storageError || !fileBlob) {
    const errorMessage = storageError?.message || "";
    const statusCode =
      storageError &&
      typeof storageError === "object" &&
      "statusCode" in storageError
        ? Number((storageError as { statusCode?: string | number }).statusCode)
        : undefined;
    const isNotFound =
      !fileBlob ||
      statusCode === 404 ||
      statusCode === 400 ||
      /not found/i.test(errorMessage);

    console.error("Failed to download media object from Supabase Storage:", {
      mediaId: id,
      statusCode,
      message: errorMessage,
    });

    return NextResponse.json(
      {
        error: isNotFound
          ? "Media file not found in storage."
          : "Unable to retrieve media file from storage.",
      },
      { status: isNotFound ? 404 : 502 }
    );
  }

  const mimeType = item.mime_type || fileBlob.type || "image/jpeg";
  const fallbackExt = mimeType.includes("webp")
    ? "webp"
    : mimeType.includes("png")
      ? "png"
      : mimeType.includes("avif")
        ? "avif"
        : "jpg";
  const fileName = item.file_name || `wedding-photo-${id}.${fallbackExt}`;

  const headers = new Headers();
  headers.set("Content-Type", mimeType);
  headers.set("X-Content-Type-Options", "nosniff");
  if (fileBlob.size > 0) {
    headers.set("Content-Length", fileBlob.size.toString());
  }

  if (isDownload) {
    headers.set(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(fileName)}"`
    );
  } else {
    headers.set(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(fileName)}"`
    );
  }

  // Cache published items for 1 hour; unpublished drafts are never cached
  if (item.is_published) {
    headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
  } else {
    headers.set("Cache-Control", "private, no-store, must-revalidate");
  }

  return new NextResponse(fileBlob.stream(), { status: 200, headers });
}
