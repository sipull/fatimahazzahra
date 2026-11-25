"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PhotoField, { type PhotoValue } from "@/components/admin/PhotoField";
import SaveBar, { useUnsavedGuard } from "@/components/admin/SaveBar";
import RichTextEditor from "@/components/admin/RichTextEditor";

const inputCls = "w-full border border-cocoa-300 bg-paper px-4 py-3 text-sm text-cocoa-700 placeholder:text-cocoa-300 focus:border-terra-400";
const labelCls = "block text-[13px] font-bold text-cocoa-700";

type FieldDef = { key: string; label: string; placeholder?: string; help?: string; required?: boolean };

const FIELDS: FieldDef[] = [
  { key: "full_name", label: "Nama lengkap", placeholder: "Fatimah Azzahra’, S.Pd.", required: true },
  { key: "owner_title", label: "Gelar / peran singkat", placeholder: "Calon Guru, Pembelajar Sepanjang Hayat" },
  { key: "study_program", label: "Program studi", placeholder: "Pendidikan Profesi Guru, Pendidikan Guru Sekolah Dasar", required: true },
  { key: "university", label: "Universitas", placeholder: "Universitas Trunodjoyo Madura", required: true },
  { key: "address", label: "Alamat / domisili", placeholder: "Dusun Mireng, RT/RW 004/005, Desa Sumberagung, Kecamatan Megaluh, Kabupaten Jombang" },
  { key: "birth_info", label: "Tempat & tanggal lahir (opsional)", placeholder: "Contoh: Jombang, 1 Januari 2000" },
  { key: "email", label: "Email / kontak (opsional)", placeholder: "nama@email.com" },
];

const CHECKS: Array<{ key: string; label: string }> = [
  { key: "show_address", label: "Tampilkan alamat di halaman publik" },
  { key: "show_birth", label: "Tampilkan tempat & tanggal lahir di publik" },
  { key: "show_email", label: "Tampilkan email di publik" },
];

