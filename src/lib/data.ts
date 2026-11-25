import { db } from "@/db";
import { entries, settings } from "@/db/schema";
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { DEFAULT_SETTINGS, getContentType, type EntryDTO } from "./types";
import { ensureSeed } from "./seed";

function rowToDTO(row: typeof entries.$inferSelect): EntryDTO {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    body: row.body,
    imageUrl: row.imageUrl,
    images: (row.images as string[]) ?? [],
    files: (row.files as EntryDTO["files"]) ?? [],
    links: (row.links as EntryDTO["links"]) ?? [],
    meta: (row.meta as Record<string, string>) ?? {},
    status: row.status,
    sortOrder: row.sortOrder ?? 0,
    createdAt: row.createdAt ? row.createdAt.toISOString() : null,
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
  };
}

export async function getAllSettings(): Promise<Record<string, string>> {
  await ensureSeed();
  try {
    const rows = await db.select().from(settings);
    const out: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const r of rows) {
      if (r.key) out[r.key] = r.value ?? "";
    }
    return out;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function getSetting(key: string, fallback = ""): Promise<string> {
  const all = await getAllSettings();
  return all[key] ?? fallback;
}

export async function saveSettings(input: Record<string, string>): Promise<void> {
  await ensureSeed();
  for (const [key, value] of Object.entries(input)) {
    const v = String(value ?? "");
    await db
      .insert(settings)
      .values({ key, value: v })
      .onConflictDoUpdate({ target: settings.key, set: { value: v } });
  }
}

export interface ListOpts {
  type?: string;
  types?: string[];
  status?: string;
  includeNonPublished?: boolean;
  limit?: number;
  query?: string;
}

export async function listEntries(opts: ListOpts = {}): Promise<EntryDTO[]> {
  await ensureSeed();
  const conds: ReturnType<typeof eq>[] = [];
  // drizzle conditions are SQL; use array of SQL
  const wheres: ReturnType<typeof sql>[] = [];
  void conds;
  try {
    let q = db.select().from(entries);
    // build with $dynamic if needed — use sql filtering manually
    const filters: string[] = [];
    void filters;
    void q;
    // Use query builder with conditions
    const clauses = [];
    if (opts.type) clauses.push(eq(entries.type, opts.type));
    if (opts.types && opts.types.length) clauses.push(inArray(entries.type, opts.types));
    if (!opts.includeNonPublished) {
      if (opts.status) clauses.push(eq(entries.status, opts.status));
      else clauses.push(eq(entries.status, "published"));
    } else if (opts.status) {
      clauses.push(eq(entries.status, opts.status));
    }
    if (opts.query) {
      const like = `%${opts.query}%`;
      clauses.push(or(ilike(entries.title, like), ilike(entries.excerpt, like), ilike(entries.body, like)) as never);
    }
    let rows;
    if (clauses.length === 0) {
      rows = await db.select().from(entries).orderBy(asc(entries.sortOrder), desc(entries.createdAt));
    } else if (clauses.length === 1) {
      rows = await db.select().from(entries).where(clauses[0] as never).orderBy(asc(entries.sortOrder), desc(entries.createdAt));
    } else {
      rows = await db
        .select()
        .from(entries)
        .where(and(...(clauses as Parameters<typeof and>)) as never)
        .orderBy(asc(entries.sortOrder), desc(entries.createdAt));
    }
    void wheres;
    let out = rows.map(rowToDTO);
    if (opts.limit) out = out.slice(0, opts.limit);
    return out;
  } catch {
    return [];
  }
}

export async function getEntryById(id: string): Promise<EntryDTO | null> {
  await ensureSeed();
  try {
    const rows = await db.select().from(entries).where(eq(entries.id, id as never));
    if (!rows[0]) return null;
    return rowToDTO(rows[0]);
  } catch {
    return null;
  }
}

export async function countEntries(): Promise<{ total: number; published: number; draft: number; priv: number; byType: Record<string, number> }> {
  const all = await listEntries({ includeNonPublished: true });
  const byType: Record<string, number> = {};
  let published = 0;
  let draft = 0;
  let priv = 0;
  for (const e of all) {
    byType[e.type] = (byType[e.type] ?? 0) + 1;
    if (e.status === "published") published++;
    else if (e.status === "private") priv++;
    else draft++;
  }
  return { total: all.length, published, draft, priv, byType };
}

export function validateEntryPayload(type: string, payload: Record<string, unknown>): { ok: boolean; errors: string[]; cleaned: Record<string, unknown> } {
  const def = getContentType(type);
  const errors: string[] = [];
  if (!def) return { ok: false, errors: ["Jenis konten tidak dikenal."], cleaned: {} };
  const cleaned: Record<string, unknown> = {};
  for (const f of def.fields) {
    const raw = (payload as Record<string, unknown>)[f.key];
    if (f.type === "checkbox") {
      cleaned[f.key] = raw === true || raw === "true" || raw === "on" || raw === "1" ? "true" : "false";
      continue;
    }
    if (f.type === "number") {
      const n = Number(raw ?? 0);
      cleaned[f.key] = Number.isFinite(n) ? n : 0;
      continue;
    }
    if (f.type === "images") {
      const arr = Array.isArray(raw) ? raw.filter((x) => typeof x === "string" && x.trim()) : [];
      cleaned[f.key] = arr.slice(0, 12).map((s) => String(s).slice(0, 2000));
      continue;
    }
    if (f.type === "files") {
      const arr = Array.isArray(raw) ? raw : [];
      cleaned[f.key] = arr
        .slice(0, 12)
        .filter((x) => x && typeof x === "object")
        .map((x) => {
          const o = x as Record<string, unknown>;
          return {
            name: String(o.name ?? "").slice(0, 300),
            url: String(o.url ?? "").slice(0, 2000),
            apiUrl: String(o.apiUrl ?? o.url ?? "").slice(0, 2000),
            size: Number(o.size ?? 0) || 0,
            mime: String(o.mime ?? "").slice(0, 200),
            label: String(o.label ?? o.name ?? "").slice(0, 300),
          };
        });
      continue;
    }
    if (f.type === "links") {
      const arr = Array.isArray(raw) ? raw : [];
      const out: Array<{ title: string; url: string }> = [];
      for (const item of arr.slice(0, 12)) {
        const o = item as Record<string, unknown>;
        const url = String(o?.url ?? "").trim().slice(0, 2000);
        const title = String(o?.title ?? "").trim().slice(0, 300) || url;
        if (!url) continue;
        try {
          const u = new URL(url);
          if (u.protocol !== "http:" && u.protocol !== "https:") {
            errors.push(`Tautan tidak valid: ${url}`);
            continue;
          }
        } catch {
          errors.push(`Tautan tidak valid: ${url}`);
          continue;
        }
        out.push({ title, url });
      }
      cleaned[f.key] = out;
      continue;
    }
    if (f.type === "url") {
      const s = String(raw ?? "").trim().slice(0, 2000);
      if (s) {
        try {
          const u = new URL(s);
          if (u.protocol !== "http:" && u.protocol !== "https:") errors.push(`${f.label} harus URL http(s).`);
        } catch {
          errors.push(`${f.label} harus URL valid.`);
        }
      } else if (f.required) {
        errors.push(`${f.label} wajib diisi.`);
      }
      cleaned[f.key] = s;
      continue;
    }
    if (f.type === "select") {
      const s = String(raw ?? "").trim().slice(0, 500);
      if (f.required && !s) errors.push(`${f.label} wajib dipilih.`);
      if (s && f.options && !f.options.some((o) => o.value === s)) {
        errors.push(`${f.label} tidak valid.`);
      }
      cleaned[f.key] = s;
      continue;
    }
    // text, textarea, richtext, image, file
    const s = String(raw ?? "").trim().slice(0, f.type === "richtext" || f.type === "textarea" ? 50000 : 5000);
    if (f.required && !s) errors.push(`${f.label} wajib diisi.`);
    if (f.type === "image" && s && !(s.startsWith("/") || s.startsWith("http://") || s.startsWith("https://"))) {
      errors.push(`${f.label} harus URL/ path valid.`);
    }
    cleaned[f.key] = s;
  }
  // title fallback
  if (!cleaned.title) {
    const t = String((payload as Record<string, unknown>).title ?? "").trim();
    if (t) cleaned.title = t.slice(0, 500);
  }
  return { ok: errors.length === 0, errors, cleaned };
}

export function cleanedToRow(type: string, cleaned: Record<string, unknown>): {
  title: string;
  slug: string | null;
  excerpt: string | null;
  body: string | null;
  imageUrl: string | null;
  images: string[];
  files: EntryDTO["files"];
  links: EntryDTO["links"];
  meta: Record<string, string>;
  status: string;
  sortOrder: number;
} {
  const meta: Record<string, string> = {};
  const known = new Set(["title", "slug", "excerpt", "body", "imageUrl", "images", "files", "links", "status", "sortOrder"]);
  for (const [k, v] of Object.entries(cleaned)) {
    if (known.has(k)) continue;
    if (v === undefined || v === null) continue;
    meta[k] = String(v);
  }
  const title = String(cleaned.title ?? "Tanpa judul").slice(0, 500) || "Tanpa judul";
  return {
    title,
    slug: cleaned.slug ? String(cleaned.slug).slice(0, 500) : null,
    excerpt: cleaned.excerpt ? String(cleaned.excerpt).slice(0, 5000) : null,
    body: cleaned.body ? String(cleaned.body).slice(0, 50000) : null,
    imageUrl: cleaned.imageUrl ? String(cleaned.imageUrl).slice(0, 2000) : null,
    images: Array.isArray(cleaned.images) ? (cleaned.images as string[]) : [],
    files: Array.isArray(cleaned.files) ? (cleaned.files as EntryDTO["files"]) : [],
    links: Array.isArray(cleaned.links) ? (cleaned.links as EntryDTO["links"]) : [],
    meta,
    status: ["published", "draft", "private"].includes(String(cleaned.status)) ? String(cleaned.status) : "draft",
    sortOrder: Number(cleaned.sortOrder ?? 0) || 0,
  };
}
