CREATE TYPE "public"."application_status" AS ENUM('submitted', 'in_review', 'accepted', 'rejected');--> statement-breakpoint
CREATE TABLE "admin_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"invited_by" text NOT NULL,
	"slot" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_accounts_email_unique" UNIQUE("email"),
	CONSTRAINT "admin_accounts_slot_unique" UNIQUE("slot"),
	CONSTRAINT "admin_accounts_slot_range" CHECK ("admin_accounts"."slot" >= 1 and "admin_accounts"."slot" <= 2)
);
--> statement-breakpoint
CREATE TABLE "admin_secrets" (
	"key" text PRIMARY KEY NOT NULL,
	"value_hash" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"status" "application_status" DEFAULT 'submitted' NOT NULL,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "applications_user_listing_idx" ON "applications" USING btree ("user_id","listing_id");--> statement-breakpoint
CREATE INDEX "applications_listing_id_idx" ON "applications" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "applications_status_idx" ON "applications" USING btree ("status");