import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllSettings } from "@/lib/data";
import AdminShell from "@/components/admin/Shell";
import ProfilkuEditor from "./profilku-editor";

export const dynamic = "force-dynamic";

export default async function AdminProfilkuPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  const initial = await getAllSettings();
  return (
    <AdminShell>
      <p className="label-caps text-terra-600">Beranda & Profilku</p>
      <h1 className="font-serif-display mt-2 text-2xl font-semibold text-cocoa-700">Kelola isi profil & refleksi pendidikan</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cocoa-500">
        Semua teks panjang dikelola dengan editor berformat (tebal, judul, daftar poin, daftar bernomor). Perubahan yang disimpan
        langsung tampil pada halaman publik.
      </p>
      <div className="mt-6">
        <ProfilkuEditor initial={initial} />
      </div>
    </AdminShell>
  );
}
