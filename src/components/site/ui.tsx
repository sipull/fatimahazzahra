"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { EntryDTO } from "@/lib/types";
import {
  DashedDivider,
  DoodleArrow,
  DoodleFlower,
  DoodlePencil,
  DoodleStar,
  ScribbleUnderline,
  ArchiveSketch,
  DoodleLeaf,
} from "./Doodles";

/* ================= Reveal on scroll ================= */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (ents) => {
        for (const e of ents) {
          if (e.isIntersecting) {
            el.classList.add("is-visible");
            obs.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className="reveal" style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ================= Reading progress ================= */
export function ReadingProgress() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setW(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="h-[3px] w-full overflow-hidden bg-kraft-200" role="progressbar" aria-label="Progres membaca">
      <div className="h-full bg-terra-500 transition-[width] duration-150" style={{ width: `${w}%` }} />
    </div>
  );
}

/* ================= Tab jurnal / label kertas ================= */
export function SectionTab({ children, tone = "kraft" }: { children: ReactNode; tone?: "kraft" | "blush" | "sage" }) {
  const bg = tone === "blush" ? "bg-blush-200" : tone === "sage" ? "bg-sage-200" : "bg-kraft-200";
  return (
    <span className={`${bg} label-caps inline-block px-4 py-2 text-cocoa-600`} style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 11px) 100%, 0 100%)" }}>
      {children}
    </span>
  );
}

/* ================= Section head ================= */
export function SectionHead({
  eyebrow,
  title,
  desc,
  align = "center",
  num,
  ornament = true,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  align?: "center" | "left";
  num?: string;
  ornament?: boolean;
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <div className={`flex flex-wrap items-center gap-3 ${align === "center" ? "justify-center" : ""}`}>
        <SectionTab>{eyebrow}</SectionTab>
        {num && <span className="label-caps text-terra-500">{num}</span>}
      </div>
      <h2 className="font-serif-display mt-4 text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.12] text-cocoa-700">{title}</h2>
      {ornament && (
        <div className={`mt-3 flex ${align === "center" ? "justify-center" : ""}`}>
          <ScribbleUnderline className="h-3 w-44 text-terra-400" />
        </div>
      )}
      {desc && <p className="mt-4 text-[15px] leading-relaxed text-cocoa-500">{desc}</p>}
    </div>
  );
}

