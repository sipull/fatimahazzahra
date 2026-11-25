import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { getAllSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Fatimah Azzahra, S.Pd. — E-Portofolio PPG",
  description:
    "Sebuah perjalanan menjadi guru: dokumentasi belajar, praktik pembelajaran, analisis, refleksi, dan pengembangan kompetensi selama Pendidikan Profesi Guru.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const s = await getAllSettings();
  const owner = s.owner_name || "Fatimah Azzahra";
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,300..700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Caveat:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-cream text-cocoa-700 antialiased paper-fiber">
        <a
          href="#konten"
          className="label-caps sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-cocoa-700 focus:px-4 focus:py-3 focus:text-ivory"
        >
          Lewati ke konten utama
        </a>
        <Navbar owner={owner} siteTitle={s.site_title || "E-Portofolio PPG"} />
        <main id="konten">{children}</main>
        <Footer owner={owner} footerText={s.footer_text || ""} marquee={s.marquee_text || ""} />
      </body>
    </html>
  );
}
