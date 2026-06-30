import { pgTable, text, timestamp, numeric, boolean, pgEnum, uuid, integer } from "drizzle-orm/pg-core";
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
// ─────────────────────────────────────────────

export const timestamps = {
  created_at: timestamp("created_at", { withTimezone: true })
    .default(sql`NOW()`)
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .default(sql`NOW()`)
    .notNull(),
};
