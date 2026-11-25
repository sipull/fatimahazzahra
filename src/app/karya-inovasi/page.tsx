import Link from "next/link";
import { listEntries } from "@/lib/data";
import { getContentType } from "@/lib/types";
import { Annotation, ArchiveSketch } from "@/components/site/Doodles";
import { EmptyState, FilterableEntries, PageHero, Polaroid, Reveal, SectionTab } from "@/components/site/ui";

export const dynamic = "force-dynamic";

export default async function KaryaInovasiPage() {
  const def = getContentType("karya-inovasi");
  const items = await listEntries({ type: "karya-inovasi" });

  return (
    <div>
      <PageHero
        eyebrow="Karya Inovasi Pendidikan"
        num="Bab IV"
        title="Karya, media, dan inovasi pembelajaran"
        desc="Karya yang dikembangkan selama PPG: media pembelajaran, perangkat ajar, LKPD, e-modul, hingga penelitian tindakan kelas."
        crumbs={[{ label: "Beranda", href: "/" }, { label: "Karya Inovasi" }]}
      />

      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        {items.length === 0 ? (
          <EmptyState
            icon="💡"
            title={def?.emptyMessage ?? "Belum ada karya inovasi yang ditambahkan"}
            desc="Karya inovasi dapat ditambahkan melalui panel admin — lengkap dengan judul, jenis karya, uraian manfaat, gambar, dokumen, dan tautan."
          />
        ) : (
          <>
            <Reveal>
              <p className="label-caps text-cocoa-400">{items.length} karya terpublikasi</p>
            </Reveal>
            <div className="mt-6">
              <FilterableEntries entries={items} basePath="/detail" />
            </div>
          </>
        )}

        <Reveal>
          {items.length > 0 && (
            <section className="mt-16">
              <div className="flex items-end justify-between gap-4">
                <SectionTab tone="sage">Dokumentasi karya</SectionTab>
                <Annotation className="hidden sm:block">foto media, LKPD, dan dokumentasi pembelajaran</Annotation>
              </div>
              <div className="mt-7 grid gap-7 sm:grid-cols-3">
                {items
                  .filter((i) => i.imageUrl)
                  .slice(0, 6)
                  .map((i, n) => (
                    <Link key={i.id} href={`/detail/${i.id}`} className="block">
                      <Polaroid src={i.imageUrl as string} alt={i.title} rotate={n % 2 === 0 ? -2 : 2} aspect="aspect-[4/3]" caption={i.meta?.period} />
                    </Link>
                  ))}
              </div>
            </section>
          )}
          <ArchiveSketch className="mx-auto mt-14 h-auto w-full max-w-2xl text-kraft-300" />
          <Annotation className="mt-4 flex items-center justify-center gap-2 text-center">
            <Link href="/refleksi" className="link-underline">lihat Refleksi PPL →</Link>
          </Annotation>
        </Reveal>
      </div>
    </div>
  );
}
