export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "image"
  | "images"
  | "file"
  | "files"
  | "url"
  | "links"
  | "date"
  | "number"
  | "select"
  | "checkbox";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

export type ContentGroup = "beranda" | "profilku" | "lk" | "refleksi" | "karya";

export const GROUP_META: Record<ContentGroup, { label: string; short: string; href: string; icon: string; desc: string }> = {
  beranda: { label: "Beranda", short: "Beranda", href: "/", icon: "🏠", desc: "Hero, Tentang Saya, tujuan, dan perjalanan PPG." },
  profilku: { label: "Profilku", short: "Profilku", href: "/profilku", icon: "👩‍🏫", desc: "Identitas, CV, pendidikan, visi & kompetensi." },
  lk: { label: "Lembar Kerja (LK)", short: "LK", href: "/lk", icon: "📚", desc: "Delapan kategori analisis, praktik & evaluasi." },
  refleksi: { label: "Refleksi PPL", short: "Refleksi", href: "/refleksi", icon: "🪞", desc: "Refleksi mata kuliah semester 1, semester 2, dan PPL." },
  karya: { label: "Karya Inovasi Pendidikan", short: "Karya", href: "/karya-inovasi", icon: "💡", desc: "Karya inovasi, media, dan pengembangan pembelajaran." },
};

export interface ContentTypeDef {
  type: string;
  label: string;
  plural: string;
  slug: string;
  group: ContentGroup;
  description: string;
  icon: string;
  hasDetail: boolean;
  emptyMessage: string;
  fields: FieldDef[];
}

const STATUS_FIELD: FieldDef = {
  key: "status",
  label: "Status publikasi",
  type: "select",
  required: true,
  help: "Published tampil publik. Draf hanya di admin. Privat/terbatas butuh login admin untuk melihat file.",
  options: [
    { value: "published", label: "Dipublikasikan" },
    { value: "draft", label: "Draf (disembunyikan)" },
    { value: "private", label: "Terbatas / Privat" },
  ],
};

const ORDER_FIELD: FieldDef = {
  key: "sortOrder",
  label: "Urutan tampil",
  type: "number",
  help: "Angka kecil tampil lebih dulu. Contoh: 1, 2, 3.",
  placeholder: "0",
};

const COMMON_MEDIA_FIELDS: FieldDef[] = [
  { key: "imageUrl", label: "Gambar sampul", type: "image", help: "Foto sampul / dokumentasi utama. Bisa unggah atau tempel URL." },
  { key: "images", label: "Galeri gambar tambahan", type: "images", help: "Opsional. Bisa tambah beberapa gambar." },
  { key: "files", label: "Dokumen pendukung (PDF, DOCX, PPTX, XLSX)", type: "files", help: "Unggah dari komputer. Maks 15 MB per file." },
  { key: "links", label: "Tautan eksternal (video, Drive, media digital)", type: "links", help: "Contoh: tautan YouTube, Google Drive." },
];

function lkFields(extra: FieldDef[] = []): FieldDef[] {
  return [
    { key: "title", label: "Judul dokumen / kegiatan", type: "text", required: true, placeholder: "Contoh: Analisis Modul Ajar Kelas IV" },
    { key: "excerpt", label: "Deskripsi singkat", type: "textarea", help: "1–2 kalimat ringkasan untuk kartu.", placeholder: "Ringkasan singkat..." },
    { key: "body", label: "Isi / uraian analisis", type: "richtext", help: "Uraian lengkap. Mendukung paragraf baris baru.", placeholder: "Tulis analisis lengkap di sini..." },
    { key: "period", label: "Tanggal / periode kegiatan", type: "text", placeholder: "Contoh: 12 Agustus 2025 / Semester Ganjil" },
    ...extra,
    ...COMMON_MEDIA_FIELDS,
    STATUS_FIELD,
    ORDER_FIELD,
  ];
}

