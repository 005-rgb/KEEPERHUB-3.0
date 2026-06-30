# KeeperHub 3.0

Platform manajemen aset untuk keluarga HNWI (High Net Worth Individual).

---

## Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Framework | Next.js 14.2.29 (App Router) + TypeScript 5 |
| UI | React 18 |
| ORM | Drizzle ORM |
| Database | PostgreSQL (Replit: managed · cPanel: manual setup) |
| Driver DB | `pg` (node-postgres) |
| Port Dev | 5000, host `0.0.0.0` |

---

## Struktur Proyek

```
/
├── app/                    # Next.js App Router (halaman, layout)
├── server/
│   └── db/
│       ├── schema.ts       # Drizzle schema: semua enum + tabel
│       └── index.ts        # Koneksi pool ke PostgreSQL
├── lib/                    # Utility/helper (format IDR, tanggal WIB, dll.)
├── public/                 # Static assets
├── scripts/
│   ├── build-cpanel.sh     # Build & ZIP untuk upload ke cPanel
│   └── migrate-cpanel.js   # Migrasi enum ke DB cPanel
├── server.js               # Entry point Passenger (cPanel)
├── .htaccess               # Apache config untuk cPanel
├── next.config.js
├── drizzle.config.ts
└── tsconfig.json
```

---

## Lokalisasi (Indonesia)

| Aspek | Aturan |
|-------|--------|
| Bahasa UI | Bahasa Indonesia penuh — satu file `lib/i18n/id.json` |
| Mata uang | `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })` → **Rp 1.250.000** |
| Tanggal | DD/MM/YYYY atau "12 Januari 2026" — **bukan** MM/DD/YYYY |
| Zona waktu | WIB (UTC+7) di UI — database simpan UTC, konversi di layer aplikasi |
| Desimal | Koma sebagai pemisah (12,5%) di tampilan — DB tetap pakai titik standar SQL |
| Telepon | Format +62 atau 08xx, validasi pola nomor HP Indonesia |
| Penamaan kode | Bahasa Inggris (snake_case DB, PascalCase komponen React) |
| Penamaan UI | Bahasa Indonesia sesuai PRD Section 12 |

---

## Database — Enum PostgreSQL

Semua enum sudah dibuat di database. **Jangan tambah/ubah nilai tanpa konfirmasi PRD.**

| Enum | Values |
|------|--------|
| `subscription_tier` | `free` · `personal` · `family_office` · `enterprise` |
| `user_role` | `owner` · `staff` · `sub_owner` |
| `tenant_membership_role` | `read_only` · `collaborator` |
| `asset_category` | `PROPERTY` · `VEHICLE` · `ELECTRONIC` · `LUXURY_GOODS` |
| `task_status` | `ditugaskan` · `menunggu_persetujuan` · `disetujui` · `ditolak` · `selesai` |
| `service_type` | `ROUTINE_SCHEDULED` · `REPAIR_BREAKDOWN` · `CLEANING_DETAILING` · `UPGRADE_MODIFICATION` · `INSPECTION_CERTIFICATION` |
| `document_type` | `STNK` · `POLIS_ASURANSI` · `OWNERSHIP_CERTIFICATE` · `PURCHASE_INVOICE` · `AUTHENTICITY_CARD` · `WARRANTY_DOCUMENT` · `TAX_RECEIPT` · `APPRAISAL_REPORT` |
| `notification_type` | `TASK_ASSIGNED` · `APPROVAL_REQUESTED` · `TASK_APPROVED` · `TASK_REJECTED` · `PAYWALL_TRIGGERED` · `ALERT_MARKUP` · `ALERT_LEMON_LAW` · `DEADLINE_TAX` · `DEADLINE_WARRANTY` |

### Timestamp Helper

Semua tabel wajib pakai spread `...timestamps` (jangan copy-paste manual):

```ts
// server/db/schema.ts
export const timestamps = {
  created_at: timestamp("created_at", { withTimezone: true }).default(sql`NOW()`).notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).default(sql`NOW()`).notNull(),
};

// Pemakaian di tabel:
export const myTable = pgTable("my_table", {
  id: uuid("id").primaryKey(),
  ...timestamps,
});
```

---

## Deployment — cPanel / Shared Hosting

> **Bacaan wajib sebelum deploy:** Shared hosting cPanel menggunakan **Phusion Passenger** untuk menjalankan Node.js. Berbeda dengan VPS — tidak ada `pm2`, tidak ada `systemd`.

### Prasyarat di cPanel

Konfirmasi item berikut di panel hosting Anda sebelum mulai:

- [ ] **Node.js versi** ≥ 18 tersedia di cPanel → *Setup Node.js App*
- [ ] **PostgreSQL** tersedia (bukan hanya MySQL) — tanya provider hosting
- [ ] **Akses SSH** aktif (untuk `npm install` di server)
- [ ] **Passenger** sudah terinstall (standar cPanel CloudLinux)

> ⚠️ **Catatan Database:** Banyak shared hosting Indonesia hanya menyediakan **MySQL/MariaDB**, bukan PostgreSQL. Jika hosting Anda hanya punya MySQL, konfirmasi ke kami — perlu migrasi driver dari `pg` ke `mysql2` + update schema Drizzle.

---

### Langkah 1 — Build di Replit

```bash
bash scripts/build-cpanel.sh
```

