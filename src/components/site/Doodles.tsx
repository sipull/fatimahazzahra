import type { ReactNode } from "react";

/* ============================================================
   Ornamen & ilustrasi hand-drawn orisinal bertema pendidikan.
   Semua SVG memakai stroke currentColor agar mengikuti warna teks.
   ============================================================ */

type SvgProps = { className?: string; strokeWidth?: number };

export function DoodleStar({ className = "", strokeWidth = 1.6 }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" aria-hidden>
      <path d="M12 2.6c.7 3.9 1.6 5.4 3 6.4 1.3.9 3.2 1.2 6.4 1.6-3 .8-4.8 1.5-6 2.7-1.2 1.2-1.9 3-2.6 6-.8-3.4-1.6-5.1-3-6.2C8.5 12 6.6 11.4 3.4 11c3-.7 4.9-1.4 6.1-2.6C10.7 7.2 11.4 5.4 12 2.6Z" />
    </svg>
  );
}

export function DoodleSparkle({ className = "", strokeWidth = 1.5 }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" aria-hidden>
      <path d="M12 3v18M3 12h18M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </svg>
  );
}

export function DoodleFlower({ className = "", strokeWidth = 1.5 }: SvgProps) {
  return (
    <svg viewBox="0 0 40 52" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" aria-hidden>
      <path d="M20 16c-3.2 0-5.4-2-5.4-4.6 0-2.6 2.4-4.6 5.4-4.6s5.4 2 5.4 4.6c0 2.6-2.2 4.6-5.4 4.6Z" />
      <path d="M20 16c2.6 1.6 3.4 4.4 1.8 6.8-1.6 2.3-4.6 2.9-7 1.4-2.4-1.5-3-4.4-1.4-6.7 1.5-2.2 4.2-2.8 6.6-1.5Z" />
      <path d="M20 16c-2.6 1.6-5.6 1-7-1.4-1.5-2.3-.8-5.2 1.6-6.6" />
      <path d="M20 24v22" />
      <path d="M20 34c-3.6-.6-6-2.6-6.8-5.8M20 40c3.6-.6 6-2.6 6.8-5.8" />
      <path d="M14.6 11.4c1.6-2.2 4.4-3.4 7.2-3" />
    </svg>
  );
}

export function DoodleBook({ className = "", strokeWidth = 1.5 }: SvgProps) {
  return (
    <svg viewBox="0 0 56 40" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M28 8.5C23 5.6 17.4 4.6 11 5.1c-2 .2-3.4.6-4.6 1.2v25.4c1.6-.8 3.4-1.2 6-1.4 6-.5 11.2.6 15.6 3.4" />
      <path d="M28 8.5c5-2.9 10.6-3.9 17-3.4 2 .2 3.4.6 4.6 1.2v25.4c-1.6-.8-3.4-1.2-6-1.4-6-.5-11.2.6-15.6 3.4" />
      <path d="M28 8.5v26.2" />
      <path d="M13 12.5c3.6-.3 6.8.2 10 1.6M13 18.5c3.6-.3 6.8.2 10 1.6M33 12.5c3.6-.3 6.8.2 10 1.6M33 18.5c3.6-.3 6.8.2 10 1.6" />
    </svg>
  );
}

export function DoodlePencil({ className = "", strokeWidth = 1.5 }: SvgProps) {
  return (
    <svg viewBox="0 0 60 20" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 12.5 44 8l10 1.2L44 12 4 16.5Z" />
      <path d="M4 12.5 1.5 17l4.6-2.6" />
      <path d="M44 8l4 .5M48.5 12.2l-4 .5" />
    </svg>
  );
}

export function DoodleArrow({ className = "", strokeWidth = 1.7 }: SvgProps) {
  return (
    <svg viewBox="0 0 70 46" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M66 5C58 22 46 32 8 38" />
      <path d="M20 30 7 38.5 21 42" />
    </svg>
  );
}

export function DoodleArrowDown({ className = "", strokeWidth = 1.7 }: SvgProps) {
  return (
    <svg viewBox="0 0 46 70" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 4c17 8 27 20 33 58" />
      <path d="M30 50l8.5 13L42.5 49" />
    </svg>
  );
}

export function ScribbleUnderline({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 14" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden preserveAspectRatio="none">
      <path d="M3 9c26-4.5 52-6 78-5 22 .8 44 3 66 1.5 17-1.2 33-3 50-4" />
    </svg>
  );
}

