import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  uuid,
  smallint,
  index,
  uniqueIndex,
  foreignKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "free",
  "personal",
  "family_office",
  "enterprise",
]);

export const userRoleEnum = pgEnum("user_role", [
  "owner",
  "staff",
  "sub_owner",
]);

export const tenantMembershipRoleEnum = pgEnum("tenant_membership_role", [
  "read_only",
  "collaborator",
]);

export const assetCategoryEnum = pgEnum("asset_category", [
  "PROPERTY",
  "VEHICLE",
  "ELECTRONIC",
  "LUXURY_GOODS",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "ditugaskan",
  "menunggu_persetujuan",
  "disetujui",
  "ditolak",
  "selesai",
]);

export const serviceTypeEnum = pgEnum("service_type", [
  "ROUTINE_SCHEDULED",
  "REPAIR_BREAKDOWN",
  "CLEANING_DETAILING",
  "UPGRADE_MODIFICATION",
  "INSPECTION_CERTIFICATION",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "STNK",
  "POLIS_ASURANSI",
  "OWNERSHIP_CERTIFICATE",
  "PURCHASE_INVOICE",
  "AUTHENTICITY_CARD",
  "WARRANTY_DOCUMENT",
  "TAX_RECEIPT",
  "APPRAISAL_REPORT",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "TASK_ASSIGNED",
  "APPROVAL_REQUESTED",
  "TASK_APPROVED",
  "TASK_REJECTED",
  "PAYWALL_TRIGGERED",
  "ALERT_MARKUP",
  "ALERT_LEMON_LAW",
  "DEADLINE_TAX",
  "DEADLINE_WARRANTY",
]);

// ─────────────────────────────────────────────
// TIMESTAMP HELPER
// Pakai spread ...timestamps di setiap tabel
// ─────────────────────────────────────────────

export const timestamps = {
  created_at: timestamp("created_at", { withTimezone: true })
    .default(sql`NOW()`)
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .default(sql`NOW()`)
    .notNull(),
};

// ─────────────────────────────────────────────
// TABEL: users
// Root tenant. Tidak punya owner_id — dialah owner-nya.
// Semua tabel lain yang punya owner_id mengacu ke users.id ini.
// ─────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    email: text("email").notNull(),
    password_hash: text("password_hash").notNull(),
    nama: text("nama").notNull(),
    role: userRoleEnum("role").notNull(),
    subscription_tier: subscriptionTierEnum("subscription_tier")
      .notNull()
      .default("free"),
    wizard_step: smallint("wizard_step").notNull().default(1),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
  ]
);

// ─────────────────────────────────────────────
// TABEL: tenant_memberships
// Relasi sub-owner ke workspace milik owner.
// owner_id  = workspace yang diakses (users.id si bos)
// member_user_id = sub-owner yang mendapat akses (users.id si anggota)
// Default role read_only dikunci di level kolom DB (R-14).
// ─────────────────────────────────────────────

export const tenantMemberships = pgTable(
  "tenant_memberships",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    owner_id: uuid("owner_id").notNull(),
    member_user_id: uuid("member_user_id").notNull(),
    role: tenantMembershipRoleEnum("role").notNull().default("read_only"),
    is_active: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    // FK: owner_id → users.id
    foreignKey({
      columns: [table.owner_id],
      foreignColumns: [users.id],
      name: "fk_tenant_memberships_owner",
    }).onDelete("cascade"),

    // FK: member_user_id → users.id
    foreignKey({
      columns: [table.member_user_id],
      foreignColumns: [users.id],
      name: "fk_tenant_memberships_member",
    }).onDelete("cascade"),

    // Composite unique: satu member hanya bisa punya satu entri per workspace
    uniqueIndex("tenant_memberships_owner_member_unique").on(
      table.owner_id,
      table.member_user_id
    ),

    // Index tambahan untuk query cepat
    index("tenant_memberships_owner_id_idx").on(table.owner_id),
    index("tenant_memberships_member_user_id_idx").on(table.member_user_id),
  ]
);