Script ini akan:
1. Jalankan `next build`
2. Salin file yang diperlukan ke folder `dist-cpanel/`
3. Buat `keeperhub-cpanel.zip`

File yang dipaket:
```
keeperhub-cpanel.zip
├── .next/          ← hasil build Next.js
├── public/
├── server.js       ← entry point Passenger
├── package.json
├── next.config.js
├── .htaccess
└── .env.production ← TEMPLATE — isi sebelum upload!
```

---

### Langkah 2 — Isi `.env.production`

Edit file `.env.production` **sebelum upload** (atau set via cPanel Node.js App UI):

```env
NODE_ENV=production

# PostgreSQL cPanel (dari cPanel → Databases → PostgreSQL)
DATABASE_URL=postgres://CPANEL_USER_DB:PASSWORD@localhost:5432/NAMA_DATABASE

# Keamanan sesi (generate random string panjang, min 32 karakter)
NEXTAUTH_SECRET=isi_dengan_random_string_sangat_panjang_dan_rahasia
NEXTAUTH_URL=https://domain-anda.com

# Zona waktu (opsional, tampilan WIB)
TZ=Asia/Jakarta
```

---

### Langkah 3 — Upload ke cPanel

1. Buka **cPanel → File Manager**
2. Navigasi ke `/home/USERNAME/` (home directory)
3. Buat folder baru: `keeperhub`
4. Upload `keeperhub-cpanel.zip` ke folder tersebut
5. Klik kanan → **Extract**

---

### Langkah 4 — Buat Database PostgreSQL

1. cPanel → **PostgreSQL Databases**
2. Buat database baru: `USERNAME_keeperhub`
3. Buat user database baru: `USERNAME_kh_user`
4. Set password yang kuat
5. Assign user ke database dengan privilege **ALL**
6. Catat `DATABASE_URL`: `postgres://USERNAME_kh_user:PASSWORD@localhost:5432/USERNAME_keeperhub`

---

### Langkah 5 — Setup Node.js App di cPanel

1. cPanel → **Setup Node.js App** (atau *Node.js Selector*)
2. Klik **Create Application**
3. Isi form:

   | Field | Nilai |
   |-------|-------|
   | Node.js version | **18.x** atau **20.x** |
   | Application mode | **Production** |
   | Application root | `/home/USERNAME/keeperhub` |
   | Application URL | `domain-anda.com` (atau subdomain) |
   | Application startup file | `server.js` |

4. Klik **Create**
5. Di halaman detail app, tambahkan **Environment Variables**:
   - `DATABASE_URL` → nilai dari Langkah 2
   - `NODE_ENV` → `production`
   - `NEXTAUTH_SECRET` → string acak panjang
   - `NEXTAUTH_URL` → `https://domain-anda.com`
   - `TZ` → `Asia/Jakarta`

---

### Langkah 6 — Install Dependencies di Server

Via SSH (atau Terminal di cPanel):

```bash
cd /home/USERNAME/keeperhub
npm install --omit=dev
```

---

### Langkah 7 — Migrasi Database

```bash
cd /home/USERNAME/keeperhub
node scripts/migrate-cpanel.js
```

Script ini membuat semua enum PostgreSQL yang dibutuhkan. Harus dijalankan **sekali** saat pertama deploy, dan setiap kali ada skema baru.

---

### Langkah 8 — Restart & Verifikasi

1. Kembali ke cPanel → **Setup Node.js App**
2. Klik **Restart** pada aplikasi KeeperHub
3. Buka browser → `https://domain-anda.com`
4. Pastikan halaman utama tampil normal

---

### Troubleshooting cPanel

| Masalah | Solusi |
|---------|--------|
| `Error: Cannot find module 'next'` | Jalankan `npm install --omit=dev` via SSH |
| `ECONNREFUSED` saat koneksi DB | Cek `DATABASE_URL`, pastikan DB dan user sudah di-assign |
| `Application Error` di browser | Lihat log di cPanel → **Errors** atau `/home/USERNAME/keeperhub/logs/` |
| Port konflik | Passenger mengelola port otomatis — jangan hardcode port |
| `.htaccess` tidak bekerja | Pastikan `mod_rewrite` dan `mod_proxy` aktif — hubungi hosting |
| Halaman 404 setelah refresh | Tambahkan konfigurasi Passenger di `.htaccess` (sudah ada di file) |

---

### Update / Redeploy

```bash
# Di Replit: build ulang
bash scripts/build-cpanel.sh

# Upload keeperhub-cpanel.zip baru → Extract (timpa file lama)
# Lalu via SSH:
cd /home/USERNAME/keeperhub
npm install --omit=dev

# Di cPanel Node.js App → Restart
```

---

## Development (Replit)

```bash
npm run dev        # Jalankan dev server di port 5000
npm run build      # Build produksi
npm run db:push    # Sync schema ke DB Replit
npm run build:cpanel  # Build + ZIP untuk cPanel
```

---

## User Preferences

- Seluruh UI dalam Bahasa Indonesia
- Format Rupiah: titik sebagai pemisah ribuan, tanpa desimal untuk nominal bulat
- Zona waktu default WIB (UTC+7)
- Nomor telepon format Indonesia (+62/08xx)
- Nama kolom/tabel/variabel di kode tetap Bahasa Inggris
