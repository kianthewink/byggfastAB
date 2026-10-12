CREATE TYPE "public"."listing_type" AS ENUM('apartment', 'commercial_premises');--> statement-breakpoint
CREATE TABLE "listings" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_type" "listing_type" NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"rooms" integer NOT NULL,
	"area" integer NOT NULL,
	"area_max" integer,
	"rent" integer NOT NULL,
	"available" text,
	"floor" integer,
	"floors_total" integer,
	"elevator" boolean,
	"build_year" integer,
	"description" text DEFAULT '' NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"amenities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"viewings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
