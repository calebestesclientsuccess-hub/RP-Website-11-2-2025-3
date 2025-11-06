ALTER TABLE "campaigns" ADD COLUMN "theme" text DEFAULT 'auto';--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "size" text DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "overlay_opacity" integer DEFAULT 50;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "dismissible" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "animation" text DEFAULT 'fade';