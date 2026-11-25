"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ContentTypeDef, EntryDTO, EntryFile, EntryLink } from "@/lib/types";
import RichTextEditor from "./RichTextEditor";
import PhotoField, { type PhotoValue } from "./PhotoField";
import SaveBar, { useUnsavedGuard } from "./SaveBar";

async function uploadOne(file: File): Promise<EntryFile> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Gagal mengunggah.");
  const f = data.file;
  return { name: f.name, url: f.url, apiUrl: f.apiUrl, size: f.size, mime: f.mime, label: f.name };
}

const inputCls =
  "w-full border border-cocoa-300 bg-paper px-4 py-3 text-sm text-cocoa-700 placeholder:text-cocoa-300 focus:border-rose-400";
const labelCls = "block text-[13px] font-bold text-cocoa-700";

export default function EntryForm({ def, initial }: { def: ContentTypeDef; initial?: EntryDTO | null }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);

  const [form, setForm] = useState<Record<string, unknown>>(() => {
    const base: Record<string, unknown> = {};
    for (const f of def.fields) {
      if (f.type === "images" || f.type === "files" || f.type === "links") {
        if (f.key === "images") base[f.key] = (initial?.images ?? []) as string[];
        else if (f.key === "files") base[f.key] = (initial?.files ?? []) as EntryFile[];
        else base[f.key] = (initial?.links ?? []) as EntryLink[];
      } else if (f.type === "number") {
        base[f.key] = f.key === "sortOrder" ? initial?.sortOrder ?? 0 : Number(initial?.meta?.[f.key] ?? 0) || 0;
      } else if (f.type === "checkbox") {
        base[f.key] = (initial?.meta?.[f.key] ?? "false") as string;
      } else if (f.key === "title") base[f.key] = initial?.title ?? "";
      else if (f.key === "excerpt") base[f.key] = initial?.excerpt ?? "";
      else if (f.key === "body") base[f.key] = initial?.body ?? "";
      else if (f.key === "imageUrl") base[f.key] = initial?.imageUrl ?? "";
      else if (f.key === "status") base[f.key] = initial?.status ?? "published";
      else base[f.key] = initial?.meta?.[f.key] ?? "";
    }
    return base;
  });

  const [linksDraft, setLinksDraft] = useState({ title: "", url: "" });

  const initialForm = useMemo(() => form, []); // eslint-disable-line react-hooks/exhaustive-deps
  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initialForm), [form, initialForm]);
  const [status, setStatus] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  useUnsavedGuard(dirty);

  function set(key: string, value: unknown) {
    setForm((p) => ({ ...p, [key]: value }));
    setStatus("");
  }

  async function handleImage(key: string, file: File | null, fromUrl?: string) {
    if (fromUrl !== undefined) {
      set(key, fromUrl);
      return;
    }
    if (!file) return;
    setUploading(key);
    setError("");
    try {
      const up = await uploadOne(file);
      set(key, up.apiUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunggah gambar.");
    } finally {
      setUploading(null);
    }
  }

  async function handleGalleryAdd(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading("images");
    try {
      const cur = [...((form.images as string[]) ?? [])];
      for (const f of Array.from(files).slice(0, 8)) {
        const up = await uploadOne(f);
        cur.push(up.apiUrl);
      }
      set("images", cur.slice(0, 12));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunggah.");
    } finally {
      setUploading(null);
    }
  }

  async function handleFilesAdd(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading("files");
    try {
      const cur = [...((form.files as EntryFile[]) ?? [])];
      for (const f of Array.from(files).slice(0, 8)) {
        const up = await uploadOne(f);
        cur.push(up);
      }
      set("files", cur.slice(0, 12));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunggah.");
    } finally {
      setUploading(null);
    }
  }

  async function save(statusOverride?: string) {
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = { ...form };
      if (statusOverride) payload.status = statusOverride;
      const url = initial ? `/api/entries/${initial.id}` : "/api/entries";
      const method = initial ? "PUT" : "POST";
      const body = initial ? { data: payload } : { type: def.type, data: payload };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan.");
      setStatus("Konten tersimpan permanen & sudah tampil sesuai status publikasinya.");
      setSavedAt(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
      router.push(`/admin/konten/${def.type}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="border border-cocoa-200 bg-paper p-6">
        {error && (
          <p className="mb-5 border border-rose-300 bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-700" role="alert">
            {error}
          </p>
        )}
        <div className="grid gap-6">
          {def.fields.map((f) => {
            if (f.key === "status" || f.key === "sortOrder" || f.type === "number" || f.type === "checkbox") return null;
            const val = form[f.key];
            if (f.type === "text" || f.type === "url" || f.type === "date") {
              return (
                <label key={f.key} className="grid gap-1.5">
                  <span className={labelCls}>
                    {f.label} {f.required && <span className="text-rose-500">*</span>}
                  </span>
                  <input value={String(val ?? "")} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} className={inputCls} />
                  {f.help && <span className="text-xs text-cocoa-400">{f.help}</span>}
                </label>
              );
            }
            if (f.type === "textarea" || f.type === "richtext") {
              return (
                <RichTextEditor
                  key={f.key}
                  label={f.label}
                  value={String(val ?? "")}
                  onChange={(nv) => set(f.key, nv)}
                  rows={f.type === "richtext" ? 10 : 4}
                  required={f.required}
                  help={f.help ? `${f.help}` : undefined}
                  placeholder={f.placeholder}
                />
              );
            }
            if (f.type === "select") {
              return (
                <label key={f.key} className="grid gap-1.5">
                  <span className={labelCls}>
                    {f.label} {f.required && <span className="text-rose-500">*</span>}
                  </span>
                  <select value={String(val ?? "")} onChange={(e) => set(f.key, e.target.value)} className={`${inputCls} bg-paper`}>
                    <option value="">— Pilih —</option>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  {f.help && <span className="text-xs text-cocoa-400">{f.help}</span>}
                </label>
              );
            }
            if (f.type === "image") {
              const src = String(val ?? "");
              return (
                <PhotoField
                  key={f.key}
                  label={f.label}
                  url={src}
                  pos={String((form[`${f.key}_pos`] as string) ?? "50% 40%")}
                  ratio="4:3"
                  help={f.help}
                  onChange={(v: PhotoValue) => set(f.key, v.url)}
                  onError={setError}
                />
              );
            }
            if (f.type === "images") {
              const arr = (val as string[]) ?? [];
              return (
                <div key={f.key} className="grid gap-2 border border-dashed border-cocoa-300 bg-sand-100/60 p-4">
                  <p className={labelCls}>{f.label}</p>
                  {arr.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {arr.map((u, i) => (
                        <div key={i} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={u} alt={`Galeri ${i + 1}`} className="h-20 w-full border border-cocoa-200 object-cover" />
                          <button
                            type="button"
                            onClick={() => set(f.key, arr.filter((_, j) => j !== i))}
                            className="absolute right-1 top-1 bg-cocoa-700 px-1.5 py-0.5 text-[10px] font-bold text-ivory"
                            aria-label={`Hapus gambar ${i + 1}`}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-cocoa-400">Belum ada gambar tambahan.</p>
                  )}
                  <label className="cursor-pointer border border-cocoa-300 bg-paper px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-widest text-cocoa-600 hover:text-rose-600">
                    {uploading === "images" ? "Mengunggah…" : "Tambah gambar"}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleGalleryAdd(e.target.files)} />
                  </label>
                  <span className="text-xs text-cocoa-400">Urutan gambar = urutan penambahan. Hapus untuk menata ulang.</span>
                </div>
              );
            }
            if (f.type === "files") {
              const arr = (val as EntryFile[]) ?? [];
              return (
                <div key={f.key} className="grid gap-2 border border-dashed border-cocoa-300 bg-sand-100/60 p-4">
                  <p className={labelCls}>{f.label}</p>
                  {arr.length === 0 && <p className="text-xs text-cocoa-400">Belum ada dokumen. PDF/DOCX/PPTX/XLSX maksimal 10 MB.</p>}
                  {arr.map((file, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 border border-cocoa-200 bg-paper px-3 py-2 text-xs">
                      <span className="truncate font-semibold text-cocoa-700">📄 {file.label || file.name}</span>
                      <span className="flex shrink-0 gap-1">
                        <a href={file.apiUrl} target="_blank" rel="noreferrer" className="bg-sand-200 px-2 py-1 font-bold text-cocoa-600">Lihat</a>
                        <button type="button" onClick={() => set(f.key, arr.filter((_, j) => j !== i))} className="bg-rose-100 px-2 py-1 font-bold text-rose-600">Hapus</button>
                      </span>
                    </div>
                  ))}
                  <label className="cursor-pointer bg-cocoa-700 px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-widest text-ivory hover:bg-rose-600">
                    {uploading === "files" ? "Mengunggah…" : "Unggah dokumen"}
                    <input type="file" multiple className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv" onChange={(e) => handleFilesAdd(e.target.files)} />
                  </label>
                  {f.help && <span className="text-xs text-cocoa-400">{f.help}</span>}
                </div>
              );
            }
            if (f.type === "links") {
              const arr = (val as EntryLink[]) ?? [];
              return (
                <div key={f.key} className="grid gap-2 border border-dashed border-cocoa-300 bg-sand-100/60 p-4">
                  <p className={labelCls}>{f.label}</p>
                  {arr.map((l, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 border border-cocoa-200 bg-paper px-3 py-2 text-xs">
                      <a href={l.url} target="_blank" rel="noreferrer" className="truncate font-semibold text-rose-600 hover:underline">🔗 {l.title}</a>
                      <button type="button" onClick={() => set(f.key, arr.filter((_, j) => j !== i))} className="shrink-0 bg-rose-100 px-2 py-1 font-bold text-rose-600">Hapus</button>
                    </div>
                  ))}
                  <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
                    <input value={linksDraft.title} onChange={(e) => setLinksDraft({ ...linksDraft, title: e.target.value })} placeholder="Judul tautan" className="border border-cocoa-300 px-3 py-2 text-xs" />
                    <input value={linksDraft.url} onChange={(e) => setLinksDraft({ ...linksDraft, url: e.target.value })} placeholder="https://…" className="border border-cocoa-300 px-3 py-2 text-xs" />
                    <button
                      type="button"
                      onClick={() => {
                        if (!linksDraft.url.trim()) return;
                        set(f.key, [...arr, { title: linksDraft.title.trim() || linksDraft.url.trim(), url: linksDraft.url.trim() }]);
                        setLinksDraft({ title: "", url: "" });
                      }}
                      className="bg-cocoa-700 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-ivory hover:bg-rose-600"
                    >
                      Tambah
                    </button>
                  </div>
                  <span className="text-xs text-cocoa-400">Hanya URL http(s) yang valid. Tautan dibuka di tab baru dengan atribut keamanan.</span>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      <div className="grid content-start gap-4">
        <div className="border border-cocoa-200 bg-paper p-5">
          <p className="label-caps text-rose-500">Publikasi</p>
          <label className="mt-4 grid gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-cocoa-400">Status</span>
            <select value={String(form.status ?? "published")} onChange={(e) => set("status", e.target.value)} className={`${inputCls} bg-paper`}>
              <option value="published">Dipublikasikan</option>
              <option value="draft">Draf</option>
              <option value="private">Terbatas / Privat</option>
            </select>
          </label>
          <label className="mt-4 grid gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-cocoa-400">Urutan tampil</span>
            <input type="number" value={Number(form.sortOrder ?? 0)} onChange={(e) => set("sortOrder", Number(e.target.value))} className={inputCls} />
          </label>
          <div className="mt-5 grid gap-2">
            <button onClick={() => save()} disabled={saving} className="bg-cocoa-700 px-4 py-3.5 text-[12px] font-bold uppercase tracking-widest text-ivory hover:bg-rose-600 disabled:opacity-60">
              {saving ? "Menyimpan…" : initial ? "Simpan perubahan" : "Tambah konten"}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => save("draft")} disabled={saving} className="border border-cocoa-300 px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest text-cocoa-600">
                Simpan draf
              </button>
              <button onClick={() => setPreview((v) => !v)} className="border border-cocoa-300 px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest text-cocoa-600">
                {preview ? "Tutup" : "Pratinjau"}
              </button>
            </div>
          </div>
        </div>
        <div className="border border-kraft-300 bg-sand-100 p-5 text-xs leading-relaxed text-cocoa-500">
          <p className="label-caps text-cocoa-600">Panduan singkat</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li><b>Published</b> tampil di situs publik & pencarian.</li>
            <li><b>Draf</b> hanya terlihat di panel admin.</li>
            <li><b>Privat</b> butuh login untuk membuka berkasnya.</li>
            <li>Angka urutan kecil tampil lebih dulu.</li>
          </ul>
        </div>
      </div>

      <SaveBar
        dirty={dirty}
        saving={saving}
        status={status}
        error={error}
        onSave={() => save()}
        onPublish={() => save("published")}
        onCancel={() => {
          if (confirm("Batalkan perubahan yang belum disimpan?")) {
            setForm(initialForm);
            router.refresh();
          }
        }}
        previewHref={initial ? `/detail/${initial.id}` : def.group === "refleksi" ? "/refleksi" : def.group === "karya" ? "/karya-inovasi" : `/lk/${def.slug}`}
        previewDisabled={!initial}
      />

      {preview && (
        <div className="fixed inset-0 z-50 overflow-auto bg-cocoa-900/80 p-4" onClick={() => setPreview(false)} role="dialog" aria-label="Pratinjau konten">
          <div className="mx-auto max-w-2xl border border-cocoa-300 bg-paper p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <p className="label-caps text-rose-500">Pratinjau — belum tentu tersimpan</p>
            <h3 className="font-serif-display mt-2 text-xl font-semibold text-cocoa-700">{String(form.title ?? "(Tanpa judul)")}</h3>
            {form.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={String(form.imageUrl)} alt="Pratinjau" className="mt-4 max-h-64 w-full border border-cocoa-200 object-cover" />
            ) : null}
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-cocoa-600">
              {String(form.excerpt || form.body || "").slice(0, 2000)}
            </p>
            <button onClick={() => setPreview(false)} className="label-caps mt-6 bg-cocoa-700 px-5 py-3 text-ivory">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
