"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BERANDA_TYPES, PROFILKU_TYPES, LK_TYPES, CONTENT_TYPES } from "@/lib/types";

const REFLEKSI_TYPES = CONTENT_TYPES.filter((t) => t.group === "refleksi");
const KARYA_TYPES = CONTENT_TYPES.filter((t) => t.group === "karya");

const NAV = [
  { href: "/admin", label: "Dasbor", icon: "📊" },
  { href: "/admin/identitas", label: "Identitas Diri", icon: "👩‍🏫" },
  { href: "/admin/beranda", label: "Editor Beranda", icon: "🏠" },
  { href: "/admin/profilku", label: "Beranda & Profilku", icon: "📚" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const [busy, setBusy] = useState(false);

  async function logout() {
    if (!confirm("Keluar dari panel pengelola?")) return;
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const linkCls = (href: string) =>
    `block px-4 py-2.5 text-[13px] font-semibold transition ${
      pathname === href || (href !== "/admin" && pathname.startsWith(href + "/"))
        ? "bg-cocoa-700 text-cream"
        : "text-cocoa-600 hover:bg-sand-100"
    }`;

  const nav = (
    <div className="grid gap-6">
      <div>
        <p className="label-caps px-4 text-cocoa-400">Menu utama</p>
        <div className="mt-2 grid gap-1">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={linkCls(n.href)}>
              <span className="mr-2 text-cocoa-400" aria-hidden>{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="label-caps px-4 text-cocoa-400">Refleksi & Lembar Kerja</p>
        <div className="mt-2 grid gap-1">
          {REFLEKSI_TYPES.map((t) => (
            <Link key={t.type} href={`/admin/konten/${t.type}`} className={linkCls(`/admin/konten/${t.type}`)}>
              <span className="mr-2 text-cocoa-400" aria-hidden>{t.icon}</span>
              {t.plural}
            </Link>
          ))}
          {KARYA_TYPES.map((t) => (
            <Link key={t.type} href={`/admin/konten/${t.type}`} className={linkCls(`/admin/konten/${t.type}`)}>
              <span className="mr-2 text-cocoa-400" aria-hidden>{t.icon}</span>
              {t.plural}
            </Link>
          ))}
          <Link href="/admin/konten/lk-refleksi" className={linkCls("/admin/konten/lk-refleksi")}>
            <span className="mr-2 text-cocoa-400" aria-hidden>📔</span> Refleksi Diri (LK)
          </Link>
        </div>
      </div>

      <div>
        <p className="label-caps px-4 text-cocoa-400">Kategori Profilku</p>
        <div className="mt-2 grid gap-1">
          {PROFILKU_TYPES.map((t) => (
            <Link key={t.type} href={`/admin/konten/${t.type}`} className={linkCls(`/admin/konten/${t.type}`)}>
              <span className="mr-2 text-cocoa-400" aria-hidden>{t.icon}</span>
              {t.plural}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="label-caps px-4 text-cocoa-400">Lembar Kerja (LK)</p>
        <div className="mt-2 grid max-h-56 gap-1 overflow-auto pr-1">
          {LK_TYPES.map((t) => (
            <Link key={t.type} href={`/admin/konten/${t.type}`} className={linkCls(`/admin/konten/${t.type}`)}>
              <span className="mr-2 text-cocoa-400" aria-hidden>{t.icon}</span>
              <span className="text-[12.5px]">{t.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="label-caps px-4 text-cocoa-400">Sistem & sesi</p>
        <div className="mt-2 grid gap-1">
          <Link href="/admin/pengaturan" className={linkCls("/admin/pengaturan")}>
            <span className="mr-2 text-cocoa-400" aria-hidden>⚙️</span> Pengaturan website
          </Link>
          <Link href="/admin/cadangan" className={linkCls("/admin/cadangan")}>
            <span className="mr-2 text-cocoa-400" aria-hidden>💾</span> Cadangan & pemulihan
          </Link>
          <Link href="/" target="_blank" className="block px-4 py-2.5 text-[13px] font-semibold text-cocoa-600 hover:bg-sand-100">
            <span className="mr-2 text-cocoa-400" aria-hidden>↗</span> Pratinjau Website
          </Link>
          <button onClick={logout} disabled={busy} className="mt-1 bg-terra-500 px-4 py-2.5 text-left text-[13px] font-bold text-cream hover:bg-terra-600 disabled:opacity-60">
            {busy ? "Keluar…" : "🚪 Keluar"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      <div className="sticky top-0 z-30 border-b border-kraft-300 bg-paper">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <button className="grid h-10 w-10 place-items-center border border-cocoa-300 text-cocoa-600 lg:hidden" onClick={() => setMobile((v) => !v)} aria-label="Menu admin" aria-expanded={mobile}>
              {mobile ? "✕" : "☰"}
            </button>
            <Link href="/admin" className="leading-none">
              <span className="font-serif-display block text-[17px] font-semibold text-cocoa-700">Panel Pengelola</span>
              <span className="label-caps mt-1 block text-[9px] text-terra-600">E-Portofolio PPG</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/identitas" className="hidden border border-cocoa-300 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-cocoa-600 hover:border-terra-400 hover:text-terra-600 sm:block">
              Identitas Diri
            </Link>
            <Link href="/" target="_blank" className="border border-cocoa-300 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-cocoa-600 hover:border-terra-400 hover:text-terra-600">
              Pratinjau ↗
            </Link>
          </div>
        </div>
        {mobile && <div className="max-h-[72vh] overflow-auto border-t border-kraft-300 px-4 py-4 lg:hidden">{nav}</div>}
      </div>
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[264px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-auto border border-kraft-300 bg-paper p-3">{nav}</div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
