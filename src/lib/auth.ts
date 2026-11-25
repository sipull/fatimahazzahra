import { cookies } from "next/headers";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { loadAdminConfig, warnIfFallback } from "./runtime-env";

const COOKIE_NAME = "eportofolio_session";
/** Kunci database penanda sesi aktif → diputar saat login/logout. */
export const SESSION_EPOCH_KEY = "session_epoch";
/** Kunci database kunci penandatangan sesi (server-only, bukan kata sandi admin). */
const SESSION_SECRET_KEY = "session_secret";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const DEV_FALLBACK_PASSWORD = "admin123";
const DEV_FALLBACK_SECRET = "eportofolio-dev-secret-change-me";

/* ============================================================
   KATA SANDI ADMIN
   Sumber utama: variabel lingkungan ADMIN_PASSWORD.
   Tidak ada pemberitahuan nilai di log, respons, maupun UI.
   ============================================================ */

export function getAdminPassword(): string {
  return loadAdminConfig().adminPassword ?? DEV_FALLBACK_PASSWORD;
}

/** Benar bila ADMIN_PASSWORD belum terbaca (server memakai sandi bawaan). */
export function isUsingFallbackPassword(): boolean {
  return !loadAdminConfig().adminPassword?.trim();
}

/** Kunci penandatangan sesi. TIDAK PERNAH memakai kata sandi admin. */
export function getSessionSecret(): string {
  warnIfFallback();
  const fromEnv = loadAdminConfig().sessionSecret;
  if (fromEnv?.trim()) return fromEnv.trim();
  // Cadangan: kunci acak yang dibuat sekali dan disimpan di database (server-only).
  return cachedDbSecret ?? DEV_FALLBACK_SECRET;
}

/* ---------- kunci sesi cadangan yang disimpan di database ---------- */

let cachedDbSecret: string | null = null;
let dbSecretLoaded = false;

async function ensureSessionSecret(): Promise<void> {
  if (dbSecretLoaded) return;
  dbSecretLoaded = true;
  try {
    const rows = await db.select().from(settings).where(eq(settings.key, SESSION_SECRET_KEY)).limit(1);
    const existing = rows[0]?.value;
    if (existing && existing.trim()) {
      cachedDbSecret = existing.trim();
      return;
    }
    const generated = randomBytes(48).toString("base64url");
    await db
      .insert(settings)
      .values({ key: SESSION_SECRET_KEY, value: generated })
      .onConflictDoUpdate({ target: settings.key, set: { value: generated, updatedAt: new Date() } });
    cachedDbSecret = generated;
  } catch {
    // database belum siap → pakai cadangan pengembangan, dicoba lagi nanti
    dbSecretLoaded = false;
  }
}

/* ============================================================
   PENANDA SESI (epoch) → logout membatalkan cookie lama
   ============================================================ */

async function currentEpoch(): Promise<string> {
  try {
    const rows = await db.select().from(settings).where(eq(settings.key, SESSION_EPOCH_KEY)).limit(1);
    return rows[0]?.value ?? "0";
  } catch {
    return "0";
  }
}

export async function rotateSessionEpoch(): Promise<void> {
  const next = `${Date.now()}-${randomBytes(8).toString("hex")}`;
  await db
    .insert(settings)
    .values({ key: SESSION_EPOCH_KEY, value: next })
    .onConflictDoUpdate({ target: settings.key, set: { value: next, updatedAt: new Date() } });
}

/* ============================================================
   TOKEN SESI
   ============================================================ */

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

export async function createSessionValue(): Promise<string> {
  await ensureSessionSecret();
  const rand = randomBytes(24).toString("hex");
  const exp = Date.now() + SESSION_TTL_MS;
  const epoch = await currentEpoch();
  const payload = Buffer.from(JSON.stringify({ rand, exp, epoch })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** Verifikasi tanda tangan + kedaluwarsa tanpa membuka isi token. */
export function verifySessionValue(value: string | undefined | null): boolean {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expected = sign(payload);
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    if (!timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number };
    return Boolean(data.exp) && Date.now() <= (data.exp as number);
  } catch {
    return false;
  }
}

/** Tanda tangan + kedaluwarsa + kesesuaian penanda sesi (untuk pembatalan logout). */
export async function isSessionValid(value: string | undefined | null): Promise<boolean> {
  if (!verifySessionValue(value)) return false;
  await ensureSessionSecret();
  try {
    const payload = (value as string).split(".")[0];
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { epoch?: string };
    if (!data.epoch) return true; // token sebelum fitur epoch
    return data.epoch === (await currentEpoch());
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const store = await cookies();
    return await isSessionValid(store.get(COOKIE_NAME)?.value);
  } catch {
    return false;
  }
}

export async function requireAdmin(): Promise<boolean> {
  return isAdminAuthenticated();
}

/* ============================================================
   PERBANDINGAN KATA SANDI — konsisten & tahan serangan waktu
   Membandingkan hash agar panjang sandi tidak bocor.
   Tidak ada trimming/normalisasi: karakter khusus tetap eksak.
   ============================================================ */

export function isPasswordMatch(submitted: string): boolean {
  const expected = getAdminPassword();
  const a = createHash("sha256").update(submitted, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return a.length === b.length && timingSafeEqual(a, b);
}

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_MAX_AGE_SEC = Math.floor(SESSION_TTL_MS / 1000);
export const DEV_FALLBACK_PASSWORD_IN_USE = DEV_FALLBACK_PASSWORD;
