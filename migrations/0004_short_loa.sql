CREATE TABLE "assessment_answers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" varchar NOT NULL,
	"answer_text" text NOT NULL,
	"answer_value" text NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"scoring_method" text DEFAULT 'decision-tree' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "assessment_configs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "assessment_questions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" varchar NOT NULL,
	"question_text" text NOT NULL,
	"description" text,
	"order" integer NOT NULL,
	"question_type" text DEFAULT 'single-choice' NOT NULL,
	"conditional_logic" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_result_buckets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" varchar NOT NULL,
	"bucket_name" text NOT NULL,
	"bucket_key" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"routing_rules" text,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_question_id_assessment_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."assessment_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_assessment_id_assessment_configs_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessment_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_result_buckets" ADD CONSTRAINT "assessment_result_buckets_assessment_id_assessment_configs_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessment_configs"("id") ON DELETE cascade ON UPDATE no action;