export const CONTENT_TYPES: ContentTypeDef[] = [
  {
    type: "kata-pengantar",
    label: "Kata Pengantar",
    plural: "Kata Pengantar",
    slug: "kata-pengantar",
    group: "beranda",
    description: "Paragraf pembuka E-Portofolio: latar belakang, syukur, tujuan & harapan.",
    icon: "💌",
    hasDetail: false,
    emptyMessage: "Belum ada kata pengantar yang ditambahkan.",
    fields: [
      { key: "title", label: "Judul", type: "text", required: true, placeholder: "Kata Pengantar" },
      { key: "body", label: "Isi kata pengantar", type: "richtext", required: true, placeholder: "Tulis kata pengantar..." },
      { key: "imageUrl", label: "Gambar / ilustrasi pendamping", type: "image", help: "Opsional." },
      STATUS_FIELD,
      ORDER_FIELD,
    ],
  },
  {
    type: "tujuan-portofolio",
    label: "Tujuan Portofolio",
    plural: "Tujuan Portofolio",
    slug: "tujuan-portofolio",
    group: "beranda",
    description: "Kartu tujuan E-Portofolio yang tampil di Beranda.",
    icon: "🎯",
    hasDetail: false,
    emptyMessage: "Belum ada tujuan yang ditambahkan.",
    fields: [
      { key: "title", label: "Judul tujuan", type: "text", required: true, placeholder: "Mendokumentasikan proses..." },
      { key: "body", label: "Deskripsi", type: "textarea", required: true, placeholder: "Penjelasan singkat tujuan..." },
      { key: "icon", label: "Ikon (emoji)", type: "text", placeholder: "📚", help: "Satu emoji, contoh: 📚 🎯 💡" },
      STATUS_FIELD,
      ORDER_FIELD,
    ],
  },
  {
    type: "perjalanan-ppg",
    label: "Gambaran Perjalanan PPG",
    plural: "Perjalanan PPG",
    slug: "perjalanan-ppg",
    group: "beranda",
    description: "Linimasa perjalanan PPG: kegiatan, periode, deskripsi, foto & dokumen.",
    icon: "🗺️",
    hasDetail: true,
    emptyMessage: "Belum ada tahapan perjalanan yang ditambahkan.",
    fields: [
      { key: "title", label: "Nama / judul kegiatan", type: "text", required: true, placeholder: "Orientasi PPG / PPL / ..." },
      { key: "period", label: "Tanggal / periode", type: "text", placeholder: "Contoh: Januari – Maret 2025" },
      { key: "body", label: "Deskripsi kegiatan", type: "richtext", placeholder: "Ceritakan kegiatan..." },
      ...COMMON_MEDIA_FIELDS,
      STATUS_FIELD,
      ORDER_FIELD,
    ],
  },
  {
    type: "pendidikan",
    label: "Perjalanan Pendidikan",
    plural: "Riwayat Pendidikan",
    slug: "pendidikan",
    group: "profilku",
    description: "Riwayat pendidikan formal pemilik portofolio.",
    icon: "🎓",
    hasDetail: true,
    emptyMessage: "Belum ada riwayat pendidikan yang ditambahkan.",
    fields: [
      { key: "title", label: "Nama institusi", type: "text", required: true, placeholder: "Contoh: Universitas ..." },
      {
        key: "jenjang",
        label: "Jenjang",
        type: "select",
        options: [
          { value: "SD", label: "SD" },
          { value: "SMP", label: "SMP" },
          { value: "SMA/SMK", label: "SMA/SMK" },
          { value: "D3", label: "D3" },
          { value: "S1", label: "S1" },
          { value: "S2", label: "S2" },
          { value: "PPG", label: "PPG" },
          { value: "Pelatihan", label: "Pelatihan" },
          { value: "Lainnya", label: "Lainnya" },
        ],
      },
      { key: "period", label: "Tahun / periode", type: "text", placeholder: "Contoh: 2018 – 2022" },
      { key: "body", label: "Keterangan", type: "textarea", placeholder: "Jurusan, fokus studi, capaian..." },
      ...COMMON_MEDIA_FIELDS,
      STATUS_FIELD,
      ORDER_FIELD,
    ],
  },
  {
    type: "visi-filosofi",
    label: "Visi & Filosofi",
    plural: "Visi & Filosofi",
    slug: "visi-filosofi",
    group: "profilku",
    description: "Visi, filosofi mengajar, nilai, prinsip & komitmen.",
    icon: "💡",
    hasDetail: false,
    emptyMessage: "Belum ada visi atau filosofi yang ditambahkan.",
    fields: [
      {
        key: "category",
        label: "Kategori",
        type: "select",
        required: true,
        options: [
          { value: "Visi sebagai Guru", label: "Visi sebagai Guru" },
          { value: "Filosofi Mengajar", label: "Filosofi Mengajar" },
          { value: "Nilai Dasar", label: "Nilai-nilai Landasan" },
          { value: "Prinsip Relasi", label: "Prinsip Hubungan dengan Peserta Didik" },
          { value: "Komitmen", label: "Komitmen Inklusif & Berpusat pada Peserta Didik" },
          { value: "Lainnya", label: "Lainnya" },
        ],
      },
      { key: "title", label: "Judul", type: "text", required: true, placeholder: "Judul bagian..." },
      { key: "body", label: "Isi", type: "richtext", required: true, placeholder: "Tulis isi..." },
      { key: "imageUrl", label: "Gambar pendamping", type: "image", help: "Opsional." },
      STATUS_FIELD,
      ORDER_FIELD,
    ],
  },
  {
    type: "kompetensi",
    label: "Kompetensi & Pengembangan Diri",
    plural: "Kompetensi & Pengembangan Diri",
    slug: "kompetensi",
    group: "profilku",
    description: "Kompetensi pedagogik, profesional, sosial, kepribadian, pelatihan & digital.",
    icon: "🌟",
    hasDetail: true,
    emptyMessage: "Belum ada data kompetensi yang ditambahkan.",
    fields: [
      {
        key: "category",
        label: "Kategori",
        type: "select",
        required: true,
        options: [
          { value: "Pedagogik", label: "Kompetensi Pedagogik" },
          { value: "Profesional", label: "Kompetensi Profesional" },
          { value: "Sosial", label: "Kompetensi Sosial" },
          { value: "Kepribadian", label: "Kompetensi Kepribadian" },
          { value: "Pengembangan Diri", label: "Pengembangan Diri & Pelatihan" },
          { value: "Digital & Inovasi", label: "Keterampilan Digital & Inovasi" },
          { value: "Lainnya", label: "Lainnya" },
        ],
      },
      { key: "title", label: "Judul kompetensi / kegiatan", type: "text", required: true, placeholder: "Contoh: Pelatihan ..." },
      { key: "body", label: "Deskripsi & bukti pendukung", type: "richtext", placeholder: "Deskripsi, bukti, capaian..." },
      ...COMMON_MEDIA_FIELDS,
      STATUS_FIELD,
      ORDER_FIELD,
    ],
  },
  {
    type: "lk-rancangan",
    label: "Analisis Rancangan Pembelajaran",
    plural: "Analisis Rancangan Pembelajaran",
    slug: "analisis-rancangan",
    group: "lk",
    description: "Perangkat ajar, modul ajar/RPP, tujuan & langkah kegiatan.",
    icon: "📝",
    hasDetail: true,
    emptyMessage: "Belum ada dokumen yang ditambahkan.",
    fields: lkFields(),
  },
  {
    type: "lk-materi",
    label: "Analisis Materi Pembelajaran",
    plural: "Analisis Materi Pembelajaran",
    slug: "analisis-materi",
    group: "lk",
    description: "Konsep utama, karakteristik materi & kesesuaian tujuan.",
    icon: "📚",
    hasDetail: true,
    emptyMessage: "Belum ada dokumen yang ditambahkan.",
    fields: lkFields(),
  },
  {
    type: "lk-media",
    label: "Analisis Media Pembelajaran",
    plural: "Analisis Media Pembelajaran",
    slug: "analisis-media",
    group: "lk",
    description: "Alasan pemilihan media, kesesuaian peserta didik, foto & video.",
    icon: "🎬",
    hasDetail: true,
    emptyMessage: "Belum ada dokumen yang ditambahkan.",
    fields: lkFields(),
  },
  {
    type: "lk-video",
    label: "Analisis Video Praktik Mengajar",
    plural: "Analisis Video Praktik Mengajar",
    slug: "analisis-video-praktik",
    group: "lk",
    description: "Video praktik mandiri, kekuatan & aspek peningkatan.",
    icon: "🎥",
    hasDetail: true,
    emptyMessage: "Belum ada dokumen yang ditambahkan.",
    fields: lkFields([
      { key: "videoUrl", label: "Tautan video utama (YouTube/Drive)", type: "url", placeholder: "https://..." },
    ]),
  },
  {
    type: "lk-nonmengajar",
    label: "Analisis Kegiatan Nonmengajar",
    plural: "Analisis Kegiatan Nonmengajar",
    slug: "analisis-nonmengajar",
    group: "lk",
    description: "Dokumentasi kegiatan nonmengajar, tujuan & refleksi.",
    icon: "🤝",
    hasDetail: true,
    emptyMessage: "Belum ada dokumen yang ditambahkan.",
    fields: lkFields(),
  },
  {
    type: "lk-instrumen",
    label: "Instrumen Penilaian & Analisisnya",
    plural: "Instrumen Penilaian",
    slug: "instrumen-penilaian",
    group: "lk",
    description: "Kisi-kisi, rubrik, observasi, hasil & analisis.",
    icon: "📊",
    hasDetail: true,
    emptyMessage: "Belum ada dokumen yang ditambahkan.",
    fields: lkFields(),
  },
  {
    type: "lk-refleksi",
    label: "Refleksi Diri",
    plural: "Refleksi Diri",
    slug: "refleksi-diri",
    group: "lk",
    description: "Refleksi proses, tantangan, pembelajaran & rencana perbaikan.",
    icon: "🪞",
    hasDetail: true,
    emptyMessage: "Belum ada dokumen yang ditambahkan.",
    fields: lkFields(),
  },
  {
    type: "lk-evaluasi",
    label: "Evaluasi",
    plural: "Evaluasi",
    slug: "evaluasi",
    group: "lk",
    description: "Evaluasi proses & hasil, tindak lanjut & pengembangan.",
    icon: "✅",
    hasDetail: true,
    emptyMessage: "Belum ada dokumen yang ditambahkan.",
    fields: lkFields(),
  },
  {
    type: "refleksi-semester-1",
    label: "Refleksi Mata Kuliah Semester 1",
    plural: "Refleksi Semester 1",
    slug: "refleksi-semester-1",
    group: "refleksi",
    description: "Refleksi pembelajaran mata kuliah PPG pada semester 1.",
    icon: "📘",
    hasDetail: true,
    emptyMessage: "Belum ada refleksi semester 1 yang ditambahkan.",
    fields: [
      { key: "title", label: "Judul refleksi", type: "text", required: true, placeholder: "Contoh: Refleksi Mata Kuliah ..." },
      { key: "mataKuliah", label: "Mata kuliah", type: "text", placeholder: "Nama mata kuliah" },
      { key: "excerpt", label: "Ringkasan", type: "textarea" },
      { key: "body", label: "Isi refleksi", type: "richtext", required: true, placeholder: "Tulis refleksi..." },
      { key: "period", label: "Periode / semester", type: "text", placeholder: "Semester 1" },
      ...COMMON_MEDIA_FIELDS,
      STATUS_FIELD,
      ORDER_FIELD,
    ],
  },
  {
    type: "refleksi-semester-2",
    label: "Refleksi Mata Kuliah Semester 2",
    plural: "Refleksi Semester 2",
    slug: "refleksi-semester-2",
    group: "refleksi",
    description: "Refleksi pembelajaran mata kuliah PPG pada semester 2.",
    icon: "📗",
    hasDetail: true,
    emptyMessage: "Belum ada refleksi semester 2 yang ditambahkan.",
    fields: [
      { key: "title", label: "Judul refleksi", type: "text", required: true, placeholder: "Contoh: Refleksi Mata Kuliah ..." },
      { key: "mataKuliah", label: "Mata kuliah", type: "text", placeholder: "Nama mata kuliah" },
      { key: "excerpt", label: "Ringkasan", type: "textarea" },
      { key: "body", label: "Isi refleksi", type: "richtext", required: true, placeholder: "Tulis refleksi..." },
      { key: "period", label: "Periode / semester", type: "text", placeholder: "Semester 2" },
      ...COMMON_MEDIA_FIELDS,
      STATUS_FIELD,
      ORDER_FIELD,
    ],
  },
  {
    type: "refleksi-ppl",
    label: "Refleksi Selama PPL",
    plural: "Refleksi PPL",
    slug: "refleksi-ppl",
    group: "refleksi",
    description: "Refleksi praktik pengalaman lapangan (PPL) mandiri.",
    icon: "🪞",
    hasDetail: true,
    emptyMessage: "Belum ada refleksi PPL yang ditambahkan.",
    fields: [
      { key: "title", label: "Judul refleksi", type: "text", required: true, placeholder: "Contoh: Refleksi Siklus 1 di SDN Banyuajuh 2" },
      { key: "sekolah", label: "Sekolah / lokasi PPL", type: "text", placeholder: "Contoh: UPTD SDN Banyuajuh 2" },
      { key: "siklus", label: "Siklus / tahap", type: "text", placeholder: "Siklus 1" },
      { key: "excerpt", label: "Ringkasan", type: "textarea" },
      { key: "body", label: "Isi refleksi", type: "richtext", required: true, placeholder: "Tulis refleksi PPL..." },
      { key: "period", label: "Periode", type: "text" },
      ...COMMON_MEDIA_FIELDS,
      STATUS_FIELD,
      ORDER_FIELD,
    ],
  },
  {
    type: "karya-inovasi",
    label: "Karya Inovasi Pendidikan",
    plural: "Karya Inovasi Pendidikan",
    slug: "karya-inovasi",
    group: "karya",
    description: "Karya inovasi, media, dan pengembangan pembelajaran.",
    icon: "💡",
    hasDetail: true,
    emptyMessage: "Belum ada karya inovasi yang ditambahkan.",
    fields: [
      { key: "title", label: "Judul karya", type: "text", required: true, placeholder: "Contoh: Media PowerPoint Interaktif ..." },
      {
        key: "category",
        label: "Jenis karya",
        type: "select",
        options: [
          { value: "Media Pembelajaran", label: "Media Pembelajaran" },
          { value: "Perangkat Ajar", label: "Perangkat Ajar" },
          { value: "LKPD", label: "LKPD" },
          { value: "E-Modul / E-Magazine", label: "E-Modul / E-Magazine" },
          { value: "Video Pembelajaran", label: "Video Pembelajaran" },
          { value: "Penelitian Tindakan", label: "Penelitian Tindakan / PTK" },
          { value: "Lainnya", label: "Lainnya" },
        ],
      },
      { key: "excerpt", label: "Deskripsi singkat", type: "textarea" },
      { key: "body", label: "Uraian karya & manfaatnya", type: "richtext", required: true },
      { key: "period", label: "Tahun / periode", type: "text" },
      ...COMMON_MEDIA_FIELDS,
      STATUS_FIELD,
      ORDER_FIELD,
    ],
  },
];

