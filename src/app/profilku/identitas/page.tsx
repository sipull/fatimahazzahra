import { getAllSettings } from "@/lib/data";
import { Polaroid, Reveal, SectionTab, RichText } from "@/components/site/ui";
import { Annotation, DoodleFlower, DoodleStar, ScribbleUnderline } from "@/components/site/Doodles";

export const dynamic = "force-dynamic";

export default async function IdentitasPage() {
  const s = await getAllSettings();
  const photo = s.profile_photo?.trim() || s.hero_image?.trim();
  const pos = s.profile_photo_pos || s.hero_image_pos || "50% 30%";
  const name = s.full_name || s.owner_name || "Fatimah Azzahra’, S.Pd.";
  const rows: Array<{ label: string; value: string; show: boolean }> = [
    { label: "Nama lengkap", value: name, show: true },
    { label: "Alamat", value: s.address, show: s.show_address === "true" && !!s.address?.trim() },
    { label: "Program studi", value: s.study_program, show: !!s.study_program?.trim() },
    { label: "Universitas", value: s.university, show: !!s.university?.trim() },
    { label: "Tempat & tanggal lahir", value: s.birth_info, show: s.show_birth === "true" && !!s.birth_info?.trim() },
    { label: "Email / kontak", value: s.email, show: s.show_email === "true" && !!s.email?.trim() },
  ];

  return (
    <div>
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <Reveal>
              <div className="relative mx-auto max-w-[340px]">
                <div className="absolute -left-5 -top-5 hidden h-full w-full bg-kraft-200/80 torn-soft sm:block" aria-hidden />
                {photo ? (
                  <Polaroid src={photo} alt={name} pos={pos} rotate={-2.5} caption={name} />
                ) : (
                  <div className="polaroid" style={{ transform: "rotate(-2.5deg)" }}>
                    <span className="tape -top-3 left-1/2 -translate-x-1/2" aria-hidden />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/collase-kertas.png" alt="Placeholder kolase kertas" className="aspect-[4/5] w-full bg-kraft-100 object-cover" />
                    <p className="font-hand absolute bottom-3 left-0 w-full px-3 text-center text-lg leading-tight text-cocoa-500">foto menyusul</p>
                  </div>
                )}
              </div>
              <p className="label-caps mt-7 text-center text-cocoa-400">Potret — E-Portofolio PPG</p>
              <div className="mt-4 flex items-center justify-center gap-3 text-sage-500" aria-hidden>
                <DoodleFlower className="h-8 w-auto" />
                <DoodleStar className="h-4 w-4 text-terra-400" />
              </div>
            </Reveal>
          </div>

          <div>
            <Reveal>
              <SectionTab tone="blush">Profilku • 01</SectionTab>
              <h1 className="font-serif-display mt-4 text-[clamp(2rem,4.6vw,3rem)] font-semibold leading-[1.05] text-cocoa-700">{name}</h1>
              <div className="mt-3">
                <ScribbleUnderline className="h-3 w-48 text-terra-400" />
              </div>
              <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-cocoa-500">{s.short_bio}</p>
            </Reveal>

            <Reveal delay={80}>
              <dl className="mt-9 grid">
                {rows
                  .filter((r) => r.show)
                  .map((r) => (
                    <div key={r.label} className="grid gap-1 border-t border-kraft-300 py-4 sm:grid-cols-[168px_1fr] sm:gap-6">
                      <dt className="label-caps text-terra-600">{r.label}</dt>
                      <dd className="text-[15px] font-medium leading-relaxed text-cocoa-700">{r.value}</dd>
                    </div>
                  ))}
              </dl>

              {(!s.show_address || !s.show_email || !s.show_birth) && (
                <p className="torn-soft mt-6 bg-sage-100 px-5 py-4 text-sm leading-relaxed text-sage-600">
                  🔒 Sebagian data pribadi disembunyikan dari halaman publik demi privasi. Bisa diaktifkan melalui panel admin →
                  Pengaturan → Identitas Diri.
                </p>
              )}
            </Reveal>

            {s.about_text?.trim() && (
              <Reveal delay={140}>
                <article className="torn relative mt-10 bg-paper px-6 py-8 sm:px-9">
                  <span className="tape -top-3 left-8" style={{ transform: "rotate(-4deg)" }} aria-hidden />
                  <p className="label-caps text-terra-600">Tentang Saya</p>
                  <div className="mt-4">
                    <RichText text={s.about_text} dropcap />
                  </div>
                  {s.extra_info?.trim() && (
                    <p className="mt-5 border-t border-dashed border-kraft-200 pt-4 text-[15px] leading-relaxed text-cocoa-500">{s.extra_info}</p>
                  )}
                </article>
              </Reveal>
            )}

            <Reveal delay={180}>
              <Annotation className="mt-8 block">data ini dapat saya perbarui kapan saja lewat panel pengelola</Annotation>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
