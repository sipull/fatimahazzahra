import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Diagnostik sesi — aman, tidak membocorkan apa pun.
 * `hasSessionCookie` membantu membedakan:
 *  - cookie tidak tersimpan di peramban (masalah flag Secure / HTTP)
 *  - cookie tersimpan tetapi tidak valid (masalah kunci/epoch)
 */
export async function GET() {
  const store = await cookies();
  const raw = store.get("eportofolio_session")?.value;
  return NextResponse.json({
    authenticated: await isAdminAuthenticated(),
    hasSessionCookie: Boolean(raw),
    cookieLength: raw ? raw.length : 0,
  });
}
