import { db } from "@/db";
import { entries, settings } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { DEFAULT_SETTINGS } from "./types";

let seeded = false;
let seeding: Promise<void> | null = null;

async function ensureTables() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      slug TEXT,
      excerpt TEXT,
      body TEXT,
      image_url TEXT,
      images JSONB DEFAULT '[]'::jsonb,
      files JSONB DEFAULT '[]'::jsonb,
      links JSONB DEFAULT '[]'::jsonb,
      meta JSONB DEFAULT '{}'::jsonb,
      status TEXT NOT NULL DEFAULT 'draft',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mime TEXT NOT NULL,
      size INTEGER NOT NULL,
      data TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
}

/* ============================================================
   Konten awal yang diberikan pemilik portofolio.
   - Pengaturan: hanya diisi bila kunci belum ada, ATAU nilainya
     masih persis sama dengan nilai scaffold lama (belum diedit).
   - Entri: hanya dibuat bila kategori masih kosong.
   Dengan begitu tidak ada data milik pengguna yang tertimpa.
   ============================================================ */

/** nilai scaffold lama → nilai baru (hanya ditimpa bila masih nilai lama) */
const SETTING_MIGRATION: Array<{ key: string; from: string; to: string }> = [
  { key: "owner_name", from: "Fatimah Azzahra, S.Pd.", to: "Fatimah Azzahra’, S.Pd." },
  { key: "full_name", from: "Fatimah Azzahra, S.Pd.", to: "Fatimah Azzahra’, S.Pd." },
  { key: "hero_title", from: "E-Portofolio PPG", to: "FATIMAH AZZAHRA’" },
  { key: "owner_title", from: "Calon Guru Profesional", to: "Calon Guru, Pembelajar Sepanjang Hayat" },
  { key: "study_program", from: "Pendidikan Profesi Guru (PPG)", to: "Pendidikan Profesi Guru, Pendidikan Guru Sekolah Dasar" },
  {
    key: "address",
    from: "",
    to: "Dusun Mireng, RT/RW 004/005, Desa Sumberagung, Kecamatan Megaluh, Kabupaten Jombang",
  },
  { key: "show_address", from: "false", to: "true" },
  { key: "footer_text", from: "E-Portofolio PPG • Fatimah Azzahra, S.Pd. • Dokumentasi perjalanan menjadi guru profesional", to: "E-Portofolio Pendidikan Profesi Guru • Fatimah Azzahra’, S.Pd. • Universitas Trunodjoyo Madura" },
  { key: "marquee_text", from: "Belajar • Bertumbuh • Mengabdi • Menginspirasi", to: "Guru hari ini, untuk masa depan mereka" },
  {
    key: "hero_description",
    from:
      "Dokumentasi perjalanan belajar, praktik pembelajaran, refleksi, dan pengembangan kompetensi sebagai calon guru profesional yang berdedikasi, reflektif, dan berpusat pada peserta didik.",
    to: "Dokumentasi perjalanan belajar, praktik pembelajaran, dan refleksi saya selama menempuh Pendidikan Profesi Guru.",
  },
  {
    key: "short_bio",
    from:
      "Assalamu'alaikum. Saya Fatimah Azzahra, S.Pd., calon guru profesional yang sedang menempuh perjalanan Pendidikan Profesi Guru. Portofolio ini mendokumentasikan proses belajar, praktik, dan refleksi saya dalam mengembangkan kompetensi pedagogik, profesional, sosial, dan kepribadian.",
    to:
      "Lulusan S1 Pendidikan Guru Sekolah Dasar Universitas Trunodjoyo Madura yang memiliki ketertarikan besar terhadap dunia pendidikan dan perkembangan anak.",
  },
];

const ABOUT_TEXT = DEFAULT_SETTINGS.about_text;

const CV_SUMMARY = DEFAULT_SETTINGS.about_text.split("\n\n")[0].replace(/\*\*/g, "");

