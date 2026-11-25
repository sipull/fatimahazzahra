import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllSettings, listEntries } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getAllSettings();
  const entries = await listEntries({ includeNonPublished: true });
  return NextResponse.json({
    ok: true,
    exportedAt: new Date().toISOString(),
    app: "e-portofolio-ppg",
    version: 1,
    settings,
    entries,
  });
}
