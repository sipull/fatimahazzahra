import Link from "next/link";
import { notFound } from "next/navigation";
import { CONTENT_TYPES, GROUP_META } from "@/lib/types";
import { listEntries } from "@/lib/data";
import { Annotation, DashedDivider } from "@/components/site/Doodles";
import { EmptyState, FilterableEntries, PageHero, Reveal, SectionTab } from "@/components/site/ui";

export const dynamic = "force-dynamic";

export default async function RefleksiIndexPage() {
  const group = GROUP_META.refleksi;
  const types = CONTENT_TYPES.filter((t) => t.group === "refleksi");
  if (types.length === 0) notFound();

  const lists = await Promise.all(types.map(async (t) => ({ t, items: await listEntries({ type: t.type }) })));

  return (
    <div>
      <PageHero
        eyebrow={group.label}
        num="Bab III"
        title="Refleksi perjalanan belajar & PPL"
        desc="Refleksi mata kuliah semester 1, semester 2, serta refleksi selama praktik pengalaman lapangan (PPL) mandiri."
        crumbs={[{ label: "Beranda", href: "/" }, { label: "Refleksi" }]}
      />

      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-14">
          {lists.map(({ t, items }, gi) => (
            <section key={t.type} id={t.slug}>
              <Reveal>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <SectionTab tone={gi % 2 === 0 ? "kraft" : "blush"}>
                      {t.icon} {t.label}
                    </SectionTab>
                    <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-cocoa-500">{t.description}</p>
                  </div>
                  <Link href={`/lk/${t.slug}`} className="label-caps link-underline text-terra-600">
                    kelola di panel admin →
                  </Link>
                </div>
                <DashedDivider className="mt-6 text-kraft-300" />
              </Reveal>

              <div className="mt-8">
                {items.length === 0 ? (
                  <EmptyState
                    icon="✎"
                    title={t.emptyMessage}
                    desc="Refleksi ini akan diisi pemilik portofolio melalui panel admin, lengkap dengan uraian, foto, dokumen, dan tautan pendukung."
                  />
                ) : (
                  <FilterableEntries entries={items} basePath="/detail" />
                )}
              </div>
            </section>
          ))}
        </div>

        <Reveal>
          <Annotation className="mt-16 block text-center">
            <Link href="/profilku" className="link-underline">← kembali ke Profilku</Link> •{" "}
            <Link href="/karya-inovasi" className="link-underline">lihat Karya Inovasi Pendidikan →</Link>
          </Annotation>
        </Reveal>
      </div>
    </div>
  );
}


