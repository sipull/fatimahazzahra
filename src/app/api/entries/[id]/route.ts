import { NextResponse } from "next/server";
import { db } from "@/db";
import { entries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/auth";
import { getEntryById, validateEntryPayload, cleanedToRow } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const entry = await getEntryById(id);
  if (!entry) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
  const authed = await isAdminAuthenticated();
  if (entry.status !== "published" && !authed) {
    return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
  }
  return NextResponse.json({ entry });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const existing = await getEntryById(id);
  if (!existing) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }
  const payload = (body.data ?? body) as Record<string, unknown>;
  const { ok, errors, cleaned } = validateEntryPayload(existing.type, payload);
  if (!ok) return NextResponse.json({ error: errors.join(" "), errors }, { status: 400 });
  const row = cleanedToRow(existing.type, cleaned);
  try {
    await db
      .update(entries)
      .set({
        title: row.title,
        excerpt: row.excerpt,
        body: row.body,
        imageUrl: row.imageUrl,
        images: row.images,
        files: row.files,
        links: row.links,
        meta: row.meta,
        status: row.status,
        sortOrder: row.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(entries.id, id as never));
    const fresh = await getEntryById(id);
    return NextResponse.json({ ok: true, entry: fresh });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  try {
    await db.delete(entries).where(eq(entries.id, id as never));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus." }, { status: 500 });
  }
}
