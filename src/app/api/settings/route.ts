import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllSettings, saveSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await getAllSettings();
  return NextResponse.json({ settings: s });
}

export async function PUT(req: Request) {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }
  const input: Record<string, string> = {};
  for (const [k, v] of Object.entries(body.settings ?? body)) {
    if (typeof k !== "string" || k.length > 100) continue;
    if (!/^[a-z0-9_]+$/.test(k)) continue;
    input[k] = String(v ?? "").slice(0, 50000);
  }
  await saveSettings(input);
  const fresh = await getAllSettings();
  return NextResponse.json({ ok: true, settings: fresh });
}
