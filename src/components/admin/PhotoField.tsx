"use client";

import { useRef, useState } from "react";

/* ============================================================
   Pengelola foto untuk panel admin.
   - Unggah dari perangkat → disimpan permanen di server
     (folder public/uploads + metadata), dilayani /api/media/[name]
   - Pratinjau sebelum & sesudah simpan
   - Ganti / hapus foto
   - Atur crop manual: focal point (object-position) + zoom (object-fit scale)
   - Foto ditampilkan MENTAH: tanpa filter, tanpa AI, tanpa penggambaran ulang
   ============================================================ */

export interface PhotoValue {
  url: string;
  pos?: string;
  zoom?: string;
}

export function aspectRatioClass(ratio: string): string {
  switch (ratio) {
    case "1:1": return "aspect-square";
    case "3:4": return "aspect-[3/4]";
    case "4:5": return "aspect-[4/5]";
    case "4:3": return "aspect-[4/3]";
    case "16:9": return "aspect-video";
    default: return "aspect-[4/5]";
  }
}

export default function PhotoField({
  label,
  url,
  pos = "50% 30%",
  zoom = "1",
  ratio = "4:5",
  help,
  onChange,
  onDelete,
  onError,
}: {
  label: string;
  url: string;
  pos?: string;
  zoom?: string;
  ratio?: string;
  help?: string;
  onChange: (v: PhotoValue) => void;
  onDelete?: () => void;
  onError?: (msg: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [pendingName, setPendingName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah foto.");
      // foto baru: simpan posisi default bila belum pernah diatur
      onChange({ url: data.file.apiUrl, pos: pos || "50% 30%", zoom: zoom || "1" });
      setPendingName(data.file.name as string);
    } catch (e) {
      onError?.(e instanceof Error ? e.message : "Gagal mengunggah foto.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const btn = "px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest";
  const aspect = aspectRatioClass(ratio);

  return (
    <div className="grid gap-3 border border-dashed border-kraft-300 bg-sand-100/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] font-bold text-cocoa-700">{label}</p>
        <span className="label-caps text-cocoa-400">rasio {ratio}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,240px)_1fr]">
        {/* pratinjau dengan crop */}
        <div className="relative bg-paper p-2 shadow-sm">
          {url ? (
            <div className={`${aspect} w-full overflow-hidden bg-kraft-100`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={label}
                className="h-full w-full"
                style={{ objectFit: "cover", objectPosition: pos, transform: `scale(${zoom || 1})`, transformOrigin: pos }}
              />
            </div>
          ) : (
            <div className={`${aspect} grid w-full place-items-center border border-dashed border-cocoa-300 bg-kraft-100 px-3 text-center`}>
              <span className="text-xs leading-relaxed text-cocoa-400">Belum ada foto. Unggah dari perangkat Anda.</span>
            </div>
          )}
          {busy && (
            <div className="absolute inset-0 grid place-items-center bg-cocoa-800/70">
              <span className="label-caps text-cream">Mengunggah…</span>
            </div>
          )}
          <span className="label-caps mt-2 block text-center text-cocoa-400">Pratinjau tampilan publik</span>
        </div>

        {/* kontrol crop */}
        <div className="grid content-start gap-3">
          <label className="grid gap-1">
            <span className="label-caps text-cocoa-500">Focal point (posisi bagian foto yang ditonjolkan)</span>
            <span className="flex items-center gap-3">
              <span className="label-caps w-9 text-cocoa-400">X</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Number((pos.split(/\s+/)[0] ?? "50").replace("%", ""))}
                onChange={(e) => onChange({ url, pos: `${e.target.value}% ${(pos.split(/\s+/)[1] ?? "30%").replace("%", "")}%`, zoom })}
                className="flex-1 accent-terra-500"
                aria-label="Posisi horizontal foto"
              />
              <span className="w-10 text-right text-xs font-bold text-cocoa-500">{(pos.split(/\s+/)[0] ?? "50%")}</span>
            </span>
            <span className="flex items-center gap-3">
              <span className="label-caps w-9 text-cocoa-400">Y</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Number((pos.split(/\s+/)[1] ?? "30").replace("%", ""))}
                onChange={(e) => onChange({ url, pos: `${(pos.split(/\s+/)[0] ?? "50%").replace("%", "")}% ${e.target.value}%`, zoom })}
                className="flex-1 accent-terra-500"
                aria-label="Posisi vertikal foto"
              />
              <span className="w-10 text-right text-xs font-bold text-cocoa-500">{(pos.split(/\s+/)[1] ?? "30%")}</span>
            </span>
          </label>

          <label className="grid gap-1">
            <span className="label-caps text-cocoa-500">Zoom ({Number(zoom || 1).toFixed(2)}×)</span>
            <input
              type="range"
              min={100}
              max={200}
              step={5}
              value={Number(zoom || 1) * 100}
              onChange={(e) => onChange({ url, pos, zoom: (Number(e.target.value) / 100).toFixed(2) })}
              className="accent-terra-500"
              aria-label="Perbesaran foto"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <label className={`${btn} cursor-pointer bg-cocoa-700 text-cream hover:bg-terra-600`}>
              {busy ? "Mengunggah…" : url ? "Ganti foto" : "Unggah foto"}
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
                }}
              />
            </label>
            {url && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Hapus foto ini? Foto akan dilepas dari bagian ini setelah Anda menyimpan perubahan.")) onDelete();
                }}
                className={`${btn} border border-terra-400 bg-paper text-terra-600 hover:bg-blush-100`}
              >
                Hapus
              </button>
            )}
          </div>

          {url && <input value={url} onChange={(e) => onChange({ url: e.target.value, pos, zoom })} className="border border-cocoa-200 px-3 py-2 text-xs" aria-label="URL foto" />}
          {pendingName && <p className="text-xs text-sage-600">✓ {pendingName} terunggah. Klik “Simpan Perubahan” untuk menerapkan.</p>}
          {help && <span className="text-xs leading-relaxed text-cocoa-400">{help}</span>}
          <p className="border-t border-dashed border-kraft-300 pt-2 text-[11px] leading-relaxed text-cocoa-400">
            Format JPG/PNG/WEBP, maksimal 6 MB per gambar. Foto ditampilkan apa adanya — tanpa filter, tanpa pengubahan wajah, tanpa pemrosesan AI. Pengaturan di atas hanya
            memotong dan memposisikan bagian foto yang terlihat.
          </p>
        </div>
      </div>
    </div>
  );
}
