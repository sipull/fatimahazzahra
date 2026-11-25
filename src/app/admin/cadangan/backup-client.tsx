"use client";

import { useState } from "react";

export default function BackupClient() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function doExport() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/backup/export");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengekspor.");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `eportofolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg(`Berhasil diekspor: ${data.entries?.length ?? 0} konten & ${Object.keys(data.settings ?? {}).length} pengaturan.`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Gagal.");
    } finally {
      setBusy(false);
    }
  }

  async function doImport(file: File | null) {
    if (!file) return;
    if (!confirm("Impor akan menimpa/menggabungkan data berdasarkan ID. Lanjutkan?")) return;
    setBusy(true);
    setMsg("");
    try {
      const json = JSON.parse(await file.text());
      const res = await fetch("/api/backup/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(json) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengimpor.");
      setMsg(`Berhasil dipulihkan: ${data.restoredEntries} konten, ${data.restoredSettings} pengaturan.`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Gagal.");
    } finally {
      setBusy(false);
    }
  }

  const btn = "w-full px-4 py-3.5 text-[12px] font-bold uppercase tracking-widest";

  return (
    <div className="grid gap-4">
      {msg && (
        <p className="border border-cocoa-300 bg-sand-100 px-4 py-3 text-sm font-semibold text-cocoa-700" role="status">
          {msg}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border border-cocoa-200 bg-paper p-6">
          <p className="label-caps text-rose-500">Langkah 1</p>
          <h2 className="font-serif-display mt-2 text-xl font-semibold text-cocoa-700">Ekspor cadangan</h2>
          <p className="mt-2 text-sm leading-relaxed text-cocoa-500">Unduh berkas JSON berisi seluruh entri dan pengaturan website.</p>
          <button onClick={doExport} disabled={busy} className={`${btn} mt-5 bg-cocoa-700 text-ivory hover:bg-rose-600 disabled:opacity-60`}>
            {busy ? "Memproses…" : "Unduh cadangan JSON"}
          </button>
        </div>
        <div className="border border-cocoa-200 bg-paper p-6">
          <p className="label-caps text-rose-500">Langkah 2</p>
          <h2 className="font-serif-display mt-2 text-xl font-semibold text-cocoa-700">Impor / pulihkan</h2>
          <p className="mt-2 text-sm leading-relaxed text-cocoa-500">Pilih berkas JSON hasil ekspor sebelumnya untuk memulihkan data.</p>
          <label className={`mt-5 block cursor-pointer border border-cocoa-300 bg-paper text-center text-cocoa-600 hover:text-rose-600 ${btn}`}>
            Pilih berkas JSON
            <input type="file" accept="application/json,.json" className="hidden" onChange={(e) => doImport(e.target.files?.[0] ?? null)} />
          </label>
          <p className="mt-3 border border-dashed border-cocoa-300 bg-sand-100 px-3 py-2 text-xs leading-relaxed text-cocoa-500">
            Berkas dokumen (PDF/gambar) tidak ikut dalam JSON. Simpan folder <code>public/uploads</code> secara terpisah.
          </p>
        </div>
      </div>
      <div className="border border-cocoa-200 bg-paper p-6 text-sm leading-relaxed text-cocoa-600">
        <p className="label-caps text-cocoa-400">Rutinitas pencadangan</p>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5">
          <li>Ekspor JSON secara berkala melalui tombol di atas.</li>
          <li>Salin folder <code>public/uploads/</code> ke penyimpanan yang aman.</li>
          <li>Untuk memulihkan: impor JSON, lalu kembalikan folder uploads.</li>
        </ol>
      </div>
    </div>
  );
}
