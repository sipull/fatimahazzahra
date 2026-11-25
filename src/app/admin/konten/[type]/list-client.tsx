"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EntryDTO } from "@/lib/types";

const btn = "px-3 py-2 text-[11px] font-bold uppercase tracking-widest";

export default function TypeListClient({ type, initial }: { type: string; initial: EntryDTO[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("semua");
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = items.filter((e) => {
    if (filter !== "semua" && e.status !== filter) return false;
    if (q && !`${e.title} ${e.excerpt ?? ""} ${e.body ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  async function toggleStatus(e: EntryDTO) {
    const next = e.status === "published" ? "draft" : "published";
    setBusy(e.id);
    const payload: Record<string, unknown> = {
      title: e.title,
      excerpt: e.excerpt ?? "",
      body: e.body ?? "",
      imageUrl: e.imageUrl ?? "",
      images: e.images ?? [],
      files: e.files ?? [],
      links: e.links ?? [],
      status: next,
      sortOrder: e.sortOrder ?? 0,
      ...e.meta,
    };
    const res = await fetch(`/api/entries/${e.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: payload }) });
    if (res.ok) setItems((prev) => prev.map((x) => (x.id === e.id ? { ...x, status: next } : x)));
    setBusy(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Hapus konten ini? Tindakan ini tidak dapat dibatalkan.")) return;
    setBusy(id);
    const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((x) => x.id !== id));
    setBusy(null);
    router.refresh();
  }

  async function move(id: string, dir: -1 | 1) {
    const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((x) => x.id === id);
    const swapWith = sorted[idx + dir];
    if (!swapWith) return;
    const cur = sorted[idx];
    const orders = [
      { id: cur.id, sortOrder: cur.sortOrder === swapWith.sortOrder ? cur.sortOrder + dir : swapWith.sortOrder },
      { id: swapWith.id, sortOrder: swapWith.sortOrder },
    ];
    await fetch("/api/entries/reorder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orders }) });
    const fresh = await fetch(`/api/entries?type=${type}`).then((r) => r.json());
    if (fresh.results) setItems(fresh.results);
    router.refresh();
  }

  return (
    <div className="border border-cocoa-200 bg-paper p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari konten…" className="flex-1 border border-cocoa-300 bg-paper px-4 py-2.5 text-sm" />
        <div className="flex flex-wrap gap-2">
          {[
            { k: "semua", l: "Semua" },
            { k: "published", l: "Published" },
            { k: "draft", l: "Draf" },
            { k: "private", l: "Privat" },
          ].map((s) => (
            <button
              key={s.k}
              onClick={() => setFilter(s.k)}
              className={`${btn} ${filter === s.k ? "bg-cocoa-700 text-ivory" : "border border-cocoa-300 text-cocoa-500 hover:text-rose-600"}`}
            >
              {s.l}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 border border-dashed border-cocoa-300 bg-sand-100 px-5 py-10 text-center text-sm text-cocoa-500">
          Belum ada konten{filter !== "semua" ? ` berstatus ${filter}` : ""}.{" "}
          <Link href={`/admin/konten/${type}/baru`} className="font-bold text-rose-600 underline">Tambah sekarang →</Link>
        </p>
      ) : (
        <ul className="mt-5 grid">
          {filtered.map((e) => (
            <li key={e.id} className="flex flex-col gap-3 border-t border-cocoa-200/80 py-4 lg:flex-row lg:items-center">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-cocoa-700">{e.title}</p>
                <p className="mt-1.5 flex flex-wrap items-center gap-3">
                  <span
                    className={`${btn} ${
                      e.status === "published"
                        ? "bg-sage-100 text-sage-600"
                        : e.status === "private"
                          ? "bg-cocoa-700 text-ivory"
                          : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {e.status}
                  </span>
                  <span className="label-caps text-cocoa-400">urutan {e.sortOrder}</span>
                  {e.meta?.category && <span className="label-caps text-cocoa-500">{e.meta.category}</span>}
                  {e.meta?.period && <span className="label-caps text-cocoa-400">{e.meta.period}</span>}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => move(e.id, -1)} title="Naikkan urutan" className={`${btn} border border-cocoa-300 text-cocoa-600`}>↑</button>
                <button onClick={() => move(e.id, 1)} title="Turunkan urutan" className={`${btn} border border-cocoa-300 text-cocoa-600`}>↓</button>
                <Link href={`/admin/konten/${type}/${e.id}`} className={`${btn} bg-cocoa-700 text-ivory hover:bg-rose-600`}>Edit</Link>
                <button onClick={() => toggleStatus(e)} disabled={busy === e.id} className={`${btn} border border-cocoa-300 text-cocoa-600`}>
                  {e.status === "published" ? "Jadikan draf" : "Publikasikan"}
                </button>
                {e.status === "published" && (
                  <Link href={`/detail/${e.id}`} target="_blank" className={`${btn} border border-cocoa-300 text-cocoa-600`}>Lihat</Link>
                )}
                <button onClick={() => remove(e.id)} disabled={busy === e.id} className={`${btn} bg-rose-100 text-rose-700`}>Hapus</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