const CV_EDUCATION = `**Universitas Trunojoyo Madura** — April 2021–Agustus 2025
S1 Pendidikan Guru Sekolah Dasar (PGSD) • IPK 3,90/4,00

**SMA Negeri Ploso, Jombang** — Juli 2018–Mei 2021
Peminatan Ilmu Pengetahuan Alam (IPA) • Nilai 88,67/100`;

const CV_EXPERIENCE = `**Pengajar Les Privat Independen** — Agustus 2025–Juni 2026
- Mendampingi anak usia TK dalam membaca, menulis, dan berhitung.
- Menyusun kegiatan kreatif sesuai karakteristik anak.
- Berkomunikasi dengan orang tua mengenai perkembangan belajar.

**Asisten Peneliti Program MBKM** — Agustus–Desember 2024
- Mendukung penelitian pengembangan E-Magazine DINO terintegrasi Social Emotional Learning.
- Membantu pengelolaan responden, media pembelajaran, sitasi, dan laporan penelitian.

**Kampus Mengajar Angkatan 7 — SDN Mojokrapak 2** — Januari–Juni 2024
- Mendampingi pembelajaran bersama guru kelas.
- Mengembangkan media berbasis PowerPoint interaktif.
- Mengelola publikasi, dokumentasi, dan konten digital kegiatan.`;

const CV_SKILLS = `- Komunikasi dan public speaking.
- Pengajaran dan pengelolaan kelas.
- Kepemimpinan dan kolaborasi.
- Keterampilan digital: Canva, CapCut, Microsoft Office, Mendeley, pengelolaan media sosial, fotografi, dan videografi dasar.`;

const CV_EXTRA = `**Wakil Presiden Direktur — Komunitas Public Speaking UTM** (2023–2024)
Mengoordinasikan kegiatan, mendampingi anggota, dan mengembangkan kemampuan komunikasi publik.

**Humas dan Infokom — Komunitas Mahasiswa Jombang** (2022–2023)
Membangun komunikasi dengan mitra, mengoordinasikan sosialisasi kampus, dan mengelola publikasi.

**Divisi Keilmuan — Senyum Anak Nusantara** (2022–2023)
Berkontribusi dalam pengembangan materi dan kegiatan belajar anak.

**Relawan — Rombong Sedekah** (2021)
Terlibat dalam kegiatan sosial dan penyaluran bantuan kepada masyarakat.`;

const CV_TRAINING = `- **2021** — Program Tafaqquh Fiddin (TFD), Universitas Trunojoyo Madura.
- **2022–2023** — Surat Keterangan Aktif, Komunitas Mahasiswa Jombang.
- **2023** — Kursus Mahir Dasar (KMD) Pramuka, Kwartir Cabang Bangkalan.
- **2023–2024** — Sertifikat Kepengurusan Wakil Presiden Direktur, Public Speaking UTM.
- **2024** — Program MBKM Kampus Mengajar Angkatan 7.
- **2025** — Uji Kemahiran Berbahasa Indonesia (UKBI).`;

const TUJUAN = [
  {
    title: "Dokumentasi Proses dan Hasil Pembelajaran",
    body: "Merekam perangkat, kegiatan, dan hasil pembelajaran selama PPG.",
    icon: "📁",
  },
  {
    title: "Refleksi dan Evaluasi Diri",
    body: "Mengenali kekuatan, tantangan, dan hal-hal yang perlu diperbaiki.",
    icon: "🪞",
  },
  {
    title: "Pengembangan Kompetensi Guru",
    body: "Menunjukkan perkembangan kompetensi pedagogik, profesional, sosial, dan kepribadian.",
    icon: "🌱",
  },
  {
    title: "Perjalanan Menjadi Pendidik",
    body: "Menyimpan pengalaman, karya, dan pembelajaran sebagai bekal menjadi guru profesional.",
    icon: "🧭",
  },
];

