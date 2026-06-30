# KeeperHub 3.0

Platform manajemen aset untuk keluarga HNWI (High Net Worth Individual).

## Tech Stack

- **Frontend/Backend**: Next.js 14 (App Router) + TypeScript
- **Database**: PostgreSQL (Replit managed) + Drizzle ORM
- **Port**: 5000 (frontend, `0.0.0.0`)

## Struktur Proyek

```
/
├── app/              # Next.js App Router (pages, layouts)
├── server/
│   └── db/
│       ├── schema.ts # Drizzle schema (enums + tabel)
│       └── index.ts  # Koneksi database
├── lib/              # Utility / helper
├── public/           # Static assets
├── next.config.js
├── drizzle.config.ts
└── tsconfig.json
```

## Lokalisasi (Indonesia)

- Bahasa UI: Bahasa Indonesia penuh (satu file `id.json`)
- Mata uang: `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })` → Rp 1.250.000
- Tanggal: DD/MM/YYYY atau "12 Januari 2026"
- Zona waktu: WIB (UTC+7) untuk tampilan, UTC di database
- Desimal: koma sebagai pemisah (12,5%) di tampilan

## Database Enums (PostgreSQL)

| Enum | Values |
|------|--------|
| `subscription_tier` | free, personal, family_office, enterprise |
| `user_role` | owner, staff, sub_owner |
| `tenant_membership_role` | read_only, collaborator |
| `asset_category` | PROPERTY, VEHICLE, ELECTRONIC, LUXURY_GOODS |
| `task_status` | ditugaskan, menunggu_persetujuan, disetujui, ditolak, selesai |
| `service_type` | ROUTINE_SCHEDULED, REPAIR_BREAKDOWN, CLEANING_DETAILING, UPGRADE_MODIFICATION, INSPECTION_CERTIFICATION |
| `document_type` | STNK, POLIS_ASURANSI, OWNERSHIP_CERTIFICATE, PURCHASE_INVOICE, AUTHENTICITY_CARD, WARRANTY_DOCUMENT, TAX_RECEIPT, APPRAISAL_REPORT |
| `notification_type` | TASK_ASSIGNED, APPROVAL_REQUESTED, TASK_APPROVED, TASK_REJECTED, PAYWALL_TRIGGERED, ALERT_MARKUP, ALERT_LEMON_LAW, DEADLINE_TAX, DEADLINE_WARRANTY |

## Timestamp Helper

Semua tabel menggunakan `timestamps` helper dari `server/db/schema.ts`:
```ts
// Diimport di setiap tabel:
...timestamps,  // → created_at, updated_at (TIMESTAMPTZ, default NOW())
```

## Konvensi Penamaan

- **Kode/DB**: Bahasa Inggris (snake_case kolom, PascalCase komponen)
- **UI/UX**: Bahasa Indonesia (sesuai PRD Section 12)

## User Preferences

- Seluruh UI dalam Bahasa Indonesia
- Format Rupiah: titik sebagai pemisah ribuan, tanpa desimal untuk nominal bulat
- Zona waktu default WIB (UTC+7)
- Nomor telepon format Indonesia (+62/08xx)