export function getContentType(type: string): ContentTypeDef | undefined {
  return CONTENT_TYPES.find((c) => c.type === type);
}

export function getContentTypeBySlug(slug: string): ContentTypeDef | undefined {
  return CONTENT_TYPES.find((c) => c.slug === slug);
}

export const LK_TYPES = CONTENT_TYPES.filter((c) => c.group === "lk");
export const BERANDA_TYPES = CONTENT_TYPES.filter((c) => c.group === "beranda");
export const PROFILKU_TYPES = CONTENT_TYPES.filter((c) => c.group === "profilku");

export interface EntryFile {
  name: string;
  url: string;
  apiUrl: string;
  size?: number;
  mime?: string;
  label?: string;
}

export interface EntryLink {
  title: string;
  url: string;
}

export interface EntryDTO {
  id: string;
  type: string;
  title: string;
  slug?: string | null;
  excerpt?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  images: string[];
  files: EntryFile[];
  links: EntryLink[];
  meta: Record<string, string>;
  status: string;
  sortOrder: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface SettingDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "image" | "checkbox" | "url" | "position";
  help?: string;
  placeholder?: string;
  group: string;
}

export const SETTING_GROUPS = [
  { id: "hero", label: "Hero & Identitas Utama", icon: "🏠" },
  { id: "identitas", label: "Identitas Diri", icon: "👩‍🏫" },
  { id: "cv", label: "Curriculum Vitae", icon: "📄" },
  { id: "situs", label: "Pengaturan Situs", icon: "⚙️" },
] as const;