/** judul scaffold lama (untuk mendeteksi apakah masih konten bawaan) */
const TUJUAN_LAMA = [
  "Mendokumentasikan Proses & Hasil",
  "Menunjukkan Perkembangan Kompetensi",
  "Praktik & Kegiatan Nonmengajar",
  "Refleksi & Evaluasi Berkelanjutan",
  "Bukti Karya & Pengembangan Diri",
];

const PERJALANAN = [
  {
    title: "Membangun Landasan sebagai Pendidik",
    period: "Fondasi",
    body: "Mempelajari filosofi pendidikan, karakteristik murid, pembelajaran berdiferensiasi, asesmen, dan pola pikir bertumbuh.",
  },
  {
    title: "Belajar dari Kelas Nyata",
    period: "PPL Mandiri",
    body: "Menjalani PPL mandiri di UPTD SDN Banyuajuh 2 melalui observasi, asistensi mengajar, perencanaan, praktik, dan bimbingan.",
  },
  {
    title: "Memperbaiki Pembelajaran melalui Refleksi",
    period: "Refleksi",
    body: "Belajar dari Siklus 1 hingga Siklus 4 dan menyempurnakan perangkat, media, LKPD, serta strategi pembelajaran.",
  },
  {
    title: "Memperluas Perspektif Pendidikan",
    period: "Perluasan",
    body: "Mendalami pembelajaran mendalam, pembelajaran sosial emosional, etnopedagogi, dan budaya lokal.",
  },
  {
    title: "Menumbuhkan Profesionalisme",
    period: "Profesionalisme",
    body: "Mengembangkan tanggung jawab, kolaborasi, etika, refleksi, dan kemauan belajar sepanjang hayat.",
  },
];

const PENDIDIKAN = [
  { title: "SDN Sumberagung 1", jenjang: "SD", period: "2009–2015", body: "" },
  { title: "SMPN 2 Megaluh", jenjang: "SMP", period: "2015–2018", body: "" },
  { title: "SMA Negeri Ploso", jenjang: "SMA/SMK", period: "2018–2021", body: "Peminatan Ilmu Pengetahuan Alam (IPA)." },
  {
    title: "Universitas Trunojoyo Madura",
    jenjang: "S1",
    period: "2021–2025",
    body: "S1 Pendidikan Guru Sekolah Dasar (PGSD) • IPK 3,90/4,00.",
  },
];

