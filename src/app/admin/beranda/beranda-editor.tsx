"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor, { RICH_HELP } from "@/components/admin/RichTextEditor";
import PhotoField, { type PhotoValue } from "@/components/admin/PhotoField";
import SaveBar, { useUnsavedGuard } from "@/components/admin/SaveBar";
import { SETTING_DEFS } from "@/lib/types";

const inputCls = "w-full border border-cocoa-300 bg-paper px-4 py-3 text-sm text-cocoa-700 placeholder:text-cocoa-300 focus:border-terra-400";
const labelCls = "block text-[13px] font-bold text-cocoa-700";

const TABS = [
  { id: "hero", label: "Hero & Identitas", icon: "🏛️", desc: "Sapaan, nama besar, subjudul, kutipan, foto, dan identitas singkat." },
  { id: "tentang", label: "Tentang Saya", icon: "📝", desc: "Teks perkenalan panjang pada bagian Tentang Saya." },
  { id: "pendidikan", label: "Riwayat & Linimasa Pendidikan", icon: "🎓", desc: "Ringkasan pada CV: pendidikan formal dan linimasa." },
  { id: "pengalaman", label: "Pengalaman Kerja & Organisasi", icon: "💼", desc: "Pengalaman kerja, pendidikan, organisasi, dan kegiatan sosial." },
  { id: "kompetensi", label: "Kompetensi & Pelatihan", icon: "🌟", desc: "Kompetensi utama, keterampilan digital, pelatihan, dan sertifikasi." },
  { id: "visi", label: "Visi, Filosofi & Nilai", icon: "💡", desc: "Visi guru, filosofi mengajar, nilai landasan, prinsip relasi, komitmen." },
  { id: "lain", label: "Lainnya & Situs", icon: "⚙️", desc: "Pengaturan teks footer, motto, dan informasi tambahan." },
];

/** peta kunci → tab */
const TAB_OF: Record<string, string> = {};
for (const d of SETTING_DEFS) {
  if (["hero", "hero_kicker", "hero_title", "hero_subtitle", "hero_quote", "hero_description", "hero_image", "hero_image_pos", "university", "owner_name", "owner_title", "full_name", "address", "show_address", "study_program"].includes(d.key)) {
    TAB_OF[d.key] = "hero";
  } else if (["about_text", "about_note", "short_bio", "extra_info", "birth_info", "show_birth", "email", "show_email"].includes(d.key)) {
    TAB_OF[d.key] = d.key === "about_text" || d.key === "about_note" ? "tentang" : "hero";
  } else if (["cv_summary", "cv_education", "cv_achievements"].includes(d.key)) {
    TAB_OF[d.key] = "pendidikan";
  } else if (["cv_experience", "cv_extra"].includes(d.key)) {
    TAB_OF[d.key] = "pengalaman";
  } else if (["cv_skills", "cv_training"].includes(d.key)) {
    TAB_OF[d.key] = "kompetensi";
  } else if (["cv_visi", "cv_filosofi", "cv_nilai", "cv_prinsip", "cv_komitmen"].includes(d.key)) {
    TAB_OF[d.key] = "visi";
  } else {
    TAB_OF[d.key] = "lain";
  }
}

/** definisi bidang tambahan yang dikelompokkan manual */
const EXTRA_FIELDS: Array<{ key: string; tab: string; label: string; type: "textarea" | "richtext" | "text"; help?: string }> = [
  { key: "cv_visi", tab: "visi", label: "Visi Saya sebagai Guru", type: "richtext", help: "Tampil pada halaman Profilku → Visi & Filosofi." },
  { key: "cv_filosofi", tab: "visi", label: "Filosofi Mengajar", type: "richtext", help: "Tampil pada halaman Profilku → Visi & Filosofi." },
  { key: "cv_nilai", tab: "visi", label: "Nilai-Nilai yang Menjadi Landasan", type: "richtext", help: "Gunakan “**1. Judul nilai**” lalu baris uraian." },
  { key: "cv_prinsip", tab: "visi", label: "Prinsip dalam Membangun Relasi", type: "richtext" },
  { key: "cv_komitmen", tab: "visi", label: "Komitmen dalam Pembelajaran", type: "richtext" },
];

