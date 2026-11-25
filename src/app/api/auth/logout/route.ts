import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { rotateSessionEpoch } from "@/lib/auth";

export async function POST() {
  try {
    // Putar penanda sesi sehingga cookie yang masih ada menjadi tidak berlaku,
    // lalu hapus cookie di peramban.
    await rotateSessionEpoch();
  } catch {
    // tetap lanjut menghapus cookie agar pengguna keluar di sisi klien
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
