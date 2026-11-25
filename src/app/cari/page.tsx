"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Annotation, DoodleStar, ScribbleUnderline } from "@/components/site/Doodles";
import { EntryCard, EmptyState, Reveal, SectionTab } from "@/components/site/ui";
import type { EntryDTO } from "@/lib/types";

export default function CariPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<EntryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function run(query?: string) {
    const needle = (query ?? q).trim();
    if (!needle) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(needle)}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const init = sp.get("q") ?? "";
    if (init) {
      setQ(init);
      run(init);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const SARAN = ["refleksi", "media", "modul ajar", "penilaian"];

  return (
    <div>
      <div className="relative overflow-hidden border-b border-kraft-200 bg-cream paper-fiber">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-16">
          <nav className="label-caps mb-6 flex items-center gap-2 text-cocoa-400" aria-label="Breadcrumb">
            <Link href="/" className="link-underline hover:text-terra-600">Beranda</Link>
            <span className="text-terra-400">/</span>
            <span className="text-cocoa-700">Cari</span>
          </nav>
          <SectionTab tone="blush">Pencarian</SectionTab>
          <h1 className="font-serif-display mt-4 max-w-2xl text-[clamp(2rem,5.2vw,3.2rem)] font-semibold leading-[1.05] text-cocoa-700">
            Telusuri seluruh arsip
          </h1>
          <ScribbleUnderline className="mt-4 h-3 w-52 text-terra-400" />
          <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-cocoa-500">
            Pencarian hanya mencakup konten yang telah dipublikasikan. Draf dan konten terbatas tidak akan pernah muncul.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run();
          }}
          className="flex flex-col gap-3 sm:flex-row"
          role="search"
        >
          <label className="relative flex-1">
            <span className="sr-only">Kata kunci pencarian</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tulis kata kunci… misalnya: modul ajar"
              className="sketch w-full bg-paper px-4 py-4 pl-12 text-[15px] text-cocoa-700 placeholder:text-cocoa-300"
            />
            <span className="absolute left-4 top-4 text-xl text-cocoa-400" aria-hidden>⌕</span>
          </label>
          <button className="label-caps bg-cocoa-700 px-8 py-4 text-cream hover:bg-terra-600" disabled={loading}>
            {loading ? "Mencari…" : "Cari"}
          </button>
        </form>

        {!searched && (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="label-caps text-cocoa-400">Coba:</span>
            {SARAN.map((x) => (
              <button
                key={x}
                onClick={() => {
                  setQ(x);
                  run(x);
                }}
                className="label-caps sketch-soft bg-paper px-4 py-2 text-cocoa-500 hover:text-terra-600"
              >
                {x}
              </button>
            ))}
          </div>
        )}

        <div className="mt-12">
          {searched && results.length === 0 && !loading && (
            <EmptyState
              icon="⌕"
              title="Tidak ada hasil"
              desc={`Tidak ditemukan konten publik untuk “${q}”. Coba kata kunci lain yang lebih umum.`}
            />
          )}
          {results.length > 0 && (
            <>
              <div className="flex items-end justify-between gap-4">
                <p className="label-caps text-cocoa-500">{results.length} hasil untuk “{q}”</p>
                <Annotation className="hidden sm:flex items-center gap-2">
                  <DoodleStar className="h-4 w-4 text-terra-400" /> ditemukan
                </Annotation>
              </div>
              <div className="mt-8 grid gap-8 sm:grid-cols-2">
                {results.map((e, i) => (
                  <Reveal key={e.id} delay={Math.min(i * 50, 250)}>
                    <EntryCard entry={e} href={`/detail/${e.id}`} index={i} />
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>

        <p className="mt-14 text-center">
          <Link href="/lk" className="label-caps link-underline text-terra-600">
            ← Jelajahi semua Lembar Kerja
          </Link>
        </p>
      </div>
    </div>
  );
}