export const SETTING_DEFS: SettingDef[] = [
  { key: "site_title", label: "Judul situs", type: "text", group: "situs", placeholder: "E-Portofolio PPG" },
  { key: "hero_kicker", label: "Sapaan kecil di atas judul", type: "text", group: "hero", placeholder: "Halo, saya" },
  { key: "owner_name", label: "Nama pemilik", type: "text", group: "hero", placeholder: "Fatimah Azzahra’, S.Pd." },
  { key: "owner_title", label: "Gelar / peran singkat", type: "text", group: "hero", placeholder: "Calon Guru, Pembelajar Sepanjang Hayat" },
  { key: "hero_title", label: "Judul utama hero", type: "text", group: "hero", placeholder: "FATIMAH AZZAHRA’" },
  { key: "hero_subtitle", label: "Subjudul hero", type: "text", group: "hero", placeholder: "Calon Guru, Pembelajar Sepanjang Hayat" },
  { key: "hero_quote", label: "Kutipan pendek hero", type: "text", group: "hero", placeholder: "Guru hari ini, untuk masa depan mereka." },
  { key: "hero_description", label: "Kalimat pengantar hero", type: "textarea", group: "hero" },
  { key: "hero_image", label: "Foto profil utama (hero)", type: "image", group: "hero", help: "Unggah foto asli — tidak diproses atau diubah. Tampil apa adanya." },
  { key: "hero_image_pos", label: "Focal point foto hero", type: "position", group: "hero", help: "Atur bagian foto yang menjadi titik fokus saat dipotong." },
  { key: "university", label: "Universitas", type: "text", group: "hero", placeholder: "Universitas Trunodjoyo Madura" },
  { key: "about_text", label: "Teks bagian Tentang Saya", type: "textarea", group: "hero", help: "Pisahkan paragraf dengan baris kosong." },
  { key: "about_note", label: "Catatan tangan di bagian Tentang Saya", type: "text", group: "hero" },
  { key: "full_name", label: "Nama lengkap", type: "text", group: "identitas", placeholder: "Fatimah Azzahra’, S.Pd." },
  { key: "birth_info", label: "Tempat & tanggal lahir", type: "text", group: "identitas" },
  { key: "show_birth", label: "Tampilkan TTL di publik", type: "checkbox", group: "identitas" },
  { key: "address", label: "Alamat / domisili", type: "text", group: "identitas", placeholder: "Dusun Mireng, RT/RW 004/005, Desa Sumberagung, Kec. Megaluh, Kab. Jombang" },
  { key: "show_address", label: "Tampilkan alamat di publik", type: "checkbox", group: "identitas" },
  { key: "email", label: "Email / kontak", type: "text", group: "identitas" },
  { key: "show_email", label: "Tampilkan email di publik", type: "checkbox", group: "identitas" },
  { key: "study_program", label: "Program studi", type: "text", group: "identitas", placeholder: "Pendidikan Profesi Guru, Pendidikan Guru Sekolah Dasar" },
  { key: "short_bio", label: "Deskripsi singkat tentang diri", type: "textarea", group: "identitas" },
  { key: "extra_info", label: "Informasi tambahan", type: "textarea", group: "identitas" },
  { key: "profile_photo", label: "Foto profil (halaman Identitas)", type: "image", group: "identitas" },
  { key: "profile_photo_pos", label: "Focal point foto identitas", type: "position", group: "identitas" },
  { key: "cv_summary", label: "Ringkasan profil (CV)", type: "textarea", group: "cv" },
  { key: "cv_education", label: "Riwayat pendidikan (CV – teks)", type: "textarea", group: "cv", help: "Satu baris per riwayat. Detail terstruktur dikelola di menu Perjalanan Pendidikan." },
  { key: "cv_experience", label: "Pengalaman mengajar / relevan", type: "textarea", group: "cv" },
  { key: "cv_training", label: "Pelatihan & sertifikasi", type: "textarea", group: "cv" },
  { key: "cv_skills", label: "Kompetensi / keterampilan", type: "textarea", group: "cv" },
  { key: "cv_achievements", label: "Prestasi / penghargaan", type: "textarea", group: "cv" },
  { key: "cv_extra", label: "Pengalaman organisasi & kegiatan sosial", type: "textarea", group: "cv", help: "Gunakan “**Nama jabatan — Organisasi** (tahun)” lalu baris uraian." },
  { key: "cv_file", label: "Berkas CV (PDF)", type: "text", group: "cv", help: "URL file dari hasil unggah (mis. /api/media/...).", placeholder: "/api/media/namafile.pdf" },
  { key: "photo_wisuda", label: "Foto wisuda / formal", type: "image", group: "cv" },
  { key: "photo_wisuda_pos", label: "Focal point foto wisuda", type: "position", group: "cv" },
  { key: "photo_ppl", label: "Foto kegiatan PPL", type: "image", group: "cv" },
  { key: "photo_ppl_pos", label: "Focal point foto PPL", type: "position", group: "cv" },
  { key: "photo_karya", label: "Dokumentasi karya pendidikan", type: "image", group: "cv" },
  { key: "photo_karya_pos", label: "Focal point foto karya", type: "position", group: "cv" },
  { key: "photo_tentang", label: "Foto pendukung Tentang Saya", type: "image", group: "hero" },
  { key: "photo_tentang_pos", label: "Focal point foto Tentang Saya", type: "position", group: "hero" },
  { key: "cv_visi", label: "Visi Saya sebagai Guru", type: "textarea", group: "cv", help: "Tampil pada Profilku → Visi & Filosofi." },
  { key: "cv_filosofi", label: "Filosofi Mengajar", type: "textarea", group: "cv" },
  { key: "cv_nilai", label: "Nilai-Nilai yang Menjadi Landasan", type: "textarea", group: "cv" },
  { key: "cv_prinsip", label: "Prinsip dalam Membangun Relasi", type: "textarea", group: "cv" },
  { key: "cv_komitmen", label: "Komitmen dalam Pembelajaran", type: "textarea", group: "cv" },
  { key: "footer_text", label: "Teks footer", type: "text", group: "situs" },
  { key: "marquee_text", label: "Kutipan / motto", type: "text", group: "situs", placeholder: "Guru hari ini, untuk masa depan mereka" },
];

