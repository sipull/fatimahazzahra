import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { countEntries, listEntries, getAllSettings } from "@/lib/data";
import { CONTENT_TYPES } from "@/lib/types";
import AdminShell from "@/components/admin/Shell";
import { DoodleArrow, DoodleGradCap, DoodleStar } from "@/components/site/Doodles";

export const dynamic = "force-dynamic";

/** Lima menu utama sesuai struktur website */
const MAIN_SECTIONS = [
  { key: "identitas", label: "Identitas Diri", icon: "👩‍🏫", href: "/admin/identitas", desc: "Nama, alamat, program studi, bidang studi, universitas, dan foto profil.", types: [] as string[] },
  {
    key: "refleksi1",
    label: "Refleksi Semester 1",
    icon: "📘",
    href: "/admin/konten/refleksi-semester-1",
    desc: "Refleksi mata kuliah PPG pada semester 1.",
    types: ["refleksi-semester-1"],
  },
  {
    key: "refleksi2",
    label: "Refleksi Semester 2",
    icon: "📗",
    href: "/admin/konten/refleksi-semester-2",
    desc: "Refleksi mata kuliah PPG pada semester 2.",
    types: ["refleksi-semester-2"],
  },
  {
    key: "ppl",
    label: "Refleksi Selama PPL",
    icon: "🪞",
    href: "/admin/konten/refleksi-ppl",
    desc: "Refleksi praktik pengalaman lapangan mandiri (per siklus).",
    types: ["refleksi-ppl"],
  },
  {
    key: "karya",
    label: "Karya Inovasi Pendidikan",
    icon: "💡",
    href: "/admin/konten/karya-inovasi",
    desc: "Media pembelajaran, perangkat ajar, LKPD, e-modul, dan PTK.",
    types: ["karya-inovasi"],
  },
];

const EXTRA = [
  { label: "Beranda & Profilku", icon: "🏠", href: "/admin/profilku", desc: "Tentang Saya, visi, filosofi, nilai, riwayat pendidikan, pengalaman, kompetensi." },
  { label: "Editor Beranda", icon: "🏛️", href: "/admin/beranda", desc: "Hero, kutipan, foto utama, dan pengaturan tampilan Beranda." },
  { label: "Lembar Kerja (LK)", icon: "📔", href: "/admin/konten/lk-refleksi", desc: "Delapan kategori LK: rancangan, materi, media, video, nonmengajar, penilaian, refleksi, evaluasi." },
];

const QUICK_NEW = [
  { type: "refleksi-ppl", label: "Refleksi PPL", icon: "🪞" },
  { type: "karya-inovasi", label: "Karya Inovasi", icon: "💡" },
  { type: "refleksi-semester-1", label: "Refleksi Semester 1", icon: "📘" },
  { type: "refleksi-semester-2", label: "Refleksi Semester 2", icon: "📗" },
  { type: "perjalanan-ppg", label: "Tahap Perjalanan", icon: "🗺️" },
];

