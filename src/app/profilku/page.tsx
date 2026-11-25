import Link from "next/link";
import { Annotation, DashedDivider, DoodleArrow, DoodleFlower, DoodleGradCap } from "@/components/site/Doodles";
import { PageHero, Reveal } from "@/components/site/ui";

export const dynamic = "force-dynamic";

const MENUS = [
  { n: "01", href: "/profilku/identitas", title: "Identitas Diri", desc: "Nama, alamat, program studi, universitas, dan pengantar singkat tentang diri.", tag: "Profil" },
  { n: "02", href: "/profilku/cv", title: "Curriculum Vitae", desc: "Ringkasan profil, riwayat pendidikan, pengalaman, pelatihan, kompetensi, organisasi, dan berkas PDF.", tag: "Dokumen" },
  { n: "03", href: "/profilku/pendidikan", title: "Perjalanan Pendidikan", desc: "Linimasa SD, SMP, SMA, hingga S1 PGSD yang urutannya dapat diatur melalui panel admin.", tag: "Linimasa" },
  { n: "04", href: "/profilku/visi", title: "Visi & Filosofi Menjadi Guru", desc: "Visi, filosofi mengajar, nilai landasan, prinsip relasi, dan komitmen pembelajaran.", tag: "Refleksi" },
  { n: "05", href: "/profilku/kompetensi", title: "Kompetensi & Pengembangan Diri", desc: "Pedagogik, profesional, sosial, kepribadian, keterampilan digital, serta pelatihan & sertifikasi.", tag: "Bukti karya" },
];

export default function ProfilkuOverview() {
  return (
    <div>
      <PageHero
        eyebrow="Profilku"
        num="Bab I"
        title="Mengenal penulis di balik jurnal ini"
        desc="Siapa saya, dari mana saya berasal, apa yang saya yakini tentang pendidikan, dan kompetensi apa yang terus saya asah."
        crumbs={[{ label: "Beranda", href: "/" }, { label: "Profilku" }]}
      />

      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <p className="label-caps text-cocoa-400">Daftar isi — 5 bagian</p>
            <Annotation className="hidden items-center gap-2 sm:flex">
              <DoodleFlower className="h-6 w-auto text-sage-500" /> pilih salah satu untuk mulai ↓
            </Annotation>
          </div>
        </Reveal>

        <ol className="mt-6">
          {MENUS.map((m, i) => (
            <Reveal key={m.href} delay={i * 60}>
              <li className="border-t border-kraft-300">
                <Link href={m.href} className="group grid items-center gap-4 py-7 sm:grid-cols-[auto_1fr_auto] sm:gap-8">
                  <span className="font-serif-display text-4xl font-semibold text-terra-400/75 sm:text-5xl">{m.n}</span>
                  <span>
                    <span className="label-caps text-cocoa-400">{m.tag}</span>
                    <span className="font-serif-display mt-1.5 block text-xl font-semibold leading-snug text-cocoa-700 transition group-hover:text-terra-600 sm:text-2xl">
                      {m.title}
                    </span>
                    <span className="mt-2 block max-w-2xl text-[15px] leading-relaxed text-cocoa-500">{m.desc}</span>
                  </span>
                  <span className="label-caps flex items-center gap-2 text-cocoa-500 transition group-hover:text-terra-600">
                    Buka <DoodleArrow className="h-3 w-5 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            </Reveal>
          ))}
        </ol>

        <Reveal>
          <DashedDivider className="mt-8 text-kraft-300" />
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {[
              { href: "/refleksi", n: "06", tag: "Bab III", title: "Refleksi PPL", desc: "Refleksi mata kuliah semester 1, semester 2, dan refleksi selama PPL mandiri." },
              { href: "/karya-inovasi", n: "07", tag: "Bab IV", title: "Karya Inovasi Pendidikan", desc: "Karya, media, dan inovasi pembelajaran yang dikembangkan selama PPG." },
            ].map((m) => (
              <Link key={m.href} href={m.href} className="group block border border-kraft-300 bg-paper p-6 hover:border-terra-400">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-serif-display text-3xl font-semibold text-terra-400/75">{m.n}</span>
                  <span className="label-caps text-cocoa-400">{m.tag}</span>
                </span>
                <span className="font-serif-display mt-3 block text-lg font-semibold text-cocoa-700 group-hover:text-terra-600">{m.title}</span>
                <span className="mt-2 block text-[14.5px] leading-relaxed text-cocoa-500">{m.desc}</span>
                <span className="label-caps mt-4 inline-block text-terra-600">buka bagian →</span>
              </Link>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center gap-4 text-center">
            <DoodleGradCap className="h-10 w-14 text-terra-500" aria-hidden />
            <p className="font-serif-display max-w-xl text-xl font-semibold italic leading-snug text-cocoa-600">
              “Menjadi guru adalah perjalanan untuk belajar memahami manusia, menumbuhkan karakter, dan mendampingi setiap anak.”
            </p>
            <Link href="/lk" className="label-caps sketch-soft bg-paper px-7 py-3.5 text-cocoa-600 hover:border-terra-400 hover:text-terra-600">
              Lanjut ke Lembar Kerja →
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