export const DEFAULT_SETTINGS: Record<string, string> = {
  site_title: "E-Portofolio PPG",
  hero_kicker: "Halo, saya",
  owner_name: "Fatimah Azzahra’, S.Pd.",
  owner_title: "Calon Guru, Pembelajar Sepanjang Hayat",
  hero_title: "FATIMAH AZZAHRA’",
  hero_subtitle: "Calon Guru, Pembelajar Sepanjang Hayat",
  hero_quote: "Guru hari ini, untuk masa depan mereka.",
  hero_description:
    "Dokumentasi perjalanan belajar, praktik pembelajaran, dan refleksi saya selama menempuh Pendidikan Profesi Guru.",
  hero_image: "",
  hero_image_pos: "50% 30%",
  university: "Universitas Trunodjoyo Madura",
  about_text:
    "Perkenalkan, saya **Fatimah Azzahra’, S.Pd.**, lulusan S1 Pendidikan Guru Sekolah Dasar Universitas Trunodjoyo Madura yang memiliki ketertarikan besar terhadap dunia pendidikan dan perkembangan anak. Bagi saya, menjadi guru bukan sekadar profesi untuk menyampaikan pengetahuan, melainkan sebuah perjalanan untuk belajar memahami manusia, menumbuhkan karakter, dan mendampingi setiap anak agar mampu berkembang sesuai potensinya.\n\nPengalaman mengajar, keterlibatan dalam program Kampus Mengajar, kegiatan organisasi, serta perjalanan saya dalam Pendidikan Profesi Guru telah membentuk cara pandang saya terhadap pendidikan. Saya belajar bahwa pembelajaran yang bermakna membutuhkan perpaduan antara pengetahuan, keteladanan, kreativitas, empati, dan kemauan untuk terus memperbaiki diri.\n\nSaya ingin tumbuh menjadi guru yang tidak hanya dikenang karena apa yang diajarkan, tetapi juga karena kebaikan, ketenangan, dan pengaruh positif yang ditinggalkan dalam kehidupan murid. Bagi saya, setiap anak memiliki potensi untuk berkembang, dan tugas guru adalah membantu mereka menemukan serta menumbuhkan potensi tersebut.",
  about_note: "ditulis dari hati, untuk pendidikan Indonesia",
  full_name: "Fatimah Azzahra’, S.Pd.",
  birth_info: "",
  show_birth: "false",
  address: "Dusun Mireng, RT/RW 004/005, Desa Sumberagung, Kecamatan Megaluh, Kabupaten Jombang",
  show_address: "true",
  email: "",
  show_email: "false",
  study_program: "Pendidikan Profesi Guru, Pendidikan Guru Sekolah Dasar",
  short_bio:
    "Lulusan S1 Pendidikan Guru Sekolah Dasar Universitas Trunodjoyo Madura yang tertarik pada dunia pendidikan dan perkembangan anak.",
  extra_info: "",
  profile_photo: "",
  profile_photo_pos: "50% 30%",
  cv_summary: "",
  cv_education: "",
  cv_experience: "",
  cv_training: "",
  cv_skills: "",
  cv_achievements: "",
  cv_extra: "",
  photo_wisuda: "",
  photo_wisuda_pos: "50% 30%",
  photo_ppl: "",
  photo_ppl_pos: "50% 40%",
  photo_karya: "",
  photo_karya_pos: "50% 40%",
  photo_tentang: "",
  photo_tentang_pos: "50% 40%",
  cv_visi: "",
  cv_filosofi: "",
  cv_nilai: "",
  cv_prinsip: "",
  cv_komitmen: "",
  cv_file: "",
  footer_text: "E-Portofolio Pendidikan Profesi Guru • Fatimah Azzahra’, S.Pd. • Universitas Trunodjoyo Madura",
  marquee_text: "Guru hari ini, untuk masa depan mereka",
};

export function isValidUrl(v: string): boolean {
  if (!v) return false;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
