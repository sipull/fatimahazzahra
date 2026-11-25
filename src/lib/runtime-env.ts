import { readFileSync } from "fs";
import { join } from "path";

/**
 * PEMUAAT KONFIGURASI ADMIN — KHUSUS SERVER.
 *
 * Masalah yang diselesaikan: berkas `.env` pada lingkungan ini dapat ditulis
 * ulang oleh platform, sehingga `ADMIN_PASSWORD` dan `SESSION_SECRET` bisa
 * hilang dan server diam-diam memakai sandi bawaan pengembangan.
 *
 * Urutan pencarian (berhenti di sumber pertama yang ditemukan):
 *   1. `process.env`  → diatur lewat Secrets / Environment Variables platform
 *   2. `.env.local`   → prioritas Next.js lebih tinggi daripada `.env`
 *   3. `.env`         → berkas lingkungan standar
 *   4. `auth.config.json` → opsional, buatan pengguna, diabaikan Git
 *
 * Nilai tidak pernah dikirim ke peramban dan tidak pernah dicetak ke log.
 */

export interface AdminConfig {
  adminPassword: string | null;
  sessionSecret: string | null;
  source: "env" | "env.local" | "env" | "auth.config.json" | "none";
}

let cache: AdminConfig | null = null;

function parseEnvFile(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const lineRaw of raw.split(/\r?\n/)) {
    const line = lineRaw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"') && val.length >= 2) ||
      (val.startsWith("'") && val.endsWith("'") && val.length >= 2)
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function readCandidate(path: string): Record<string, string> | null {
  try {
    return parseEnvFile(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

/** Ambil nilai pertama yang tidak kosong dari beberapa sumber. */
function pick(keys: string[]): { value: string | null; source: AdminConfig["source"] } {
  // 1) proses.env (dari platform Secrets / Environment Variables)
  for (const k of keys) {
    const v = process.env[k];
    if (typeof v === "string" && v.trim() !== "") return { value: v, source: "env" };
  }
  // 2)–4) berkas konfigurasi di disk (server-only)
  const base = process.cwd();
  const candidates: Array<[string, AdminConfig["source"]]> = [
    [join(base, ".env.local"), "env.local"],
    [join(base, "auth.config.json"), "auth.config.json"],
    [join(base, ".env"), "env"],
  ];
  for (const [path, source] of candidates) {
    const parsed = readCandidate(path);
    if (!parsed) continue;
    for (const k of keys) {
      const v = parsed[k];
      if (typeof v === "string" && v.trim() !== "") return { value: v, source };
    }
  }
  return { value: null, source: "none" };
}

export function loadAdminConfig(): AdminConfig {
  if (cache) return cache;
  const pwd = pick(["ADMIN_PASSWORD"]);
  const secret = pick(["SESSION_SECRET"]);
  cache = {
    adminPassword: pwd.value,
    sessionSecret: secret.value,
    source: pwd.source,
  };
  return cache;
}

/** Peringatan sekali per proses. Tidak pernah memuat nilai rahasia. */
let warned = false;
export function warnIfFallback(): void {
  if (warned) return;
  const cfg = loadAdminConfig();
  if (!cfg.adminPassword) {
    console.warn(
      "[auth] ADMIN_PASSWORD belum terbaca — server memakai kata sandi bawaan pengembangan. " +
        "Atur ADMIN_PASSWORD pada Secrets/Environment Variables platform lalu redeploy."
    );
  }
  if (!cfg.sessionSecret) {
    console.warn(
      "[auth] SESSION_SECRET belum terbaca — dipakai kunci sesi yang disimpan di database (server-only). " +
        "Atur SESSION_SECRET pada Secrets/Environment Variables platform untuk konfigurasi produksi."
    );
  }
  warned = true;
}

/** Hanya untuk diagnostik aman: tidak pernah mengembalikan nilai rahasia. */
export function describeAdminConfig() {
  const cfg = loadAdminConfig();
  return {
    passwordConfigured: Boolean(cfg.adminPassword?.trim()),
    sessionSecretConfigured: Boolean(cfg.sessionSecret?.trim()),
    usingFallbackPassword: !cfg.adminPassword?.trim(),
    passwordLength: (cfg.adminPassword ?? "admin123").length,
    passwordSource: cfg.adminPassword ? cfg.source : "fallback",
    sessionSecretSource: cfg.sessionSecret ? cfg.source : "database-generated",
  };
}
