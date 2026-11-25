# E-Portofolio PPG — Fatimah Azzahra, S.Pd.

Website E-Portofolio perjalanan Pendidikan Profesi Guru (PPG): dinamis, dikelola via panel admin, Next.js App Router + PostgreSQL (Drizzle) + Tailwind v4.

## 🚀 Ingin tautan yang permanen & bisa dibuka kapan saja?

Lihat **[DEPLOY.md](./DEPLOY.md)** — panduan lengkap (±20 menit, gratis) untuk deploy ke Vercel + Neon, sehingga portofolio Anda memiliki domain tetap seperti `e-portofolio-ppg.vercel.app` yang bisa dibagikan ke siapa pun.

> Tautan *preview* di lingkungan pengembangan bersifat **sementara** (sandbox dibuat ulang tiap sesi, dan aksesnya dikunci token platform). Solusi untuk tautan permanen ada di `DEPLOY.md`.

Template variabel lingkungan tersedia di **[.env.example](./.env.example)** — jangan pernah mengunggah `.env` berisi nilai asli ke repositori (sudah dijaga oleh `.gitignore`).

---

## Panel Admin — panduan pemakaian

Masuk lewat `/admin/login`. Semua perubahan **tersimpan permanen di PostgreSQL** (bukan localStorage/state) dan langsung tampil di halaman publik setelah disimpan.

### Kredensial
Kata sandi admin dibaca dari variabel lingkungan `ADMIN_PASSWORD` **di server**; sudah diatur di `.env`:
```
ADMIN_PASSWORD=aljabbar123@
SESSION_SECRET=<string acak 64 karakter>
```
Sandi **tidak pernah** dikirim ke browser, tidak muncul di HTML/JS frontend, log, maupun antarmuka. `SESSION_SECRET` dipakai untuk menandatangani cookie sesi (HMAC-SHA256). Untuk produksi, set kedua variabel tersebut pada panel hosting Anda.

### Keamanan
- Kata sandi diverifikasi **di server** (`POST /api/auth/login`). Tidak ada pemeriksaan sandi di frontend.
- Sesi = cookie `eportofolio_session` **httpOnly + SameSite=lax**, ditandatangani HMAC-SHA256, kedaluwarsa 7 hari.
- **Logout benar-benar mengakhiri sesi**: panel menyimpan *penanda sesi* (`session_epoch`) di database. Saat login/logout penanda diputar, sehingga cookie lama otomatis ditolak server (terverifikasi: setelah logout `/admin` → 307, `PUT /api/settings` → 401).
- Pembatasan laju: maks. 8 percobaan gagal / 10 menit per IP (HTTP 429).
- Semua halaman & endpoint admin memeriksa sesi di server; pengunjung anonim mendapat `307 → /admin/login` atau `401`.
- Tombol **tampilkan/sembunyikan kata sandi**, pesan kesalahan jelas, dan tombol **Keluar** (dengan konfirmasi).

### Struktur panel
| Menu | Fungsi |
|---|---|
| **Dasbor** | Ringkasan jumlah konten, status kelengkapan per bagian (bar progres), tombol ke semua bagian, Pratinjau Website, Simpan Perubahan, Keluar |
| **Editor Beranda** | 7 tab: Hero & Identitas, Tentang Saya, Riwayat & Linimasa Pendidikan, Pengalaman Kerja & Organisasi, Kompetensi & Pelatihan, Visi/Filosofi/Nilai/Komitmen, Lainnya |
| **Editor Profilku** | Pintasan ke 5 bagian Profilku + ringkasan identitas tersimpan |
| **Beranda / Profilku / LK / Refleksi PPL / Karya Inovasi** | Daftar konten: cari, filter status, urutkan ↑↓, ubah status, edit, hapus (konfirmasi) |
| **Pengaturan website** | Editor per tab (Hero/Identitas/CV/Situs) |
| **Cadangan & pemulihan** | Ekspor/impor JSON |
| **Keluar** | Hancurkan sesi |

