CREATE TABLE "blog_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"author" text NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "email_captures" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"acv" text,
	"close_rate" text,
	"sales_cycle" text,
	"quota" text,
	"calculated_revenue" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"resume" text,
	"cover_letter" text,
	"linkedin" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_postings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"department" text NOT NULL,
	"location" text NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"requirements" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_captures" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"company" text,
	"role" text,
	"resource_downloaded" text NOT NULL,
	"downloaded_at" timestamp DEFAULT now() NOT NULL,
	"source" text,
	"ip_address" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"company_logo" text,
	"quote" text NOT NULL,
	"rating" integer NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"avatar_url" text,
	"metrics" text,
	"industry" text,
	"company_size" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_job_postings_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_postings"("id") ON DELETE no action ON UPDATE no action;