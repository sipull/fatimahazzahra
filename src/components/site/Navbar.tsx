"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DoodleGradCap, DoodlePaperclip, DoodleStar } from "./Doodles";

const MAIN = [
  { href: "/", label: "Beranda" },
  { href: "/profilku", label: "Profilku" },
  { href: "/lk", label: "LK" },
];

const PROFILKU = [
  { href: "/profilku/identitas", label: "Identitas Diri" },
  { href: "/profilku/cv", label: "Curriculum Vitae" },
  { href: "/profilku/pendidikan", label: "Perjalanan Pendidikan" },
  { href: "/profilku/visi", label: "Visi & Filosofi" },
  { href: "/profilku/kompetensi", label: "Kompetensi" },
  { href: "/refleksi", label: "Refleksi PPL" },
  { href: "/karya-inovasi", label: "Karya Inovasi Pendidikan" },
];

const LK = [
  { href: "/lk/analisis-rancangan", label: "Rancangan Pembelajaran" },
  { href: "/lk/analisis-materi", label: "Materi Pembelajaran" },
  { href: "/lk/analisis-media", label: "Media Pembelajaran" },
  { href: "/lk/analisis-video-praktik", label: "Video Praktik Mengajar" },
  { href: "/lk/analisis-nonmengajar", label: "Kegiatan Nonmengajar" },
  { href: "/lk/instrumen-penilaian", label: "Instrumen Penilaian" },
  { href: "/lk/refleksi-diri", label: "Refleksi Diri" },
  { href: "/lk/evaluasi", label: "Evaluasi" },
];

export default function Navbar({ owner, siteTitle }: { owner: string; siteTitle: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<"profilku" | "lk" | null>(null);

  useEffect(() => {
    setOpen(false);
    setSub(null);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 border-b border-kraft-200 bg-cream/95 backdrop-blur-sm paper-fiber">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative grid h-11 w-11 shrink-0 place-items-center bg-paper" style={{ transform: "rotate(-4deg)" }} aria-hidden>
            <DoodleGradCap className="h-7 w-9 text-terra-500" />
            <span className="tape-sage tape -top-1.5 left-1/2 !h-2 !w-8 -translate-x-1/2" />
          </span>
          <span className="leading-none">
            <span className="font-serif-display block text-[19px] font-semibold tracking-tight text-cocoa-700">{owner || "Fatimah Azzahra’"}</span>
            <span className="label-caps mt-1 block text-[9px] text-terra-600">{siteTitle || "E-Portofolio PPG"}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Navigasi utama">
          {MAIN.map((m) => {
            const active = isActive(m.href);
            return (
              <Link
                key={m.href}
                href={m.href}
                aria-current={active ? "page" : undefined}
                className={`label-caps relative py-2 transition hover:text-terra-600 ${active ? "text-terra-600" : "text-cocoa-500"}`}
              >
                {m.label}
                {active && (
                  <span className="absolute -bottom-1 left-0 flex w-full items-center" aria-hidden>
                    <span className="h-[3px] w-full bg-terra-400" style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 4px) 100%, 0 100%)" }} />
                  </span>
                )}
              </Link>
            );
          })}
          <Link
            href="/cari"
            className={`label-caps flex items-center gap-2 border px-4 py-2 transition ${
              pathname === "/cari" ? "border-terra-400 bg-blush-100 text-terra-600" : "border-kraft-300 text-cocoa-500 hover:border-terra-400 hover:text-terra-600"
            }`}
          >
            <span aria-hidden>⌕</span> Cari
          </Link>
        </nav>

        <button
          className="grid h-11 w-11 place-items-center border border-kraft-300 bg-paper text-cocoa-600 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Buka menu navigasi"
        >
          <span className="relative block h-3 w-5" aria-hidden>
            <span className={`absolute left-0 h-[1.6px] w-5 bg-cocoa-600 transition ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-1.5 h-[1.6px] w-5 bg-cocoa-600 transition ${open ? "opacity-0" : "opacity-100"}`} />
            <span className={`absolute left-0 h-[1.6px] w-5 bg-cocoa-600 transition ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </div>

      {open && (
        <div className="border-t border-kraft-200 bg-kraft-100 px-5 pb-8 pt-4 md:hidden paper-fiber">
          <nav className="grid gap-1" aria-label="Menu seluler">
            {MAIN.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className={`label-caps flex items-center justify-between border-b border-kraft-200 py-3.5 ${isActive(m.href) ? "text-terra-600" : "text-cocoa-600"}`}
              >
                {m.label} <span aria-hidden>→</span>
              </Link>
            ))}

            <button onClick={() => setSub(sub === "profilku" ? null : "profilku")} className="label-caps mt-3 flex items-center justify-between py-2 text-left text-terra-600" aria-expanded={sub === "profilku"}>
              <span className="flex items-center gap-2"><DoodlePaperclip className="h-4 w-3 text-cocoa-400" /> Profilku — submenu</span>
              <span aria-hidden>{sub === "profilku" ? "−" : "+"}</span>
            </button>
            {sub === "profilku" && (
              <div className="grid gap-0.5 pl-3">
                {PROFILKU.map((s) => (
                  <Link key={s.href} href={s.href} className="border-b border-kraft-200 py-2.5 text-sm text-cocoa-600">
                    {s.label}
                  </Link>
                ))}
              </div>
            )}

            <button onClick={() => setSub(sub === "lk" ? null : "lk")} className="label-caps mt-3 flex items-center justify-between py-2 text-left text-terra-600" aria-expanded={sub === "lk"}>
              <span className="flex items-center gap-2"><DoodleStar className="h-3.5 w-3.5 text-cocoa-400" /> Lembar Kerja — submenu</span>
              <span aria-hidden>{sub === "lk" ? "−" : "+"}</span>
            </button>
            {sub === "lk" && (
              <div className="grid max-h-72 gap-0.5 overflow-auto pl-3">
                {LK.map((s) => (
                  <Link key={s.href} href={s.href} className="border-b border-kraft-200 py-2.5 text-sm text-cocoa-600">
                    {s.label}
                  </Link>
                ))}
              </div>
            )}

            <Link href="/cari" className="label-caps mt-4 bg-cocoa-700 px-4 py-3.5 text-center text-cream">
              ⌕ Pencarian konten
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
