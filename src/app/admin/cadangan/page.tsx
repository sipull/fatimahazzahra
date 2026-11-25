import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import AdminShell from "@/components/admin/Shell";
import BackupClient from "./backup-client";

export const dynamic = "force-dynamic";

export default async function BackupPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  return (
    <AdminShell>
      <p className="label-caps text-rose-500">Sistem</p>
      <h1 className="font-serif-display mt-2 text-2xl font-semibold text-cocoa-700">Cadangan & pemulihan data</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cocoa-500">
        Ekspor seluruh pengaturan dan konten ke berkas JSON, lalu impor kembali bila diperlukan.
      </p>
      <div className="mt-6">
        <BackupClient />
      </div>
    </AdminShell>
  );
}