export default function IdentitasEditor({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>(() => ({ ...initial }));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const baseline = useMemo(() => JSON.stringify(form), []); // eslint-disable-line react-hooks/exhaustive-deps
  const dirty = JSON.stringify(form) !== baseline;
  useUnsavedGuard(dirty);

  function set(key: string, v: string) {
    setForm((p) => ({ ...p, [key]: v }));
    setStatus("");
    setError("");
  }

  function cancel() {
    if (!confirm("Batalkan semua perubahan yang belum disimpan?")) return;
    setForm(JSON.parse(baseline));
    setStatus("Perubahan dibatalkan.");
    router.refresh();
  }

  async function save() {
    setSaving(true);
    setError("");
    setStatus("");
    try {
      // validasi klien (server memvalidasi ulang)
      if (!form.full_name?.trim()) throw new Error("Nama lengkap wajib diisi.");
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan identitas.");
      setStatus("Identitas tersimpan permanen & otomatis tampil di Beranda serta Profilku.");
      setSavedAt(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="border border-kraft-300 bg-paper p-5 sm:p-6">
        <h2 className="font-serif-display text-xl font-semibold text-cocoa-700">Biodata</h2>
        <p className="mt-1 text-sm text-cocoa-500">Bidang bertanda * wajib diisi.</p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <label key={f.key} className={`grid gap-1.5 ${f.key === "address" || f.key === "full_name" ? "sm:col-span-2" : ""}`}>
              <span className={labelCls}>
                {f.label} {f.required && <span className="text-terra-500">*</span>}
              </span>
              <input
                value={form[f.key] ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className={inputCls}
                aria-label={f.label}
              />
            </label>
          ))}
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <RichTextEditor
            label="Deskripsi singkat tentang diri"
            value={form.short_bio ?? ""}
            onChange={(v) => set("short_bio", v)}
            rows={5}
            help="Tampil pada halaman Identitas Diri di bawah nama."
          />
          <RichTextEditor
            label="Informasi tambahan"
            value={form.extra_info ?? ""}
            onChange={(v) => set("extra_info", v)}
            rows={5}
            help="Opsional. Ditampilkan setelah bagian Tentang Saya."
          />
        </div>
      </div>

      <div className="mt-5 border border-kraft-300 bg-paper p-5 sm:p-6">
        <h2 className="font-serif-display text-xl font-semibold text-cocoa-700">Foto profil</h2>
        <p className="mt-1 text-sm text-cocoa-500">
          Foto yang disimpan di bawah ini otomatis dipakai pada Beranda (hero) dan halaman Identitas Diri.
        </p>
        <div className="mt-6 grid gap-6">
          <PhotoField
            label="Foto profil utama"
            url={form.profile_photo ?? ""}
            pos={form.profile_photo_pos ?? "50% 30%"}
            zoom={form.profile_photo_zoom ?? "1"}
            ratio="4:5"
            help="Foto ini dipakai pada halaman Identitas Diri. Bila kosong, situs memakai foto hero."
            onChange={(v: PhotoValue) =>
              setForm((p) => ({ ...p, profile_photo: v.url, profile_photo_pos: v.pos ?? p.profile_photo_pos, profile_photo_zoom: v.zoom ?? p.profile_photo_zoom ?? "1" }))
            }
            onDelete={() => setForm((p) => ({ ...p, profile_photo: "" }))}
            onError={setError}
          />
          <PhotoField
            label="Foto hero (Beranda)"
            url={form.hero_image ?? ""}
            pos={form.hero_image_pos ?? "50% 30%"}
            zoom={form.hero_image_zoom ?? "1"}
            ratio="4:5"
            help="Foto besar pada bagian hero Beranda."
            onChange={(v: PhotoValue) =>
              setForm((p) => ({ ...p, hero_image: v.url, hero_image_pos: v.pos ?? p.hero_image_pos, hero_image_zoom: v.zoom ?? p.hero_image_zoom ?? "1" }))
            }
            onDelete={() => setForm((p) => ({ ...p, hero_image: "" }))}
            onError={setError}
          />
          <PhotoField
            label="Foto wisuda / formal"
            url={form.photo_wisuda ?? ""}
            pos={form.photo_wisuda_pos ?? "50% 30%"}
            zoom={form.photo_wisuda_zoom ?? "1"}
            ratio="3:4"
            help="Dapat dipakai pada bagian Tentang Saya atau CV."
            onChange={(v: PhotoValue) =>
              setForm((p) => ({ ...p, photo_wisuda: v.url, photo_wisuda_pos: v.pos ?? p.photo_wisuda_pos, photo_wisuda_zoom: v.zoom ?? p.photo_wisuda_zoom ?? "1" }))
            }
            onDelete={() => setForm((p) => ({ ...p, photo_wisuda: "" }))}
            onError={setError}
          />
        </div>
      </div>

      <div className="mt-5 border border-kraft-300 bg-paper p-5 sm:p-6">
        <h2 className="font-serif-display text-xl font-semibold text-cocoa-700">Privasi</h2>
        <p className="mt-1 text-sm text-cocoa-500">Informasi pribadi yang tidak dicentang tidak akan tampil di halaman publik.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {CHECKS.map((c) => (
            <label key={c.key} className="flex cursor-pointer items-center gap-3 border border-dashed border-kraft-300 bg-sand-100/70 px-4 py-3">
              <input type="checkbox" checked={(form[c.key] ?? "false") === "true"} onChange={(e) => set(c.key, e.target.checked ? "true" : "false")} className="h-5 w-5 accent-terra-500" />
              <span className="text-[13px] font-bold text-cocoa-700">{c.label}</span>
            </label>
          ))}
        </div>
      </div>

      <SaveBar
        dirty={dirty}
        saving={saving}
        status={status}
        error={error}
        savedAt={savedAt}
        onSave={save}
        onCancel={cancel}
        previewHref="/profilku/identitas"
        labels={{ save: "Simpan Identitas" }}
      />
    </div>
  );
}