/* ================= Page hero ================= */
export function PageHero({
  eyebrow,
  title,
  desc,
  crumbs,
  num,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  crumbs?: Array<{ label: string; href?: string }>;
  num?: string;
}) {
  return (
    <div className="relative overflow-hidden border-b border-kraft-200 bg-cream paper-fiber">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-35" aria-hidden />
      <div className="pointer-events-none absolute -right-10 -top-6 h-40 w-40 bg-kraft-200/70 torn-soft" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-5 pb-9 pt-10 sm:px-8 sm:pb-12 sm:pt-14">
        {crumbs && (
          <nav className="mb-6 flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={i} className="label-caps flex items-center gap-2 text-cocoa-400">
                {i > 0 && <span className="text-terra-400">/</span>}
                {c.href ? (
                  <Link href={c.href} className="link-underline hover:text-terra-600">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-cocoa-700">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <p className="label-caps flex items-center gap-3 text-terra-600">
              {num && <span className="font-hand text-2xl normal-case tracking-normal text-cocoa-400">{num}</span>}
              {eyebrow}
            </p>
            <h1 className="font-serif-display mt-3 text-[clamp(2.1rem,5.4vw,3.5rem)] font-semibold leading-[1.05] text-cocoa-700">{title}</h1>
            {desc && <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-cocoa-500">{desc}</p>}
          </div>
          <div className="hidden shrink-0 items-end gap-3 text-sage-500 lg:flex" aria-hidden>
            <DoodleLeaf className="float-slow h-14 w-auto" />
            <DoodleStar className="h-5 w-5 text-terra-400" />
          </div>
        </div>
        <DashedDivider className="mt-8 text-kraft-300" />
      </div>
      <ReadingProgress />
    </div>
  );
}

/* ================= Kertas catatan / kutipan ================= */
export function NotePaper({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`note-paper px-6 py-7 sm:px-8 ${className}`}>{children}</div>;
}

/* ================= Rich text (list, sub-judul, bold) ================= */
function inline(text: string, keyBase: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={`${keyBase}-${i}`}>{p.slice(2, -2)}</strong> : <span key={`${keyBase}-${i}`}>{p}</span>
  );
}

export function RichText({ text, dropcap = false, className = "" }: { text?: string | null; dropcap?: boolean; className?: string }) {
  if (!text) return null;
  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className={`prose-portofolio ${className}`}>
      {blocks.map((block, bi) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);

        // daftar bernomor murni: "1. ..." di setiap baris
        if (lines.length > 0 && lines.every((l) => /^\d+[.)]\s+/.test(l))) {
          return (
            <ol key={bi} className="my-4 grid gap-2.5">
              {lines.map((l, li) => {
                const m = l.match(/^(\d+)[.)]\s+(.*)$/);
                return (
                  <li key={li} className="flex gap-3">
                    <span className="font-serif-display mt-0.5 shrink-0 text-sm font-semibold text-terra-500">{m?.[1]}.</span>
                    <span className="text-[15px] leading-relaxed text-cocoa-600">{inline(m?.[2] ?? l, `${bi}-${li}`)}</span>
                  </li>
                );
              })}
            </ol>
          );
        }
        // daftar berbutir
        if (lines.length > 0 && lines.every((l) => /^[-•*]\s+/.test(l))) {
          return (
            <ul key={bi} className="my-4 grid gap-2.5">
              {lines.map((l, li) => (
                <li key={li} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-400" aria-hidden />
                  <span className="text-[15px] leading-relaxed text-cocoa-600">{inline(l.replace(/^[-•*]\s+/, ""), `${bi}-${li}`)}</span>
                </li>
              ))}
            </ul>
          );
        }

        // butir bernomor dengan judul tebal + uraian: "**1. Judul**\nUraian..."
        const headNum = lines[0]?.match(/^\*\*(\d+)[.)]\s*(.+?)\*\*$/);
        if (headNum) {
          return (
            <div key={bi} className="my-5 border-t border-kraft-200 pt-5 first:border-0 first:pt-0">
              <h4 className="flex items-baseline gap-2.5">
                <span className="font-serif-display text-lg font-semibold text-terra-500">{headNum[1]}.</span>
                <span className="font-serif-display text-[1.05rem] font-semibold leading-snug text-cocoa-700">{headNum[2]}</span>
              </h4>
              {lines.length > 1 && (
                <p className="mt-2 pl-7 text-[15px] leading-[1.85] text-cocoa-600">{inline(lines.slice(1).join(" "), `${bi}-body`)}</p>
              )}
            </div>
          );
        }

        // sub-judul tebal menonjol: "**Judul Bagian**"
        const subOnly = lines.length === 1 && /^\*\*[^*]+\*\*$/.test(lines[0]);
        if (subOnly) {
          return (
            <h4 key={bi} className="font-serif-display mt-6 mb-2 text-lg font-semibold text-cocoa-700 first:mt-0">
              {lines[0].slice(2, -2)}
            </h4>
          );
        }

        // blok dengan baris pertama tebal
        if (lines.length > 1 && /^\*\*[^*]+\*\*$/.test(lines[0])) {
          return (
            <div key={bi} className="my-5">
              <h4 className="font-serif-display text-[1.05rem] font-semibold text-cocoa-700">{lines[0].slice(2, -2)}</h4>
              <p className="mt-1.5 text-[15px] leading-[1.85] text-cocoa-600">{inline(lines.slice(1).join(" "), `${bi}-body`)}</p>
            </div>
          );
        }

        return (
          <p key={bi} className={dropcap && bi === 0 ? "dropcap" : undefined}>
            {inline(lines.join(" "), `${bi}`)}
          </p>
        );
      })}
    </div>
  );
}

/** Nama lama dipertahankan agar kompatibel */
export function BodyText({ text, dropcap = false }: { text?: string | null; dropcap?: boolean }) {
  return <RichText text={text} dropcap={dropcap} />;
}

/* ================= Polaroid ================= */
export function Polaroid({
  src,
  alt,
  caption,
  pos,
  aspect = "aspect-[4/5]",
  rotate = -2,
  tape = "blush",
  className = "",
  children,
}: {
  src: string;
  alt: string;
  caption?: string;
  pos?: string;
  aspect?: string;
  rotate?: number;
  tape?: "blush" | "kraft" | "sage";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`polaroid relative ${className}`} style={{ transform: `rotate(${rotate}deg)` }}>
      <span
        className={`tape -top-3 left-1/2 -translate-x-1/2 ${tape === "kraft" ? "tape-kraft" : tape === "sage" ? "tape-sage" : ""}`}
        style={{ transform: `translateX(-50%) rotate(${rotate > 0 ? -4 : 4}deg)` }}
        aria-hidden
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={`${aspect} bg-kraft-100`} style={pos ? { objectPosition: pos } : undefined} />
      {caption && <p className="font-hand absolute bottom-3 left-0 w-full px-3 text-center text-lg leading-tight text-cocoa-500">{caption}</p>}
      {children}
    </div>
  );
}

