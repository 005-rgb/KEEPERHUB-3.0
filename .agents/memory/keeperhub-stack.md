---
name: KeeperHub Stack & Conventions
description: Tech stack, enum list, lokalisasi, dan konvensi penamaan untuk proyek KeeperHub 3.0
---

# KeeperHub 3.0 — Stack & Conventions

## Tech Stack
- Next.js 14.2.29 (App Router), React 18, TypeScript 5
- Drizzle ORM + node-postgres (`pg`) → Replit PostgreSQL
- Port dev: 5000, host: 0.0.0.0

## Enums di PostgreSQL (sudah dibuat)
Semua 8 enum berikut sudah di-CREATE di database:
- `subscription_tier`: free, personal, family_office, enterprise
- `user_role`: owner, staff, sub_owner
- `tenant_membership_role`: read_only, collaborator
- `asset_category`: PROPERTY, VEHICLE, ELECTRONIC, LUXURY_GOODS
- `task_status`: ditugaskan, menunggu_persetujuan, disetujui, ditolak, selesai
- `service_type`: ROUTINE_SCHEDULED, REPAIR_BREAKDOWN, CLEANING_DETAILING, UPGRADE_MODIFICATION, INSPECTION_CERTIFICATION
- `document_type`: STNK, POLIS_ASURANSI, OWNERSHIP_CERTIFICATE, PURCHASE_INVOICE, AUTHENTICITY_CARD, WARRANTY_DOCUMENT, TAX_RECEIPT, APPRAISAL_REPORT
- `notification_type`: TASK_ASSIGNED, APPROVAL_REQUESTED, TASK_APPROVED, TASK_REJECTED, PAYWALL_TRIGGERED, ALERT_MARKUP, ALERT_LEMON_LAW, DEADLINE_TAX, DEADLINE_WARRANTY

**Why:** Enum dikunci di DB untuk validasi data level storage, bukan hanya frontend.

## Timestamp Helper
`server/db/schema.ts` mengekspor objek `timestamps` ({ created_at, updated_at }) — pakai spread `...timestamps` di setiap tabel, jangan copy-paste manual.

## Lokalisasi
- UI: Bahasa Indonesia penuh (bukan bilingual)
- Mata uang: `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })` → Rp 1.250.000
- Tanggal: DD/MM/YYYY atau format panjang Indonesia
- Zona waktu: WIB (UTC+7) tampilan, UTC di DB
- Kolom/variabel kode: tetap Bahasa Inggris (snake_case DB, PascalCase komponen)

## UUID
Tidak menggunakan pgcrypto/uuid-ossp extension. UUID di-generate di aplikasi layer (Node.js crypto) jika diperlukan — belum diputuskan saat fondasi dibuat.
