import Link from "next/link";
import { listEntries } from "@/lib/data";
import { LK_TYPES } from "@/lib/types";
import { Annotation, ArchiveSketch, DashedDivider, DoodleArrow, DoodleBook } from "@/components/site/Doodles";
import { PageHero, Reveal, SectionTab } from "@/components/site/ui";

export const dynamic = "force-dynamic";

const TAPES = ["", "tape-kraft", "tape-sage"];

export default async function LkOverview() {
  const counts: Record<string, number> = {};
  await Promise.all(
    LK_TYPES.map(async (t) => {
      const items = await listEntries({ type: t.type });
      counts[t.type] = items.length;
    })
  );
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div>
      <PageHero
        eyebrow="Lembar Kerja (LK)"
        num="Bab II"
        title="Arsip karya & dokumentasi akademik"
        desc="Delapan kelompok dokumentasi selama PPG: analisis, praktik, instrumen penilaian, refleksi, dan evaluasi. Seluruhnya dikelola melalui panel admin."
        crumbs={[{ label: "Beranda", href: "/" }, { label: "Lembar Kerja" }]}
      />

      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionTab tone="kraft">Indeks arsip — 8 kategori</SectionTab>
              <p className="font-serif-display mt-4 text-3xl font-semibold text-cocoa-700">
                {total} <span className="text-lg font-normal text-cocoa-400">karya terpublikasi</span>
              </p>
            </div>
            <Annotation className="hidden sm:block">klik kategori untuk melihat isinya ↓</Annotation>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {LK_TYPES.map((t, i) => (
            <Reveal key={t.type} delay={Math.min(i * 45, 280)}>
              <Link href={`/lk/${t.slug}`} className="group block h-full">
                <article className="torn sketch-shift relative h-full bg-paper px-6 py-7">
                  <span className={`tape ${TAPES[i % 3]} -top-3 left-8`} style={{ transform: `rotate(${i % 2 === 0 ? -5 : 5}deg)` }} aria-hidden />
                  <div className="flex items-start justify-between">
                    <span className="font-serif-display text-5xl font-semibold leading-none text-terra-400/70 transition group-hover:text-terra-500">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-lg text-cocoa-400" aria-hidden>{t.icon}</span>
                  </div>
                  <h2 className="font-serif-display mt-4 text-[1.15rem] font-semibold leading-snug text-cocoa-700 transition group-hover:text-terra-600">
                    {t.label}
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-cocoa-500">{t.description}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-dashed border-kraft-200 pt-3">
                    <span className={`label-caps ${counts[t.type] > 0 ? "text-sage-600" : "text-cocoa-300"}`}>
                      {counts[t.type] > 0 ? `${counts[t.type]} dokumen` : "belum ada dokumen"}
                    </span>
                    <span className="label-caps flex items-center gap-1.5 text-terra-600">
                      Buka <DoodleArrow className="h-3 w-5 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="relative mt-16 overflow-hidden bg-cocoa-700 px-6 py-10 text-center text-cream sm:px-10">
            <div className="grid-faint pointer-events-none absolute inset-0 opacity-10" aria-hidden />
            <div className="relative">
              <DoodleBook className="mx-auto h-10 w-16 text-blush-200" aria-hidden />
              <p className="font-serif-display mx-auto mt-5 max-w-xl text-xl font-semibold italic leading-snug">
                Setiap lembar kerja memuat judul, uraian analisis, dokumen terlampir, foto dokumentasi, dan tautan pendukung.
              </p>
              <Link href="/cari" className="label-caps mt-7 inline-block bg-cream px-7 py-3.5 text-cocoa-700 hover:bg-blush-200">
                ⌕ Cari di seluruh arsip
              </Link>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link href="/refleksi" className="label-caps border border-cream/40 px-5 py-3 text-cream hover:border-blush-200">🪞 Refleksi PPL</Link>
                <Link href="/karya-inovasi" className="label-caps border border-cream/40 px-5 py-3 text-cream hover:border-blush-200">💡 Karya Inovasi</Link>
              </div>
            </div>
          </div>
          <ArchiveSketch className="mx-auto mt-12 h-auto w-full max-w-2xl text-kraft-300" />
        </Reveal>
      </div>
    </div>
  );
}