export function CircleScribble({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 90" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden preserveAspectRatio="none">
      <path d="M100 6C46 6 8 22 8 45c0 23 40 39 94 39 52 0 90-16 90-39C192 22 154 6 100 6Z" />
      <path d="M14 36C40 18 74 12 118 14" opacity="0.55" />
    </svg>
  );
}

export function DashedDivider({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 12" className={`w-full ${className}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden preserveAspectRatio="none">
      <path d="M2 6.5c40-2 80-2.5 120-1.5 40 1 80 3 120 1.5 40-1.5 80-4 120-3 40 1 80 4 120 3 40-1 80-4.5 120-4 40 .5 80 4 120 3.5 40-.5 80-4 120-4.5 40-.5 80 3 120 3.5 40 .5 80-.5 120-2" strokeDasharray="14 12" />
    </svg>
  );
}

/* ---------- elemen scrapbook tambahan ---------- */

export function DoodleGradCap({ className = "", strokeWidth = 1.5 }: SvgProps) {
  return (
    <svg viewBox="0 0 64 52" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M32 8 4 20l28 12 28-12L32 8Z" />
      <path d="M16 26v12c0 4 7.2 7 16 7s16-3 16-7V26" />
      <path d="M56 21v14" />
      <path d="M56 35c-2.2 0-4 1.6-4 3.6V46c0 1.7 1.8 3 4 3s4-1.3 4-3v-7.4c0-2-1.8-3.6-4-3.6Z" />
      <path d="M22 23.5 44 32" opacity="0.55" />
    </svg>
  );
}

export function DoodleSchool({ className = "", strokeWidth = 1.4 }: SvgProps) {
  return (
    <svg viewBox="0 0 180 120" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M90 6 116 24H64L90 6Z" />
      <path d="M64 24h52v10H64z" />
      <path d="M52 34h76v74H52z" />
      <path d="M62 48h16v18H62zM102 48h16v18h-16z" />
      <path d="M82 108V82c0-4.4 3.6-8 8-8s8 3.6 8 8v26" />
      <path d="M40 108h100" strokeDasharray="11 9" />
      <path d="M28 34 52 34M128 34h24" opacity="0.6" />
      <path d="M150 42c8 0 14 6 14 14v40" opacity="0.35" />
      <path d="M30 42c-8 0-14 6-14 14v40" opacity="0.35" />
    </svg>
  );
}

export function DoodleLeaf({ className = "", strokeWidth = 1.5 }: SvgProps) {
  return (
    <svg viewBox="0 0 44 56" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 52V22" />
      <path d="M22 30C10 30 4 22 4 10c12 0 18 8 18 20Z" />
      <path d="M22 22c10 0 16-7 16-18-11 0-16 7-16 18Z" />
      <path d="M22 44c-5-1-8-4-9-8M22 38c4-1 6-3 7-6" />
    </svg>
  );
}

export function DoodlePaperclip({ className = "", strokeWidth = 1.6 }: SvgProps) {
  return (
    <svg viewBox="0 0 24 52" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" aria-hidden>
      <path d="M7 14v24a5 5 0 0 0 10 0V10a7 7 0 0 0-14 0v28" />
    </svg>
  );
}

export function DoodleHeart({ className = "", strokeWidth = 1.6 }: SvgProps) {
  return (
    <svg viewBox="0 0 32 30" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 27C10 21.5 3 17 3 10.8 3 6.5 6.3 3.5 10 3.5c2.7 0 4.8 1.5 6 3.6 1.2-2.1 3.3-3.6 6-3.6 3.7 0 7 3 7 7.3C29 17 22 21.5 16 27Z" />
    </svg>
  );
}

export function DoodleRuler({ className = "", strokeWidth = 1.4 }: SvgProps) {
  return (
    <svg viewBox="0 0 120 22" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" aria-hidden>
      <path d="M3 4h114v14H3z" />
      <path d="M14 4v6M26 4v9M38 4v6M50 4v9M62 4v6M74 4v9M86 4v6M98 4v9M110 4v6" />
    </svg>
  );
}