const VISI = [
  {
    category: "Visi sebagai Guru",
    title: "Visi Saya sebagai Guru",
    body: "Menjadi guru yang dihormati, disegani, dicintai, dan dirindukan oleh murid, bukan karena rasa takut, melainkan karena keteladanan, ketulusan, ilmu, dan kebaikan yang diberikan. Saya ingin menghadirkan pendidikan yang menumbuhkan kecerdasan akademik, spiritual, serta sosial-emosional secara seimbang, sehingga murid tidak hanya berkembang dalam pengetahuan, tetapi juga memiliki akhlak yang baik, sikap tawadu, kesantunan, dan kepedulian terhadap sesama.\n\nSaya berharap dapat menjadi sosok pendidik yang menuntun dengan ketenangan, mendidik dengan ketegasan yang bijaksana, dan membersamai murid dengan kasih sayang. Sebagaimana inspirasi yang saya peroleh dari para guru di lingkungan pondok pesantren di Jombang, saya ingin menghadirkan wibawa yang lahir dari ilmu, akhlak, dan keteladanan, bukan dari rasa takut.",
  },
  {
    category: "Filosofi Mengajar",
    title: "Filosofi Mengajar",
    body: "Saya memandang mengajar sebagai proses menuntun, bukan memaksakan. Setiap murid hadir dengan karakteristik, kemampuan, pengalaman, latar belakang, dan potensi yang berbeda. Karena itu, tugas guru bukan menyeragamkan seluruh murid, melainkan menciptakan kesempatan agar setiap anak dapat tumbuh dan berkembang sesuai kebutuhannya.\n\nFilosofi ini berakar pada pemikiran Ki Hadjar Dewantara bahwa pendidikan perlu menuntun kodrat alam dan kodrat zaman murid. Pengalaman PPL di SDN Banyuajuh 2 semakin menguatkan keyakinan saya bahwa pembelajaran harus dekat dengan kehidupan nyata, menghargai budaya setempat, memberi ruang bagi keaktifan murid, dan menjadikan asesmen sebagai sarana perbaikan pembelajaran.\n\nBagi saya, keberhasilan mengajar tidak hanya terlihat dari tercapainya tujuan akademik, tetapi juga dari tumbuhnya keberanian murid untuk mencoba, kemauan untuk belajar, karakter yang baik, dan keyakinan bahwa dirinya mampu berkembang.",
  },
  {
    category: "Nilai Dasar",
    title: "Nilai-Nilai yang Menjadi Landasan",
    body: "**1. Keteladanan dan integritas**\nMenjaga keselarasan antara perkataan, tindakan, dan nilai yang diajarkan. Guru perlu menjadi contoh nyata dalam kejujuran, tanggung jawab, kesantunan, dan kedisiplinan.\n\n**2. Keberpihakan kepada murid**\nMenempatkan kebutuhan, keselamatan, perkembangan, dan martabat murid sebagai pertimbangan utama dalam mengambil keputusan pembelajaran.\n\n**3. Kasih sayang dan empati**\nMemahami kesulitan murid tanpa terburu-buru memberikan label, serta memberikan bantuan dengan sabar dan menghargai proses belajar setiap anak.\n\n**4. Keadilan dan penghargaan terhadap keberagaman**\nMemberikan dukungan sesuai kebutuhan murid, menghargai perbedaan kemampuan dan latar belakang, serta menciptakan kesempatan belajar yang inklusif.\n\n**5. Profesionalisme dan tanggung jawab**\nMenjalankan tugas sesuai kode etik guru, mempersiapkan pembelajaran dengan sungguh-sungguh, menjaga kepercayaan, dan terbuka terhadap evaluasi.\n\n**6. Pertumbuhan dan refleksi**\nMemandang kesalahan sebagai kesempatan untuk belajar, baik bagi murid maupun bagi diri saya sendiri sebagai pendidik yang terus berkembang.",
  },
  {
    category: "Prinsip Relasi",
    title: "Prinsip dalam Membangun Relasi",
    body: "Saya ingin membangun hubungan yang hangat, aman, dan saling menghormati dengan murid. Saya ingin mereka merasa nyaman bertanya, berpendapat, mencoba, bahkan melakukan kesalahan tanpa takut dipermalukan. Namun, kehangatan bukan berarti kehilangan ketegasan. Saya akan tetap menetapkan batas yang jelas, menegakkan kesepakatan kelas, dan membimbing murid memahami konsekuensi dari perilakunya.\n\nDalam relasi dengan orang tua, saya ingin mengedepankan komunikasi yang terbuka dan kolaboratif demi mendukung perkembangan anak. Sementara itu, dengan sesama guru dan tenaga kependidikan, saya berkomitmen menjaga sikap saling menghargai, berbagi pengalaman, menerima masukan, serta bekerja sama menciptakan lingkungan sekolah yang positif.",
  },
  {
    category: "Komitmen",
    title: "Komitmen dalam Pembelajaran",
    body: "Saya berkomitmen untuk:\n\n1. Mengenali karakteristik, kemampuan awal, minat, dan kebutuhan murid sebelum menentukan strategi pembelajaran.\n2. Merancang pembelajaran yang bermakna, kreatif, kontekstual, dan menyenangkan.\n3. Menyelaraskan tujuan pembelajaran, materi, kegiatan, media, dan asesmen.\n4. Menggunakan asesmen awal, formatif, dan sumatif untuk memahami perkembangan murid serta menentukan tindak lanjut.\n5. Menghargai usaha dan proses belajar melalui umpan balik yang membangun serta menumbuhkan pola pikir bertumbuh.\n6. Mengintegrasikan nilai karakter dan budaya lokal sebagai bagian dari pengalaman belajar.\n7. Melakukan refleksi setelah mengajar, menerima masukan, dan memperbaiki pembelajaran secara berkelanjutan.\n\nSaya ingin terus mengingat bahwa menjadi guru berarti bersedia belajar sepanjang hayat, sebab setiap murid, kelas, dan pengalaman mengajar selalu memberikan pelajaran baru.",
  },
];

