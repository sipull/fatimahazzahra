import { listEntries } from "@/lib/data";
import { Annotation, DashedDivider, DoodleLeaf } from "@/components/site/Doodles";
import { EmptyState, FilterableEntries, Reveal, SectionTab } from "@/components/site/ui";

export const dynamic = "force-dynamic";

export default async function KompetensiPage() {
  const items = await listEntries({ type: "kompetensi" });
  const groups = new Map<string, number>();
  for (const e of items) {
    const c = e.meta?.category || "Lainnya";
    groups.set(c, (groups.get(c) ?? 0) + 1);
  }
  const pelatihan = items.filter((e) => e.meta?.category === "Pengembangan Diri");
  const lainnya = items.filter((e) => e.meta?.category !== "Pengembangan Diri");

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <Reveal>
        <SectionTab tone="blush">Profilku • 05</SectionTab>
        <h1 className="font-serif-display mt-4 max-w-2xl text-[clamp(1.9rem,4.4vw,2.8rem)] font-semibold leading-[1.08] text-cocoa-700">
          Kompetensi & pengembangan diri
        </h1>
        <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-cocoa-500">
          Empat kompetensi guru, keterampilan digital dan inovasi pembelajaran, serta riwayat pelatihan dan sertifikasi.
        </p>
      </Reveal>

      {items.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            icon="❋"
            title="Belum ada data kompetensi yang ditambahkan"
            desc="Kompetensi beserta deskripsi, bukti pendukung, gambar, dokumen, dan tautan diisi melalui panel admin — menu Profilku → Kompetensi."
          />
        </div>
      ) : (
        <>
          <Reveal>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
              {[...groups.entries()].map(([k, v], i) => (
                <span key={k} className="flex items-baseline gap-2 border-t border-kraft-300 pt-3">
                  <span className="label-caps text-kraft-300">{String(i + 1).padStart(2, "0")}</span>
                  <span className="label-caps text-cocoa-600">{k}</span>
                  <span className="font-serif-display text-sm text-terra-500">{v}</span>
                </span>
              ))}
            </div>
            <DashedDivider className="mt-8 text-kraft-300" />
          </Reveal>

          <div className="mt-10">
            <FilterableEntries entries={lainnya} basePath="/detail" />
          </div>

          {pelatihan.length > 0 && (
            <Reveal>
              <section className="mt-16">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <SectionTab tone="sage">Pelatihan & Sertifikasi</SectionTab>
                    <h2 className="font-serif-display mt-4 text-2xl font-semibold text-cocoa-700">Kartu sertifikat</h2>
                  </div>
                  <DoodleLeaf className="hidden h-12 w-auto text-sage-400 sm:block" aria-hidden />
                </div>
                <div className="mt-7 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                  {pelatihan.map((p, i) => (
                    <article
                      key={p.id}
                      className="torn sketch-shift relative bg-paper px-5 py-6"
                      style={{ transform: `rotate(${i % 2 === 0 ? -0.8 : 0.8}deg)` }}
                    >
                      <span className={`tape ${i % 3 === 0 ? "tape-kraft" : i % 3 === 1 ? "tape-sage" : ""} -top-3 left-6`} style={{ transform: `rotate(${i % 2 === 0 ? -5 : 4}deg)` }} aria-hidden />
                      <span className="label-caps text-terra-600">{p.meta?.period || "—"}</span>
                      <h3 className="font-serif-display mt-2 text-[1.05rem] font-semibold leading-snug text-cocoa-700">{p.title}</h3>
                      {p.body && <p className="mt-2 text-[14px] leading-relaxed text-cocoa-500">{p.body}</p>}
                      <div className="mt-4 flex flex-wrap gap-3 border-t border-dashed border-kraft-200 pt-3">
                        {p.files?.length > 0 && <span className="label-caps text-cocoa-400">📎 {p.files.length} berkas</span>}
                        {p.links?.length > 0 && <span className="label-caps text-cocoa-400">🔗 {p.links.length} tautan</span>}
                        {!p.files?.length && !p.links?.length && <span className="label-caps text-cocoa-300">belum ada berkas</span>}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          <Reveal>
            <Annotation className="mt-16 block text-center">setiap butir dapat dilengkapi bukti: dokumen, foto, atau tautan</Annotation>
          </Reveal>
        </>
      )}
    </div>
  );
}