/* ================= Empty state ================= */
export function EmptyState({
  icon = "✎",
  title,
  desc,
  action,
}: {
  icon?: string;
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-xl py-6 text-center">
      <div className="relative mx-auto w-full max-w-sm">
        <div className="torn-soft bg-kraft-100 p-6">
          <ArchiveSketch className="mx-auto h-auto w-full text-cocoa-400" />
        </div>
        <span className="absolute -right-1 top-2 text-terra-400" aria-hidden>
          <DoodleStar className="h-6 w-6" />
        </span>
      </div>
      <p className="label-caps mt-4 text-terra-600">Halaman masih kosong</p>
      <h3 className="font-serif-display mt-2 text-xl font-semibold text-cocoa-700">{title}</h3>
      {desc && <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cocoa-500">{desc}</p>}
      {action && <div className="mt-6">{action}</div>}
      <p className="font-hand mt-4 text-xl text-cocoa-400">{icon} segera dilengkapi, insya Allah</p>
    </div>
  );
}

/* ================= Entry card (potongan kertas) ================= */
export function EntryCard({ entry, href, index }: { entry: EntryDTO; href: string; index?: number }) {
  const cat = entry.meta?.category || entry.meta?.jenjang;
  return (
    <Link href={href} className="group block h-full">
      <article className="torn sketch-shift relative h-full bg-paper p-5 pt-7">
        <span className="tape -top-3 left-6" style={{ transform: "rotate(-5deg)" }} aria-hidden />
        {typeof index === "number" && (
          <span className="font-serif-display absolute right-4 top-2 text-3xl font-semibold text-kraft-300" aria-hidden>
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
        <div className="relative mb-4 overflow-hidden border border-kraft-200 bg-kraft-100">
          {entry.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={entry.imageUrl} alt={entry.title} className="h-40 w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
          ) : (
            <div className="relative grid h-28 w-full place-items-center bg-blush-100">
              <DoodlePencil className="h-4 w-14 text-cocoa-400" />
              <span className="font-hand absolute bottom-2 right-3 text-lg text-cocoa-400">belum ada foto</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {cat && <span className="label-caps text-terra-600">{cat}</span>}
          {entry.meta?.period && <span className="label-caps text-cocoa-400">{entry.meta.period}</span>}
        </div>
        <h3 className="font-serif-display mt-2 text-lg font-semibold leading-snug text-cocoa-700 group-hover:text-terra-600">{entry.title}</h3>
        <p className="line-clamp-2 mt-2 text-sm leading-relaxed text-cocoa-500">
          {entry.excerpt || (entry.body ? entry.body.replace(/\*/g, "").slice(0, 150) : "")}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-dashed border-kraft-200 pt-3">
          <span className="flex gap-3">
            {entry.files?.length > 0 && <span className="label-caps text-cocoa-400">📎 {entry.files.length}</span>}
            {entry.links?.length > 0 && <span className="label-caps text-cocoa-400">🔗 {entry.links.length}</span>}
          </span>
          <span className="label-caps flex items-center gap-1.5 text-terra-600">
            Baca <DoodleArrow className="h-3 w-5 transition group-hover:translate-x-1" />
          </span>
        </div>
      </article>
    </Link>
  );
}

/* ================= Filter + list ================= */
export function FilterableEntries({ entries, basePath }: { entries: EntryDTO[]; basePath: string }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Semua");
  const cats = ["Semua", ...Array.from(new Set(entries.map((e) => e.meta?.category || e.meta?.jenjang).filter(Boolean) as string[]))];
  const filtered = entries.filter((e) => {
    const matchCat = cat === "Semua" || (e.meta?.category || e.meta?.jenjang) === cat;
    const needle = q.toLowerCase();
    const matchQ =
      !needle ||
      e.title.toLowerCase().includes(needle) ||
      (e.excerpt ?? "").toLowerCase().includes(needle) ||
      (e.body ?? "").toLowerCase().includes(needle);
    return matchCat && matchQ;
  });
  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative flex-1">
          <span className="sr-only">Cari dalam halaman ini</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Saring judul, deskripsi, isi…"
            className="sketch-soft w-full bg-paper px-4 py-3 pl-11 text-sm text-cocoa-700 placeholder:text-cocoa-300"
          />
          <span className="absolute left-4 top-3 text-cocoa-400" aria-hidden>⌕</span>
        </label>
        {cats.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`label-caps px-3.5 py-2 transition ${
                  cat === c ? "bg-cocoa-700 text-cream" : "sketch-soft bg-transparent text-cocoa-500 hover:text-terra-600"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
      {filtered.length === 0 ? (
        <div className="mt-10">
          <EmptyState icon="⌕" title="Tidak ada yang cocok" desc="Coba kata kunci atau kategori lain." />
        </div>
      ) : (
        <div className="mt-9 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e, i) => (
            <Reveal key={e.id} delay={Math.min(i * 50, 250)}>
              <EntryCard entry={e} href={`${basePath}/${e.id}`} index={i} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= Gallery + lightbox ================= */
export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);
  if (!images || images.length === 0) return null;
  return (
    <div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
        {images.map((src, i) => (
          <button key={i} onClick={() => setActive(src)} className="group text-left" aria-label={`Perbesar gambar ${i + 1}`}>
            <span className="polaroid block !p-2 !pb-7" style={{ transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${title} – foto ${i + 1}`} className="h-32 w-full object-cover transition duration-500 group-hover:scale-[1.04] sm:h-36" loading="lazy" />
              <span className="font-hand absolute bottom-1 left-0 w-full text-center text-base text-cocoa-400">#{i + 1}</span>
            </span>
          </button>
        ))}
      </div>
      {active && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-cocoa-800/90 p-4"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau gambar"
        >
          <div className="polaroid max-h-[88vh] max-w-4xl !p-3 !pb-10" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active} alt={title} className="max-h-[78vh] w-full bg-kraft-100 object-contain" />
          </div>
          <button onClick={() => setActive(null)} className="label-caps absolute right-5 top-5 bg-paper px-4 py-2 text-cocoa-700">
            Tutup ✕
          </button>
        </div>
      )}
    </div>
  );
}

