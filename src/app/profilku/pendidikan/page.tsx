import Link from "next/link";
import { listEntries } from "@/lib/data";
import { Annotation, DoodleFlower, DoodleGradCap } from "@/components/site/Doodles";
import { EmptyState, Polaroid, Reveal, SectionTab } from "@/components/site/ui";

export const dynamic = "force-dynamic";

export default async function PendidikanPage() {
  const items = await listEntries({ type: "pendidikan" });
  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <Reveal>
        <SectionTab tone="blush">Profilku • 03</SectionTab>
        <h1 className="font-serif-display mt-4 max-w-2xl text-[clamp(1.9rem,4.4vw,2.8rem)] font-semibold leading-[1.08] text-cocoa-700">
          Linimasa perjalanan pendidikan
        </h1>
        <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-cocoa-500">
          Jejak belajar formal dari sekolah dasar hingga jenjang sarjana. Seluruh entri ditambahkan pemilik portofolio melalui
          panel admin.
        </p>
      </Reveal>

      <div className="mt-12">
        {items.length === 0 ? (
          <EmptyState
            icon="⌘"
            title="Belum ada riwayat pendidikan yang ditambahkan"
            desc="Nama institusi, jenjang, periode, dan dokumen pendukung diisi melalui panel admin — menu Profilku → Perjalanan Pendidikan."
          />
        ) : (
          <div className="relative">
            <span className="absolute left-[21px] top-2 hidden h-[calc(100%-1rem)] w-[1.5px] bg-kraft-300 sm:block" aria-hidden />
            <ol className="grid gap-12">
              {items.map((e, i) => {
                const right = i % 2 === 1;
                return (
                  <Reveal key={e.id} delay={Math.min(i * 70, 300)}>
                    <li className="relative grid items-center gap-6 sm:grid-cols-2 sm:gap-14">
                      <span className="absolute left-[21px] top-6 hidden h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-terra-500 bg-cream sm:block" aria-hidden />
                      <div className={`pl-12 sm:pl-0 ${right ? "sm:order-2" : "sm:text-right"}`}>
                        <div className={`flex items-center gap-3 ${right ? "" : "sm:justify-end"}`}>
                          <span className="font-serif-display text-3xl font-semibold text-terra-400/70" aria-hidden>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="tab-label label-caps text-cocoa-600">{e.meta?.period || "Periode menyusul"}</span>
                        </div>
                        {e.meta?.jenjang && <p className="label-caps mt-3 text-sage-600">{e.meta.jenjang}</p>}
                        <h2 className="font-serif-display mt-2 text-xl font-semibold leading-snug text-cocoa-700 sm:text-2xl">
                          <Link href={`/detail/${e.id}`} className="link-underline">
                            {e.title}
                          </Link>
                        </h2>
                        {e.body && <p className="mt-2 text-[15px] leading-relaxed text-cocoa-500">{e.body}</p>}
                        <Link href={`/detail/${e.id}`} className="label-caps mt-3 inline-block text-cocoa-500 hover:text-terra-600">
                          Baca detail →
                        </Link>
                      </div>
                      <div className={`pl-12 sm:pl-0 ${right ? "sm:order-1" : ""}`}>
                        <Link href={`/detail/${e.id}`} className="block">
                          {e.imageUrl ? (
                            <Polaroid src={e.imageUrl} alt={e.title} rotate={right ? 2.5 : -2.5} aspect="aspect-[16/11]" caption={e.meta?.period} />
                          ) : (
                            <div
                              className={`polaroid ${right ? "" : ""}`}
                              style={{ transform: `rotate(${right ? 2.5 : -2.5}deg)` }}
                            >
                              <span className={`tape ${right ? "tape-kraft" : ""} -top-3 left-1/2 -translate-x-1/2`} aria-hidden />
                              <div className="grid aspect-[16/11] w-full place-items-center bg-blush-100 px-6 text-center">
                                {i === items.length - 1 ? (
                                  <DoodleGradCap className="h-14 w-20 text-cocoa-400" />
                                ) : (
                                  <DoodleFlower className="h-12 w-auto text-cocoa-400" />
                                )}
                              </div>
                              <p className="font-hand absolute bottom-3 left-0 w-full px-3 text-center text-lg leading-tight text-cocoa-400">
                                foto pendukung menyusul
                              </p>
                            </div>
                          )}
                        </Link>
                      </div>
                    </li>
                  </Reveal>
                );
              })}
            </ol>
          </div>
        )}
      </div>

      <Reveal>
        <Annotation className="mt-14 block text-center">perjalanan PPG dan refleksinya ada pada halaman Lembar Kerja</Annotation>
      </Reveal>
    </div>
  );
}
