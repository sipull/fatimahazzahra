import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getContentType } from "@/lib/types";
import AdminShell from "@/components/admin/Shell";
import EntryForm from "@/components/admin/EntryForm";

export const dynamic = "force-dynamic";

export default async function AdminNew({ params }: { params: Promise<{ type: string }> }) {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  const { type } = await params;
  const def = getContentType(type);
  if (!def) notFound();
  return (
    <AdminShell>
      <p className="label-caps text-rose-500">
        Tambah <span className="text-cocoa-300">•</span> {def.icon} {def.plural}
      </p>
      <h1 className="font-serif-display mt-2 text-2xl font-semibold text-cocoa-700">Konten baru</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cocoa-500">{def.description}</p>
      <div className="mt-6">
        <EntryForm def={def} />
      </div>
    </AdminShell>
  );
}