/* ================= Files ================= */
export function FileList({ files }: { files: EntryDTO["files"] }) {
  if (!files || files.length === 0) return null;
  return (
    <ul className="grid gap-3">
      {files.map((f, i) => (
        <li key={i} className="torn-soft flex flex-wrap items-center justify-between gap-3 bg-kraft-100 px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="font-serif-display grid h-11 w-11 shrink-0 place-items-center rounded-full border border-cocoa-300 text-[11px] font-semibold text-cocoa-600" aria-hidden>
              {(f.name || "file").split(".").pop()?.slice(0, 4).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-cocoa-700">{f.label || f.name}</p>
              <p className="label-caps mt-0.5 text-cocoa-400">
                {f.mime?.split("/")[1]?.replace("openxmlformats-officedocument.", "").toUpperCase() || "DOKUMEN"}
                {f.size ? ` • ${(f.size / 1024).toFixed(0)} KB` : ""}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={f.apiUrl || f.url} target="_blank" rel="noopener noreferrer" className="label-caps bg-cocoa-700 px-4 py-2.5 text-cream hover:bg-terra-600">
              Buka
            </a>
            <a
              href={`${f.apiUrl || f.url}${(f.apiUrl || f.url).includes("?") ? "&" : "?"}download=1`}
              className="label-caps sketch-soft bg-paper px-4 py-2.5 text-cocoa-600 hover:text-terra-600"
            >
              Unduh
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ================= Links ================= */
export function LinkList({ links }: { links: EntryDTO["links"] }) {
  if (!links || links.length === 0) return null;
  return (
    <ul className="grid gap-2">
      {links.map((l, i) => (
        <li key={i}>
          <a href={l.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-3 border-b border-dashed border-kraft-200 py-3">
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-cocoa-700 group-hover:text-terra-600">{l.title}</span>
              <span className="label-caps block truncate text-cocoa-400">{new URL(l.url).hostname}</span>
            </span>
            <span className="label-caps shrink-0 text-terra-600">Buka ↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/* ================= Teks yang bisa diperluas ================= */
export function ExpandableText({ text, limit = 340, href }: { text?: string | null; limit?: number; href: string }) {
  const [open, setOpen] = useState(false);
  const plain = (text ?? "").replace(/\*\*/g, "");
  const isLong = plain.length > limit;
  if (!text) return null;
  if (!isLong || open) {
    return (
      <div>
        <RichText text={text} />
        {isLong && (
          <button onClick={() => setOpen(false)} className="label-caps mt-5 text-cocoa-500 hover:text-terra-600">
            − Tampilkan lebih ringkas
          </button>
        )}
      </div>
    );
  }
  const clipped = plain.slice(0, limit).replace(/\s+\S*$/, "");
  return (
    <div>
      <p className={plain.startsWith("Perkenalkan") ? "dropcap" : undefined}>{clipped}…</p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button onClick={() => setOpen(true)} className="label-caps bg-cocoa-700 px-6 py-3.5 text-cream hover:bg-terra-600">
          Baca Selengkapnya
        </button>
        <Link href={href} className="label-caps link-underline text-terra-600">
          atau buka halaman Profilku →
        </Link>
      </div>
    </div>
  );
}

/* ================= Angka bab besar ================= */
export function ChapterNum({ n, className = "" }: { n: string | number; className?: string }) {
  return (
    <span className={`font-serif-display select-none text-5xl font-semibold leading-none text-terra-400/70 sm:text-6xl ${className}`} aria-hidden>
      {n}
    </span>
  );
}

export function DoodleFlowerAlias() {
  return <DoodleFlower className="h-8 w-auto" />;
}
