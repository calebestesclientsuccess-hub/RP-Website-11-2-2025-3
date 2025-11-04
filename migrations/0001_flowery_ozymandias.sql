CREATE TABLE "assessment_responses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"q1" text,
	"q2" text,
	"q3" text,
	"q4" text,
	"q5" text,
	"q6" text,
	"q7" text,
	"q8" text,
	"q9" text,
	"q10a1" text,
	"q10a2" text,
	"q10b1" text,
	"q10b2" text,
	"q10c1" text,
	"q10c2" text,
	"q11" text,
	"q13" text,
	"q14" text,
	"q15" text,
	"q16" text,
	"q17" text,
	"q18" text,
	"q19" text,
	"q20" text,
	"bucket" text,
	"completed" boolean DEFAULT false NOT NULL,
	"used_calculator" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "assessment_responses_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "blueprint_captures" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"path" text NOT NULL,
	"q1" text NOT NULL,
	"q2" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"email_sent" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_signups" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"source" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"video_url" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"platform" text,
	"duration" text,
	"author" text NOT NULL,
	"category" text,
	"scheduled_for" timestamp,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	CONSTRAINT "video_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "widget_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"widget_type" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"position" text DEFAULT 'bottom-right' NOT NULL,
	"settings" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "featured_image" text;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "video_url" text;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "scheduled_for" timestamp;