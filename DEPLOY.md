# Panduan Deploy — Membuat Tautan Portofolio yang Permanen

Tautan preview di lingkungan Arena AI **bersifat sementara**: sandbox dibuat ulang
setiap sesi, dan aksesnya dikunci token platform. Karena itu tautan preview **tidak
bisa** dijadikan tautan permanen.

Untuk mendapatkan tautan yang **bisa diakses kapan pun selama-lamanya**, aplikasi
harus dideploy ke layanan hosting. Panduan ini memakai **Vercel** (gratis) dan
**Neon** (database PostgreSQL gratis).

Hasil akhirnya berupa domain tetap, misalnya:

```
https://e-portofolio-ppg.vercel.app
```

yang tidak berubah, tidak dikunci token, dan bisa dibuka siapa pun.

---

## Ringkasan waktu

| Tahap | Waktu | Biaya |
|---|---|---|
| 1. Database di Neon | ±5 menit | Gratis |
| 2. Push kode ke GitHub | ±3 menit | Gratis |
| 3. Deploy ke Vercel | ±5 menit | Gratis |
| 4. Atur Environment Variables | ±3 menit | Gratis |
| 5. Redeploy & verifikasi | ±3 menit | — |

**Total: ±20 menit.**

---

## Tahap 1 — Buat database di Neon

1. Buka **https://neon.tech** → **Sign up** (bisa pakai akun GitHub/Google)
2. Klik **Create project**
   - Name: `e-portofolio-ppg`
   - Region: pilih yang terdekat (mis. `Singapore`)
   - PostgreSQL version: biarkan default
3. Setelah selesai, cari panel **Connection string** → pilih mode **Pooled connection**
4. Klik **Copy** — string berbentuk:
   ```
   postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
5. **Simpan string ini.** Nanti dipakai sebagai nilai `DATABASE_URL`.

> Tidak perlu membuat tabel manual. Aplikasi membuat tabel `entries` dan `settings`
> otomatis saat pertama kali dijalankan (`src/lib/seed.ts`).

---

## Tahap 2 — Push kode ke GitHub

Jika kode masih di komputer lokal:

```bash
cd <folder-proyek>

git init
git add .
git commit -m "E-Portofolio PPG siap deploy"

# Buat repositori baru di github.com, lalu:
git remote add origin https://github.com/<username>/e-portofolio-ppg.git
git branch -M main
git push -u origin main
```

> **Penting — jangan unggah `.env`.** Berkas `.env` berisi sandi dan kunci rahasia.
> Berkas `.gitignore` sudah mengecualikannya. Nilai rahasia dimasukkan nanti di
> Vercel (Tahap 4), bukan di repositori.
>
> Yang **boleh & perlu** diunggah: `.env.example` (berisi nama variabel saja,
> tanpa nilai rahasia).

---

## Tahap 3 — Deploy ke Vercel

1. Buka **https://vercel.com** → **Sign up** dengan akun GitHub
2. Klik **Add New → Project**
3. Pilih repositori `e-portofolio-ppg` → **Import**
4. **Jangan klik Deploy dulu** — berhenti di langkah **Environment Variables**
   (karena aplikasi butuh database & kredensial sebelum build)
5. Lanjut ke **Tahap 4** untuk mengisi variabel, lalu klik **Deploy**

Vercel mendeteksi Next.js otomatis, tidak perlu konfigurasi tambahan.

---

## Tahap 4 — Isi Environment Variables

Di halaman konfigurasi project Vercel (atau **Settings → Environment Variables**
setelah project dibuat), tambahkan **empat** variabel berikut:

| Name | Value | Keterangan |
|---|---|---|
| `DATABASE_URL` | `postgresql://…` dari Neon (Tahap 1) | Koneksi database |
| `ADMIN_PASSWORD` | sandi pribadi Anda, mis. `aljabbar123@` | Untuk masuk `/admin/login` |
| `SESSION_SECRET` | string acak panjang | Penanda tangan cookie sesi |
| `NODE_ENV` | `production` | Otomatis diatur Vercel — tidak perlu ditambahkan |

### Cara membuat `SESSION_SECRET`

Buka terminal, jalankan salah satu:

```bash
openssl rand -base64 48
```

atau

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Salin hasilnya (panjang ±64 karakter).

> **Jangan** mengisi `SESSION_SECRET` dengan `ADMIN_PASSWORD`. Keduanya harus
> berbeda — sandi admin bukan kunci kriptografi.

