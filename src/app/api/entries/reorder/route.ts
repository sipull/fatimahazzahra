import { NextResponse } from "next/server";
import { db } from "@/db";
import { entries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/auth";

export async function POST(req: Request) {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: { orders?: Array<{ id: string; sortOrder: number }> };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }
  const orders = body.orders ?? [];
  for (const o of orders.slice(0, 100)) {
    if (!o.id) continue;
    const n = Number(o.sortOrder) || 0;
    await db.update(entries).set({ sortOrder: n, updatedAt: new Date() }).where(eq(entries.id, o.id as never));
  }
  return NextResponse.json({ ok: true });
}
