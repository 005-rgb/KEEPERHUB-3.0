CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"category" "asset_category" NOT NULL,
	"nama" text NOT NULL,
	"deskripsi" text,
	"purchase_price" numeric(15, 2) NOT NULL,
	"purchase_date" date,
	"current_value" numeric(15, 2),
	"total_maintenance_cost" numeric(15, 2) DEFAULT '0' NOT NULL,
	"taxation_deadline" date,
	"warranty_end_date" date,
	"photo_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT NOW() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT NOW() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "fk_assets_owner" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assets_owner_id_idx" ON "assets" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "assets_category_idx" ON "assets" USING btree ("category");--> statement-breakpoint
CREATE INDEX "assets_owner_active_idx" ON "assets" USING btree ("owner_id","is_active");