### Editor teks
Semua bidang panjang memakai **editor berformat** dengan tombol: **B** (tebal `**teks**`), **H** (judul bagian `## `), **• Poin**, **1. Nomor**, **Butir+Judul** (`**1. Judul**` + baris uraian), penghitung karakter, **panduan format**, dan **pratinjau format** langsung. Hasilnya dirender oleh `RichText` di halaman publik.

### Fitur foto (foto asli, tanpa AI)
Komponen `PhotoField` menyediakan: unggah dari perangkat, **pratinjau ber-crop sesuai tampilan publik**, ganti foto, hapus (konfirmasi), **focal point X/Y (slider)**, dan **zoom 1–2×**. Foto disimpan ke `public/uploads/` (permanen) dan dilayani `/api/media/[name]`; metadata & URL tersimpan di database sehingga tetap tampil setelah reload/logout. **Tidak ada filter, penghalusan, atau penggambaran ulang wajah** — yang diubah hanya posisi & potongan tampak.

### Menu admin (lima menu utama website)
1. **Identitas Diri** (`/admin/identitas`) — nama, alamat, program studi, bidang studi, universitas, foto profil/hero/wisuda, dan toggle privasi. Tersimpan otomatis tampil di Beranda & Profilku.
2. **Refleksi Semester 1** (`/admin/konten/refleksi-semester-1`)
3. **Refleksi Semester 2** (`/admin/konten/refleksi-semester-2`)
4. **Refleksi Selama PPL** (`/admin/konten/refleksi-ppl`) — field khusus: sekolah/lokasi & siklus.
5. **Karya Inovasi Pendidikan** (`/admin/konten/karya-inovasi`)

Tambahan: **Editor Beranda** (hero & Tentang Saya), **Beranda & Profilku** (5 tab: Tentang Saya, Visi/Filosofi/Nilai, Riwayat Pendidikan, Pengalaman Kerja & Organisasi, Kompetensi & Pelatihan), 8 kategori LK, Pengaturan, Cadangan.

Slot foto: `hero_image` (Beranda), `profile_photo` (Identitas), `photo_wisuda`, `photo_ppl` (kegiatan PPL), `photo_karya` (dokumentasi karya), `photo_tentang`, serta gambar per entri (sampul + galeri).

### Batas unggahan
Gambar (JPG/PNG/WEBP/GIF) maksimal **6 MB**; dokumen (PDF/DOC/DOCX/PPT/PPTX/XLS/XLSX/TXT/CSV) maksimal **10 MB**. Tipe berbahaya (html/js/php/exe/svg) ditolak. Pesan galat jelas untuk: berkas terlalu besar (`413`), tipe tidak didukung (`415`), dan sesi berakhir (`401`).

### Indikator simpan & pratinjau
Setiap editor punya **bilah simpan lengket**: penanda `● Ada perubahan yang belum disimpan`, status `✓ tersimpan` + waktu, pesan galat bila gagal, tombol **Simpan Perubahan**, **Simpan & Publikasikan**, **Batal** (dengan konfirmasi), dan **Pratinjau ↗** (buka tab baru, *tidak* memublikasikan). Peringatan browser muncul bila menutup tab dengan perubahan yang belum disimpan.

### Bagian Refleksi PPL & Karya Inovasi
- `/refleksi` — Refleksi Mata Kuliah Semester 1, Semester 2, dan Refleksi Selama PPL (field khusus: mata kuliah, sekolah/lokasi, siklus/tahap).
- `/karya-inovasi` — Karya Inovasi Pendidikan (jenis karya: Media, Perangkat Ajar, LKPD, E-Modul, Video, PTK).
- Dikelola di `/admin/konten/refleksi-ppl`, `/admin/konten/refleksi-semester-1`, `refleksi-semester-2`, dan `/admin/konten/karya-inovasi`. Kedua halaman publik terhubung dari Profilku, footer, submenu seluler, dan halaman LK.

