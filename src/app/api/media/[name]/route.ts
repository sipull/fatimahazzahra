import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join, basename } from "path";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllSettings, listEntries } from "@/lib/data";

async function serveFile(req: Request, safe: string): Promise<NextResponse> {
  const path = join(process.cwd(), "public", "uploads", safe);
  const st = await stat(path).catch(() => null);
  if (!st || !st.isFile()) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
  const buf = await readFile(path);
  const mime = mimeFor(safe);
  const download = new URL(req.url).searchParams.get("download") === "1";
  const headers: Record<string, string> = {
    "Content-Type": mime,
    "Content-Length": String(buf.length),
    "Cache-Control": "private, max-age=300",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "sandbox",
  };
  if (download) headers["Content-Disposition"] = `attachment; filename="${safe}"`;
  else if (!mime.startsWith("image/") && !mime.startsWith("video/") && mime !== "application/pdf" && !mime.startsWith("text/")) {
    headers["Content-Disposition"] = `attachment; filename="${safe}"`;
  } else {
    headers["Content-Disposition"] = `inline; filename="${safe}"`;
  }
  return new NextResponse(new Uint8Array(buf), { headers });
}

export const dynamic = "force-dynamic";

function mimeFor(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    txt: "text/plain; charset=utf-8",
    csv: "text/csv; charset=utf-8",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    mp4: "video/mp4",
  };
  return map[ext] ?? "application/octet-stream";
}

export async function GET(req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  // cegah path traversal
  const safe = basename(name);
  if (!safe || safe !== name || safe.includes("..") || safe.includes("/") || safe.includes("\\")) {
    return NextResponse.json({ error: "Nama file tidak valid." }, { status: 400 });
  }
  if (safe.startsWith(".")) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });

  // Periksa izin: jika file hanya dirujuk konten draf/privat (atau belum dirujuk), wajib login admin
  const url = new URL(req.url);
  void url;
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      // 1) Berkas yang dirujuk pengaturan situs (foto profil/hero, CV) bersifat publik
      const s = await getAllSettings();
      const settingRefs = ["hero_image", "profile_photo", "cv_file"];
      const usedBySetting = settingRefs.some((k) => (s[k] ?? "").includes(safe));
      if (usedBySetting) {
        return serveFile(req, safe);
      }

      // 2) Berkas lain: publik hanya bila dirujuk entri berstatus published
      const all = await listEntries({ includeNonPublished: true });
      let referencedByPublished = false;
      let referencedAtAll = false;
      for (const e of all) {
        const inFiles = (e.files ?? []).some((f) => (f.apiUrl ?? f.url ?? "").includes(safe) || f.name === safe);
        const inImages = (e.images ?? []).some((u) => u.includes(safe));
        const inCover = (e.imageUrl ?? "").includes(safe);
        if (inFiles || inImages || inCover) {
          referencedAtAll = true;
          if (e.status === "published") {
            referencedByPublished = true;
            break;
          }
        }
      }
      // File yang belum dirujuk siapa pun (baru diunggah) dianggap terbatas
      if (!referencedAtAll || !referencedByPublished) {
        return NextResponse.json({ error: "File terbatas. Silakan masuk sebagai admin." }, { status: 403 });
      }
    }

    return serveFile(req, safe);
  } catch {
    return NextResponse.json({ error: "Gagal membaca file." }, { status: 500 });
  }
}
