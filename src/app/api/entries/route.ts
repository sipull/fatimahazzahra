import { NextResponse } from "next/server";
import { db } from "@/db";
import { entries } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/auth";
import { listEntries, validateEntryPayload, cleanedToRow } from "@/lib/data";
import { getContentType } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? undefined;
  const q = url.searchParams.get("q") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;
  const authed = await isAdminAuthenticated();
  // Publik: hanya published. Admin: boleh semua bila login.
  const includeNonPublished = authed;
  const items = await listEntries({
    type,
    status: authed ? status : "published",
    includeNonPublished,
    query: q ?? undefined,
  });
  // ganda: pastikan non-admin tidak pernah menerima non-published
  const safe = authed ? items : items.filter((e) => e.status === "published");
  return NextResponse.json({ results: safe });
}

export async function POST(req: Request) {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }
  const type = String(body.type ?? "");
  const def = getContentType(type);
  if (!def) return NextResponse.json({ error: "Jenis konten tidak dikenal." }, { status: 400 });
  const payload = (body.data ?? body) as Record<string, unknown>;
  const { ok, errors, cleaned } = validateEntryPayload(type, payload);
  if (!ok) return NextResponse.json({ error: errors.join(" "), errors }, { status: 400 });
  const row = cleanedToRow(type, cleaned);
  try {
    const inserted = await db
      .insert(entries)
      .values({
        type,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        body: row.body,
        imageUrl: row.imageUrl,
        images: row.images,
        files: row.files,
        links: row.links,
        meta: row.meta,
        status: row.status,
        sortOrder: row.sortOrder,
      })
      .returning();
    return NextResponse.json({ ok: true, entry: inserted[0] }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Gagal menyimpan." }, { status: 500 });
  }
}
