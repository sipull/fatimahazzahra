import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { isAdminAuthenticated } from "@/lib/auth";
import { isAllowed, looksDangerous, makeStoredName, sanitizeFileName, MAX_FILE_BYTES, MAX_IMAGE_BYTES } from "@/lib/upload";

export const dynamic = "force-dynamic";

/** Pesan galat yang aman: tidak pernah menampilkan isi/kredensial. */
export async function POST(req: Request) {
  // Otorisasi: hanya admin terautentikasi boleh mengunggah.
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "Sesi berakhir. Silakan masuk kembali." }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Berkas tidak dapat dibaca. Coba unggah ulang." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Tidak ada berkas yang dikirim." }, { status: 400 });
  if (file.size === 0) return NextResponse.json({ error: "Berkas kosong." }, { status: 400 });

  const original = file.name || "file";
  const { ext } = sanitizeFileName(original);
  const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);
  const limit = isImage ? MAX_IMAGE_BYTES : MAX_FILE_BYTES;
  if (file.size > limit) {
    return NextResponse.json(
      {
        error: `Ukuran berkas ${(file.size / 1024 / 1024).toFixed(1)} MB melebihi batas ${limit / 1024 / 1024} MB${
          isImage ? " untuk gambar" : ""
        }. Kompres terlebih dahulu atau gunakan berkas lebih kecil.`,
      },
      { status: 413 }
    );
  }
  if (looksDangerous(ext)) {
    return NextResponse.json({ error: `Tipe berkas .${ext || "?"} tidak diizinkan demi keamanan.` }, { status: 415 });
  }
  if (!isAllowed(original, file.type || "")) {
    return NextResponse.json(
      { error: `Tipe berkas .${ext || "?"} tidak didukung. Gunakan PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, JPG, PNG, WEBP, atau MP4.` },
      { status: 415 }
    );
  }

  const stored = makeStoredName(original);
  const dir = join(process.cwd(), "public", "uploads");
  try {
    await mkdir(dir, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(join(dir, stored), bytes);
  } catch {
    return NextResponse.json({ error: "Penyimpanan berkas gagal. Coba lagi atau gunakan ukuran lebih kecil." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    file: {
      name: original,
      stored,
      url: `/uploads/${stored}`,
      apiUrl: `/api/media/${stored}`,
      size: file.size,
      mime: file.type || "application/octet-stream",
    },
  });
}
