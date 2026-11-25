import { NextResponse } from "next/server";
import {
  createSessionValue,
  isPasswordMatch,
  rotateSessionEpoch,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SEC,
} from "@/lib/auth";
import { describeAdminConfig } from "@/lib/runtime-env";

export const dynamic = "force-dynamic";

/* Pembatasan laju percobaan masuk (di memori, per server). */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const attempts = new Map<string, { count: number; resetAt: number }>();

function clientKey(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "lokal"
  );
}

function tooManyAttempts(key: string): { blocked: boolean; retryInSec: number } {
  const rec = attempts.get(key);
  if (!rec || Date.now() > rec.resetAt) return { blocked: false, retryInSec: 0 };
  return { blocked: rec.count >= MAX_ATTEMPTS, retryInSec: Math.ceil((rec.resetAt - Date.now()) / 1000) };
}

function recordFailure(key: string) {
  const rec = attempts.get(key);
  if (!rec || Date.now() > rec.resetAt) attempts.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
  else rec.count += 1;
}

export async function POST(req: Request) {
  try {
    const key = clientKey(req);
    const gate = tooManyAttempts(key);
    if (gate.blocked) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan. Coba lagi dalam ${gate.retryInSec} detik.` },
        { status: 429 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
    }

    // Ambil apa adanya; tidak ada trimming/normalisasi agar karakter khusus tetap eksak.
    const raw = body.password;
    if (typeof raw !== "string" || raw.length === 0) {
      return NextResponse.json({ error: "Kata sandi wajib diisi." }, { status: 400 });
    }
    if (raw.length > 512) {
      return NextResponse.json({ error: "Kata sandi terlalu panjang." }, { status: 400 });
    }

    if (!isPasswordMatch(raw)) {
      recordFailure(key);
      const cfg = describeAdminConfig();
      const left = Math.max(0, MAX_ATTEMPTS - (attempts.get(key)?.count ?? 0));
      // Pesan aman: tidak menyertakan kata sandi, hanya petunjuk konfigurasi.
      const hint = cfg.passwordConfigured
        ? "Silakan coba lagi."
        : "Server belum membaca ADMIN_PASSWORD — atur pada Secrets/Environment Variables lalu redeploy.";
      return NextResponse.json(
        { ok: false, error: `Kata sandi salah. ${left <= 3 ? `Sisa percobaan: ${left}. ` : ""}${hint}` },
        { status: 401 }
      );
    }

    attempts.delete(key);
    // Putar penanda sesi: cookie lama di perangkat lain menjadi tidak berlaku.
    await rotateSessionEpoch();
    const value = await createSessionValue();
    const res = NextResponse.json({ ok: true, redirect: "/admin" });

    // ================================================================
    // ATRIBUT COOKIE — menyesuaikan konteks tempat aplikasi dijalankan
    // ================================================================
    // Preview Arena AI menampilkan aplikasi di dalam IFRAME pada domain lain
    // (arena.ai → iframe e2b.app). Untuk konten cross-site, browser MENOLAK
    // cookie SameSite=Lax. Satu-satunya atribut yang diterima di dalam iframe
    // adalah `SameSite=None` yang WAJIB disertai `Secure` (HTTPS).
    //
    // Maka:
    //  • dijalankan di domain publik / iframe  → SameSite=None; Secure
    //  • dijalankan lokal (localhost, http)    → SameSite=Lax  (tanpa Secure,
    //    karena Chrome menolak `SameSite=None` tanpa `Secure` di protokol http)
    const host = req.headers.get("host") ?? "";
    const isLocal =
      /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(host) ||
      host === "" ||
      new URL(req.url).hostname === "localhost";

    const proto =
      req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
      new URL(req.url).protocol.replace(":", "");

    const sameSite: "none" | "lax" = isLocal ? "lax" : "none";
    const secure = isLocal ? false : true;

    res.cookies.set(SESSION_COOKIE, value, {
      httpOnly: true,
      sameSite,
      secure,
      path: "/",
      maxAge: SESSION_MAX_AGE_SEC,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Gagal masuk. Silakan coba lagi." }, { status: 500 });
  }
}
