import Link from "next/link";
import { ClassroomSketch, DoodleFlower, DoodleGradCap, DoodleStar } from "./Doodles";

export default function Footer({ owner, footerText }: { owner: string; footerText: string; marquee: string }) {
  return (
    <footer className="mt-20 bg-cocoa-700 text-cream">
      <div className="mx-auto max-w-6xl px-5 pb-10 pt-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center border border-cream/30" aria-hidden>
                <DoodleGradCap className="h-7 w-9 text-blush-200" />
              </span>
              <div className="leading-none">
                <p className="font-serif-display text-xl font-semibold">{owner || "Fatimah Azzahra’"}</p>
                <p className="label-caps mt-1.5 text-blush-200">E-Portofolio PPG</p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/70">{footerText}</p>
            <div className="mt-5 flex items-center gap-3 text-sage-300" aria-hidden>
              <DoodleFlower className="h-9 w-auto" />
              <DoodleStar className="h-4 w-4 text-blush-200" />
            </div>
          </div>
          <nav aria-label="Tautan Profilku">
            <p className="label-caps text-blush-200">Profilku</p>
            <ul className="mt-4 grid gap-2.5 text-sm text-cream/75">
              <li><Link className="link-underline" href="/profilku/identitas">Identitas Diri</Link></li>
              <li><Link className="link-underline" href="/profilku/cv">Curriculum Vitae</Link></li>
              <li><Link className="link-underline" href="/profilku/pendidikan">Perjalanan Pendidikan</Link></li>
              <li><Link className="link-underline" href="/profilku/visi">Visi & Filosofi</Link></li>
              <li><Link className="link-underline" href="/profilku/kompetensi">Kompetensi & Pengembangan Diri</Link></li>
              <li><Link className="link-underline" href="/refleksi">Refleksi PPL</Link></li>
              <li><Link className="link-underline" href="/karya-inovasi">Karya Inovasi Pendidikan</Link></li>
            </ul>
          </nav>
          <nav aria-label="Tautan Lembar Kerja">
            <p className="label-caps text-blush-200">Lembar Kerja</p>
            <ul className="mt-4 grid gap-2.5 text-sm text-cream/75">
              <li><Link className="link-underline" href="/lk/analisis-rancangan">Analisis Rancangan</Link></li>
              <li><Link className="link-underline" href="/lk/analisis-materi">Analisis Materi</Link></li>
              <li><Link className="link-underline" href="/lk/analisis-media">Analisis Media</Link></li>
              <li><Link className="link-underline" href="/lk/refleksi-diri">Refleksi Diri</Link></li>
              <li><Link className="link-underline" href="/lk">Semua Lembar Kerja →</Link></li>
            </ul>
          </nav>
        </div>

        <ClassroomSketch className="mt-10 h-auto w-full text-cream/15" />
      </div>

      <div className="border-t border-cream/15">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-5 text-center sm:flex-row sm:px-8 sm:text-left">
          <p className="label-caps text-cream/55">
            © {new Date().getFullYear()} {owner || "Fatimah Azzahra’"} • E-Portofolio Pendidikan Profesi Guru
          </p>
          <Link href="/admin/login" className="label-caps border border-cream/30 px-4 py-2 text-cream/80 hover:border-blush-200 hover:text-cream">
            Panel pengelola
          </Link>
        </div>
      </div>
    </footer>
  );
}
