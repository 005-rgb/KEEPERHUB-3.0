CREATE TYPE "public"."asset_category" AS ENUM('PROPERTY', 'VEHICLE', 'ELECTRONIC', 'LUXURY_GOODS');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('STNK', 'POLIS_ASURANSI', 'OWNERSHIP_CERTIFICATE', 'PURCHASE_INVOICE', 'AUTHENTICITY_CARD', 'WARRANTY_DOCUMENT', 'TAX_RECEIPT', 'APPRAISAL_REPORT');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('TASK_ASSIGNED', 'APPROVAL_REQUESTED', 'TASK_APPROVED', 'TASK_REJECTED', 'PAYWALL_TRIGGERED', 'ALERT_MARKUP', 'ALERT_LEMON_LAW', 'DEADLINE_TAX', 'DEADLINE_WARRANTY');--> statement-breakpoint
CREATE TYPE "public"."service_type" AS ENUM('ROUTINE_SCHEDULED', 'REPAIR_BREAKDOWN', 'CLEANING_DETAILING', 'UPGRADE_MODIFICATION', 'INSPECTION_CERTIFICATION');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('free', 'personal', 'family_office', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('ditugaskan', 'menunggu_persetujuan', 'disetujui', 'ditolak', 'selesai');--> statement-breakpoint
CREATE TYPE "public"."tenant_membership_role" AS ENUM('read_only', 'collaborator');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'staff', 'sub_owner');--> statement-breakpoint
CREATE TABLE "tenant_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"member_user_id" uuid NOT NULL,
	"role" "tenant_membership_role" DEFAULT 'read_only' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT NOW() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT NOW() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"nama" text NOT NULL,
	"role" "user_role" NOT NULL,
	"subscription_tier" "subscription_tier" DEFAULT 'free' NOT NULL,
	"wizard_step" smallint DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT NOW() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT NOW() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tenant_memberships" ADD CONSTRAINT "fk_tenant_memberships_owner" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_memberships" ADD CONSTRAINT "fk_tenant_memberships_member" FOREIGN KEY ("member_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_memberships_owner_member_unique" ON "tenant_memberships" USING btree ("owner_id","member_user_id");--> statement-breakpoint
CREATE INDEX "tenant_memberships_owner_id_idx" ON "tenant_memberships" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "tenant_memberships_member_user_id_idx" ON "tenant_memberships" USING btree ("member_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");