const KOMPETENSI = [
  {
    category: "Pedagogik",
    title: "Kompetensi Pedagogik",
    body: "Kemampuan memahami karakteristik murid, merancang pembelajaran, memilih model dan media yang sesuai, mengelola kelas, serta melakukan asesmen dan tindak lanjut.\n\n**Pengembangan:** memperdalam asesmen diagnostik, pembelajaran berdiferensiasi, pengelolaan kelas, dan strategi yang mengakomodasi kebutuhan murid.",
  },
  {
    category: "Profesional",
    title: "Kompetensi Profesional",
    body: "Mengembangkan penguasaan materi, menyusun perangkat pembelajaran yang sistematis, memanfaatkan sumber belajar, serta menghubungkan teori pendidikan dengan praktik di kelas.\n\n**Pengembangan:** memperkuat penguasaan materi, kualitas media dan LKPD, ketepatan asesmen, serta evaluasi efektivitas pembelajaran.",
  },
  {
    category: "Sosial",
    title: "Kompetensi Sosial",
    body: "Berkomunikasi secara efektif, bekerja sama dengan rekan sejawat, menjalin hubungan dengan orang tua, dan membangun interaksi yang menghargai keberagaman.\n\n**Pengembangan:** memperkuat komunikasi profesional, kolaborasi sekolah dan keluarga, serta pemahaman terhadap budaya lingkungan belajar.",
  },
  {
    category: "Kepribadian",
    title: "Kompetensi Kepribadian",
    body: "Mengembangkan sikap bertanggung jawab, reflektif, sabar, konsisten, berintegritas, dan mampu menjadi teladan bagi murid.\n\n**Pengembangan:** melatih pengendalian emosi, menjaga batas profesional, menerima kritik secara terbuka, dan menyeimbangkan tuntutan pekerjaan dengan kesehatan diri.",
  },
  {
    category: "Digital & Inovasi",
    title: "Keterampilan Digital",
    body: "Memanfaatkan Canva, CapCut, Microsoft Office, Mendeley, media sosial, serta fotografi dan videografi dasar untuk mendukung pembelajaran dan dokumentasi.\n\n**Pengembangan:** merancang media interaktif, mengembangkan sumber belajar digital, dan menggunakan teknologi secara kreatif, efektif, serta bertanggung jawab.",
  },
];

const PELATIHAN = [
  { title: "Program Tafaqquh Fiddin (TFD)", period: "2021", body: "Universitas Trunojoyo Madura." },
  { title: "Surat Keterangan Aktif — Komunitas Mahasiswa Jombang", period: "2022–2023", body: "Keaktifan dalam kepengurusan Komunitas Mahasiswa Jombang." },
  { title: "Kursus Mahir Dasar (KMD) Pramuka", period: "2023", body: "Kwartir Cabang Bangkalan." },
  { title: "Sertifikat Kepengurusan Wakil Presiden Direktur", period: "2023–2024", body: "Public Speaking UTM." },
  { title: "Program MBKM Kampus Mengajar Angkatan 7", period: "2024", body: "Penugasan di SDN Mojokrapak 2." },
  { title: "Uji Kemahiran Berbahasa Indonesia (UKBI)", period: "2025", body: "" },
];

