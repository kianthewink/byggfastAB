CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "configuration" jsonb;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "packages" jsonb DEFAULT '[]'::jsonb NOT NULL;