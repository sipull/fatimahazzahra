"use client";

import { useState } from "react";
import { SETTING_DEFS, SETTING_GROUPS } from "@/lib/types";

async function uploadOne(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Gagal mengunggah.");
  return data.file.apiUrl as string;
}

const inputCls = "w-full border border-cocoa-300 bg-paper px-4 py-3 text-sm text-cocoa-700 placeholder:text-cocoa-300";
const labelCls = "block text-[13px] font-bold text-cocoa-700";

export default function SettingsClient({ initial }: { initial: Record<string, string> }) {
  const [form, setForm] = useState<Record<string, string>>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState<string>("hero");

  function set(key: string, v: string) {
    setForm((p) => ({ ...p, [key]: v }));
  }

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: form }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan.");
      setMsg("Pengaturan tersimpan dan sudah tampil pada halaman publik.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleImage(key: string, file: File | null) {
    if (!file) return;
    setUploading(key);
    try {
      set(key, await uploadOne(file));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Gagal mengunggah.");
    } finally {
      setUploading(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {SETTING_GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => setTab(g.id)}
            className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition ${
              tab === g.id ? "bg-cocoa-700 text-ivory" : "border border-cocoa-300 text-cocoa-500 hover:text-rose-600"
            }`}
          >
            <span className="mr-1.5" aria-hidden>{g.icon}</span>
            {g.label}
          </button>
        ))}
      </div>

      {msg && (
        <p className="mt-4 border border-cocoa-300 bg-sand-100 px-4 py-3 text-sm font-semibold text-cocoa-700" role="status">
          {msg}
        </p>
      )}

      <div className="mt-4 grid gap-6 border border-cocoa-200 bg-paper p-6">
        {SETTING_DEFS.filter((d) => d.group === tab).map((d) => {
          const v = form[d.key] ?? "";
          if (d.type === "textarea") {
            return (
              <label key={d.key} className="grid gap-1.5">
                <span className={labelCls}>{d.label}</span>
                <textarea value={v} onChange={(e) => set(d.key, e.target.value)} rows={4} placeholder={d.placeholder} className={`${inputCls} leading-relaxed`} />
                {d.help && <span className="text-xs text-cocoa-400">{d.help}</span>}
              </label>
            );
          }
          if (d.type === "checkbox") {
            return (
              <label key={d.key} className="flex cursor-pointer items-center gap-3 border border-dashed border-cocoa-300 bg-sand-100/70 px-4 py-3">
                <input type="checkbox" checked={v === "true"} onChange={(e) => set(d.key, e.target.checked ? "true" : "false")} className="h-5 w-5 accent-terra-500" />
                <span className={labelCls}>{d.label}</span>
              </label>
            );
          }
          if (d.type === "position") {
            const cur = (v || "50% 50%").split(/\s+/);
            const curX = cur[0] ?? "50%";
            const curY = cur[1] ?? "50%";
            const X = ["0%", "25%", "50%", "75%", "100%"];
            const Y = ["0%", "25%", "50%", "75%", "100%"];
            return (
              <div key={d.key} className="grid gap-2 border border-dashed border-cocoa-300 bg-sand-100/60 p-4">
                <p className={labelCls}>{d.label}</p>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="grid grid-cols-5 gap-1" role="group" aria-label={d.label}>
                    {Y.map((y) =>
                      X.map((x) => {
                        const active = x === curX && y === curY;
                        return (
                          <button
                            key={`${x}-${y}`}
                            type="button"
                            onClick={() => set(d.key, `${x} ${y}`)}
                            aria-label={`Focal point ${x} ${y}`}
                            aria-pressed={active}
                            className={`h-7 w-7 border text-[9px] ${active ? "border-terra-500 bg-terra-500 text-cream" : "border-cocoa-200 bg-paper text-cocoa-300"}`}
                          >
                            {active ? "•" : ""}
                          </button>
                        );
                      })
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-cocoa-400">
                    Klik titik pada kisi untuk memilih bagian foto yang menjadi fokus saat dipotong. Aktif: <b>{curX} {curY}</b>
                  </p>
                </div>
                <input value={v} onChange={(e) => set(d.key, e.target.value)} placeholder="50% 30%" className="border border-cocoa-200 px-3 py-2 text-xs" />
                {d.help && <span className="text-xs text-cocoa-400">{d.help}</span>}
              </div>
            );
          }
          if (d.type === "image") {
            return (
              <div key={d.key} className="grid gap-2 border border-dashed border-cocoa-300 bg-sand-100/60 p-4">
                <p className={labelCls}>{d.label}</p>
                {v ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v} alt={d.label} className="h-44 w-full border border-cocoa-200 object-cover" />
                ) : (
                  <div className="grid h-24 place-items-center border border-dashed border-cocoa-300 bg-paper text-xs text-cocoa-300">belum ada gambar</div>
                )}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label className="flex-1 cursor-pointer bg-cocoa-700 px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-widest text-ivory hover:bg-rose-600">
                    {uploading === d.key ? "Mengunggah…" : "Unggah gambar"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(d.key, e.target.files?.[0] ?? null)} />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const u = prompt("Tempel URL gambar", v);
                      if (u !== null) set(d.key, u);
                    }}
                    className="flex-1 border border-cocoa-300 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-cocoa-600"
                  >
                    Tempel URL
                  </button>
                  {v && (
                    <button type="button" onClick={() => set(d.key, "")} className="border border-rose-300 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-rose-600">
                      Hapus
                    </button>
                  )}
                </div>
                <input value={v} onChange={(e) => set(d.key, e.target.value)} placeholder="/api/media/… atau https://…" className="border border-cocoa-200 px-3 py-2 text-xs" />
              </div>
            );
          }
          return (
            <label key={d.key} className="grid gap-1.5">
              <span className={labelCls}>{d.label}</span>
              {d.key === "cv_file" ? (
                <span className="grid gap-2">
                  <input value={v} onChange={(e) => set(d.key, e.target.value)} placeholder={d.placeholder} className={inputCls} />
                  <label className="w-fit cursor-pointer bg-cocoa-700 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-ivory hover:bg-rose-600">
                    {uploading === d.key ? "Mengunggah…" : "Unggah PDF CV"}
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        setUploading(d.key);
                        try {
                          set(d.key, await uploadOne(f));
                        } catch (err) {
                          setMsg(err instanceof Error ? err.message : "Gagal mengunggah.");
                        } finally {
                          setUploading(null);
                        }
                      }}
                    />
                  </label>
                  {v && <a href={v} target="_blank" rel="noreferrer" className="text-xs font-bold text-rose-600 underline">Lihat berkas →</a>}
                </span>
              ) : (
                <input value={v} onChange={(e) => set(d.key, e.target.value)} placeholder={d.placeholder} className={inputCls} />
              )}
              {d.help && <span className="text-xs text-cocoa-400">{d.help}</span>}
            </label>
          );
        })}
        <button onClick={save} disabled={saving} className="bg-cocoa-700 px-4 py-4 text-[12px] font-bold uppercase tracking-widest text-ivory hover:bg-rose-600 disabled:opacity-60">
          {saving ? "Menyimpan…" : "Simpan pengaturan"}
        </button>
      </div>
    </div>
  );
}
