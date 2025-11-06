CREATE TABLE "tenants" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "assessment_answers" ADD COLUMN "points" integer;--> statement-breakpoint
ALTER TABLE "assessment_configs" ADD COLUMN "tenant_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "assessment_configs" ADD COLUMN "entry_question_id" varchar;--> statement-breakpoint
ALTER TABLE "assessment_responses" ADD COLUMN "tenant_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "assessment_result_buckets" ADD COLUMN "min_score" integer;--> statement-breakpoint
ALTER TABLE "assessment_result_buckets" ADD COLUMN "max_score" integer;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "tenant_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "job_applications" ADD COLUMN "tenant_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "job_postings" ADD COLUMN "tenant_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "lead_captures" ADD COLUMN "tenant_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "tenant_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "video_posts" ADD COLUMN "tenant_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "widget_config" ADD COLUMN "tenant_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "assessment_configs" ADD CONSTRAINT "assessment_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_responses" ADD CONSTRAINT "assessment_responses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_captures" ADD CONSTRAINT "lead_captures_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_posts" ADD CONSTRAINT "video_posts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget_config" ADD CONSTRAINT "widget_config_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;