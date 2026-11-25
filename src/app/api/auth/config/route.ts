import { NextResponse } from "next/server";
import { describeAdminConfig } from "@/lib/runtime-env";

export const dynamic = "force-dynamic";

/**
 * Diagnostik konfigurasi autentikasi — AMAN.
 * Hanya mengembalikan boolean dan sumber konfigurasi.
 * TIDAK pernah mengembalikan kata sandi, kunci rahasia, atau potongannya.
 *
 * Menjawab pertanyaan: "kata sandi mana yang benar-benar dipakai server?"
 */
export async function GET() {
  const cfg = describeAdminConfig();
  return NextResponse.json({
    passwordConfigured: cfg.passwordConfigured,
    usingFallbackPassword: cfg.usingFallbackPassword,
    sessionSecretConfigured: cfg.sessionSecretConfigured,
    usingDatabaseSecret: !cfg.sessionSecretConfigured,
    passwordLength: cfg.passwordLength,
    passwordSource: cfg.passwordSource,
    sessionSecretSource: cfg.sessionSecretSource,
    passwordHint: cfg.passwordConfigured
      ? "dari variabel lingkungan ADMIN_PASSWORD"
      : "bawaan pengembangan (admin123) — atur ADMIN_PASSWORD lalu redeploy",
    secretHint: cfg.sessionSecretConfigured
      ? "dari variabel lingkungan SESSION_SECRET"
      : "kunci acak yang dibuat otomatis dan disimpan di database (bukan kata sandi admin)",
  });
}
