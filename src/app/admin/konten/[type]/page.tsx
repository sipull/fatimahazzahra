import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { listEntries } from "@/lib/data";
import { getContentType } from "@/lib/types";
import AdminShell from "@/components/admin/Shell";
import TypeListClient from "./list-client";

export const dynamic = "force-dynamic";

export default async function AdminTypeList({ params }: { params: Promise<{ type: string }> }) {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  const { type } = await params;
  const def = getContentType(type);
  if (!def) notFound();
  const items = await listEntries({ type, includeNonPublished: true });

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="label-caps text-rose-500">
            {def.group} <span className="text-cocoa-300">•</span> {def.icon}
          </p>
          <h1 className="font-serif-display mt-2 text-2xl font-semibold text-cocoa-700">{def.plural}</h1>
          <p className="mt-2 text-sm leading-relaxed text-cocoa-500">{def.description}</p>
        </div>
        <Link href={`/admin/konten/${type}/baru`} className="bg-cocoa-700 px-6 py-3.5 text-[12px] font-bold uppercase tracking-widest text-ivory hover:bg-rose-600">
          Tambah baru
        </Link>
      </div>
      <div className="mt-6">
        <TypeListClient type={type} initial={items} />
      </div>
    </AdminShell>
  );
}
