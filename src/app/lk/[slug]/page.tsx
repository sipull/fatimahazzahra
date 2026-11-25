import Link from "next/link";
import { notFound } from "next/navigation";
import { getContentTypeBySlug, LK_TYPES } from "@/lib/types";
import { listEntries } from "@/lib/data";
import { Annotation, DashedDivider } from "@/components/site/Doodles";
import { EmptyState, PageHero, Reveal, SectionTab } from "@/components/site/ui";

export const dynamic = "force-dynamic";

export default async function LkCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const def = getContentTypeBySlug(slug);
  if (!def || def.group !== "lk") notFound();
  const items = await listEntries({ type: def.type });
  const idx = LK_TYPES.findIndex((t) => t.type === def.type) + 1;

  return (
    <div>
      <PageHero
        eyebrow={`Lembar Kerja ${String(idx).padStart(2, "0")}`}
        num={def.icon}
        title={def.label}
        desc={def.description}
        crumbs={[{ label: "Beranda", href: "/" }, { label: "Lembar Kerja", href: "/lk" }, { label: def.label }]}
      />

      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <Reveal>
          <nav aria-label="Kategori Lembar Kerja">
            <SectionTab tone="kraft">Kategori lain</SectionTab>
            <div className="mt-4 flex flex-wrap gap-2">
              {LK_TYPES.map((t, i) => (
                <Link
                  key={t.type}
                  href={`/lk/${t.slug}`}
                  aria-current={t.slug === slug ? "page" : undefined}
                  className={`label-caps px-3.5 py-2 transition ${
                    t.slug === slug ? "bg-cocoa-700 text-cream" : "sketch-soft bg-paper text-cocoa-500 hover:text-terra-600"
                  }`}
                >
                  <span className="mr-1.5 text-terra-400">{String(i + 1).padStart(2, "0")}</span>
                  {t.label.replace("Analisis ", "").replace("Instrumen Penilaian & Analisisnya", "Instrumen Penilaian")}
                </Link>
              ))}
            </div>
            <DashedDivider className="mt-8 text-kraft-300" />
          </nav>
        </Reveal>

        <div className="mt-10">
          {items.length === 0 ? (
            <EmptyState
              icon="✎"
              title={def.emptyMessage}
              desc="Kategori ini akan diisi pemilik portofolio melalui panel admin, lengkap dengan uraian analisis, dokumen, foto, dan tautan pendukung."
            />
          ) : (
            <>
              <p className="label-caps text-cocoa-400">{items.length} entri pada kategori ini</p>
              <div className="mt-4">
                <FilterableEntriesAlias entries={items} />
              </div>
            </>
          )}
        </div>

        <Reveal>
          <Annotation className="mt-14 block text-center">dokumen terbatas hanya dapat dibuka pemilik portofolio</Annotation>
        </Reveal>
      </div>
    </div>
  );
}

import { FilterableEntries } from "@/components/site/ui";
function FilterableEntriesAlias({ entries }: { entries: Awaited<ReturnType<typeof listEntries>> }) {
  return <FilterableEntries entries={entries} basePath="/detail" />;
}
