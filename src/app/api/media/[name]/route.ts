import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { requireUser } from "@/lib/api";

// /api/media/[name] — serves the wall's uploaded media (session 57, R57-B
// — the superset behind REF's hidden #media-upload input). Files live
// under <repo>/db/uploads/ (the git-ignored db folder, beside the SQLite
// file) and are served BY EXTENSION with a strict name guard (no path
// traversal — only the basename, no separators, no dotfiles).
//
// auth: any signed-in user (the wall is an internal surface; the post
// feed already gates visibility server-side in /api/posts). Binary
// responses bypass the JSON envelope — this route catches its own
// errors and answers with the envelope's error shape on failure.

const UPLOADS_DIR = path.join(process.cwd(), "db", "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

const jsonErr = (code: string, message: string, status: number) =>
  NextResponse.json({ ok: false, error: { code, message } }, { status });

export async function GET(_req: NextRequest, ctx: { params: Promise<{ name: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;

  try {
    const { name } = await ctx.params;

    // path traversal guard: a bare filename only (no separators, no
    // dotfiles, no double-dot segments)
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name) || name.includes("..")) {
      return jsonErr("VALIDATION", "Invalid media name", 400);
    }

    const ext = path.extname(name).toLowerCase();
    const contentType = CONTENT_TYPES[ext];
    if (!contentType) return jsonErr("NOT_FOUND", "Unsupported media type", 404);

    const filePath = path.join(UPLOADS_DIR, name);
    const st = await stat(filePath);
    if (!st.isFile()) return jsonErr("NOT_FOUND", "Media not found", 404);

    const data = await readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(st.size),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return jsonErr("NOT_FOUND", "Media not found", 404);
  }
}
