import Link from "next/link";
import { Annotation, ArchiveSketch, DoodleFlower } from "@/components/site/Doodles";
import { SectionTab } from "@/components/site/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-20 text-center sm:py-28">
      <div className="torn-soft bg-kraft-100 p-6">
        <ArchiveSketch className="mx-auto h-auto w-full max-w-sm text-cocoa-400" />
      </div>
      <div className="mt-8 flex justify-center">
        <SectionTab tone="blush">Error 404</SectionTab>
      </div>
      <h1 className="font-serif-display mt-5 text-[clamp(1.8rem,4.6vw,2.6rem)] font-semibold leading-tight text-cocoa-700">
        Halaman ini tidak ditemukan
      </h1>
      <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-cocoa-500">
        Tautan mungkin sudah berubah, atau konten tersebut masih berstatus draf / terbatas sehingga tidak dapat dilihat publik.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="label-caps bg-cocoa-700 px-7 py-3.5 text-cream hover:bg-terra-600">
          ← Beranda
        </Link>
        <Link href="/lk" className="label-caps sketch-soft bg-paper px-7 py-3.5 text-cocoa-600 hover:border-terra-400 hover:text-terra-600">
          Lembar Kerja
        </Link>
      </div>
      <Annotation className="mt-9 inline-flex items-center gap-2">
        <DoodleFlower className="h-7 w-auto text-sage-500" /> jalan seterbuk, kembali lagi nanti
      </Annotation>
    </div>
  );
}
