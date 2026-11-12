import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@/lib/supabase/server";
import { getAdminContext } from "@/lib/supabase/auth-helpers";

export const instant = false;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const isDownload = url.searchParams.get("download") === "1";

  const supabase = await createClient();
  const adminCtx = await getAdminContext();
  const hasPhotosAdmin = Boolean(
    adminCtx && (adminCtx.isSuperAdmin || adminCtx.hasPermission("photos"))
  );

  // Query media item from database
  const { data: item, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !item) {
    // If not found through current session RLS, check if it's an unauthorized draft
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

  // Resolve file path strictly within private storage/media subfolder
  const fileNameOnDisk = path.basename(item.storage_path);
  const filePath = path.join(process.cwd(), "storage", "media", fileNameOnDisk);

  try {
    const fileBuffer = await fs.readFile(/*turbopackIgnore: true*/ filePath);
    const mimeType = item.mime_type || "image/jpeg";
    const fileName = item.file_name || `wedding-photo-${id}.jpg`;

    const headers = new Headers();
    headers.set("Content-Type", mimeType);
    headers.set("Content-Length", fileBuffer.length.toString());

    if (isDownload) {
      headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(fileName)}"`);
    } else {
      headers.set("Content-Disposition", `inline; filename="${encodeURIComponent(fileName)}"`);
      // Cache published items for 1 hour; drafts are not cached
      if (item.is_published) {
        headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
      } else {
        headers.set("Cache-Control", "no-store, must-revalidate");
      }
    }

    return new NextResponse(fileBuffer, { headers });
  } catch (fsErr) {
    console.error(`Failed to read media file at ${filePath}:`, fsErr);
    return NextResponse.json({ error: "Media file not found on disk." }, { status: 404 });
  }
}
