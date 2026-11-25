import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getEntryById } from "@/lib/data";
import { getContentType } from "@/lib/types";
import AdminShell from "@/components/admin/Shell";
import EntryForm from "@/components/admin/EntryForm";

export const dynamic = "force-dynamic";

export default async function AdminEdit({ params }: { params: Promise<{ type: string; id: string }> }) {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  const { type, id } = await params;
  const def = getContentType(type);
  if (!def) notFound();
  const entry = await getEntryById(id);
  if (!entry || entry.type !== type) notFound();
  return (
    <AdminShell>
      <p className="label-caps text-rose-500">
        Edit <span className="text-cocoa-300">•</span> {def.icon} {def.plural}
      </p>
      <h1 className="font-serif-display mt-2 line-clamp-2 text-2xl font-semibold text-cocoa-700">{entry.title}</h1>
      <div className="mt-6">
        <EntryForm def={def} initial={entry} />
      </div>
    </AdminShell>
  );
}
