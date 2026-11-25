import { NextResponse } from "next/server";
import { db } from "@/db";
import { entries, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/auth";
import { getContentType } from "@/lib/types";

export async function POST(req: Request) {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: { settings?: Record<string, string>; entries?: Array<Record<string, unknown>> };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Berkas cadangan tidak valid." }, { status: 400 });
  }
  let restoredEntries = 0;
  let restoredSettings = 0;
  try {
    if (body.settings && typeof body.settings === "object") {
      for (const [k, v] of Object.entries(body.settings)) {
        if (!/^[a-z0-9_]+$/.test(k)) continue;
        await db.insert(settings).values({ key: k, value: String(v ?? "").slice(0, 50000) }).onConflictDoUpdate({ target: settings.key, set: { value: String(v ?? "").slice(0, 50000) } });
        restoredSettings++;
      }
    }
    if (Array.isArray(body.entries)) {
      for (const raw of body.entries.slice(0, 2000)) {
        const type = String((raw as Record<string, unknown>).type ?? "");
        if (!getContentType(type)) continue;
        const title = String((raw as Record<string, unknown>).title ?? "Tanpa judul").slice(0, 500);
        const id = typeof (raw as Record<string, unknown>).id === "string" ? String((raw as Record<string, unknown>).id) : undefined;
        const row = {
          type,
          title,
          slug: typeof raw.slug === "string" ? raw.slug.slice(0, 500) : null,
          excerpt: typeof raw.excerpt === "string" ? raw.excerpt.slice(0, 5000) : null,
          body: typeof raw.body === "string" ? raw.body.slice(0, 50000) : null,
          imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl.slice(0, 2000) : null,
          images: Array.isArray(raw.images) ? (raw.images as string[]).slice(0, 12) : [],
          files: Array.isArray(raw.files) ? raw.files.slice(0, 12) : [],
          links: Array.isArray(raw.links) ? raw.links.slice(0, 12) : [],
          meta: raw.meta && typeof raw.meta === "object" ? (raw.meta as Record<string, string>) : {},
          status: ["published", "draft", "private"].includes(String(raw.status)) ? String(raw.status) : "draft",
          sortOrder: Number((raw as Record<string, unknown>).sortOrder ?? 0) || 0,
        };
        if (id) {
          const exist = await db.select().from(entries).where(eq(entries.id, id as never));
          if (exist.length > 0) {
            await db.update(entries).set({ ...row, updatedAt: new Date() }).where(eq(entries.id, id as never));
          } else {
            await db.insert(entries).values({ id: id as never, ...row } as never);
          }
        } else {
          await db.insert(entries).values(row as never);
        }
        restoredEntries++;
      }
    }
    return NextResponse.json({ ok: true, restoredEntries, restoredSettings });
  } catch {
    return NextResponse.json({ error: "Gagal memulihkan cadangan." }, { status: 500 });
  }
}