export function WashiStrip({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 26" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden preserveAspectRatio="none">
      <path d="M2 3h196v20H2z" fill="rgba(243,220,223,0.75)" />
      <path d="M2 3h196M2 23h196" />
      <path d="M18 3v20M42 3v20M66 3v20M90 3v20M114 3v20M138 3v20M162 3v20M186 3v20" opacity="0.35" />
    </svg>
  );
}

/* Ilustrasi suasana kelas — dekoratif, orisinal */
export function ClassroomSketch({ className = "", strokeWidth = 1.4 }: SvgProps) {
  return (
    <svg viewBox="0 0 640 260" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {/* papan tulis */}
      <path d="M60 34h214c3 0 5 2 5 5v104c0 3-2 5-5 5H60c-3 0-5-2-5-5V39c0-3 2-5 5-5Z" />
      <path d="M55 148l224 0" opacity="0.5" />
      {/* bunga & matahari di papan */}
      <path d="M120 78c0-9 7-16 16-16s16 7 16 16-7 16-16 16-16-7-16-16Z" />
      <path d="M136 62v-8M136 94v8M120 78h-8M152 78h8M124 66l-6-6M148 90l6 6M148 66l6-6M124 90l-6 6" />
      <path d="M196 104c14-26 30-26 44 0" />
      <path d="M210 104v22M232 104v22M196 104h62" />
      {/* meja guru */}
      <path d="M320 150h262c4 0 7 3 7 7v20c0 4-3 7-7 7H320c-4 0-7-3-7-7v-20c0-4 3-7 7-7Z" />
      <path d="M330 184v56M566 184v56M352 184v34M540 184v34" />
      {/* buku di meja */}
      <path d="M368 150v-16c0-3 2-5 5-5h44c3 0 5 2 5 5v16" />
      <path d="M382 129v-10c0-3 2-5 5-5h44c3 0 5 2 5 5v10" />
      {/* vas & pensil */}
      <path d="M480 150v-26h26v26" />
      <path d="M486 124 508 96M492 124l14-20M498 124l20-14" />
      {/* tanaman */}
      <path d="M120 190c0-4 3-7 7-7h26c4 0 7 3 7 7v40h-40Z" />
      <path d="M140 183v-30M140 153c-14 0-22-8-24-20 14-2 24 6 24 20ZM140 153c14 0 22-8 24-20-14-2-24 6-24 20Z" />
      {/* jendela */}
      <path d="M596 40h34c3 0 5 2 5 5v70c0 3-2 5-5 5h-34c-3 0-5-2-5-5V45c0-3 2-5 5-5Z" />
      <path d="M613 40v80M591 80h44" />
      {/* garis lantai */}
      <path d="M4 240h632" strokeDasharray="12 10" />
    </svg>
  );
}

export function ArchiveSketch({ className = "", strokeWidth = 1.4 }: SvgProps) {
  return (
    <svg viewBox="0 0 420 200" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M60 150h300c4 0 7 3 7 7v14c0 4-3 7-7 7H60c-4 0-7-3-7-7v-14c0-4 3-7 7-7Z" />
      <path d="M78 150V78c0-4 3-7 7-7h150c4 0 7 3 7 7v72" />
      <path d="M96 92h124M96 110h124M96 128h86" />
      <path d="M262 150V56c0-4 3-7 7-7h74c4 0 7 3 7 7v94" />
      <path d="M278 70h58M278 88h58M278 106h40" />
      <path d="M330 43c-10-8-24-10-34-4M344 43c8-6 20-6 28 0" />
      <path d="M40 178h340" strokeDasharray="10 9" />
    </svg>
  );
}

/* ---------- composite helpers ---------- */

export function Annotation({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`font-hand text-xl leading-none text-cocoa-500 ${className}`}>{children}</span>
  );
}

export function ChapterNum({ n, className = "" }: { n: string | number; className?: string }) {
  return (
    <span className={`font-serif-display select-none text-5xl font-semibold leading-none text-rose-500/70 sm:text-6xl ${className}`} aria-hidden>
      {n}
    </span>
  );
}

export function TapeFrame({
  children,
  tapeClass = "",
  rotate = 0,
  className = "",
}: {
  children: ReactNode;
  tapeClass?: string;
  rotate?: number;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <span className={`tape -top-3 left-6 ${tapeClass}`} style={{ transform: `rotate(${rotate}deg)` }} aria-hidden />
      {children}
    </div>
  );
}
