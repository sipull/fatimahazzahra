"use client";

import { useState } from "react";
import Link from "next/link";
import { DoodleGradCap, DoodleStar } from "@/components/site/Doodles";

type Config = {
  passwordConfigured: boolean;
  usingFallbackPassword: boolean;
  sessionSecretConfigured: boolean;
  passwordHint: string;
};

type Me = { authenticated: boolean; hasSessionCookie: boolean; cookieLength: number };

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [cfg, setCfg] = useState<Config | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [showCfg, setShowCfg] = useState(false);

  async function loadConfig() {
    try {
      const res = await fetch("/api/auth/config", { cache: "no-store" });
      if (res.ok) setCfg(await res.json());
    } catch {
      /* diagnostik tidak boleh menggagalkan login */
    }
  }

  async function loadMe() {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) setMe(await res.json());
    } catch {
      /* abaikan */
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      setError("Kata sandi wajib diisi.");
      return;
    }
    setBusy(true);
    setError("");
    setNote("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || `Login gagal (kode ${res.status}).`);
        setPassword("");
        loadConfig();
        return;
      }

      // Login diterima server. Verifikasi cookie benar-benar tersimpan sebelum berpindah.
      const check = await fetch("/api/auth/me", { cache: "no-store" });
      const st = check.ok ? ((await check.json()) as Me) : null;
      setMe(st);

      if (st?.authenticated) {
        // Navigasi penuh (bukan router.push) agar cookie langsung terkirim
        // dan halaman /admin memeriksa sesi dengan keadaan terbaru.
        setNote("Login berhasil. Membuka Dasbor…");
        window.location.assign("/admin");
        return;
      }

      // Server menerima sandi, tetapi cookie tidak tersimpan di peramban.
      const isHttp = window.location.protocol === "http:";
      setError(
        isHttp
          ? "Server menerima kata sandi Anda, tetapi sesi tidak dapat disimpan karena halaman ini dibuka lewat HTTP. Buka alamat situs dengan HTTPS (https://…) lalu login lagi."
          : "Server menerima kata sandi Anda, tetapi peramban menolak menyimpan cookie sesi. Izinkan cookie untuk situs ini, lalu login lagi."
      );
      setPassword("");
      loadConfig();
    } catch {
      setError("Tidak dapat menghubungi server. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream px-5 py-10 paper-fiber">
      <div className="w-full max-w-md">
        <div className="relative">
          <div className="absolute -left-3 -top-3 hidden h-full w-full bg-kraft-200/80 torn-soft sm:block" aria-hidden />
          <div className="torn relative bg-paper px-7 py-9 sm:px-10">
            <span className="tape -top-3 left-10" style={{ transform: "rotate(-4deg)" }} aria-hidden />
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center bg-blush-100" aria-hidden>
                <DoodleGradCap className="h-7 w-10 text-terra-600" />
              </span>
              <div className="leading-none">
                <p className="label-caps text-terra-600">Area privat</p>
                <p className="font-serif-display mt-1.5 text-lg font-semibold text-cocoa-700">Panel Pengelola</p>
              </div>
            </div>

            <h1 className="font-serif-display mt-6 text-2xl font-semibold leading-tight text-cocoa-700">
              Masuk untuk mengelola
              <br />
              E-Portofolio PPG
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-cocoa-500">
              Masukkan kata sandi admin. Seluruh perubahan yang Anda simpan tersimpan permanen di database dan langsung tampil
              pada halaman publik.
            </p>

            <form onSubmit={submit} className="mt-7 grid gap-4">
              {error && (
                <p className="flex items-start gap-2 border border-terra-400 bg-blush-100 px-4 py-3 text-sm font-semibold text-terra-600" role="alert">
                  <DoodleStar className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  {error}
                </p>
              )}
              {note && (
                <p className="border border-sage-300 bg-sage-100 px-4 py-3 text-sm font-semibold text-sage-600" role="status">
                  {note}
                </p>
              )}

              <label className="grid gap-1.5">
                <span className="label-caps text-cocoa-500">Kata sandi admin</span>
                <span className="relative flex">
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="••••••••"
                    className="w-full border border-cocoa-300 bg-ivory px-4 py-3.5 pr-20 text-sm text-cocoa-700 focus:border-terra-400"
                    autoComplete="current-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 border border-cocoa-300 bg-ivory px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-cocoa-500 hover:text-terra-600"
                    aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {show ? "Sembunyi" : "Lihat"}
                  </button>
                </span>
              </label>

              <button
                disabled={busy}
                className="bg-cocoa-700 px-4 py-4 text-[12px] font-bold uppercase tracking-widest text-cream hover:bg-terra-600 disabled:opacity-60"
              >
                {busy ? "Memeriksa…" : "Masuk →"}
              </button>
            </form>

            {/* Diagnostik: tanpa menampilkan nilai rahasia */}
            <div className="mt-6 border-t border-dashed border-kraft-300 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCfg((v) => !v);
                  if (!cfg) loadConfig();
                  loadMe();
                }}
                className="text-[11px] font-bold uppercase tracking-widest text-cocoa-400 underline hover:text-terra-600"
              >
                {showCfg ? "sembunyikan status server" : "masuk gagal? periksa status server"}
              </button>

              {showCfg && (
                <div className="mt-3 grid gap-2">
                  {cfg && (
                    <>
                      {cfg.usingFallbackPassword ? (
                        <p className="border border-terra-400 bg-blush-100 px-3 py-2.5 text-xs leading-relaxed text-terra-600">
                          <b>Server masih memakai kata sandi bawaan.</b> Variabel <code>ADMIN_PASSWORD</code> belum terbaca.
                          Pastikan kuncinya tepat (tanpa spasi) di Secrets / Environment Variables, lalu <b>Redeploy</b>.
                        </p>
                      ) : (
                        <p className="border border-sage-300 bg-sage-100 px-3 py-2.5 text-xs leading-relaxed text-sage-600">
                          ✓ Konfigurasi benar: server membaca kata sandi dari variabel lingkungan{" "}
                          <code>ADMIN_PASSWORD</code>.
                        </p>
                      )}
                      <ul className="grid gap-1 text-[11px] leading-relaxed text-cocoa-500">
                        <li>
                          ADMIN_PASSWORD terbaca:{" "}
                          <b className={cfg.passwordConfigured ? "text-sage-600" : "text-terra-600"}>
                            {cfg.passwordConfigured ? "ya" : "tidak"}
                          </b>
                          <span className="text-cocoa-400"> — {cfg.passwordHint}</span>
                        </li>
                        <li>
                          SESSION_SECRET terbaca:{" "}
                          <b className={cfg.sessionSecretConfigured ? "text-sage-600" : "text-terra-600"}>
                            {cfg.sessionSecretConfigured ? "ya" : "tidak"}
                          </b>
                        </li>
                      </ul>
                    </>
                  )}

                  {me && (
                    <div className="border border-dashed border-kraft-300 bg-kraft-100 px-3 py-2.5 text-[11px] leading-relaxed text-cocoa-500">
                      <p className="label-caps mb-1 text-cocoa-500">Status sesi di peramban ini</p>
                      <p>
                        Cookie sesi tersimpan:{" "}
                        <b className={me.hasSessionCookie ? "text-sage-600" : "text-terra-600"}>
                          {me.hasSessionCookie ? "ya" : "tidak"}
                        </b>
                      </p>
                      <p>
                        Sesi aktif:{" "}
                        <b className={me.authenticated ? "text-sage-600" : "text-terra-600"}>
                          {me.authenticated ? "ya" : "tidak"}
                        </b>
                      </p>
                      {me.hasSessionCookie && !me.authenticated && (
                        <p className="mt-1">
                          Cookie ada tetapi tidak valid — kemungkinan situs baru di-redeploy. Klik <b>Keluar</b> lalu login lagi.
                        </p>
                      )}
                      {!me.hasSessionCookie && (
                        <p className="mt-1">
                          Buka halaman ini dengan alamat <b>https://</b> dan izinkan cookie untuk situs ini.
                        </p>
                      )}
                    </div>
                  )}

                  <p className="text-[11px] leading-relaxed text-cocoa-400">
                    Protokol halaman ini: <b>{typeof window !== "undefined" ? window.location.protocol.replace(":", "") : "-"}</b>{" "}
                    — sesi hanya tersimpan bila protokol sama dengan saat login.
                  </p>
                </div>
              )}
            </div>

            <p className="mt-5 border-t border-dashed border-kraft-300 pt-4 text-xs leading-relaxed text-cocoa-400">
              Kata sandi diverifikasi di server (bukan di peramban) dan hanya ditandai dengan cookie sesi bertanda tangan digital.
              Sesi berlaku 7 hari. Atur variabel lingkungan <code className="font-semibold">ADMIN_PASSWORD</code> serta{" "}
              <code className="font-semibold">SESSION_SECRET</code> pada server untuk mengubah kredensial.
            </p>

            <p className="mt-5 text-center">
              <Link href="/" className="label-caps link-underline text-cocoa-500 hover:text-terra-600">
                ← Kembali ke situs
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
