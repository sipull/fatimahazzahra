import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllSettings } from "@/lib/data";
import AdminShell from "@/components/admin/Shell";
import SettingsClient from "./settings-client";

export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  const initial = await getAllSettings();
  return (
    <AdminShell>
      <p className="label-caps text-rose-500">Sistem</p>
      <h1 className="font-serif-display mt-2 text-2xl font-semibold text-cocoa-700">Pengaturan website</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cocoa-500">
        Hero & identitas utama, identitas diri, curriculum vitae, dan teks situs. Perubahan langsung tampil pada halaman publik.
      </p>
      <div className="mt-6">
        <SettingsClient initial={initial} />
      </div>
    </AdminShell>
  );
}