### Pengujian yang telah dijalankan
login salah/kosong/benar • akses admin anonim (307) • ubah nama & teks Beranda → tampil publik • unggah & ganti foto → tampil setelah reload • logout→login → data tetap • CRUD refleksi & karya • reorder • hapus dengan konfirmasi • anonim ditolak (401) untuk settings/entries/upload/backup • `/api/health` OK • `next typegen`, `tsc --noEmit`, `npm run build`, `build_and_start` lolos.

---


## Identitas visual — Elegant Soft Scrapbook Education Portfolio

Redesain tampilan dilakukan **tanpa mengubah arsitektur, skema database, API, autentikasi, maupun fitur**. Yang berubah hanya lapisan presentasi: token desain, tipografi, layout, komponen presentasi, dan pengisian konten.

**Palet** (token Tailwind v4 di `src/app/globals.css`):

| Token | Nilai | Peran |
|---|---|---|
| `cream` | `#FBF7EF` | latar dasar utama |
| `ivory` / `paper` | `#FDFBF6` / `#FFFEFB` | latar konten |
| `kraft-100..300` | `#F5EDDE`→`#DDCEB3` | tekstur kertas daur ulang |
| `blush-100..300` / `rose-300..700` | `#FAE8EA` / `#C48A93` | aksen dusty & blush pink |
| `terra-300..600` | `#C2705A` | aksen terracotta untuk judul/dekorasi |
| `cocoa-100..900` | `#4A3A32` (+ skala) | teks utama & bidang gelap |
| `sage-100..600` | `#A8B5A2` (+ skala) | aksen alami (bagian penutup, pelatihan) |
| `sand-100..200` | `#F6EFE3` | bidang hangat sekunder |

**Tipografi** (3 keluarga): `Fraunces` (serif editorial), `Plus Jakarta Sans` (isi), `Caveat` (tulisan tangan), plus `.label-caps` untuk metadata berkapital.

**Elemen scrapbook**: tepi kertas robek (`.torn`, `.torn-soft`), selotip washi (`.tape`, `.tape-kraft`, `.tape-sage`), bingkai polaroid (`.polaroid`), kertas catatan bergaris (`.note-paper`, `.note-lines`), tab/label jurnal (`.tab-label`, `SectionTab`), tekstur serat & titik (`.paper-fiber`, `.dot-grid`, `.grid-faint`).

**Ilustrasi SVG orisinal** (`src/components/site/Doodles.tsx`): topi wisuda, gedung sekolah, buku, pensil, penggaris, bunga, daun, bintang, hati, kertas bidang, paperclip, pesawat kertas, suasana kelas & arsip. Placeholder gambar: `public/images/collase-kertas.png`, `sketsa-buku.png`, `hero-ilustrasi.png`.

**Struktur halaman kunci**:
- **Beranda** — hero dua kolom: kiri foto polaroid ber-selotip + kutipan “Guru hari ini, untuk masa depan mereka.”; kanan “Halo, saya” → **FATIMAH AZZAHRA’** → subjudul → tabel identitas (nama, alamat, prodi, universitas) → tombol “Jelajahi Profil Saya” & “Lihat Lembar Kerja”. Lalu **Tentang Saya** (kertas jurnal asimetris, tombol “Baca Selengkapnya”), **Tujuan Portofolio** (4 potongan kertas), **Perjalanan Saya dalam PPG** (timeline horizontal di desktop / vertikal di ponsel, 5 tahap + tombol “Baca Perjalanan Saya”), dan **Penutup** berlatar sage dengan ilustrasi buku & sekolah.
- **Profilku** — daftar isi 5 bagian; Identitas, CV (dengan pratinjau PDF), Linimasa Pendidikan, Visi & Filosofi (kutipan besar + kartu nilai), Kompetensi + kartu Pelatihan & Sertifikasi.
- **LK** — indeks 8 kategori berbentuk potongan kertas bernomor besar.
- Panel admin tetap bersih & minim ornamen agar nyaman mengelola data.

