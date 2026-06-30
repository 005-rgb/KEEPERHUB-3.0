#!/usr/bin/env node
/**
 * Script migrasi database untuk cPanel PostgreSQL
 * Jalankan sekali setelah upload: node scripts/migrate-cpanel.js
 *
 * Requirement: DATABASE_URL sudah di-set di environment
 */

require("dotenv").config({ path: ".env.production" });
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Terhubung ke database. Menjalankan migrasi...\n");

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
          CREATE TYPE subscription_tier AS ENUM ('free', 'personal', 'family_office', 'enterprise');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('owner', 'staff', 'sub_owner');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tenant_membership_role') THEN
          CREATE TYPE tenant_membership_role AS ENUM ('read_only', 'collaborator');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'asset_category') THEN
          CREATE TYPE asset_category AS ENUM ('PROPERTY', 'VEHICLE', 'ELECTRONIC', 'LUXURY_GOODS');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
          CREATE TYPE task_status AS ENUM ('ditugaskan', 'menunggu_persetujuan', 'disetujui', 'ditolak', 'selesai');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_type') THEN
          CREATE TYPE service_type AS ENUM ('ROUTINE_SCHEDULED', 'REPAIR_BREAKDOWN', 'CLEANING_DETAILING', 'UPGRADE_MODIFICATION', 'INSPECTION_CERTIFICATION');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
          CREATE TYPE document_type AS ENUM ('STNK', 'POLIS_ASURANSI', 'OWNERSHIP_CERTIFICATE', 'PURCHASE_INVOICE', 'AUTHENTICITY_CARD', 'WARRANTY_DOCUMENT', 'TAX_RECEIPT', 'APPRAISAL_REPORT');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
          CREATE TYPE notification_type AS ENUM ('TASK_ASSIGNED', 'APPROVAL_REQUESTED', 'TASK_APPROVED', 'TASK_REJECTED', 'PAYWALL_TRIGGERED', 'ALERT_MARKUP', 'ALERT_LEMON_LAW', 'DEADLINE_TAX', 'DEADLINE_WARRANTY');
        END IF;
      END $$;
    `);

    console.log("✅ Semua enum berhasil dibuat/diverifikasi.");
    console.log("\nSiap untuk migrasi tabel selanjutnya.");
  } catch (err) {
    console.error("❌ Error migrasi:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
