import { createHash, randomBytes } from "crypto";

export const ALLOWED_MIMES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
]);

export const ALLOWED_EXTS = new Set([
  "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "csv",
  "jpg", "jpeg", "png", "webp", "gif", "mp4",
]);

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
/** Batas khusus gambar agar halaman tetap cepat dimuat. */
export const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
export const MAX_BYTES_LABEL = `${Math.floor(MAX_FILE_BYTES / 1024 / 1024)} MB`;

export function sanitizeFileName(original: string): { safe: string; ext: string } {
  const base = original.split(/[\\/]/).pop() ?? "file";
  const dot = base.lastIndexOf(".");
  let ext = "";
  let name = base;
  if (dot > 0) {
    ext = base.slice(dot + 1).toLowerCase();
    name = base.slice(0, dot);
  }
  ext = ext.replace(/[^a-z0-9]/g, "").slice(0, 10);
  let clean = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  if (!clean) clean = "file";
  return { safe: clean, ext };
}

export function makeStoredName(original: string): string {
  const { safe, ext } = sanitizeFileName(original);
  const rand = randomBytes(6).toString("hex");
  const stamp = Date.now().toString(36);
  const hash = createHash("sha1").update(original + rand).digest("hex").slice(0, 6);
  return ext ? `${stamp}-${hash}-${safe}.${ext}` : `${stamp}-${hash}-${safe}`;
}

export function isAllowed(original: string, mime: string): boolean {
  const { ext } = sanitizeFileName(original);
  if (ext && ALLOWED_EXTS.has(ext)) return true;
  if (ALLOWED_MIMES.has(mime)) return true;
  return false;
}

export function looksDangerous(ext: string): boolean {
  return ["html", "htm", "js", "mjs", "php", "exe", "sh", "svg"].includes(ext);
}