**Foto asli (tanpa pemrosesan AI)**: foto profil diunggah lewat panel admin → Pengaturan → *Hero & Identitas* (`hero_image`, `profile_photo`). Gambar ditampilkan apa adanya, hanya dipotong proporsional. **Focal point** diatur dengan kisi 5×5 (`hero_image_pos`, `profile_photo_pos`, format CSS `object-position`, default `50% 30%`) agar wajah tetap terlihat baik. Foto hanya diganti, tidak digambar ulang/dihaluskan.

**Teks panjang**: komponen `RichText` merender teks dari database dengan dukungan `**tebal**`, daftar bernomor/berbutir, serta butir bernomor berjudul tebal + uraian — sehingga refleksi panjang (nilai, komitmen, kompetensi) tetap nyaman dibaca tanpa dipersingkat.

**Animasi & aksesibilitas**: `Reveal` (IntersectionObserver), hover halus, lightbox galeri (tutup dengan `Escape`), `ReadingProgress` di `PageHero`, `prefers-reduced-motion` dihormati, skip-link, indikator fokus konsisten.

**Konten awal** (`src/lib/seed.ts`, idempoten): identitas, teks Tentang Saya, seluruh CV (pendidikan, pengalaman, pelatihan, kompetensi, organisasi), 4 tujuan portofolio, 5 tahap perjalanan PPG, 4 linimasa pendidikan, 5 bagian visi & filosofi, serta 6 kompetensi + 6 pelatihan/sertifikasi. Seed hanya mengisi kunci/kategori yang **masih kosong**, dan hanya menimpa nilai scaffold lama jika nilainya persis masih nilai bawaan — sehingga suntingan pengguna tidak pernah tertimpa.

**Catatan izin berkas**: foto CV/hero/profil yang dirujuk pengaturan situs dilayani publik melalui `/api/media/[name]`; berkas milik entri `draft`/`private` (atau yang belum dirujuk entri mana pun) tetap ditolak 403 untuk pengunjung anonim.

---


## Menu utama

- **Beranda** (`/`): Hero (judul, nama, deskripsi, foto, 2 tombol), Kata Pengantar, Tujuan Portofolio (kartu), Gambaran Perjalanan PPG (timeline), Akses Cepat (Profilku & LK).
- **Profilku** (`/profilku`): 5 submenu
  - `/profilku/identitas` — nama, foto, TTL/alamat/email (bisa disembunyikan), program, bio
  - `/profilku/cv` — ringkasan, pendidikan, pengalaman, pelatihan, kompetensi, prestasi + unggah PDF & tombol lihat/unduh
  - `/profilku/pendidikan` — timeline riwayat pendidikan
  - `/profilku/visi` — visi, filosofi, nilai, prinsip, komitmen
  - `/profilku/kompetensi` — kartu kompetensi per kategori + filter + pencarian
- **Lembar Kerja** (`/lk`): 8 kartu → `/lk/[slug]` per kategori → `/detail/[id]` halaman detail
  - analisis-rancangan, analisis-materi, analisis-media, analisis-video-praktik, analisis-nonmengajar, instrumen-penilaian, refleksi-diri, evaluasi
- **Pencarian** (`/cari` atau `/api/search?q=`): hanya konten `published`.

## Cara menjalankan

```bash
npm install
# .env sudah berisi DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
npx drizzle-kit push
npm run dev
# build production:
npm run build && npm run start
```

Kesehatan: `GET /api/health` → `{ ok: true }`.

## Masuk panel admin

- Buka `/admin/login`
- Kata sandi default: `admin123`
- Production: set env `ADMIN_PASSWORD` (wajib diganti) dan `SESSION_SECRET` (acak panjang).
- Sesi: cookie httpOnly `eportofolio_session` (HMAC + kedaluwarsa 7 hari).

## Mengelola konten

- **Dasbor** (`/admin`): total, published, draf, privat + jumlah per kategori + tambah cepat.
- **Beranda / Profilku / Lembar Kerja**: navigasi sidebar sesuai `CONTENT_TYPES` di `src/lib/types.ts`.
  - Daftar (`/admin/konten/[type]`): cari, filter status, ubah status cepat, susun ulang (↑↓), edit, hapus (konfirmasi), lihat publik.
  - Baru (`/admin/konten/[type]/baru`) & Edit (`/admin/konten/[type]/[id]`): formulir dinamis dari definisi field — teks, textarea/richtext, select, gambar, galeri, file, tautan, status, urutan + pratinjau.
