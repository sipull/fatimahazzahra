import Link from "next/link";
import { getAllSettings } from "@/lib/data";
import { Annotation, DashedDivider, DoodleArrow, DoodleGradCap } from "@/components/site/Doodles";
import { EmptyState, Reveal, RichText, SectionTab } from "@/components/site/ui";

export const dynamic = "force-dynamic";

function Block({ label, text, num }: { label: string; text: string; num: string }) {
  if (!text?.trim()) return null;
  return (
    <section className="border-t border-kraft-300 py-8">
      <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:gap-10">
        <span className="label-caps text-terra-600 sm:w-44">
          <span className="font-serif-display mr-2 text-lg text-kraft-300">{num}</span>
          {label}
        </span>
        <RichText text={text} className="max-w-2xl" />
      </div>
    </section>
  );
}

export default async function CvPage() {
  const s = await getAllSettings();
  const name = s.full_name || s.owner_name || "Fatimah Azzahra’, S.Pd.";
  const cvFile = s.cv_file?.trim();
  const hasAny = [s.cv_summary, s.cv_education, s.cv_experience, s.cv_training, s.cv_skills, s.cv_achievements, s.cv_extra].some((x) => x?.trim());

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
      <Reveal>
        <SectionTab tone="blush">Profilku • 02</SectionTab>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="font-serif-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-semibold leading-none text-cocoa-700">
              Curriculum Vitae
            </h1>
            <p className="mt-3 flex items-center gap-2 text-[15px] text-cocoa-500">
              <DoodleGradCap className="h-5 w-7 text-terra-500" aria-hidden /> {name}
            </p>
          </div>
          {cvFile && (
            <div className="flex gap-2">
              <a href={cvFile} target="_blank" rel="noopener noreferrer" className="label-caps bg-cocoa-700 px-5 py-3 text-cream hover:bg-terra-600">
                Buka PDF
              </a>
              <a href={`${cvFile}${cvFile.includes("?") ? "&" : "?"}download=1`} className="label-caps sketch-soft bg-paper px-5 py-3 text-cocoa-600 hover:text-terra-600">
                Unduh
              </a>
            </div>
          )}
        </div>
        <DashedDivider className="mt-7 text-kraft-300" />
      </Reveal>

      <Reveal delay={60}>
        <div className="torn relative mt-8 bg-paper px-6 py-8 sm:px-10 sm:py-10">
          <span className="tape -top-3 left-10" style={{ transform: "rotate(-4deg)" }} aria-hidden />

          {s.cv_summary?.trim() && (
            <section className="pb-8">
              <p className="label-caps text-terra-600">Ringkasan profil</p>
              <div className="mt-4">
                <RichText text={s.cv_summary} dropcap />
              </div>
            </section>
          )}

          <Block num="01" label="Riwayat pendidikan" text={s.cv_education || ""} />
          <Block num="02" label="Pengalaman kerja & pendidikan" text={s.cv_experience || ""} />
          <Block num="03" label="Pelatihan & sertifikasi" text={s.cv_training || ""} />
          <Block num="04" label="Kompetensi utama" text={s.cv_skills || ""} />
          <Block num="05" label="Pengalaman organisasi" text={s.cv_extra || ""} />
          <Block num="06" label="Prestasi" text={s.cv_achievements || ""} />

          {!hasAny && (
            <div className="py-6">
              <EmptyState
                icon="⌸"
                title="Belum ada informasi CV yang ditambahkan"
                desc="Isi melalui panel admin → Pengaturan → tab Curriculum Vitae."
              />
            </div>
          )}

          <DashedDivider className="text-kraft-300" />
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <Annotation>detail perjalanan akademik ada di submenu berikutnya →</Annotation>
            <div className="flex flex-wrap gap-3">
              <Link href="/profilku/pendidikan" className="label-caps sketch-soft bg-paper px-5 py-3 text-cocoa-600 hover:text-terra-600">
                Linimasa Pendidikan
              </Link>
              <Link href="/profilku/kompetensi" className="label-caps bg-cocoa-700 px-5 py-3 text-cream hover:bg-terra-600">
                Kompetensi <DoodleArrow className="ml-1 inline h-3 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      {cvFile && (
        <Reveal delay={100}>
          <div className="torn-soft mt-10 bg-kraft-100 p-3">
            <iframe src={cvFile} title={`Pratinjau CV ${name}`} className="aspect-[1/1.414] w-full bg-paper" />
          </div>
          <p className="label-caps mt-3 text-center text-cocoa-400">Pratinjau dokumen CV</p>
        </Reveal>
      )}
    </div>
  );
}