export default async function AdminDashboard() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");

  const [counts, s] = await Promise.all([countEntries(), getAllSettings()]);
  const recent = (await listEntries({ includeNonPublished: true }))
    .slice()
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
    .slice(0, 6);

  const stat = (types: string[]) => types.reduce((a, t) => a + (counts.byType[t] ?? 0), 0);
  const missing = CONTENT_TYPES.filter((t) => (counts.byType[t.type] ?? 0) === 0);

  const identitasLengkap = [s.full_name, s.study_program, s.university, s.address].every((x) => x?.trim());
  const fotoLengkap = [s.hero_image, s.profile_photo].some((x) => x?.trim());

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-caps text-terra-600">Dasbor</p>
          <h1 className="font-serif-display mt-2 text-2xl font-semibold text-cocoa-700">Ringkasan portofolio</h1>
          <p className="mt-1 text-sm text-cocoa-500">Kelola seluruh isi website. Perubahan tersimpan permanen di database.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/" target="_blank" className="border border-cocoa-300 bg-paper px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-cocoa-600 hover:border-terra-400 hover:text-terra-600">
            Pratinjau Website <span aria-hidden>↗</span>
          </Link>
          <Link href="/admin/identitas" className="bg-cocoa-700 px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-cream hover:bg-terra-600">
            Simpan Perubahan
          </Link>
        </div>
      </div>

      {/* ringkasan */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total konten", value: counts.total, bg: "bg-cocoa-700" },
          { label: "Dipublikasikan", value: counts.published, bg: "bg-sage-500" },
          { label: "Draf", value: counts.draft, bg: "bg-terra-400" },
          { label: "Privat / terbatas", value: counts.priv, bg: "bg-cocoa-400" },
        ].map((c) => (
          <div key={c.label} className="border border-kraft-300 bg-paper p-5">
            <span className={`block h-1.5 w-10 ${c.bg}`} aria-hidden />
            <p className="font-serif-display mt-4 text-3xl font-semibold text-cocoa-700">{c.value}</p>
            <p className="label-caps mt-1 text-cocoa-400">{c.label}</p>
          </div>
        ))}
      </div>

      {/* kelengkapan identitas */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="border border-kraft-300 bg-paper p-5">
          <p className="label-caps text-cocoa-400">Kelengkapan biodata</p>
          <p className={`mt-2 text-[15px] font-bold ${identitasLengkap ? "text-sage-600" : "text-terra-600"}`}>
            {identitasLengkap ? "✓ Biodata sudah lengkap" : "● Biodata belum lengkap"}
          </p>
          <dl className="mt-3 grid text-[13px]">
            {[["Nama", s.full_name], ["Program studi", s.study_program], ["Universitas", s.university], ["Alamat", s.show_address === "true" ? s.address : "disembunyikan"]].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-t border-kraft-200 py-1.5">
                <dt className="label-caps text-cocoa-400">{k}</dt>
                <dd className="truncate text-right font-semibold text-cocoa-600">{v || "—"}</dd>
              </div>
            ))}
          </dl>
          <Link href="/admin/identitas" className="label-caps mt-3 inline-block link-underline text-terra-600">kelola identitas →</Link>
        </div>
        <div className="border border-kraft-300 bg-paper p-5">
          <p className="label-caps text-cocoa-400">Kelengkapan foto profil</p>
          <p className={`mt-2 text-[15px] font-bold ${fotoLengkap ? "text-sage-600" : "text-terra-600"}`}>
            {fotoLengkap ? "✓ Foto sudah diunggah" : "● Foto belum diunggah"}
          </p>
          <div className="mt-3 flex gap-3">
            {[["Hero", s.hero_image], ["Profil", s.profile_photo], ["Wisuda", s.photo_wisuda], ["PPL", s.photo_ppl]].map(([k, v]) => (
              <div key={k} className="flex-1 text-center">
                <div className="grid aspect-square w-full place-items-center border border-dashed border-kraft-300 bg-kraft-100 text-[10px] font-bold text-cocoa-400">
                  {v ? "✓" : "—"}
                </div>
                <p className="label-caps mt-1 text-cocoa-400">{k}</p>
              </div>
            ))}
          </div>
          <Link href="/admin/identitas" className="label-caps mt-3 inline-block link-underline text-terra-600">unggah foto →</Link>
        </div>
      </div>

      {/* lima menu utama */}
      <section className="mt-8">
        <p className="label-caps text-cocoa-400">Lima menu utama website</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MAIN_SECTIONS.map((g) => {
            const n = stat(g.types);
            return (
              <div key={g.key} className="flex flex-col border border-kraft-300 bg-paper p-5">
                <div className="flex items-start justify-between">
                  <span className="text-2xl" aria-hidden>{g.icon}</span>
                  <span className={`label-caps ${n > 0 ? "text-sage-600" : "text-cocoa-300"}`}>{n} entri</span>
                </div>
                <h2 className="font-serif-display mt-3 text-lg font-semibold leading-snug text-cocoa-700">{g.label}</h2>
                <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-cocoa-500">{g.desc}</p>
                <div className="mt-4 grid gap-2">
                  <Link href={g.href} className="group flex items-center justify-between bg-cocoa-700 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-cream hover:bg-terra-600">
                    Kelola <DoodleArrow className="h-3 w-5 transition group-hover:translate-x-1" />
                  </Link>
                  <Link href={`${g.href.replace("/admin/konten/", "/admin/konten/")}/baru`} className="border border-cocoa-300 px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-widest text-cocoa-600 hover:border-terra-400 hover:text-terra-600">
                    Tambah baru
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* bagian lain */}
      <section className="mt-8">
        <p className="label-caps text-cocoa-400">Bagian pengelolaan lainnya</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          {EXTRA.map((g) => (
            <Link key={g.href} href={g.href} className="group flex flex-col border border-kraft-300 bg-paper p-5 hover:border-terra-400">
              <span className="text-2xl" aria-hidden>{g.icon}</span>
              <span className="font-serif-display mt-3 text-lg font-semibold text-cocoa-700 group-hover:text-terra-600">{g.label}</span>
              <span className="mt-1.5 flex-1 text-[13px] leading-relaxed text-cocoa-500">{g.desc}</span>
              <span className="label-caps mt-4 text-terra-600">buka →</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="border border-kraft-300 bg-paper p-5">
          <div className="flex items-center gap-2">
            <DoodleGradCap className="h-6 w-8 text-terra-500" aria-hidden />
            <p className="label-caps text-cocoa-400">Status kelengkapan konten</p>
          </div>
          {missing.length === 0 ? (
            <p className="mt-4 border border-dashed border-sage-300 bg-sage-100 px-4 py-3 text-sm font-semibold text-sage-600">
              ✓ Semua kategori sudah memiliki konten.
            </p>
          ) : (
            <>
              <p className="mt-3 text-[13px] leading-relaxed text-cocoa-500">
                {missing.length} kategori masih kosong. Kategori yang memang belum Anda kerjakan boleh dibiarkan — halaman publik
                menampilkan pesan ramah, bukan data contoh.
              </p>
              <div className="mt-4 grid gap-2">
                {missing.map((t) => (
                  <Link key={t.type} href={`/admin/konten/${t.type}/baru`} className="group flex items-center justify-between gap-3 border-t border-kraft-200 py-2.5 hover:bg-sand-100">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="text-cocoa-400" aria-hidden>{t.icon}</span>
                      <span className="truncate text-[13px] font-semibold text-cocoa-700 group-hover:text-terra-600">{t.plural}</span>
                    </span>
                    <span className="label-caps shrink-0 text-terra-600">isi sekarang →</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="grid content-start gap-5">
          <div className="bg-cocoa-700 p-5 text-cream">
            <p className="label-caps text-blush-200">Tambah cepat</p>
            <div className="mt-3 grid gap-2">
              {QUICK_NEW.map((x) => (
                <Link key={x.type} href={`/admin/konten/${x.type}/baru`} className="flex items-center gap-2 border border-cream/25 px-4 py-2.5 text-[13px] font-semibold hover:border-blush-200">
                  <span aria-hidden>{x.icon}</span> {x.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="border border-kraft-300 bg-paper p-5">
            <div className="flex items-center gap-2">
              <DoodleStar className="h-4 w-4 text-terra-400" aria-hidden />
              <p className="label-caps text-cocoa-400">Terakhir diperbarui</p>
            </div>
            <div className="mt-3 grid">
              {recent.length === 0 && <p className="text-sm text-cocoa-400">Belum ada konten.</p>}
              {recent.map((r) => (
                <Link key={r.id} href={`/admin/konten/${r.type}/${r.id}`} className="border-t border-kraft-200 py-2.5 hover:bg-sand-100">
                  <p className="truncate text-[13px] font-semibold text-cocoa-700">{r.title}</p>
                  <p className="label-caps mt-0.5 text-cocoa-400">{r.type} • {r.status}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
