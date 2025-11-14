import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tenants table for multi-tenant architecture
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  role: text("role").notNull().default("manager"),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  token: text("token").notNull().unique(),
  userId: varchar("user_id").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailCaptures = pgTable("email_captures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  acv: text("acv"),
  closeRate: text("close_rate"),
  salesCycle: text("sales_cycle"),
  quota: text("quota"),
  calculatedRevenue: text("calculated_revenue"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  featuredImage: text("featured_image"),
  videoUrl: text("video_url"),
  category: text("category"),
  scheduledFor: timestamp("scheduled_for"),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  published: boolean("published").default(true).notNull(),
});

export const videoPosts = pgTable("video_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  platform: text("platform"),
  duration: text("duration"),
  author: text("author").notNull(),
  category: text("category"),
  scheduledFor: timestamp("scheduled_for"),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  published: boolean("published").default(true).notNull(),
});

export const widgetConfig = pgTable("widget_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  widgetType: text("widget_type").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  position: text("position").default("bottom-right").notNull(),
  settings: text("settings"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  name: text("name").notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  companyLogo: text("company_logo"),
  quote: text("quote").notNull(),
  rating: integer("rating").notNull(),
  featured: boolean("featured").default(false).notNull(),
  avatarUrl: text("avatar_url"),
  metrics: text("metrics"),
  industry: text("industry"),
  companySize: text("company_size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leadCaptures = pgTable("lead_captures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  company: text("company"),
  role: text("role"),
  resourceDownloaded: text("resource_downloaded").notNull(),
  downloadedAt: timestamp("downloaded_at").defaultNow().notNull(),
  source: text("source"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const jobPostings = pgTable("job_postings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  title: text("title").notNull(),
  department: text("department").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobApplications = pgTable("job_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  jobId: varchar("job_id").notNull().references(() => jobPostings.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  resume: text("resume"),
  coverLetter: text("cover_letter"),
  linkedin: text("linkedin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const blueprintCaptures = pgTable("blueprint_captures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  path: text("path").notNull(),
  q1: text("q1").notNull(),
  q2: text("q2"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  emailSent: boolean("email_sent").default(false).notNull(),
});

export const assessmentResponses = pgTable("assessment_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  sessionId: varchar("session_id").notNull().unique(),
  
  q1: text("q1"),
  q2: text("q2"),
  q3: text("q3"),
  q4: text("q4"),
  q5: text("q5"),
  q6: text("q6"),
  q7: text("q7"),
  q8: text("q8"),
  q9: text("q9"),
  q10a1: text("q10a1"),
  q10a2: text("q10a2"),
  q10b1: text("q10b1"),
  q10b2: text("q10b2"),
  q10c1: text("q10c1"),
  q10c2: text("q10c2"),
  q11: text("q11"),
  q13: text("q13"),
  q14: text("q14"),
  q15: text("q15"),
  q16: text("q16"),
  q17: text("q17"),
  q18: text("q18"),
  q19: text("q19"),
  q20: text("q20"),
  
  bucket: text("bucket"),
  completed: boolean("completed").default(false).notNull(),
  usedCalculator: boolean("used_calculator").default(false).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const newsletterSignups = pgTable("newsletter_signups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  source: text("source").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assessmentConfigs = pgTable("assessment_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  scoringMethod: text("scoring_method").notNull().default("decision-tree"),
  gateBehavior: text("gate_behavior").notNull().default("UNGATED"),
  entryQuestionId: varchar("entry_question_id"),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const assessmentQuestions = pgTable("assessment_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessmentConfigs.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  questionType: text("question_type").notNull().default("single-choice"),
  conditionalLogic: text("conditional_logic"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assessmentAnswers = pgTable("assessment_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: varchar("question_id").notNull().references(() => assessmentQuestions.id, { onDelete: "cascade" }),
  answerText: text("answer_text").notNull(),
  answerValue: text("answer_value").notNull(),
  points: integer("points"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assessmentResultBuckets = pgTable("assessment_result_buckets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessmentConfigs.id, { onDelete: "cascade" }),
  bucketName: text("bucket_name").notNull(),
  bucketKey: text("bucket_key").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  pdfUrl: text("pdf_url"),
  routingRules: text("routing_rules"),
  minScore: integer("min_score"),
  maxScore: integer("max_score"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const configurableAssessmentResponses = pgTable("configurable_assessment_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  assessmentConfigId: varchar("assessment_config_id").notNull().references(() => assessmentConfigs.id),
  sessionId: varchar("session_id").notNull().unique(),
  answers: text("answers").notNull(),
  finalScore: integer("final_score"),
  finalBucketKey: text("final_bucket_key"),
  name: text("name"),
  email: text("email"),
  company: text("company"),
  resultUrl: text("result_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  campaignName: text("campaign_name").notNull(),
  contentType: text("content_type").notNull(),
  widgetConfig: text("widget_config"),
  displayAs: text("display_as").notNull(),
  displaySize: text("display_size").default("standard"),
  targetPages: text("target_pages").array(),
  targetZone: text("target_zone"),
  isActive: boolean("is_active").default(true).notNull(),
  theme: text("theme").default("auto"),
  size: text("size").default("medium"),
  overlayOpacity: integer("overlay_opacity").default(50),
  dismissible: boolean("dismissible").default(true),
  animation: text("animation").default("fade"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  seoMetadata: text("seo_metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  campaignId: varchar("campaign_id").references(() => campaigns.id),
  eventType: text("event_type").notNull(),
  payload: text("payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  email: text("email").notNull(),
  name: text("name"),
  company: text("company"),
  phone: text("phone"),
  source: text("source").notNull(),
  pageUrl: text("page_url"),
  formData: text("form_data"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const featureFlags = pgTable("feature_flags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  flagKey: text("flag_key").notNull(),
  flagName: text("flag_name").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTenantSchema = createInsertSchema(tenants).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
}).extend({
  email: z.string().email("Please enter a valid email address"),
});

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
  used: true,
});

export const insertEmailCaptureSchema = createInsertSchema(emailCaptures).omit({
  id: true,
  createdAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  tenantId: true,
  publishedAt: true,
  updatedAt: true,
});

export const insertVideoPostSchema = createInsertSchema(videoPosts).omit({
  id: true,
  tenantId: true,
  publishedAt: true,
  updatedAt: true,
});

export const insertWidgetConfigSchema = createInsertSchema(widgetConfig).omit({
  id: true,
  tenantId: true,
  updatedAt: true,
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  tenantId: true,
  createdAt: true,
}).extend({
  // Preprocess optional fields: convert blank strings to null
  companyLogo: z.preprocess(
    (val) => (!val || (typeof val === 'string' && val.trim() === '') ? null : val),
    z.string().url().nullable().optional()
  ),
  avatarUrl: z.preprocess(
    (val) => (!val || (typeof val === 'string' && val.trim() === '') ? null : val),
    z.string().url().nullable().optional()
  ),
  metrics: z.preprocess(
    (val) => (!val || (typeof val === 'string' && val.trim() === '') ? null : val),
    z.string().nullable().optional()
  ),
  industry: z.preprocess(
    (val) => (!val || (typeof val === 'string' && val.trim() === '') ? null : val),
    z.string().nullable().optional()
  ),
  companySize: z.preprocess(
    (val) => (!val || (typeof val === 'string' && val.trim() === '') ? null : val),
    z.string().nullable().optional()
  ),
});

export const insertJobPostingSchema = createInsertSchema(jobPostings).omit({
  id: true,
  tenantId: true,
  createdAt: true,
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  tenantId: true,
  createdAt: true,
});

export const insertLeadCaptureSchema = createInsertSchema(leadCaptures)
  .omit({
    id: true,
    tenantId: true,
  })
  .extend({
    email: z.string().email("Please enter a valid email address"),
    firstName: z.string().min(1, "First name is required"),
    company: z.string().optional(),
  });

export const insertBlueprintCaptureSchema = createInsertSchema(blueprintCaptures)
  .omit({
    id: true,
    createdAt: true,
    emailSent: true,
  })
  .extend({
    email: z.string().email("Please enter a valid email address"),
  });

export const insertAssessmentResponseSchema = createInsertSchema(assessmentResponses)
  .omit({
    id: true,
    tenantId: true,
    createdAt: true,
    updatedAt: true,
  });

export const insertNewsletterSignupSchema = createInsertSchema(newsletterSignups)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    email: z.string().email("Please enter a valid email address"),
  });

export const insertAssessmentConfigSchema = createInsertSchema(assessmentConfigs).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssessmentQuestionSchema = createInsertSchema(assessmentQuestions).omit({
  id: true,
  createdAt: true,
});

export const insertAssessmentAnswerSchema = createInsertSchema(assessmentAnswers).omit({
  id: true,
  createdAt: true,
});

export const insertAssessmentResultBucketSchema = createInsertSchema(assessmentResultBuckets).omit({
  id: true,
  createdAt: true,
});

export const insertConfigurableAssessmentResponseSchema = createInsertSchema(configurableAssessmentResponses).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  tenantId: true,
  createdAt: true,
});

export const insertLeadSchema = createInsertSchema(leads)
  .omit({
    id: true,
    tenantId: true,
    createdAt: true,
  })
  .extend({
    email: z.string().email("Please enter a valid email address"),
    source: z.string().min(1, "Source is required"),
  });

export const insertFeatureFlagSchema = createInsertSchema(featureFlags).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type EmailCapture = typeof emailCaptures.$inferSelect;
export type InsertEmailCapture = z.infer<typeof insertEmailCaptureSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type VideoPost = typeof videoPosts.$inferSelect;
export type InsertVideoPost = z.infer<typeof insertVideoPostSchema>;
export type WidgetConfig = typeof widgetConfig.$inferSelect;
export type InsertWidgetConfig = z.infer<typeof insertWidgetConfigSchema>;
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type JobPosting = typeof jobPostings.$inferSelect;
export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type LeadCapture = typeof leadCaptures.$inferSelect;
export type InsertLeadCapture = z.infer<typeof insertLeadCaptureSchema>;
export type BlueprintCapture = typeof blueprintCaptures.$inferSelect;
export type InsertBlueprintCapture = z.infer<typeof insertBlueprintCaptureSchema>;
export type AssessmentResponse = typeof assessmentResponses.$inferSelect;
export type InsertAssessmentResponse = z.infer<typeof insertAssessmentResponseSchema>;
export type NewsletterSignup = typeof newsletterSignups.$inferSelect;
export type InsertNewsletterSignup = z.infer<typeof insertNewsletterSignupSchema>;
export type AssessmentConfig = typeof assessmentConfigs.$inferSelect;
export type InsertAssessmentConfig = z.infer<typeof insertAssessmentConfigSchema>;
export type AssessmentQuestion = typeof assessmentQuestions.$inferSelect;
export type InsertAssessmentQuestion = z.infer<typeof insertAssessmentQuestionSchema>;
export type AssessmentAnswer = typeof assessmentAnswers.$inferSelect;
export type InsertAssessmentAnswer = z.infer<typeof insertAssessmentAnswerSchema>;
export type AssessmentResultBucket = typeof assessmentResultBuckets.$inferSelect;
export type InsertAssessmentResultBucket = z.infer<typeof insertAssessmentResultBucketSchema>;
export type ConfigurableAssessmentResponse = typeof configurableAssessmentResponses.$inferSelect;
export type InsertConfigurableAssessmentResponse = z.infer<typeof insertConfigurableAssessmentResponseSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = z.infer<typeof insertFeatureFlagSchema>;

export const formFieldSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  label: z.string().min(1, "Field label is required"),
  type: z.enum(["text", "email", "tel", "number", "textarea", "select", "checkbox", "radio"]),
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    message: z.string().optional(),
  }).optional(),
  options: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).optional(),
});

export const formConfigSchema = z.object({
  title: z.string().min(1, "Form title is required"),
  description: z.string().optional(),
  fields: z.array(formFieldSchema).min(1, "At least one field is required"),
  submitButtonText: z.string().default("Submit"),
  successMessage: z.string().default("Thank you for your submission!"),
});

export const calculatorInputSchema = z.object({
  name: z.string().min(1, "Input name is required"),
  label: z.string().min(1, "Input label is required"),
  type: z.enum(["number", "slider", "toggle"]),
  defaultValue: z.number().default(0),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  unit: z.string().optional(),
});

export const calculatorConfigSchema = z.object({
  title: z.string().min(1, "Calculator title is required"),
  description: z.string().optional(),
  inputs: z.array(calculatorInputSchema).min(1, "At least one input is required"),
  formula: z.string().min(1, "Formula is required"),
  resultLabel: z.string().default("Result"),
  resultUnit: z.string().optional(),
});

export const seoMetadataSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),
});

// Branding Portfolio Tables
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  clientName: text("client_name"),
  thumbnailUrl: text("thumbnail_url"),
  categories: text("categories").array().default(sql`'{}'::text[]`), // Array of category tags
  challengeText: text("challenge_text"),
  solutionText: text("solution_text"),
  outcomeText: text("outcome_text"),
  modalMediaType: text("modal_media_type").default("video").notNull(), // 'video' or 'carousel'
  modalMediaUrls: text("modal_media_urls").array(), // Array of Cloudinary URLs
  testimonialText: text("testimonial_text"),
  testimonialAuthor: text("testimonial_author"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectScenes = pgTable("project_scenes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  sceneConfig: text("scene_config").notNull(), // JSONB stored as text for Drizzle compatibility
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas for projects
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  tenantId: true,
  createdAt: true,
}).extend({
  // Preprocessors: convert blank strings to null for optional fields
  clientName: z.preprocess(
    (val) => (!val || (typeof val === 'string' && val.trim() === '') ? null : val),
    z.string().nullable().optional()
  ),
  thumbnailUrl: z.preprocess(
    (val) => (!val || (typeof val === 'string' && val.trim() === '') ? null : val),
    z.string().url().nullable().optional()
  ),
  challengeText: z.preprocess(
    (val) => (!val || (typeof val === 'string' && val.trim() === '') ? null : val),
    z.string().nullable().optional()
  ),
  solutionText: z.preprocess(
    (val) => (!val || (typeof val === 'string' && val.trim() === '') ? null : val),
    z.string().nullable().optional()
  ),
  outcomeText: z.preprocess(
    (val) => (!val || (typeof val === 'string' && val.trim() === '') ? null : val),
    z.string().nullable().optional()
  ),
  testimonialText: z.preprocess(
    (val) => (!val || (typeof val === 'string' && val.trim() === '') ? null : val),
    z.string().nullable().optional()
  ),
  testimonialAuthor: z.preprocess(
    (val) => (!val || (typeof val === 'string' && val.trim() === '') ? null : val),
    z.string().nullable().optional()
  ),
});

export const updateProjectSchema = insertProjectSchema.partial();

export const insertProjectSceneSchema = createInsertSchema(projectScenes).omit({
  id: true,
  projectId: true,
  createdAt: true,
});

export const updateProjectSceneSchema = insertProjectSceneSchema.partial();

// Types
export type FormField = z.infer<typeof formFieldSchema>;
export type FormConfig = z.infer<typeof formConfigSchema>;
export type CalculatorInput = z.infer<typeof calculatorInputSchema>;
export type CalculatorConfig = z.infer<typeof calculatorConfigSchema>;
export type SeoMetadata = z.infer<typeof seoMetadataSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type ProjectScene = typeof projectScenes.$inferSelect;
export type InsertProjectScene = z.infer<typeof insertProjectSceneSchema>;