async function insertEntries(
  rows: Array<{
    type: string;
    title: string;
    excerpt?: string;
    body?: string;
    meta?: Record<string, string>;
    status?: string;
    sortOrder?: number;
  }>
) {
  for (const r of rows) {
    await db.insert(entries).values({
      type: r.type,
      title: r.title,
      excerpt: r.excerpt ?? null,
      body: r.body ?? null,
      meta: r.meta ?? {},
      status: r.status ?? "published",
      sortOrder: r.sortOrder ?? 0,
    });
  }
}

export async function ensureSeed(): Promise<void> {
  if (seeded) return;
  if (seeding) return seeding;
  seeding = (async () => {
    try {
      await ensureTables();

      /* ---------- settings: isi kunci yang belum ada ---------- */
      const existing = await db.select().from(settings);
      const have = new Map(existing.map((r) => [r.key, r.value ?? ""]));
      for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
        if (!have.has(k)) {
          await db.insert(settings).values({ key: k, value: v }).onConflictDoNothing();
        }
      }
      /* ---------- settings: perbarui hanya nilai scaffold lama ---------- */
      for (const m of SETTING_MIGRATION) {
        if (have.has(m.key) && have.get(m.key) === m.from) {
          await db
            .insert(settings)
            .values({ key: m.key, value: m.to })
            .onConflictDoUpdate({ target: settings.key, set: { value: m.to } });
        }
      }
      // data CV yang belum terisi
      const cvFill: Record<string, string> = {
        cv_summary: CV_SUMMARY,
        cv_education: CV_EDUCATION,
        cv_experience: CV_EXPERIENCE,
        cv_skills: CV_SKILLS,
        cv_extra: CV_EXTRA,
        cv_training: CV_TRAINING,
      };
      for (const [k, v] of Object.entries(cvFill)) {
        const cur = have.get(k);
        if (cur === undefined || cur.trim() === "") {
          await db.insert(settings).values({ key: k, value: v }).onConflictDoUpdate({ target: settings.key, set: { value: v } });
        }
      }

      /* ---------- tujuan portofolio ---------- */
      const tujuanRows = await db.select().from(entries).where(eq(entries.type, "tujuan-portofolio"));
      const tujuanTitles = tujuanRows.map((r) => r.title).sort();
      if (tujuanRows.length === 0) {
        await insertEntries(
          TUJUAN.map((t, i) => ({ type: "tujuan-portofolio", title: t.title, body: t.body, meta: { icon: t.icon }, sortOrder: i + 1 }))
        );
      } else if (
        tujuanTitles.length === TUJUAN_LAMA.length &&
        JSON.stringify(tujuanTitles) === JSON.stringify([...TUJUAN_LAMA].sort())
      ) {
        // masih konten scaffold awal → perbarui sesuai tujuan terbaru
        await db.delete(entries).where(inArray(entries.id, tujuanRows.map((r) => r.id) as never));
        await insertEntries(
          TUJUAN.map((t, i) => ({ type: "tujuan-portofolio", title: t.title, body: t.body, meta: { icon: t.icon }, sortOrder: i + 1 }))
        );
      }

      /* ---------- kata pengantar (perbarui bila masih scaffold) ---------- */
      const kataRows = await db.select().from(entries).where(eq(entries.type, "kata-pengantar"));
      if (kataRows[0] && kataRows[0].body?.includes("Puji syukur ke hadirat Allah SWT")) {
        await db
          .update(entries)
          .set({
            body: `Assalamu'alaikum warahmatullahi wabarakatuh.\n\nPuji syukur saya panjatkan ke hadirat Allah SWT atas rahmat dan karunia-Nya, sehingga E-Portofolio Pendidikan Profesi Guru ini dapat tersusun sebagai dokumentasi perjalanan saya menempuh PPG di Universitas Trunodjoyo Madura.\n\nPortofolio ini merekam proses belajar, praktik pembelajaran, kegiatan nonmengajar, serta refleksi dan evaluasi yang saya lakukan selama perjalanan menjadi calon guru. Setiap Lembar Kerja disusun dengan sungguh-sungguh sebagai wujud komitmen untuk terus bertumbuh.\n\nSaya menyadari perjalanan ini masih panjang. Semoga portofolio ini menjadi sarana refleksi diri, evaluasi berkelanjutan, dan langkah awal untuk menjadi pendidik yang menuntun dengan ketenangan dan mendidik dengan ketulusan.\n\nWassalamu'alaikum warahmatullahi wabarakatuh.`,
            updatedAt: new Date(),
          })
          .where(eq(entries.id, kataRows[0].id as never));
      } else if (kataRows.length === 0) {
        await insertEntries([
          {
            type: "kata-pengantar",
            title: "Kata Pengantar",
            body: "Assalamu'alaikum warahmatullahi wabarakatuh.\n\nPuji syukur saya panjatkan ke hadirat Allah SWT atas rahmat dan karunia-Nya, sehingga E-Portofolio Pendidikan Profesi Guru ini dapat tersusun sebagai dokumentasi perjalanan saya menempuh PPG di Universitas Trunodjoyo Madura.\n\nPortofolio ini merekam proses belajar, praktik pembelajaran, kegiatan nonmengajar, serta refleksi dan evaluasi yang saya lakukan selama perjalanan menjadi calon guru. Setiap Lembar Kerja disusun dengan sungguh-sungguh sebagai wujud komitmen untuk terus bertumbuh.\n\nSaya menyadari perjalanan ini masih panjang. Semoga portofolio ini menjadi sarana refleksi diri, evaluasi berkelanjutan, dan langkah awal untuk menjadi pendidik yang menuntun dengan ketenangan dan mendidik dengan ketulusan.\n\nWassalamu'alaikum warahmatullahi wabarakatuh.",
            meta: {},
            sortOrder: 1,
          },
        ]);
      }

      /* ---------- kategori lain: isi hanya bila kosong ---------- */
      const perj = await db.select().from(entries).where(eq(entries.type, "perjalanan-ppg"));
      if (perj.length === 0) {
        await insertEntries(PERJALANAN.map((p, i) => ({ type: "perjalanan-ppg", ...p, meta: { period: p.period }, sortOrder: i + 1 })));
      }

      const pend = await db.select().from(entries).where(eq(entries.type, "pendidikan"));
      if (pend.length === 0) {
        await insertEntries(PENDIDIKAN.map((p, i) => ({ type: "pendidikan", ...p, meta: { jenjang: p.jenjang, period: p.period }, sortOrder: i + 1 })));
      }

      const visi = await db.select().from(entries).where(eq(entries.type, "visi-filosofi"));
      if (visi.length === 0) {
        await insertEntries(VISI.map((v, i) => ({ type: "visi-filosofi", ...v, meta: { category: v.category }, sortOrder: i + 1 })));
      }

      const komp = await db.select().from(entries).where(eq(entries.type, "kompetensi"));
      if (komp.length === 0) {
        await insertEntries([
          ...KOMPETENSI.map((k, i) => ({ type: "kompetensi", ...k, meta: { category: k.category }, sortOrder: i + 1 })),
          ...PELATIHAN.map((p, i) => ({
            type: "kompetensi",
            title: p.title,
            body: p.body,
            meta: { category: "Pengembangan Diri", period: p.period },
            sortOrder: 10 + i,
          })),
        ]);
      }

      seeded = true;
    } catch {
      // Jangan gagalkan render bila DB belum siap; coba lagi pada permintaan berikutnya.
      seeding = null;
    }
  })();
  return seeding;
}

export async function resetSeededFlag() {
  seeded = false;
}
