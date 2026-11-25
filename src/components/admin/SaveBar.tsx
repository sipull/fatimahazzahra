"use client";

import { useEffect } from "react";

/* ============================================================
   Bilah aksi penyimpanan yang dipakai semua editor admin.
   - Indikator perubahan belum tersimpan
   - Simpan / Simpan & Publikasikan
   - Pratinjau (tab baru, TIDAK memublikasikan)
   - Batal (kembalikan nilai awal)
   - Konfirmasi sebelum menutup tab bila ada perubahan
   ============================================================ */

export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}

export default function SaveBar({
  dirty,
  saving,
  status,
  error,
  onSave,
  onPublish,
  onCancel,
  previewHref,
  previewDisabled,
  savedAt,
  labels = {},
}: {
  dirty: boolean;
  saving: boolean;
  status: string;
  error: string;
  onSave: () => void;
  onPublish?: () => void;
  onCancel: () => void;
  previewHref?: string;
  previewDisabled?: boolean;
  savedAt?: string | null;
  labels?: { save?: string; cancel?: string };
}) {
  const btn = "px-5 py-3.5 text-[12px] font-bold uppercase tracking-widest";
  return (
    <div className="sticky bottom-0 z-20 mt-6 border-t border-kraft-300 bg-kraft-100/95 px-1 py-4 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[190px] flex-1" aria-live="polite">
          {saving ? (
            <p className="label-caps text-cocoa-600">⏳ Menyimpan…</p>
          ) : error ? (
            <p className="text-[13px] font-bold text-terra-600" role="alert">⚠ {error}</p>
          ) : status ? (
            <p className="text-[13px] font-bold text-sage-600" role="status">✓ {status}</p>
          ) : dirty ? (
            <p className="text-[13px] font-bold text-terra-600">● Ada perubahan yang belum disimpan</p>
          ) : (
            <p className="label-caps text-cocoa-400">Semua perubahan tersimpan</p>
          )}
          {savedAt && !dirty && !error && <p className="label-caps mt-0.5 text-cocoa-400">Terakhir disimpan {savedAt}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          {previewHref && (
            <a
              href={previewHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={previewDisabled}
              className={`${btn} border border-cocoa-300 bg-paper text-cocoa-600 hover:border-terra-400 hover:text-terra-600 ${
                previewDisabled ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Pratinjau ↗
            </a>
          )}
          <button onClick={onCancel} disabled={saving || !dirty} className={`${btn} border border-cocoa-300 bg-paper text-cocoa-600 disabled:opacity-40`}>
            {labels.cancel ?? "Batal"}
          </button>
          {onPublish && (
            <button onClick={onPublish} disabled={saving} className={`${btn} bg-sage-500 text-cream hover:bg-sage-600 disabled:opacity-60`}>
              Simpan & Publikasikan
            </button>
          )}
          <button onClick={onSave} disabled={saving || !dirty} className={`${btn} bg-cocoa-700 text-cream hover:bg-terra-600 disabled:opacity-40`}>
            {saving ? "Menyimpan…" : labels.save ?? "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}
