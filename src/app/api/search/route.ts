import { NextResponse } from "next/server";
import { listEntries } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 200);
  if (!q) return NextResponse.json({ results: [] });
  // Hanya konten published yang boleh tampil di pencarian publik
  const results = await listEntries({ query: q });
  const safe = results.filter((e) => e.status === "published");
  return NextResponse.json({ results: safe.slice(0, 30) });
}