export default function BerandaEditor({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>(() => {
    const base: Record<string, string> = { ...initial };
    for (const e of EXTRA_FIELDS) if (!(e.key in base)) base[e.key] = "";
    return base;
  });
  const [tab, setTab] = useState("hero");
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

  async function save(overrides?: Record<string, string>) {
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const payload = { ...form, ...(overrides ?? {}) };
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan pengaturan.");
      setForm(payload);
      setStatus("Perubahan tersimpan permanen & sudah tampil di website publik.");
      setSavedAt(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  const tabFields = SETTING_DEFS.filter((d) => TAB_OF[d.key] === tab);
  const tabExtras = EXTRA_FIELDS.filter((e) => e.tab === tab);

  return (
    <div>
      {/* navigasi bagian */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const fieldsIn = [...tabFields, ...tabExtras];
          void fieldsIn;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                if (dirty && !confirm("Pindah bagian? Perubahan yang belum disimpan tetap ada di formulir ini.")) return;
                setTab(t.id);
              }}
              aria-current={active ? "true" : undefined}
              className={`flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition ${
                active ? "bg-cocoa-700 text-cream" : "border border-cocoa-300 bg-paper text-cocoa-500 hover:text-terra-600"
              }`}
            >
              <span aria-hidden>{t.icon}</span> {t.label}
            </button>
          );
        })}
      </div>

      <div className="border border-kraft-300 bg-paper p-5 sm:p-6">
        {TABS.filter((t) => t.id === tab).map((t) => (
          <div key={t.id}>
            <h2 className="font-serif-display text-xl font-semibold text-cocoa-700">{t.label}</h2>
            <p className="mt-1 text-sm text-cocoa-500">{t.desc}</p>
            <p className="mt-3 border border-dashed border-kraft-300 bg-kraft-100 px-3 py-2 text-xs leading-relaxed text-cocoa-500">{RICH_HELP}</p>
          </div>
        ))}

        <div className="mt-6 grid gap-6">
          {/* Bidang foto khusus */}
          {tab === "hero" && (
            <>
              <PhotoField
                label="Foto profil utama (hero)"
                url={form.hero_image ?? ""}
                pos={form.hero_image_pos ?? "50% 30%"}
                zoom={form.hero_image_zoom ?? "1"}
                ratio="4:5"
                help="Tampil di Beranda (kiri) dan dipakai juga di halaman Identitas bila foto profil belum diatur."
                onChange={(v: PhotoValue) =>
                  setForm((p) => ({ ...p, hero_image: v.url, hero_image_pos: v.pos ?? p.hero_image_pos, hero_image_zoom: v.zoom ?? p.hero_image_zoom ?? "1" }))
                }
                onDelete={() => setForm((p) => ({ ...p, hero_image: "" }))}
                onError={setError}
              />
              <PhotoField
                label="Foto profil halaman Identitas"
                url={form.profile_photo ?? ""}
                pos={form.profile_photo_pos ?? "50% 30%"}
                zoom={form.profile_photo_zoom ?? "1"}
                ratio="4:5"
                help="Kosongkan bila ingin memakai foto hero."
                onChange={(v: PhotoValue) =>
                  setForm((p) => ({ ...p, profile_photo: v.url, profile_photo_pos: v.pos ?? p.profile_photo_pos, profile_photo_zoom: v.zoom ?? p.profile_photo_zoom ?? "1" }))
                }
                onDelete={() => setForm((p) => ({ ...p, profile_photo: "" }))}
                onError={setError}
              />
              <PhotoField
                label="Foto wisuda / foto formal kedua"
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
            </>
          )}

          {/* Bidang teks standar */}
          {tabFields.map((d) => {
            const v = form[d.key] ?? "";
            if (d.type === "checkbox") {
              return (
                <label key={d.key} className="flex cursor-pointer items-center gap-3 border border-dashed border-kraft-300 bg-sand-100/70 px-4 py-3">
                  <input type="checkbox" checked={v === "true"} onChange={(e) => set(d.key, e.target.checked ? "true" : "false")} className="h-5 w-5 accent-terra-500" />
                  <span className={labelCls}>{d.label}</span>
                </label>
              );
            }
            if (d.type === "textarea") {
              return (
                <RichTextEditor
                  key={d.key}
                  label={d.label}
                  value={v}
                  onChange={(nv) => set(d.key, nv)}
                  rows={d.key === "about_text" || d.key.startsWith("cv_") ? 10 : 4}
                  help={d.help}
                  placeholder={d.placeholder}
                />
              );
            }
            if (d.type === "image") return null;
            return (
              <label key={d.key} className="grid gap-1.5">
                <span className={labelCls}>{d.label}</span>
                <input value={v} onChange={(e) => set(d.key, e.target.value)} placeholder={d.placeholder} className={inputCls} />
                {d.help && <span className="text-xs text-cocoa-400">{d.help}</span>}
              </label>
            );
          })}

          {/* Bidang tambahan (editor teks kaya) */}
          {tabExtras.map((e) => (
            <RichTextEditor
              key={e.key}
              label={e.label}
              value={form[e.key] ?? ""}
              onChange={(nv) => set(e.key, nv)}
              rows={10}
              required={false}
              help={e.help}
            />
          ))}

          {tab === "tentang" && (
            <PhotoField
              label="Foto pendukung bagian Tentang Saya"
              url={form.photo_tentang ?? ""}
              pos={form.photo_tentang_pos ?? "50% 30%"}
              zoom={form.photo_tentang_zoom ?? "1"}
              ratio="1:1"
              help="Contoh: foto kegiatan, foto wisuda, atau dokumentasi pembelajaran."
              onChange={(v: PhotoValue) =>
                setForm((p) => ({ ...p, photo_tentang: v.url, photo_tentang_pos: v.pos ?? p.photo_tentang_pos, photo_tentang_zoom: v.zoom ?? p.photo_tentang_zoom ?? "1" }))
              }
              onDelete={() => setForm((p) => ({ ...p, photo_tentang: "" }))}
              onError={setError}
            />
          )}

          {tab === "hero" && (
            <div className="grid gap-6 border-t border-dashed border-kraft-300 pt-6">
              <p className="label-caps text-cocoa-400">Foto kegiatan PPL & dokumentasi karya</p>
              <PhotoField
                label="Foto kegiatan PPL"
                url={form.photo_ppl ?? ""}
                pos={form.photo_ppl_pos ?? "50% 40%"}
                zoom={form.photo_ppl_zoom ?? "1"}
                ratio="16:9"
                help="Dokumentasi kegiatan di sekolah tempat PPL."
                onChange={(v: PhotoValue) =>
                  setForm((p) => ({ ...p, photo_ppl: v.url, photo_ppl_pos: v.pos ?? p.photo_ppl_pos, photo_ppl_zoom: v.zoom ?? p.photo_ppl_zoom ?? "1" }))
                }
                onDelete={() => setForm((p) => ({ ...p, photo_ppl: "" }))}
                onError={setError}
              />
              <PhotoField
                label="Dokumentasi karya pendidikan"
                url={form.photo_karya ?? ""}
                pos={form.photo_karya_pos ?? "50% 40%"}
                zoom={form.photo_karya_zoom ?? "1"}
                ratio="16:9"
                help="Contoh: foto media pembelajaran, LKPD, atau karya murid."
                onChange={(v: PhotoValue) =>
                  setForm((p) => ({ ...p, photo_karya: v.url, photo_karya_pos: v.pos ?? p.photo_karya_pos, photo_karya_zoom: v.zoom ?? p.photo_karya_zoom ?? "1" }))
                }
                onDelete={() => setForm((p) => ({ ...p, photo_karya: "" }))}
                onError={setError}
              />
            </div>
          )}
        </div>

        <SaveBar
          dirty={dirty}
          saving={saving}
          status={status}
          error={error}
          savedAt={savedAt}
          onSave={() => save()}
          onCancel={cancel}
          previewHref="/"
        />
      </div>
    </div>
  );
}
