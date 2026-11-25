import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllSettings } from "@/lib/data";
import AdminShell from "@/components/admin/Shell";
import IdentitasEditor from "./identitas-editor";

export const dynamic = "force-dynamic";

export default async function AdminIdentitasPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  const initial = await getAllSettings();
  return (
    <AdminShell>
      <p className="label-caps text-terra-600">Identitas Diri</p>
      <h1 className="font-serif-display mt-2 text-2xl font-semibold text-cocoa-700">Kelola biodata & foto profil</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cocoa-500">
        Data di sini otomatis tampil pada halaman Beranda (hero &amp; tabel identitas) dan halaman Profilku → Identitas Diri.
        Foto ditampilkan apa adanya — tanpa filter maupun pengubahan wajah.
      </p>
      <div className="mt-6">
        <IdentitasEditor initial={initial} />
      </div>
    </AdminShell>
  );
}
