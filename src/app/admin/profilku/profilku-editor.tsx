"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor, { RICH_HELP } from "@/components/admin/RichTextEditor";
import SaveBar, { useUnsavedGuard } from "@/components/admin/SaveBar";

const inputCls = "w-full border border-cocoa-300 bg-paper px-4 py-3 text-sm text-cocoa-700 placeholder:text-cocoa-300 focus:border-terra-400";

interface Group {
  id: string;
  label: string;
  icon: string;
  desc: string;
  fields: Array<{ key: string; label: string; help?: string; rows?: number }>;
}

const GROUPS: Group[] = [
  {
    id: "tentang",
    label: "Tentang Saya",
    icon: "📝",
    desc: "Teks perkenalan panjang pada Beranda dan halaman Identitas Diri.",
    fields: [
      { key: "about_text", label: "Teks Tentang Saya", help: "Pisahkan paragraf dengan baris kosong.", rows: 12 },
      { key: "short_bio", label: "Deskripsi singkat (halaman Identitas)", rows: 5 },
      { key: "extra_info", label: "Informasi tambahan", rows: 4 },
      { key: "about_note", label: "Catatan tangan kecil", help: "Contoh: “ditulis dari hati, untuk pendidikan Indonesia”.", rows: 2 },
    ],
  },
  {
    id: "visi",
    label: "Visi, Filosofi & Nilai",
    icon: "💡",
    desc: "Tampil pada halaman Profilku → Visi & Filosofi.",
    fields: [
      { key: "cv_visi", label: "Visi Saya sebagai Guru", rows: 10 },
      { key: "cv_filosofi", label: "Filosofi Mengajar", rows: 10 },
      { key: "cv_nilai", label: "Nilai-Nilai yang Menjadi Landasan", help: "Gunakan tombol “Butir+Judul” untuk setiap nilai.", rows: 14 },
      { key: "cv_prinsip", label: "Prinsip dalam Membangun Relasi", rows: 10 },
      { key: "cv_komitmen", label: "Komitmen dalam Pembelajaran", help: "Gunakan tombol “1. Nomor” untuk daftar komitmen.", rows: 12 },
    ],
  },
  {
    id: "pendidikan",
    label: "Riwayat Pendidikan",
    icon: "🎓",
    desc: "Ringkasan pendidikan formal pada CV & halaman Profilku.",
    fields: [
      { key: "cv_summary", label: "Ringkasan profil", rows: 8 },
      { key: "cv_education", label: "Riwayat pendidikan formal", help: "Gunakan “**Institusi** — Tahun” lalu baris keterangan.", rows: 10 },
      { key: "cv_achievements", label: "Prestasi / penghargaan", rows: 6 },
    ],
  },
  {
    id: "pengalaman",
    label: "Pengalaman Kerja & Organisasi",
    icon: "💼",
    desc: "Pengalaman kerja, pendidikan, organisasi, dan kegiatan sosial.",
    fields: [
      { key: "cv_experience", label: "Pengalaman kerja & pendidikan", help: "Gunakan “**Jabatan — Instansi** — Tahun” lalu baris poin.", rows: 14 },
      { key: "cv_extra", label: "Pengalaman organisasi & kegiatan sosial", rows: 14 },
    ],
  },
  {
    id: "kompetensi",
    label: "Kompetensi & Pelatihan",
    icon: "🌟",
    desc: "Kompetensi utama, keterampilan digital, pelatihan, dan sertifikasi.",
    fields: [
      { key: "cv_skills", label: "Kompetensi utama & keterampilan digital", help: "Gunakan tombol “• Poin” untuk setiap kompetensi.", rows: 10 },
      { key: "cv_training", label: "Pelatihan dan sertifikasi", help: "Gunakan “**Tahun** — Nama pelatihan, Penyelenggara.”", rows: 10 },
    ],
  },
];

export default function ProfilkuEditor({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>(() => ({ ...initial }));
  const [tab, setTab] = useState("tentang");
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
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan.");
      setStatus("Semua perubahan tersimpan permanen & sudah tampil di website publik.");
      setSavedAt(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  const active = GROUPS.find((g) => g.id === tab)!;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => {
              if (dirty && !confirm("Pindah bagian? Perubahan yang belum disimpan tetap ada di formulir ini.")) return;
              setTab(g.id);
            }}
            aria-current={tab === g.id ? "true" : undefined}
            className={`flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition ${
              tab === g.id ? "bg-cocoa-700 text-cream" : "border border-cocoa-300 bg-paper text-cocoa-500 hover:text-terra-600"
            }`}
          >
            <span aria-hidden>{g.icon}</span> {g.label}
          </button>
        ))}
      </div>

      <div className="mt-4 border border-kraft-300 bg-paper p-5 sm:p-6">
        <h2 className="font-serif-display text-xl font-semibold text-cocoa-700">
          <span aria-hidden>{active.icon}</span> {active.label}
        </h2>
        <p className="mt-1 text-sm text-cocoa-500">{active.desc}</p>
        <p className="mt-3 border border-dashed border-kraft-300 bg-kraft-100 px-3 py-2 text-xs leading-relaxed text-cocoa-500">{RICH_HELP}</p>

        <div className="mt-6 grid gap-7">
          {active.fields.map((f) => (
            <RichTextEditor
              key={f.key}
              label={f.label}
              value={form[f.key] ?? ""}
              onChange={(v) => set(f.key, v)}
              rows={f.rows ?? 8}
              help={f.help}
            />
          ))}
        </div>

        <SaveBar
          dirty={dirty}
          saving={saving}
          status={status}
          error={error}
          savedAt={savedAt}
          onSave={save}
          onCancel={cancel}
          previewHref="/profilku"
          labels={{ save: "Simpan Perubahan" }}
        />
      </div>
    </div>
  );
}
