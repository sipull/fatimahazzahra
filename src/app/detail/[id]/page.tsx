import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntryById } from "@/lib/data";
import { getContentType } from "@/lib/types";
import { Annotation, DashedDivider, DoodleArrow, DoodlePaperclip, DoodleStar } from "@/components/site/Doodles";
import { EmptyState, Gallery, FileList, LinkList, PageHero, Polaroid, Reveal, RichText, SectionTab } from "@/components/site/ui";

export const dynamic = "force-dynamic";

export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await getEntryById(id);
  // Privasi ketat di server: hanya published yang boleh tampil publik
  if (!entry || entry.status !== "published") notFound();
  const def = getContentType(entry.type);
  const backHref =
    def?.group === "lk"
      ? `/lk/${def.slug}`
      : def?.type === "kompetensi"
        ? "/profilku/kompetensi"
        : def?.type === "pendidikan"
          ? "/profilku/pendidikan"
          : "/";

  const period = entry.meta?.period || entry.meta?.date;
  const videoUrl = entry.meta?.videoUrl;

  return (
    <div>
      <PageHero
        eyebrow={def?.label ?? "Dokumen"}
        num={def?.icon ?? "✎"}
        title={entry.title}
        desc={entry.excerpt ?? undefined}
        crumbs={[
          { label: "Beranda", href: "/" },
          ...(def?.group === "lk"
            ? [
                { label: "Lembar Kerja", href: "/lk" },
                { label: def.label, href: `/lk/${def.slug}` },
              ]
            : [{ label: def?.label ?? "Dokumen", href: backHref }]),
          { label: "Detail" },
        ]}
      />

      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <Reveal>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {entry.meta?.category && <SectionTab tone="blush">{entry.meta.category}</SectionTab>}
            {entry.meta?.jenjang && <span className="label-caps text-sage-600">{entry.meta.jenjang}</span>}
            {period && <span className="label-caps text-cocoa-400">{period}</span>}
            {entry.files?.length > 0 && <span className="label-caps text-cocoa-400">📎 {entry.files.length} berkas</span>}
            {entry.links?.length > 0 && <span className="label-caps text-cocoa-400">🔗 {entry.links.length} tautan</span>}
          </div>
          <DashedDivider className="mt-6 text-kraft-300" />
        </Reveal>

        {videoUrl && (
          <Reveal delay={60}>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 bg-cocoa-700 px-6 py-5 text-cream">
              <span>
                <span className="label-caps block text-blush-200">Video praktik</span>
                <span className="font-serif-display mt-1 block text-lg">Tersedia tautan video pembelajaran</span>
              </span>
              <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="label-caps bg-terra-500 px-5 py-3 text-cream hover:bg-cream hover:text-cocoa-700">
                Tonton video ↗
              </a>
            </div>
          </Reveal>
        )}

        {entry.imageUrl && (
          <Reveal delay={80}>
            <div className="mx-auto mt-10 max-w-md">
              <Polaroid src={entry.imageUrl} alt={entry.title} aspect="aspect-[4/3]" rotate={-1.5} caption={entry.excerpt ?? undefined} />
            </div>
          </Reveal>
        )}

        {entry.body ? (
          <Reveal delay={100}>
            <article className="torn relative mt-12 bg-paper px-6 py-8 sm:px-10 sm:py-10">
              <span className="tape -top-3 left-10" style={{ transform: "rotate(-4deg)" }} aria-hidden />
              {entry.excerpt && (
                <p className="font-serif-display border-l-2 border-terra-400 pl-4 text-lg italic leading-relaxed text-cocoa-600">
                  {entry.excerpt}
                </p>
              )}
              <div className={entry.excerpt ? "mt-6" : ""}>
                <RichText text={entry.body} dropcap={!entry.excerpt} />
              </div>
            </article>
          </Reveal>
        ) : !entry.imageUrl ? (
          <Reveal>
            <div className="mt-10">
              <EmptyState icon="✎" title="Catatan ini belum memiliki uraian" desc="Uraian analisis dapat ditambahkan melalui panel admin." />
            </div>
          </Reveal>
        ) : null}

        {entry.images?.length > 0 && (
          <Reveal>
            <section className="mt-14">
              <div className="flex items-baseline gap-3">
                <SectionTab tone="kraft">Galeri dokumentasi</SectionTab>
                <span className="h-[1.5px] flex-1 bg-kraft-200" aria-hidden />
              </div>
              <div className="mt-6">
                <Gallery images={entry.images} title={entry.title} />
              </div>
            </section>
          </Reveal>
        )}

        {entry.files?.length > 0 && (
          <Reveal>
            <section className="mt-14">
              <div className="flex items-baseline gap-3">
                <SectionTab tone="kraft">Dokumen terlampir</SectionTab>
                <span className="h-[1.5px] flex-1 bg-kraft-200" aria-hidden />
              </div>
              <div className="mt-6">
                <FileList files={entry.files} />
              </div>
              <p className="label-caps mt-3 flex items-center gap-2 text-cocoa-400">
                <DoodlePaperclip className="h-4 w-3" aria-hidden /> berkas dilayani dengan pemeriksaan hak akses
              </p>
            </section>
          </Reveal>
        )}

        {entry.links?.length > 0 && (
          <Reveal>
            <section className="mt-14">
              <div className="flex items-baseline gap-3">
                <SectionTab tone="kraft">Tautan pendukung</SectionTab>
                <span className="h-[1.5px] flex-1 bg-kraft-200" aria-hidden />
              </div>
              <div className="mt-4">
                <LinkList links={entry.links} />
              </div>
            </section>
          </Reveal>
        )}

        <Reveal>
          <DashedDivider className="mt-14 text-kraft-300" />
          <div className="mt-8 flex flex-wrap items-center justify-between gap-5">
            <div className="flex flex-wrap gap-3">
              <Link href={backHref} className="label-caps sketch-soft bg-paper px-6 py-3.5 text-cocoa-600 hover:border-terra-400 hover:text-terra-600">
                ← Kembali
              </Link>
              <Link href="/lk" className="label-caps bg-cocoa-700 px-6 py-3.5 text-cream hover:bg-terra-600">
                Semua Lembar Kerja <DoodleArrow className="ml-1 inline h-3 w-5" />
              </Link>
            </div>
            <Annotation className="flex items-center gap-2">
              <DoodleStar className="h-4 w-4 text-terra-400" /> terima kasih sudah membaca
            </Annotation>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
