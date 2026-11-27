import Link from "next/link";
import { getAllSettings, listEntries } from "@/lib/data";
import { LK_TYPES } from "@/lib/types";
import { ExpandableText, Polaroid, Reveal, SectionHead, SectionTab, EmptyState, RichText } from "@/components/site/ui";
import {
  CircleScribble,
  ClassroomSketch,
  DashedDivider,
  DoodleArrow,
  DoodleArrowDown,
  DoodleBook,
  DoodleFlower,
  DoodleGradCap,
  DoodleHeart,
  DoodleLeaf,
  DoodlePaperclip,
  DoodlePencil,
  DoodleSchool,
  DoodleStar,
  ScribbleUnderline,
} from "@/components/site/Doodles";

export const dynamic = "force-dynamic";

const TUJUAN_ICON = ["📁", "🪞", "🌱", "🧭"];
const TUJUAN_TONE = ["bg-blush-100", "bg-kraft-100", "bg-sage-100", "bg-sand-100"];

export default async function BerandaPage() {
  const s = await getAllSettings();
  const [kata, tujuan, journey] = await Promise.all([
    listEntries({ type: "kata-pengantar" }),
    listEntries({ type: "tujuan-portofolio" }),
    listEntries({ type: "perjalanan-ppg" }),
  ]);

  const owner = s.full_name?.trim() || s.owner_name || "Fatimah Azzahra’, S.Pd.";
  const namaBesar = (s.hero_title || "FATIMAH AZZAHRA’").toUpperCase();
  const subjudul = s.hero_subtitle || s.owner_title || "Calon Guru, Pembelajar Sepanjang Hayat";
  const foto = "/src/foto/IMG_0620.jpeg";
  const fotoPos = s.hero_image_pos || "50% 30%";
  const identitas = [
    { label: "Nama", value: owner },
    { label: "Alamat", value: s.show_address === "true" ? s.address : "— disembunyikan —" },
    { label: "Program studi", value: s.study_program },
    { label: "Universitas", value: s.university },
  ].filter((x) => x.value && x.value.trim());

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border-b border-kraft-200 bg-cream paper-fiber">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden />
        <div className="pointer-events-none absolute -left-16 top-24 hidden h-48 w-48 bg-blush-200/70 torn-soft lg:block" aria-hidden />
        <div className="pointer-events-none absolute right-4 top-10 hidden lg:block" aria-hidden>
          <CircleScribble className="h-20 w-44 text-terra-300" />
        </div>
        <div className="pointer-events-none absolute bottom-24 left-6 hidden lg:block" aria-hidden>
          <DoodlePaperclip className="h-12 w-5 text-cocoa-400" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
          {/* kiri: foto */}
          <div className="order-2 lg:order-1">
            <div className="relative mx-auto max-w-[340px]">
              <div className="absolute -left-5 -top-5 hidden h-full w-full bg-kraft-200/80 torn-soft sm:block" aria-hidden />
              <div className="relative">
                {foto ? (
                  <Polaroid src={foto} alt={`Foto ${owner}`} pos={fotoPos} rotate={-2.5} caption={s.hero_quote} />
                ) : (
                  <div className="polaroid relative" style={{ transform: "rotate(-2.5deg)" }}>
                    <span className="tape -top-3 left-1/2 -translate-x-1/2" aria-hidden />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/collase-kertas.png" alt="Kolase kertas scrapbook — unggah foto profil Anda melalui panel admin" className="aspect-[4/5] w-full bg-kraft-100 object-cover" />
                    <p className="font-hand absolute bottom-3 left-0 w-full px-3 text-center text-lg leading-tight text-cocoa-500">
                      unggah foto aslimu di panel admin
                    </p>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-5 -right-4 hidden rotate-6 bg-blush-200 px-3 py-2 sm:block" aria-hidden>
                <DoodleStar className="h-5 w-5 text-terra-600" />
              </div>
              <div className="absolute -left-6 bottom-14 hidden -rotate-12 lg:block" aria-hidden>
                <DoodleFlower className="h-12 w-auto text-sage-500" />
              </div>
            </div>
            {foto && (
              <p className="note-paper mx-auto mt-8 max-w-[340px] px-4 py-3 text-center">
                <span className="font-hand text-2xl leading-tight text-cocoa-600">“{s.hero_quote || "Guru hari ini, untuk masa depan mereka."}”</span>
              </p>
            )}
          </div>

          {/* kanan: identitas */}
          <div className="order-1 lg:order-2">
            <p className="label-caps flex items-center gap-3 text-terra-600">
              <span className="inline-block h-[1.5px] w-9 bg-terra-400" aria-hidden />
              {s.hero_kicker || "Halo, saya"}
            </p>

            <h1 className="font-serif-display mt-5 text-[clamp(2.4rem,6.4vw,4.2rem)] font-semibold leading-[0.95] text-cocoa-700">
              {namaBesar}
            </h1>

            <p className="font-serif-display mt-3 text-xl italic text-terra-600 sm:text-2xl">{subjudul}</p>

            <div className="mt-6 inline-flex items-center gap-2 bg-blush-100 px-4 py-2">
              <DoodleGradCap className="h-5 w-7 text-terra-600" aria-hidden />
              <span className="label-caps text-cocoa-600">{s.site_title || "E-Portofolio PPG"}</span>
            </div>

            <dl className="mt-7 max-w-xl grid gap-0 border-t border-kraft-300">
              {identitas.map((x) => (
                <div key={x.label} className="grid gap-0.5 border-b border-dashed border-kraft-200 py-3 sm:grid-cols-[124px_1fr] sm:gap-4">
                  <dt className="label-caps text-terra-600">{x.label}</dt>
                  <dd className="text-[14.5px] font-medium leading-relaxed text-cocoa-600">{x.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/profilku" className="label-caps group inline-flex items-center gap-3 bg-cocoa-700 px-7 py-4 text-cream hover:bg-terra-600">
                Jelajahi Profil Saya
                <DoodleArrow className="h-3.5 w-6 transition group-hover:translate-x-1" />
              </Link>
              <Link href="/lk" className="label-caps sketch inline-flex items-center gap-3 bg-paper px-7 py-4 text-cocoa-700 hover:border-terra-400 hover:text-terra-600">
                Lihat Lembar Kerja <span aria-hidden>→</span>
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <DoodleArrowDown className="h-8 w-5 text-terra-400" aria-hidden />
              <span className="font-hand text-xl leading-none text-cocoa-400">{s.about_note || "jurnal perjalanan menjadi guru"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TENTANG SAYA ================= */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <SectionTab tone="blush">Tentang Saya</SectionTab>
              <h2 className="font-serif-display mt-4 text-[clamp(1.9rem,4.4vw,2.9rem)] font-semibold leading-[1.08] text-cocoa-700">
                Perjalanan yang
                <br />
                membentuk arah
              </h2>
              <div className="mt-4">
                <ScribbleUnderline className="h-3 w-48 text-terra-400" />
              </div>
              <div className="relative mt-8 max-w-[250px]">
                <span className="tape tape-sage -top-3 left-8" style={{ transform: "rotate(-6deg)" }} aria-hidden />
                <div className="bg-paper p-2.5 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/sketsa-buku.png" alt="Sketsa buku catatan dan bunga" className="h-auto w-full" loading="lazy" />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sage-500" aria-hidden>
                <DoodleLeaf className="h-8 w-auto" />
                <DoodleStar className="h-4 w-4 text-terra-400" />
              </div>
            </Reveal>
          </div>

          <div>
            <Reveal>
              <div className="relative">
                <div className="absolute -right-3 -top-3 hidden h-full w-full bg-blush-100 torn-soft sm:block" aria-hidden />
                <article className="torn relative bg-paper px-6 py-8 sm:px-10 sm:py-10">
                  <span className="tape -top-3 right-10" style={{ transform: "rotate(4deg)" }} aria-hidden />
                  <p className="label-caps text-cocoa-400">Perkenalan</p>
                  <h3 className="font-serif-display mt-2 text-2xl font-semibold text-cocoa-700">Tentang Saya</h3>
                  <div className="mt-5">
                    <ExpandableText text={s.about_text} limit={360} href="/profilku/identitas" />
                  </div>
                  <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-dashed border-kraft-200 pt-5">
                    <span className="font-hand text-xl text-cocoa-400">{s.about_note}</span>
                    <span className="font-serif-display text-right text-lg font-semibold italic text-terra-600">— {owner}</span>
                  </div>
                </article>
              </div>
            </Reveal>

            {kata[0] && (
              <Reveal delay={80}>
                <div className="note-paper relative mt-10 px-6 py-7 sm:px-8">
                  <span className="tape tape-kraft -top-3 left-6" style={{ transform: "rotate(-4deg)" }} aria-hidden />
                  <p className="label-caps text-terra-600">{kata[0].title}</p>
                  <div className="mt-4">
                    <RichText text={kata[0].body} />
                  </div>
                  <p className="font-serif-display mt-5 text-right text-base font-semibold italic text-cocoa-500">— {owner}</p>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ================= TUJUAN PORTOFOLIO ================= */}
      <section className="border-y border-kraft-200 bg-sand-100 paper-fiber">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <Reveal>
            <SectionHead
              eyebrow="Tujuan Portofolio"
              num="01"
              title="Mengapa Portofolio Ini Disusun?"
              desc="Sebuah ruang untuk mendokumentasikan proses, merefleksikan pengalaman, dan merayakan pertumbuhan sebagai calon pendidik."
            />
          </Reveal>

          {tujuan.length === 0 ? (
            <div className="mt-12">
              <EmptyState icon="◎" title="Belum ada tujuan yang ditambahkan" desc="Tujuan portofolio dapat dikelola melalui panel admin — menu Beranda → Tujuan Portofolio." />
            </div>
          ) : (
            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              {tujuan.slice(0, 6).map((t, i) => (
                <Reveal key={t.id} delay={i * 70}>
                  <article className={`torn sketch-shift relative h-full ${TUJUAN_TONE[i % 4]} px-6 py-7 sm:px-8`}>
                    <span className={`tape ${i % 2 === 0 ? "tape-kraft" : ""} -top-3 left-8`} style={{ transform: `rotate(${i % 2 === 0 ? -5 : 5}deg)` }} aria-hidden />
                    <div className="flex items-start gap-4">
                      <span className="grid h-14 w-14 shrink-0 place-items-center bg-paper text-2xl shadow-sm" aria-hidden>
                        {t.meta?.icon || TUJUAN_ICON[i % 4]}
                      </span>
                      <span className="font-serif-display ml-auto text-4xl font-semibold text-cocoa-700/20" aria-hidden>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="font-serif-display mt-4 text-[1.2rem] font-semibold leading-snug text-cocoa-700">{t.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-cocoa-600">{t.body}</p>
                    <DoodlePencil className="mt-5 h-3.5 w-14 text-cocoa-400" aria-hidden />
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= PERJALANAN PPG ================= */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="grid-faint pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <SectionHead
              eyebrow="Gambaran Perjalanan"
              num="02"
              title="Perjalanan Saya dalam PPG"
              desc="Dari belajar menjadi pendidik hingga belajar memahami murid."
            />
          </Reveal>

          {journey.length === 0 ? (
            <div className="mt-12">
              <EmptyState
                icon="✎"
                title="Belum ada tahapan perjalanan yang ditambahkan"
                desc="Linimasa ini terisi dari panel admin — menu Beranda → Gambaran Perjalanan PPG. Tidak ada tahapan yang dikarang."
              />
            </div>
          ) : (
            <>
              <div className="relative mt-14 hidden lg:block">
                <span className="absolute left-0 right-0 top-7 border-t-2 border-dashed border-kraft-300" aria-hidden />
                <ol className="relative grid grid-cols-5 gap-6">
                  {journey.slice(0, 5).map((j, i) => (
                    <Reveal key={j.id} delay={i * 90}>
                      <li className="relative">
                        <span className="font-serif-display relative z-10 grid h-14 w-14 place-items-center rounded-full bg-paper text-lg font-semibold text-terra-600 ring-1 ring-kraft-300">
                          {i + 1}
                        </span>
                        <div className="mt-5">
                          {j.meta?.period && <span className="label-caps text-terra-600">{j.meta.period}</span>}
                          <h3 className="font-serif-display mt-2 text-[1.05rem] font-semibold leading-snug text-cocoa-700">{j.title}</h3>
                          <p className="mt-2 text-[13.5px] leading-relaxed text-cocoa-500">{j.body}</p>
                        </div>
                      </li>
                    </Reveal>
                  ))}
                </ol>
              </div>

              <ol className="relative mt-10 grid gap-8 lg:hidden">
                <span className="absolute left-[26px] top-3 h-[calc(100%-1.5rem)] w-[1.5px] bg-kraft-300" aria-hidden />
                {journey.slice(0, 5).map((j, i) => (
                  <Reveal key={j.id} delay={i * 60}>
                    <li className="relative flex gap-5">
                      <span className="font-serif-display relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper text-base font-semibold text-terra-600 ring-1 ring-kraft-300">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        {j.meta?.period && <span className="label-caps text-terra-600">{j.meta.period}</span>}
                        <h3 className="font-serif-display mt-1.5 text-lg font-semibold leading-snug text-cocoa-700">{j.title}</h3>
                        <p className="mt-1.5 text-[14.5px] leading-relaxed text-cocoa-500">{j.body}</p>
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </>
          )}

          <Reveal>
            <div className="mt-12 flex flex-wrap items-center gap-5">
              <Link href="/profilku/pendidikan" className="label-caps group inline-flex items-center gap-3 bg-cocoa-700 px-7 py-4 text-cream hover:bg-terra-600">
                Baca Perjalanan Saya
                <DoodleArrow className="h-3.5 w-6 transition group-hover:translate-x-1" />
              </Link>
              <span className="font-hand text-xl text-cocoa-400">lima tahap yang membentuk cara saya mengajar</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= PENUTUP ================= */}
      <section className="relative overflow-hidden border-y border-sage-300 bg-sage-100 paper-fiber">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-25" aria-hidden />
        <div className="pointer-events-none absolute -left-8 bottom-4 hidden h-40 w-40 bg-sage-200/80 torn-soft lg:block" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 sm:py-24">
          <Reveal>
            <div className="mx-auto mb-8 flex items-center justify-center gap-4 text-sage-500" aria-hidden>
              <DoodleBook className="h-9 w-14" />
              <DoodleStar className="h-4 w-4 text-terra-400" />
              <DoodleSchool className="h-16 w-24" />
            </div>
            <SectionTab tone="sage">Penutup</SectionTab>
            <h2 className="font-serif-display mx-auto mt-5 max-w-2xl text-[clamp(1.9rem,4.6vw,2.9rem)] font-semibold leading-[1.1] text-cocoa-700">
              Setiap Perjalanan adalah Ruang untuk Bertumbuh
            </h2>
            <ScribbleUnderline className="mx-auto mt-4 h-3 w-56 text-terra-400" />
            <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-cocoa-600">
              Jelajahi kisah perjalanan saya, kompetensi yang terus dikembangkan, serta karya dan refleksi pembelajaran selama
              Pendidikan Profesi Guru.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link href="/profilku" className="label-caps bg-cocoa-700 px-7 py-4 text-cream hover:bg-terra-600">
                Lihat Profil Saya
              </Link>
              <Link href="/lk" className="label-caps sketch bg-paper px-7 py-4 text-cocoa-700 hover:border-terra-400 hover:text-terra-600">
                Jelajahi Lembar Kerja
              </Link>
            </div>

            <div className="mt-14 flex flex-wrap items-center justify-center gap-2">
              {LK_TYPES.map((t, i) => (
                <Link
                  key={t.type}
                  href={`/lk/${t.slug}`}
                  className="label-caps flex items-center gap-2 bg-paper px-3.5 py-2.5 text-cocoa-500 hover:text-terra-600"
                >
                  <span className="text-terra-400" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                  {t.label.replace("Analisis ", "").replace("Instrumen Penilaian & Analisisnya", "Instrumen Penilaian")}
                </Link>
              ))}
            </div>

            <ClassroomSketch className="mx-auto mt-12 h-auto w-full max-w-2xl text-sage-500/70" />
            <span className="font-hand mt-4 inline-flex items-center gap-2 text-xl text-cocoa-400">
              <DoodleHeart className="h-4 w-4 text-terra-400" aria-hidden /> terima kasih telah membaca jurnal saya
            </span>
          </Reveal>
        </div>
      </section>
    </div>
  );
}