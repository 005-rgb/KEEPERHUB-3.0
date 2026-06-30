import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  uuid,
  smallint,
  numeric,
  date,
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

// ─────────────────────────────────────────────
// TABEL: assets
// Inti dari seluruh sistem. Semua servis, dokumen,
// dan notifikasi berelasi ke tabel ini via asset_id.
//
// Kolom keuangan disimpan sebagai NUMERIC murni (tanpa simbol)
// sesuai aturan lokalisasi — format Rupiah diterapkan di frontend.
// ─────────────────────────────────────────────

export const assets = pgTable(
  "assets",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    // Pemilik aset (root tenant)
    owner_id: uuid("owner_id").notNull(),

    // Kategori & identitas
    category: assetCategoryEnum("category").notNull(),
    nama: text("nama").notNull(),
    deskripsi: text("deskripsi"),

    // Data finansial — disimpan NUMERIC murni, diformat IDR di frontend
    purchase_price: numeric("purchase_price", { precision: 15, scale: 2 }).notNull(),
    purchase_date: date("purchase_date"),
    current_value: numeric("current_value", { precision: 15, scale: 2 }),

    // Running total biaya perawatan — dipakai trigger ALERT_LEMON_LAW
    // (total_maintenance_cost > 30% dari purchase_price)
    total_maintenance_cost: numeric("total_maintenance_cost", { precision: 15, scale: 2 })
      .notNull()
      .default("0"),

    // Deadline untuk radar notifikasi (H-14 alert)
    taxation_deadline: date("taxation_deadline"),    // → DEADLINE_TAX
    warranty_end_date: date("warranty_end_date"),    // → DEADLINE_WARRANTY

    // Foto utama aset
    photo_url: text("photo_url"),

    is_active: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    // FK: owner_id → users.id
    foreignKey({
      columns: [table.owner_id],
      foreignColumns: [users.id],
      name: "fk_assets_owner",
    }).onDelete("cascade"),

    // Index untuk listing aset per owner (query paling sering)
    index("assets_owner_id_idx").on(table.owner_id),

    // Index untuk filter per kategori
    index("assets_category_idx").on(table.category),

    // Composite index untuk listing aset aktif per owner
    index("assets_owner_active_idx").on(table.owner_id, table.is_active),
  ]
);

// ─────────────────────────────────────────────
// TABEL: tasks
// Perintah servis dari owner ke staf.
// Alur status: ditugaskan → menunggu_persetujuan → disetujui/ditolak → selesai
// submitted_cost dari staf dipantau radar ALERT_MARKUP (>Rp 3jt untuk VEHICLE/ELECTRONIC)
// magic_link_token: token WA unik untuk staf buka task tanpa login
// ─────────────────────────────────────────────

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    owner_id: uuid("owner_id").notNull(),          // si bos yang membuat tugas
    asset_id: uuid("asset_id").notNull(),           // aset yang diservis
    assigned_to: uuid("assigned_to").notNull(),     // staf yang ditugaskan

    service_type: serviceTypeEnum("service_type").notNull(),
    status: taskStatusEnum("status").notNull().default("ditugaskan"),

    judul: text("judul").notNull(),
    deskripsi: text("deskripsi"),

    due_date: date("due_date"),

    // Biaya yang diajukan staf setelah pekerjaan selesai
    // Dipantau ALERT_MARKUP jika >3.000.000 untuk kategori VEHICLE/ELECTRONIC
    submitted_cost: numeric("submitted_cost", { precision: 15, scale: 2 }),

    // Biaya yang disetujui owner (bisa berbeda dari submitted_cost)
    approved_cost: numeric("approved_cost", { precision: 15, scale: 2 }),

    completion_photo_url: text("completion_photo_url"),  // foto bukti pekerjaan staf
    staff_notes: text("staff_notes"),                    // catatan staf
    owner_notes: text("owner_notes"),                    // catatan/alasan owner (approve/reject)

    // Magic link WA untuk staf — token unik, satu kali pakai per tugas
    magic_link_token: text("magic_link_token"),
    magic_link_expires_at: timestamp("magic_link_expires_at", { withTimezone: true }),

    ...timestamps,
  },
  (table) => [
    foreignKey({
      columns: [table.owner_id],
      foreignColumns: [users.id],
      name: "fk_tasks_owner",
    }).onDelete("cascade"),

    foreignKey({
      columns: [table.asset_id],
      foreignColumns: [assets.id],
      name: "fk_tasks_asset",
    }).onDelete("cascade"),

    foreignKey({
      columns: [table.assigned_to],
      foreignColumns: [users.id],
      name: "fk_tasks_assigned_to",
    }).onDelete("restrict"),   // staf tidak bisa dihapus selama punya task aktif

    index("tasks_owner_id_idx").on(table.owner_id),
    index("tasks_asset_id_idx").on(table.asset_id),
    index("tasks_assigned_to_idx").on(table.assigned_to),
    index("tasks_status_idx").on(table.status),

    // Index untuk validasi magic link
    uniqueIndex("tasks_magic_link_token_unique").on(table.magic_link_token),
  ]
);

