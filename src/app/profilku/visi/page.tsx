import { getAllSettings, listEntries } from "@/lib/data";
import { Annotation, ChapterNum, DoodleHeart, DoodleStar, ScribbleUnderline } from "@/components/site/Doodles";
import { EmptyState, Reveal, RichText, SectionTab } from "@/components/site/ui";

export const dynamic = "force-dynamic";

const ORDER = ["Visi sebagai Guru", "Filosofi Mengajar", "Nilai Dasar", "Prinsip Relasi", "Komitmen", "Lainnya"];

export default async function VisiPage() {
  const [items, s] = await Promise.all([listEntries({ type: "visi-filosofi" }), getAllSettings()]);
  const sorted = [...items].sort((a, b) => {
    const ai = ORDER.indexOf(a.meta?.category ?? "");
    const bi = ORDER.indexOf(b.meta?.category ?? "");
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.sortOrder - b.sortOrder;
  });

  // Fallback dari pengaturan situs (diedit lewat Editor Beranda → tab Visi & Filosofi)
  if (sorted.length === 0) {
    const fromSettings = [
      { category: "Visi sebagai Guru", title: "Visi Saya sebagai Guru", body: s.cv_visi },
      { category: "Filosofi Mengajar", title: "Filosofi Mengajar", body: s.cv_filosofi },
      { category: "Nilai Dasar", title: "Nilai-Nilai yang Menjadi Landasan", body: s.cv_nilai },
      { category: "Prinsip Relasi", title: "Prinsip dalam Membangun Relasi", body: s.cv_prinsip },
      { category: "Komitmen", title: "Komitmen dalam Pembelajaran", body: s.cv_komitmen },
    ]
      .filter((x) => x.body?.trim())
      .map((x, i) => ({
        id: `setting-${i}`,
        type: "visi-filosofi",
        title: x.title,
        slug: null,
        excerpt: null,
        body: x.body ?? null,
        imageUrl: null,
        images: [],
        files: [],
        links: [],
        meta: { category: x.category },
        status: "published",
        sortOrder: i,
        createdAt: null,
        updatedAt: null,
      }));
    if (fromSettings.length > 0) sorted.push(...fromSettings);
  }

  const [visi, filosofi, ...rest] = sorted;

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <Reveal>
        <SectionTab tone="blush">Profilku • 04</SectionTab>
        <h1 className="font-serif-display mt-4 max-w-2xl text-[clamp(1.9rem,4.4vw,2.8rem)] font-semibold leading-[1.08] text-cocoa-700">
          Visi, filosofi, dan nilai yang saya pegang
        </h1>
        <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-cocoa-500">
          Landasan berpikir dan berpihak sebagai calon guru: visi, filosofi mengajar, nilai, prinsip relasi, serta komitmen pada
          pembelajaran yang inklusif dan bermakna.
        </p>
      </Reveal>

      {sorted.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            icon="✎"
            title="Belum ada visi atau filosofi yang ditambahkan"
            desc="Bagian ini diisi pemilik portofolio melalui panel admin — menu Profilku → Visi & Filosofi."
          />
        </div>
      ) : (
        <>
          {/* Visi — kutipan besar */}
          {visi && (
            <Reveal>
              <figure className="relative mx-auto mt-14 max-w-3xl text-center">
                <span className="absolute -left-2 -top-4 hidden text-terra-300 sm:block" aria-hidden>
                  <DoodleStar className="h-8 w-8" />
                </span>
                <SectionTab tone="sage">{visi.meta?.category || "Visi"}</SectionTab>
                <h2 className="font-serif-display mt-6 text-[clamp(1.5rem,3.6vw,2.15rem)] font-semibold italic leading-[1.25] text-cocoa-700">
                  “{visi.title}”
                </h2>
                <ScribbleUnderline className="mx-auto mt-5 h-3 w-56 text-terra-400" />
                <div className="mx-auto mt-7 max-w-2xl text-left">
                  <RichText text={visi.body} />
                </div>
              </figure>
            </Reveal>
          )}

          {/* Filosofi — kertas jurnal */}
          {filosofi && (
            <Reveal>
              <article className="torn relative mt-16 bg-paper px-6 py-8 sm:px-10 sm:py-10">
                <span className="tape -top-3 left-10" style={{ transform: "rotate(-4deg)" }} aria-hidden />
                <SectionTab tone="kraft">{filosofi.meta?.category || "Filosofi"}</SectionTab>
                <h2 className="font-serif-display mt-5 text-2xl font-semibold text-cocoa-700">{filosofi.title}</h2>
                <div className="mt-4 max-w-3xl">
                  <RichText text={filosofi.body} />
                </div>
              </article>
            </Reveal>
          )}

          {/* Sisanya — dua kolom */}
          {rest.length > 0 && (
            <div className="mt-16 grid gap-10 sm:grid-cols-2">
              {rest.map((e, i) => (
                <Reveal key={e.id} delay={Math.min(i * 60, 240)}>
                  <article className={`h-full px-6 py-7 torn-soft ${i % 2 === 0 ? "bg-kraft-100" : "bg-blush-100"}`}>
                    <div className="flex items-baseline justify-between gap-4">
                      <SectionTab tone={i % 2 === 0 ? "kraft" : "blush"}>{e.meta?.category || "Catatan"}</SectionTab>
                      <ChapterNum n={String(i + 3).padStart(2, "0")} className="!text-2xl" />
                    </div>
                    <h2 className="font-serif-display mt-4 text-xl font-semibold leading-snug text-cocoa-700">{e.title}</h2>
                    <div className="mt-3">
                      <RichText text={e.body} />
                    </div>
                    {e.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.imageUrl} alt={e.title} className="mt-5 aspect-[16/10] w-full border border-kraft-200 object-cover" loading="lazy" />
                    )}
                  </article>
                </Reveal>
              ))}
            </div>
          )}

          <Reveal>
            <Annotation className="mt-16 flex items-center justify-center gap-2 text-center">
              <DoodleHeart className="h-4 w-4 text-terra-400" /> ditulis ulang setiap kali saya belajar hal baru tentang murid
            </Annotation>
          </Reveal>
        </>
      )}
    </div>
  );
}