- **Pengaturan** (`/admin/pengaturan`): tab Hero, Identitas, CV, Situs. Termasuk checkbox privasi `show_birth/show_address/show_email`, unggah `hero_image/profile_photo`, dan unggah PDF `cv_file`.

### Menambah dokumen, gambar, tautan

1. Buka kategori LK → Tambah baru / Edit.
2. **Dokumen**: bagian “Dokumen pendukung” → Unggah (PDF/DOCX/PPTX/XLSX/TXT, maks 15 MB). Tersimpan di `public/uploads/` dengan nama acak aman; disajikan via `/api/media/[name]` dengan tombol Lihat/Unduh.
3. **Gambar**: sampul (unggah atau tempel URL) + galeri tambahan; ada pratinjau sebelum simpan, bisa ganti/hapus, ada lightbox di publik.
4. **Tautan**: judul + URL https (YouTube/Drive/dll). Divalidasi server; dibuka `target=_blank rel=noopener`.

### Publikasi & konten terbatas

- Status: `published` (publik + pencarian + file publik), `draft` (admin saja, 404 di publik), `private` (halaman 404 di publik; file via `/api/media` wajib login meski URL ditebak).
- Server menegakkan di: daftar publik, detail, search, API entries, dan media. Bukan sekadar hide di frontend.
- Informasi pribadi: hanya tampil bila checkbox `show_*` = true.
- Validasi file: ekstensi+MIME allowlist, tolak html/js/php/exe/svg, nama aman, anti path-traversal, header `X-Content-Type-Options: nosniff`, unduh paksa untuk tipe non-pratinjau.

### Ekspor & impor cadangan

- `/admin/cadangan` → Unduh JSON (`GET /api/backup/export`) berisi `{ settings, entries }`.
- Impor via `POST /api/backup/import` (gabung berdasarkan ID, validasi tipe via `CONTENT_TYPES`).
- File biner tidak ikut JSON — salinkan folder `public/uploads/` manual.

## Arsitektur & database

```
src/db/schema.ts      → tabel entries(id, type, title, slug, excerpt, body, imageUrl, images[], files[], links[], meta{}, status, sortOrder) + settings(key, value)
src/lib/types.ts      → SATU sumber kebenaran: CONTENT_TYPES (14 tipe), SETTING_DEFS, DEFAULT_SETTINGS, DTO
src/lib/data.ts       → getAllSettings/saveSettings/listEntries/getEntryById/validateEntryPayload/cleanedToRow
src/lib/seed.ts       → ensureTables + seed tujuan (5 kartu sesuai spek) + kata pengantar template; dipanggil lazy di setiap akses data
src/lib/auth.ts       → HMAC session cookie
src/lib/upload.ts     → sanitasi & allowlist file
src/app/api/*         → auth, entries (+reorder), settings, upload, media/[name], search, backup, health
src/components/site  → Navbar, Footer, PageHero, SectionHead, EntryCard, FilterableEntries, Gallery, Reveal, ReadingProgress, EmptyState, FileList, LinkList, BodyText
src/components/admin → Shell (sidebar), EntryForm (dinamis), SettingsClient, BackupClient
src/app/*             → publik (beranda, profilku×5, lk+8, detail, cari, not-found)
src/app/admin/*       → login, dasbor, konten/[type], pengaturan, cadangan
```

Seed sengaja **tidak mengarang** riwayat pendidikan, pengalaman, dokumen LK, atau tanggal pribadi — kategori kosong menampilkan “Belum ada dokumen yang ditambahkan” + ilustrasi.

## Validasi akhir

```bash
npx next typegen
npm exec tsc -- --noEmit
npm run build
# lalu via tool build_and_start (bootstrap DB + build + start + cek /api/health)
```