### Setelah variabel diisi

Klik **Deploy** (atau **Redeploy** bila project sudah dibuat).
Tunggu sampai statusnya **Ready**.

---

## Tahap 5 — Verifikasi

Buka domain yang diberikan Vercel, lalu cek:

| Hal | URL | Harusnya |
|---|---|---|
| Beranda | `https://<domain>/` | Tampil halaman scrapbook |
| Database | `https://<domain>/api/health` | `{"ok":true}` |
| Login admin | `https://<domain>/admin/login` | Formulir login |
| Dasbor | `https://<domain>/admin` | Setelah login berhasil |

### Uji login

1. Buka `/admin/login`
2. Masukkan `ADMIN_PASSWORD` yang Anda set di Tahap 4
3. Klik **Masuk →** → harus terbuka Dasbor

### Bila login gagal

Klik tautan **"masuk gagal? periksa status server"** di bawah tombol Masuk.
Panel itu menampilkan:

| Pesan | Penyebab | Solusi |
|---|---|---|
| `ADMIN_PASSWORD terbaca: tidak` | Variabel salah eja / belum diisi / belum redeploy | Cek ejaan persis `ADMIN_PASSWORD` → **Redeploy** |
| `Cookie sesi tersimpan: tidak` | Browser memblokir cookie | Gembok di address bar → *Site settings* → *Cookies* → *Allow* |
| `Protokol: http` | Membuka versi tanpa HTTPS | Selalu pakai `https://` |
| Semua "ya" tetapi gagal | Cookie dari deploy lama | Klik **Keluar**, lalu login lagi |

---

## Masalah yang diketahui & solusinya

### 1. Upload foto/dokumen tidak bertahan

Folder `public/uploads/` **tidak persisten** di Vercel — berkas hilang setiap
deploy ulang. Dua pilihan:

**Opsi A — Vercel Blob (rekomendasi):**
1. Di Vercel → tab **Storage** → **Create Database → Blob**
2. Hubungkan ke project → token `BLOB_READ_WRITE_TOKEN` otomatis ditambahkan
3. Sesuaikan `src/app/api/upload/route.ts` untuk menyimpan ke Blob

**Opsi B — Cloudinary:**
1. Daftar **cloudinary.com** (gratis)
2. Salin `CLOUDINARY_URL` ke Environment Variables
3. Sesuaikan `src/app/api/upload/route.ts`

**Opsi C — Tanpa perubahan:**
Upload tetap berfungsi, tetapi berkas hilang saat redeploy. Cocok bila Anda
jarang mengunggah dan siap mengunggah ulang.

### 2. Error saat build di Vercel

Biasanya karena `DATABASE_URL` belum diisi. Vercel menjalankan build yang
menyentuh database, sehingga variabel wajib ada sebelum build.

### 3. Domain khusus

Setelah deploy, di **Settings → Domains** Anda bisa menambahkan domain sendiri
(mis. `fatimahazzahra.sch.id`) — tinggal mengikuti instruksi DNS yang diberikan.

---

## Alternatif hosting (jika tidak memakai Vercel)

| Layanan | Database | Catatan |
|---|---|---|
| **Netlify** | Perlu Neon/Supabase | Mirip Vercel, serverless |
| **Render** | Bisa pakai Postgres internal | `public/uploads` persisten (disk) |
| **Railway** | Bisa pakai Postgres internal | Paling mudah untuk database + hosting sekaligus |
| **VPS (DigitalOcean/Vultr)** | Sendiri | Paling fleksibel, perlu setup sendiri |

Untuk **Render** dan **Railway**, `public/uploads/` bisa dibuat persisten dengan
disk — sehingga tidak perlu Vercel Blob/Cloudinary.

---

## Ringkasan akhir

| Di lingkungan Arena AI | Setelah deploy ke Vercel |
|---|---|
| Tautan berubah tiap sesi | Domain tetap |
| Dikunci token akses | Terbuka untuk semua |
| Berhenti saat sesi selesai | Online 24/7 |
| Cocok untuk pengembangan | Cocok untuk dibagikan ke publik |

Setelah deploy berhasil, tautan Anda bisa dimasukkan ke CV, dibagikan ke sekolah,
atau dikirim ke penguji PPG — dan tetap berlaku tanpa batas waktu.