// ─────────────────────────────────────────────
// TABEL: documents  (Brankas Dokumen)
// Arsip surat-surat berharga per aset.
// expiry_date dipakai untuk alert kadaluarsa di masa depan.
// ─────────────────────────────────────────────

export const documents = pgTable(
  "documents",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    owner_id: uuid("owner_id").notNull(),
    asset_id: uuid("asset_id").notNull(),

    document_type: documentTypeEnum("document_type").notNull(),
    nama: text("nama").notNull(),          // label deskriptif dokumen
    file_url: text("file_url").notNull(), // path/URL file tersimpan
    expiry_date: date("expiry_date"),     // nullable — tidak semua dok punya exp date
    notes: text("notes"),

    ...timestamps,
  },
  (table) => [
    foreignKey({
      columns: [table.owner_id],
      foreignColumns: [users.id],
      name: "fk_documents_owner",
    }).onDelete("cascade"),

    foreignKey({
      columns: [table.asset_id],
      foreignColumns: [assets.id],
      name: "fk_documents_asset",
    }).onDelete("cascade"),

    index("documents_owner_id_idx").on(table.owner_id),
    index("documents_asset_id_idx").on(table.asset_id),
    index("documents_type_idx").on(table.document_type),
  ]
);

// ─────────────────────────────────────────────
// TABEL: notifications
// Log semua notifikasi sistem — WA maupun in-app.
// recipient_user_id: siapa yang menerima (owner atau staf)
// asset_id / task_id nullable — tidak semua notif terkait keduanya
// ─────────────────────────────────────────────

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    owner_id: uuid("owner_id").notNull(),              // workspace owner
    recipient_user_id: uuid("recipient_user_id").notNull(), // penerima actual

    asset_id: uuid("asset_id"),   // nullable
    task_id: uuid("task_id"),     // nullable

    notification_type: notificationTypeEnum("notification_type").notNull(),

    is_read: boolean("is_read").notNull().default(false),
    sent_via_wa: boolean("sent_via_wa").notNull().default(false),
    wa_sent_at: timestamp("wa_sent_at", { withTimezone: true }),  // nullable

    ...timestamps,
  },
  (table) => [
    foreignKey({
      columns: [table.owner_id],
      foreignColumns: [users.id],
      name: "fk_notifications_owner",
    }).onDelete("cascade"),

    foreignKey({
      columns: [table.recipient_user_id],
      foreignColumns: [users.id],
      name: "fk_notifications_recipient",
    }).onDelete("cascade"),

    foreignKey({
      columns: [table.asset_id],
      foreignColumns: [assets.id],
      name: "fk_notifications_asset",
    }).onDelete("set null"),

    foreignKey({
      columns: [table.task_id],
      foreignColumns: [tasks.id],
      name: "fk_notifications_task",
    }).onDelete("set null"),

    index("notifications_owner_id_idx").on(table.owner_id),
    index("notifications_recipient_idx").on(table.recipient_user_id),
    index("notifications_type_idx").on(table.notification_type),

    // Index untuk load inbox belum dibaca
    index("notifications_unread_idx").on(table.recipient_user_id, table.is_read),
  ]
);
