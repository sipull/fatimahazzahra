import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllSettings } from "@/lib/data";
import AdminShell from "@/components/admin/Shell";
import BerandaEditor from "./beranda-editor";

export const dynamic = "force-dynamic";

export default async function AdminBerandaPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  const initial = await getAllSettings();
  return (
    <AdminShell>
      <p className="label-caps text-terra-600">Editor Beranda</p>
      <h1 className="font-serif-display mt-2 text-2xl font-semibold text-cocoa-700">Kelola isi halaman Beranda</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cocoa-500">
        Formulir dikelompokkan per bagian agar mudah dikelola. Setiap perubahan yang disimpan tersimpan permanen di database dan
        langsung tampil pada halaman publik.
      </p>
      <div className="mt-6">
        <BerandaEditor initial={initial} />
      </div>
    </AdminShell>
  );
}
