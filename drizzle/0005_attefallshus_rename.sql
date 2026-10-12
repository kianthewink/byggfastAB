ALTER TABLE "listings" ALTER COLUMN "listing_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."listing_type";--> statement-breakpoint
CREATE TYPE "public"."listing_type" AS ENUM('attefallshus', 'attefallshus_med_kallare');--> statement-breakpoint
UPDATE "listings" SET "listing_type" = CASE "listing_type" WHEN 'apartment' THEN 'attefallshus' WHEN 'commercial_premises' THEN 'attefallshus_med_kallare' ELSE "listing_type" END;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "listing_type" SET DATA TYPE "public"."listing_type" USING "listing_type"::"public"."listing_type";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "address";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "lat";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "lng";