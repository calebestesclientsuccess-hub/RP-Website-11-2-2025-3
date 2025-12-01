import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, json, jsonb, unique, uniqueIndex, index, bigint, AnyPgColumn } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { nanoid } from 'nanoid';

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
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  username: text("username").notNull(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").notNull().default("manager"),
}, (table) => ({
  // Composite unique constraint: username unique per tenant
  uniqueUsernamePerTenant: unique().on(table.tenantId, table.username),
  uniqueEmailPerTenant: unique().on(table.tenantId, table.email),
}));

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
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  canonicalUrl: text("canonical_url"),
  recommendedArticleIds: text("recommended_article_ids").array(),
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

// E-book Lead Magnet Configuration
export const ebookLeadMagnets = pgTable("ebook_lead_magnets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  slug: text("slug").notNull(), // e.g., "198k-mistake-ebook"
  h1Text: text("h1_text").notNull(),
  h2Text: text("h2_text"),
  bodyText: text("body_text"),
  pdfUrl: text("pdf_url").notNull(), // Cloudinary URL
  pdfPublicId: text("pdf_public_id"), // Cloudinary public ID for deletion
  previewImageUrl: text("preview_image_url"), // Cloudinary URL
  previewImagePublicId: text("preview_image_public_id"), // Cloudinary public ID
  imageSize: text("image_size").default("medium").$type<"small" | "medium" | "large" | "xlarge" | "full">(),
  imageOrientation: text("image_orientation").default("portrait").$type<"portrait" | "landscape">(),
  imageStyle: text("image_style").default("shadow").$type<"shadow" | "minimal" | "elevated" | "glow" | "tilted">(),
  ctaButtonText: text("cta_button_text").default("Get Free Access"),
  successMessage: text("success_message").default("Check your email for your free e-book!"),
  calendlyLink: text("calendly_link"), // Optional Calendly scheduling link
  isEnabled: boolean("is_enabled").default(false).notNull(),
  sortOrder: integer("sort_order").default(0), // For future multi-placement support
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueSlugPerTenant: unique().on(table.tenantId, table.slug),
}));

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

// Scene Templates - Reusable scene configurations
export const sceneTemplates = pgTable("scene_templates", {
  // Primary identifier
  id: varchar("id").primaryKey().$defaultFn(() => `tmpl_${nanoid(12)}`),

  // CRITICAL: Tenant isolation
  tenantId: varchar("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),

  // Template metadata
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  // The complete scene blueprint (copied from project_scenes.sceneConfig)
  sceneConfig: jsonb("scene_config").$type<SceneConfig>().notNull(),

  // Visual preview for gallery UI
  previewImageUrl: varchar("preview_image_url", { length: 2048 }),

  // Categorization and search
  tags: text("tags").array().default(sql`ARRAY[]::text[]`),
  category: varchar("category", { length: 100 }),

  // Source tracking (optional - which scene was this template created from?)
  sourceProjectId: varchar("source_project_id").references(() => projects.id, { onDelete: "set null" }),
  sourceSceneId: varchar("source_scene_id").references(() => projectScenes.id, { onDelete: "set null" }),

  // Usage analytics
  usageCount: integer("usage_count").default(0).notNull(),
  lastUsedAt: timestamp("last_used_at"),

  // Auditing
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // Schema versioning for migrations
  schemaVersion: varchar("schema_version", { length: 10 }).default("1.0").notNull(),
}, (table) => ({
  // Fast tenant filtering
  tenantIdIdx: index("scene_templates_tenant_id_idx").on(table.tenantId),
  
  // Search by category
  categoryIdx: index("scene_templates_category_idx").on(table.category),
  
  // Full-text search on name/description using GIN index with to_tsvector
  searchIdx: index("scene_templates_search_idx")
    .using("gin", sql`to_tsvector('english', coalesce(${table.name}, '') || ' ' || coalesce(${table.description}, ''))`),
}));

export const portfolioConversations = pgTable("portfolio_conversations", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PortfolioConversation = typeof portfolioConversations.$inferSelect;
export type InsertPortfolioConversation = typeof portfolioConversations.$inferInsert;

// Content Assets table for inline asset creation
export const contentAssets = pgTable("content_assets", {
  id: text("id").notNull().primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  assetType: text("asset_type").notNull(), // 'image', 'video', 'quote'

  // Common fields
  title: text("title"),
  tags: text("tags").array(),

  // Image-specific
  imageUrl: text("image_url"),
  altText: text("alt_text"),

  // Video-specific
  videoUrl: text("video_url"),
  videoCaption: text("video_caption"),
  duration: integer("duration"),

  // Quote-specific
  quoteText: text("quote_text"),
  quoteAuthor: text("quote_author"),
  quoteRole: text("quote_role"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ContentAsset = typeof contentAssets.$inferSelect;
export type InsertContentAsset = typeof contentAssets.$inferInsert;

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
  variants: jsonb("variants").$type<CampaignVariant[]>().default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const seoIssues = pgTable("seo_issues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  url: text("url").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  issueType: text("issue_type").notNull(),
  severity: text("severity").notNull().default("medium"),
  status: text("status").notNull().default("open"),
  details: text("details"),
  lastChecked: timestamp("last_checked").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueIssue: uniqueIndex("seo_issues_unique").on(table.tenantId, table.issueType, table.entityId),
}));

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

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  name: text("name").notNull(),
  domain: text("domain"),
  industry: text("industry"),
  website: text("website"),
  customFields: jsonb("custom_fields").$type<Record<string, any>>().default(sql`'{}'::jsonb`).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tenantDomainIdx: uniqueIndex("companies_tenant_domain_idx")
    .on(table.tenantId, table.domain)
    .where(sql`${table.domain} IS NOT NULL`),
}));

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  companyId: varchar("company_id").references(() => companies.id),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").notNull(),
  phone: text("phone"),
  title: text("title"),
  customFields: jsonb("custom_fields").$type<Record<string, any>>().default(sql`'{}'::jsonb`).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tenantEmailIdx: uniqueIndex("contacts_tenant_email_idx").on(table.tenantId, table.email),
  companyIdx: index("contacts_company_id_idx").on(table.companyId),
}));

export const customFieldDefinitions = pgTable("custom_field_definitions", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: varchar("tenant_id", { length: 255 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  objectType: text("object_type").notNull(),
  fieldKey: text("field_key").notNull(),
  fieldLabel: text("field_label").notNull(),
  fieldType: text("field_type").notNull(),
  description: text("description"),
  required: boolean("required").notNull().default(false),
  options: jsonb("options").$type<Array<{ label: string; value: string }>>().default(sql`'[]'::jsonb`).notNull(),
  validation: jsonb("validation").$type<Record<string, any>>().default(sql`'{}'::jsonb`).notNull(),
  defaultValue: jsonb("default_value").$type<any>(),
  orderIndex: integer("order_index").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueFieldPerObject: uniqueIndex("custom_field_unique_idx").on(table.tenantId, table.objectType, table.fieldKey),
  tenantIdx: index("custom_field_tenant_idx").on(table.tenantId),
}));

export const deals = pgTable("deals", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  companyId: varchar("company_id", { length: 255 }).references(() => companies.id, { onDelete: "set null" }),
  contactId: varchar("contact_id", { length: 255 }).references(() => contacts.id, { onDelete: "set null" }),
  ownerId: varchar("owner_id", { length: 255 }).references(() => users.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  description: text("description"),
  stage: text("stage").notNull().default("qualification"),
  status: text("status").notNull().default("open"),
  amount: integer("amount"),
  currency: text("currency").notNull().default("USD"),
  probability: integer("probability"),
  source: text("source"),
  closeDate: timestamp("close_date"),
  customFields: jsonb("custom_fields").$type<Record<string, any>>().default(sql`'{}'::jsonb`).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tenantStatusIdx: index("deals_tenant_status_idx").on(table.tenantId, table.status),
  companyIdx: index("deals_company_idx").on(table.companyId),
  contactIdx: index("deals_contact_idx").on(table.contactId),
  ownerIdx: index("deals_owner_idx").on(table.ownerId),
}));

export const emails = pgTable("emails", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  companyId: varchar("company_id", { length: 255 }).references(() => companies.id, { onDelete: "set null" }),
  contactId: varchar("contact_id", { length: 255 }).references(() => contacts.id, { onDelete: "set null" }),
  dealId: varchar("deal_id", { length: 255 }).references(() => deals.id, { onDelete: "set null" }),
  ownerId: varchar("owner_id", { length: 255 }).references(() => users.id, { onDelete: "set null" }),
  subject: text("subject").notNull(),
  body: text("body"),
  direction: text("direction").notNull().default("outbound"),
  status: text("status").notNull().default("logged"),
  sentAt: timestamp("sent_at"),
  customFields: jsonb("custom_fields").$type<Record<string, any>>().default(sql`'{}'::jsonb`).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("emails_tenant_idx").on(table.tenantId, table.direction),
  contactIdx: index("emails_contact_idx").on(table.contactId),
  dealIdx: index("emails_deal_idx").on(table.dealId),
}));

export const phoneCalls = pgTable("phone_calls", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  companyId: varchar("company_id", { length: 255 }).references(() => companies.id, { onDelete: "set null" }),
  contactId: varchar("contact_id", { length: 255 }).references(() => contacts.id, { onDelete: "set null" }),
  dealId: varchar("deal_id", { length: 255 }).references(() => deals.id, { onDelete: "set null" }),
  ownerId: varchar("owner_id", { length: 255 }).references(() => users.id, { onDelete: "set null" }),
  callType: text("call_type").notNull().default("outbound"),
  subject: text("subject"),
  notes: text("notes"),
  durationSeconds: integer("duration_seconds"),
  calledAt: timestamp("called_at"),
  outcome: text("outcome"),
  customFields: jsonb("custom_fields").$type<Record<string, any>>().default(sql`'{}'::jsonb`).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("phone_calls_tenant_idx").on(table.tenantId, table.callType),
  contactIdx: index("phone_calls_contact_idx").on(table.contactId),
  dealIdx: index("phone_calls_deal_idx").on(table.dealId),
}));

export const meetings = pgTable("meetings", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  companyId: varchar("company_id", { length: 255 }).references(() => companies.id, { onDelete: "set null" }),
  contactId: varchar("contact_id", { length: 255 }).references(() => contacts.id, { onDelete: "set null" }),
  dealId: varchar("deal_id", { length: 255 }).references(() => deals.id, { onDelete: "set null" }),
  ownerId: varchar("owner_id", { length: 255 }).references(() => users.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  agenda: text("agenda"),
  meetingType: text("meeting_type"),
  status: text("status").notNull().default("scheduled"),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  location: text("location"),
  conferencingLink: text("conferencing_link"),
  customFields: jsonb("custom_fields").$type<Record<string, any>>().default(sql`'{}'::jsonb`).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("meetings_tenant_idx").on(table.tenantId, table.status),
  contactIdx: index("meetings_contact_idx").on(table.contactId),
  dealIdx: index("meetings_deal_idx").on(table.dealId),
}));

export const tasks = pgTable("tasks", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  companyId: varchar("company_id", { length: 255 }).references(() => companies.id, { onDelete: "set null" }),
  contactId: varchar("contact_id", { length: 255 }).references(() => contacts.id, { onDelete: "set null" }),
  dealId: varchar("deal_id", { length: 255 }).references(() => deals.id, { onDelete: "set null" }),
  ownerId: varchar("owner_id", { length: 255 }).references(() => users.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("normal"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  reminderAt: timestamp("reminder_at"),
  customFields: jsonb("custom_fields").$type<Record<string, any>>().default(sql`'{}'::jsonb`).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("tasks_tenant_idx").on(table.tenantId, table.status),
  contactIdx: index("tasks_contact_idx").on(table.contactId),
  dealIdx: index("tasks_deal_idx").on(table.dealId),
  ownerIdx: index("tasks_owner_idx").on(table.ownerId),
}));

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

export const campaignVariantSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  weight: z.number().min(0).optional(),
  widgetConfig: z.string().optional(),
  seoMetadata: seoMetadataSchema.optional(),
});

export type CampaignVariant = z.infer<typeof campaignVariantSchema>;

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

export const insertEbookLeadMagnetSchema = createInsertSchema(ebookLeadMagnets)
  .omit({
    id: true,
    tenantId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
    h1Text: z.string().min(1, "H1 text is required").max(200, "H1 must be under 200 characters"),
    h2Text: z.string().max(300, "H2 must be under 300 characters").optional(),
    bodyText: z.string().max(2000, "Body text must be under 2000 characters").optional(),
    pdfUrl: z.string().url("Invalid PDF URL"),
    previewImageUrl: z.string().url("Invalid image URL").optional(),
    imageSize: z.enum(["small", "medium", "large", "xlarge", "full"]).optional(),
    imageOrientation: z.enum(["portrait", "landscape"]).optional(),
    imageStyle: z.enum(["shadow", "minimal", "elevated", "glow", "tilted"]).optional(),
    ctaButtonText: z.string().max(50, "CTA text must be under 50 characters").optional(),
    successMessage: z.string().max(500, "Success message must be under 500 characters").optional(),
    calendlyLink: z.string().url("Invalid Calendly URL").optional(),
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
}).extend({
  variants: z.array(campaignVariantSchema).optional(),
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

export const insertSeoIssueSchema = createInsertSchema(seoIssues).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
  resolvedBy: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  tenantId: true, // managed by middleware/context
  createdAt: true,
  updatedAt: true,
}).extend({
  customFields: z.record(z.any()).optional(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  customFields: z.record(z.any()).optional(),
});

export const insertCustomFieldDefinitionSchema = createInsertSchema(customFieldDefinitions)
  .omit({
    id: true,
    tenantId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    options: z
      .array(z.object({ label: z.string().min(1), value: z.string().min(1) }))
      .optional(),
    validation: z.record(z.any()).optional(),
    required: z.boolean().optional(),
    isActive: z.boolean().optional(),
    defaultValue: z
      .union([z.string(), z.number(), z.boolean(), z.array(z.any()), z.record(z.any())])
      .optional(),
  });

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  customFields: z.record(z.any()).optional(),
});

export const insertEmailSchema = createInsertSchema(emails).omit({
  id: true,
  tenantId: true,
  createdAt: true,
}).extend({
  customFields: z.record(z.any()).optional(),
});

export const insertPhoneCallSchema = createInsertSchema(phoneCalls).omit({
  id: true,
  tenantId: true,
  createdAt: true,
}).extend({
  customFields: z.record(z.any()).optional(),
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  customFields: z.record(z.any()).optional(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  customFields: z.record(z.any()).optional(),
});

export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type CustomFieldDefinition = typeof customFieldDefinitions.$inferSelect;
export type InsertCustomFieldDefinition = z.infer<typeof insertCustomFieldDefinitionSchema>;
export type Deal = typeof deals.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type EmailActivity = typeof emails.$inferSelect;
export type InsertEmailActivity = z.infer<typeof insertEmailSchema>;
export type PhoneCall = typeof phoneCalls.$inferSelect;
export type InsertPhoneCall = z.infer<typeof insertPhoneCallSchema>;
export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type EmailCapture = typeof emailCaptures.$inferSelect;
export type InsertEmailCapture = z.infer<typeof insertEmailCaptureSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type BlogPostSummary = Omit<BlogPost, "content"> & {
  contentPreview?: string | null;
};
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
export type EbookLeadMagnet = typeof ebookLeadMagnets.$inferSelect;
export type InsertEbookLeadMagnet = z.infer<typeof insertEbookLeadMagnetSchema>;
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
export type SeoIssue = typeof seoIssues.$inferSelect;
export type InsertSeoIssue = z.infer<typeof insertSeoIssueSchema>;

// Project Media Asset type used for branding portfolio media
export interface ProjectMediaAsset {
  id: string;
  url: string;
  type: "image" | "video";
  order: number;
  alt?: string;
  caption?: string;
  mediaId?: string;
}

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
  brandLogoUrl: text("brand_logo_url"),
  brandColors: jsonb("brand_colors").$type<{
    primary?: string;
    secondary?: string;
    accent?: string;
    neutral?: string;
  }>().default(sql`'{}'::jsonb`),
  // Hero media support (image or video)
  heroMediaType: text("hero_media_type").default("image"), // 'image' or 'video'
  heroMediaConfig: jsonb("hero_media_config").$type<{
    videoUrl?: string;
    posterUrl?: string;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
  }>().default(sql`'{}'::jsonb`),
  // Expansion layout mode for portfolio grid
  expansionLayout: text("expansion_layout").default("vertical"), // 'vertical' or 'cinematic'
  componentLibrary: text("component_library").default("shadcn"),
  assetPlan: jsonb("asset_plan").$type<Array<{
    assetId: string;
    label?: string;
    sectionKey?: string;
  }>>().default(sql`'[]'::jsonb`),
  caseStudyContent: jsonb("case_study_content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectScenes = pgTable("project_scenes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  sceneConfig: jsonb("scene_config").notNull().$type<{
    type: string;
    content: {
      url?: string;
      mediaId?: string; // NEW: Optional reference to media_library
      [key: string]: any;
    };
    layout?: string;
    animation?: string;
    director?: Record<string, any>;
  }>(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  projectIdIdx: index("project_scenes_project_id_idx").on(table.projectId),
}));

export const projectSectionPlans = pgTable("project_section_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  sectionKey: text("section_key").notNull(),
  label: text("label"),
  featureType: text("feature_type").notNull(),
  featureConfig: jsonb("feature_config").$type<Record<string, any>>().default(sql`'{}'::jsonb`),
  orderIndex: integer("order_index").default(0).notNull(),
  enablePerSectionPrompt: boolean("enable_per_section_prompt").default(false).notNull(),
  prompt: text("prompt"),
  selectedAssets: jsonb("selected_assets").$type<Array<{ assetId: string; label?: string }>>().default(sql`'[]'::jsonb`),
  metrics: jsonb("metrics").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  projectIdx: index("idx_project_section_plans_project").on(table.projectId),
  uniqueSection: unique().on(table.projectId, table.sectionKey),
}));

export const portfolioPipelineRuns = pgTable("portfolio_pipeline_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  status: text("status").default("pending").notNull(),
  stages: jsonb("stages").$type<Array<{
    key: string;
    label: string;
    status: "pending" | "running" | "succeeded" | "failed";
    startedAt?: string;
    completedAt?: string;
    error?: string;
  }>>().default(sql`'[]'::jsonb`),
  currentStageIndex: integer("current_stage_index").default(0),
  totalStages: integer("total_stages").default(6),
  latestVersionNumber: integer("latest_version_number"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  metadata: jsonb("metadata").$type<Record<string, any>>().default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  projectIdx: index("idx_portfolio_pipeline_runs_project").on(table.projectId),
}));

export const portfolioVersions = pgTable("portfolio_versions", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  pipelineRunId: text("pipeline_run_id").references(() => portfolioPipelineRuns.id, { onDelete: "set null" }),
  stageKey: text("stage_key"),
  versionNumber: integer("version_number").notNull(),
  scenesJson: jsonb("scenes_json").notNull(),
  confidenceScore: integer("confidence_score"),
  confidenceFactors: jsonb("confidence_factors"),
  changeDescription: text("change_description"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  projectIdx: index("idx_portfolio_versions_project").on(table.projectId),
  createdIdx: index("idx_portfolio_versions_created").on(table.createdAt),
  uniqueVersion: unique().on(table.projectId, table.versionNumber),
}));

// AI-powered scene generation prompt templates
export const promptTemplates = pgTable("prompt_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  name: text("name").notNull(),
  description: text("description"),
  sceneType: text("scene_type"), // 'text', 'image', 'video', 'split', etc. (null = universal)
  scope: text("scope").default("director").notNull(), // 'director', 'voiceover' (future extensibility)
  templateContent: text("template_content").notNull(),
  variablesMeta: jsonb("variables_meta").$type<Array<{
    name: string;
    description: string;
    required: boolean;
    example?: string;
  }>>(), // Placeholder descriptors for UI validation
  outputSchema: jsonb("output_schema"), // For Gemini response validation
  isDefault: boolean("is_default").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: varchar("created_by").references(() => users.id),
  updatedBy: varchar("updated_by").references(() => users.id),
}, (table) => [
  // Unique constraint: name unique per tenant
  unique("unique_name_per_tenant").on(table.tenantId, table.name),

  // Partial unique index: only one default template per tenant/sceneType/scope
  // CRITICAL: Use COALESCE to handle NULL sceneType (universal templates) so uniqueness is enforced
  uniqueIndex("unique_default_per_type_scope")
    .on(table.tenantId, sql`COALESCE(${table.sceneType}, '')`, table.scope)
    .where(sql`${table.isDefault} = true`),

  // Regular composite index for query performance
  index("tenant_type_active_idx")
    .on(table.tenantId, table.sceneType, table.isActive),
]);

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
  brandLogoUrl: z.preprocess(
    (val) => (!val || (typeof val === 'string' && val.trim() === '') ? null : val),
    z.string().url().nullable().optional()
  ),
  brandColors: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
    neutral: z.string().optional(),
  }).partial().optional(),
  componentLibrary: z.string().optional(),
  assetPlan: z.array(z.object({
    assetId: z.string(),
    label: z.string().optional(),
    sectionKey: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })).optional(),
});

export const updateProjectSchema = insertProjectSchema.partial();

// Scene content validation schemas
const textSceneSchema = z.object({
  type: z.literal("text"),
  content: z.object({
    heading: z.string().min(1).max(60, "Heading should be under 60 characters for SEO"),
    headingLevel: z.enum(["h1", "h2", "h3", "h4", "h5", "h6"]).default("h2"),
    body: z.string().min(50, "Body text should be at least 50 characters for quality content"),
    metaDescription: z.string().min(120).max(160).optional(),
  }),
});

const imageSceneSchema = z.object({
  type: z.literal("image"),
  content: z.object({
    url: z.string().url(),
    mediaId: z.string().optional(), // NEW: Media Library reference
    alt: z.string().min(10, "Alt text must be at least 10 characters").max(125, "Alt text must be under 125 characters"),
    title: z.string().optional(),
  }),
});

const videoSceneSchema = z.object({
  type: z.literal("video"),
  content: z.object({
    url: z.string().url(),
  }).passthrough(),
});

const splitSceneSchema = z.object({
  type: z.literal("split"),
  content: z.object({
    media: z.string().url(),
    mediaMediaId: z.string().optional(), // NEW: Media Library reference for 'media' field
    heading: z.string().optional(),
    body: z.string().optional(),
  }).passthrough(),
});

const gallerySceneSchema = z.object({
  type: z.literal("gallery"),
  content: z.object({
    images: z.array(z.object({
      url: z.string().url(),
      mediaId: z.string().optional(), // NEW: Media Library reference per image
      alt: z.string().optional(),
    })).min(1),
  }).passthrough(),
});

const quoteSceneSchema = z.object({
  type: z.literal("quote"),
  content: z.object({
    quote: z.string().min(1),
  }).passthrough(),
});

const fullscreenSceneSchema = z.object({
  type: z.literal("fullscreen"),
  content: z.object({
    media: z.string().url(),
    mediaType: z.enum(["image", "video"]),
  }).passthrough(),
});

// New: Component-based scene type for rich SaaS UI elements
const componentSceneSchema = z.object({
  type: z.literal("component"),
  content: z.object({
    componentType: z.enum([
      "metric-card",
      "timeline",
      "comparison-table",
      "testimonial-carousel",
      "badge-grid",
      "icon-grid",
      "chart",
      "calculator",
      "feature-showcase",
      "stat-counter",
      "pricing-table",
      "cta-block"
    ]),
    props: z.record(z.any()), // Component-specific props
    heading: z.string().optional(),
    description: z.string().optional(),
  }).passthrough(),
});

// Discriminated union of all scene types
export const sceneConfigSchema = z.discriminatedUnion("type", [
  textSceneSchema,
  imageSceneSchema,
  videoSceneSchema,
  splitSceneSchema,
  gallerySceneSchema,
  quoteSceneSchema,
  fullscreenSceneSchema,
  componentSceneSchema, // Added component scene type
]);

export const insertProjectSceneSchema = createInsertSchema(projectScenes).omit({
  id: true,
  projectId: true,
  createdAt: true,
}).extend({
  sceneConfig: sceneConfigSchema, // Validate object structure directly (jsonb column)
});

export const updateProjectSceneSchema = insertProjectSceneSchema.partial();

export const DIRECTOR_CONFIG_DEFAULTS = {
  // ANIMATION & TIMING (8 controls)
  entryEffect: 'fade',
  entryDuration: 1.0,
  entryDelay: 0,
  entryEasing: 'ease-out',
  exitEffect: 'fade',
  exitDuration: 1.0,
  exitDelay: 0,
  exitEasing: 'ease-in',

  // VISUAL FOUNDATION (2 controls)
  backgroundColor: '#000000',
  textColor: '#ffffff',

  // SCROLL DEPTH & DURATION (3 controls)
  parallaxIntensity: 0,
  scrollSpeed: 'normal',
  animationDuration: 1.0,

  // TYPOGRAPHY (4 controls)
  headingSize: '4xl',
  bodySize: 'base',
  fontWeight: 'normal',
  alignment: 'center',

  // SCROLL INTERACTION (3 controls)
  fadeOnScroll: false,
  scaleOnScroll: false,
  blurOnScroll: false,

  // MULTI-ELEMENT TIMING (2 controls)
  staggerChildren: 0,
  layerDepth: 5,

  // ADVANCED MOTION (3 controls)
  transformOrigin: 'center center',
  overflowBehavior: 'hidden',
  backdropBlur: 'none',

  // VISUAL BLENDING (2 controls)
  mixBlendMode: 'normal',
  enablePerspective: false,

  // CUSTOM STYLING & TEXT (3 controls)
  customCSSClasses: '',
  textShadow: false,
  textGlow: false,

  // VERTICAL SPACING (2 controls)
  paddingTop: 'md',
  paddingBottom: 'md',

  // MEDIA PRESENTATION (3 controls - nullable)
  mediaPosition: 'center',
  mediaScale: 'cover',
  mediaOpacity: 1.0,

  // GRADIENT BACKGROUNDS (2 controls - nullable)
  gradientColors: undefined,
  gradientDirection: undefined,
} as const;

// Director configuration schema (optional customization)
export const directorConfigSchema = z.object({
  entryDuration: z.number().min(0.1).max(5).default(1.2),
  exitDuration: z.number().min(0.1).max(5).default(1.0),
  entryDelay: z.number().min(0).max(2).default(0),
  exitDelay: z.number().min(0).max(2).default(0), // NEW: stagger exit timing
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  gradientColors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).optional(),
  gradientDirection: z.enum(["to-top", "to-bottom", "to-left", "to-right", "to-top-right", "to-bottom-right", "to-top-left", "to-bottom-left"]).optional(),
  headingSize: z.enum(["4xl", "5xl", "6xl", "7xl", "8xl"]).optional(),
  bodySize: z.enum(["base", "lg", "xl", "2xl"]).optional(),
  fontWeight: z.enum(["normal", "medium", "semibold", "bold"]).optional(),
  alignment: z.enum(["left", "center", "right"]).optional(),
  scrollSpeed: z.enum(["slow", "normal", "fast"]).optional(),
  parallaxIntensity: z.number().min(0).max(1).optional(),
  animationDuration: z.number().min(0.5).max(10.0).optional(),
  animationEasing: z.enum(["linear", "ease", "ease-in", "ease-out", "ease-in-out", "power1", "power2", "power3", "power4", "back", "elastic", "bounce"]).optional(),
  fadeOnScroll: z.boolean().default(false),
  scaleOnScroll: z.boolean().default(false),
  blurOnScroll: z.boolean().default(false),
});

// Update scene schemas to include optional director config
const textSceneWithDirectorSchema = textSceneSchema.extend({
  director: directorConfigSchema,
});

const imageSceneWithDirectorSchema = imageSceneSchema.extend({
  director: directorConfigSchema,
});

const videoSceneWithDirectorSchema = videoSceneSchema.extend({
  director: directorConfigSchema,
});

const splitSceneWithDirectorSchema = splitSceneSchema.extend({
  director: directorConfigSchema,
});

const gallerySceneWithDirectorSchema = gallerySceneSchema.extend({
  director: directorConfigSchema,
});

const quoteSceneWithDirectorSchema = quoteSceneSchema.extend({
  director: directorConfigSchema,
});

const fullscreenSceneWithDirectorSchema = fullscreenSceneSchema.extend({
  director: directorConfigSchema,
});

const componentSceneWithDirectorSchema = componentSceneSchema.extend({
  director: directorConfigSchema,
});

// Discriminated union of all scene types with director config
export const sceneConfigWithDirectorSchema = z.discriminatedUnion("type", [
  textSceneWithDirectorSchema,
  imageSceneWithDirectorSchema,
  videoSceneWithDirectorSchema,
  splitSceneWithDirectorSchema,
  gallerySceneWithDirectorSchema,
  quoteSceneWithDirectorSchema,
  fullscreenSceneWithDirectorSchema,
  componentSceneWithDirectorSchema, // Added component scene type
]);


export const insertProjectSceneSchemaWithDirector = createInsertSchema(projectScenes).omit({
  id: true,
  projectId: true,
  createdAt: true,
}).extend({
  sceneConfig: sceneConfigWithDirectorSchema, // Validate object structure directly (jsonb column)
});

export const updateProjectSceneSchemaWithDirector = insertProjectSceneSchemaWithDirector.partial();

// Insert schemas for prompt templates
export const insertPromptTemplateSchema = createInsertSchema(promptTemplates).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
}).extend({
  // Preprocessors: convert blank strings to null for optional fields
  description: z.preprocess(
    (val) => (!val || (typeof val === 'string' && val.trim() === '') ? null : val),
    z.string().nullable().optional()
  ),
  sceneType: z.preprocess(
    (val) => (!val || (typeof val === 'string' && val.trim() === '') ? null : val),
    z.string().nullable().optional()
  ),
});

export const updatePromptTemplateSchema = insertPromptTemplateSchema.partial();

// Director configuration constants and defaults
export const ENTRY_EFFECTS = ["fade", "slide-up", "slide-down", "slide-left", "slide-right", "zoom-in", "zoom-out", "sudden", "cross-fade", "rotate-in", "flip-in", "spiral-in", "elastic-bounce", "blur-focus"] as const;
export const EXIT_EFFECTS = ["fade", "slide-up", "slide-down", "slide-left", "slide-right", "zoom-out", "dissolve", "cross-fade", "rotate-out", "flip-out", "scale-blur"] as const;
export const HEADING_SIZES = ["4xl", "5xl", "6xl", "7xl", "8xl"] as const;
export const BODY_SIZES = ["base", "lg", "xl", "2xl"] as const;
export const FONT_WEIGHTS = ["normal", "medium", "semibold", "bold"] as const;
export const ALIGNMENTS = ["left", "center", "right"] as const;
export const SCROLL_SPEEDS = ["slow", "normal", "fast"] as const;
export const MEDIA_POSITIONS = ["center", "top", "bottom", "left", "right"] as const;
export const MEDIA_SCALES = ["cover", "contain", "fill"] as const;
export const EASING_FUNCTIONS = ["linear", "ease", "ease-in", "ease-out", "ease-in-out", "power1", "power2", "power3", "power4", "back", "elastic", "bounce"] as const;

export const DEFAULT_DIRECTOR_CONFIG = {
  // ANIMATION & TIMING (8 controls)
  entryEffect: 'fade',
  entryDuration: 1.0,
  entryDelay: 0,
  entryEasing: 'ease-out',
  exitEffect: 'fade',
  exitDuration: 1.0,
  exitDelay: 0,
  exitEasing: 'ease-in',

  // VISUAL FOUNDATION (2 controls)
  backgroundColor: '#000000',
  textColor: '#ffffff',

  // SCROLL DEPTH & DURATION (3 controls)
  parallaxIntensity: 0,
  scrollSpeed: 'normal',
  animationDuration: 1.0,

  // TYPOGRAPHY (4 controls)
  headingSize: '4xl',
  bodySize: 'base',
  fontWeight: 'normal',
  alignment: 'center',

  // SCROLL INTERACTION (3 controls)
  fadeOnScroll: false,
  scaleOnScroll: false,
  blurOnScroll: false,

  // MULTI-ELEMENT TIMING (2 controls)
  staggerChildren: 0,
  layerDepth: 5,

  // ADVANCED MOTION (3 controls)
  transformOrigin: 'center center',
  overflowBehavior: 'hidden',
  backdropBlur: 'none',

  // VISUAL BLENDING (2 controls)
  mixBlendMode: 'normal',
  enablePerspective: false,

  // CUSTOM STYLING & TEXT (3 controls)
  customCSSClasses: '',
  textShadow: false,
  textGlow: false,

  // VERTICAL SPACING (2 controls)
  paddingTop: 'md',
  paddingBottom: 'md',

  // MEDIA PRESENTATION (3 controls - nullable)
  mediaPosition: 'center',
  mediaScale: 'cover',
  mediaOpacity: 1.0,

  // GRADIENT BACKGROUNDS (2 controls - nullable)
  gradientColors: undefined,
  gradientDirection: undefined,
} as const;

// Types
export type FormField = z.infer<typeof formFieldSchema>;
export type FormConfig = z.infer<typeof formConfigSchema>;
export type CalculatorInput = z.infer<typeof calculatorInputSchema>;
export type CalculatorConfig = z.infer<typeof calculatorConfigSchema>;
export type SeoMetadata = z.infer<typeof seoMetadataSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type HeroMediaConfig = {
  videoUrl?: string;
  posterUrl?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
};
export type SceneConfig = z.infer<typeof sceneConfigSchema>;
export type SceneConfigWithDirector = z.infer<typeof sceneConfigWithDirectorSchema>;
// ProjectScene with properly typed sceneConfig
export type ProjectScene = Omit<typeof projectScenes.$inferSelect, 'sceneConfig'> & {
  sceneConfig: SceneConfig;
};
export type InsertProjectScene = z.infer<typeof insertProjectSceneSchema>;
export type InsertProjectSceneWithDirector = z.infer<typeof insertProjectSceneSchemaWithDirector>;
export type DirectorConfig = z.infer<typeof directorConfigSchema>;
export type PromptTemplate = typeof promptTemplates.$inferSelect;
export type InsertPromptTemplate = z.infer<typeof insertPromptTemplateSchema>;
export type UpdatePromptTemplate = z.infer<typeof updatePromptTemplateSchema>;

export type PortfolioVersion = typeof portfolioVersions.$inferSelect;
export type InsertPortfolioVersion = typeof portfolioVersions.$inferInsert;
export type ProjectSectionPlan = typeof projectSectionPlans.$inferSelect;
export type InsertProjectSectionPlan = typeof projectSectionPlans.$inferInsert;
export type PortfolioPipelineRun = typeof portfolioPipelineRuns.$inferSelect;
export type InsertPortfolioPipelineRun = typeof portfolioPipelineRuns.$inferInsert;

export const insertSceneTemplateSchema = createInsertSchema(sceneTemplates)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    usageCount: true,
    lastUsedAt: true,
  })
  .extend({
    name: z.string().min(3, "Template name must be at least 3 characters").max(255),
    description: z.string().max(1000).optional(),
    sceneConfig: sceneConfigSchema,
    tags: z.array(z.string()).max(10).optional(),
    category: z.enum(["hero", "testimonial", "gallery", "split", "text", "media", "other"]).optional(),
  });

export const updateSceneTemplateSchema = insertSceneTemplateSchema.partial();

export type InsertSceneTemplate = z.infer<typeof insertSceneTemplateSchema>;
export type SceneTemplate = typeof sceneTemplates.$inferSelect;
export type UpdateSceneTemplate = z.infer<typeof updateSceneTemplateSchema>;

// Portfolio Builder Content Catalog Schemas - Enhanced for Cinematic Mode
export const textAssetSchema = z.object({
  id: z.string(),
  type: z.enum(["headline", "paragraph", "subheading"]),
  content: z.string().min(1),
  metadata: z.object({
    sectionType: z.enum(["hero", "problem", "solution", "proof", "closing"]).optional(),
    emotionalTone: z.enum(["dramatic", "urgent", "authoritative", "inspirational", "contemplative"]).optional(),
  }).optional(),
});

export const imageAssetSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  alt: z.string().min(1),
  caption: z.string().optional(),
  metadata: z.object({
    visualStyle: z.enum(["hero-shot", "detail", "proof", "transition", "atmosphere"]).optional(),
    dominantColor: z.string().optional(), // Hex color for AI color matching
  }).optional(),
});

export const videoAssetSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  caption: z.string().optional(),
  metadata: z.object({
    duration: z.number().optional(), // seconds
    energyLevel: z.enum(["calm", "moderate", "energetic", "explosive"]).optional(),
  }).optional(),
});

export const quoteAssetSchema = z.object({
  id: z.string(),
  quote: z.string().min(1),
  author: z.string().min(1),
  role: z.string().optional(),
  metadata: z.object({
    emotionalWeight: z.enum(["light", "moderate", "powerful", "transformative"]).optional(),
  }).optional(),
});

// Section-level guidance for AI orchestration
export const contentSectionSchema = z.object({
  sectionId: z.string(),
  sectionType: z.enum(["hero", "problem", "solution", "proof", "testimonial", "closing"]),
  sectionPrompt: z.string().min(1), // Specific guidance for this section
  assetIds: z.array(z.string()), // Which assets belong to this section
  userStyling: z.object({
    preferredFontFamily: z.string().optional(),
    preferredAlignment: z.enum(["left", "center", "right"]).optional(),
    colorScheme: z.object({
      background: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      text: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    }).optional(),
    transitionStyle: z.enum(["smooth", "sharp", "cinematic", "energetic"]).optional(),
  }).optional(),
});

export const contentCatalogSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  clientName: z.string().optional(),
  categories: z.array(z.string()).optional(),
  challenge: z.string().optional(),
  solution: z.string().optional(),
  outcome: z.string().optional(),
  testimonial: z.object({
    text: z.string(),
    author: z.string(),
  }).optional(),
  directorNotes: z.string().optional(),
  globalPrompt: z.string().min(1), // Overall narrative vision
  sections: z.array(contentSectionSchema).min(1), // Section-by-section structure
  texts: z.array(textAssetSchema),
  images: z.array(imageAssetSchema),
  videos: z.array(videoAssetSchema),
  quotes: z.array(quoteAssetSchema),
}).refine(
  (data) => data.texts.length + data.images.length + data.videos.length + data.quotes.length > 0,
  { message: "Catalog must contain at least one asset (text, image, video, or quote)" }
);

export const portfolioGenerateRequestSchema = z.object({
  catalog: contentCatalogSchema,
  projectId: z.string().nullable(),
  // New project metadata (required if projectId is null)
  newProjectTitle: z.string().optional(),
  newProjectSlug: z.string().optional(),
  newProjectClient: z.string().optional(),
});

// Types
export type TextAsset = z.infer<typeof textAssetSchema>;
export type ImageAsset = z.infer<typeof imageAssetSchema>;
export type VideoAsset = z.infer<typeof videoAssetSchema>;
export type QuoteAsset = z.infer<typeof quoteAssetSchema>;
export type ContentCatalog = z.infer<typeof contentCatalogSchema>;
export type PortfolioGenerateRequest = z.infer<typeof portfolioGenerateRequestSchema>;
// API Keys table for rotation and usage tracking
export const apiKeys = pgTable("api_keys", {
  id: varchar("id", { length: 255 }).primaryKey().notNull().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  keyName: text("key_name").notNull(),
  keyHash: text("key_hash").notNull(), // bcrypt hash of the key
  keyPrefix: varchar("key_prefix", { length: 8 }).notNull(), // First 8 chars for identification
  scopes: json("scopes").$type<string[]>().notNull().default(sql`'[]'::json`),
  expiresAt: timestamp("expires_at"),
  lastUsedAt: timestamp("last_used_at"),
  usageCount: integer("usage_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by", { length: 255 }).references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  rotatedAt: timestamp("rotated_at"),
  rotatedFrom: varchar("rotated_from", { length: 255 }).references((): AnyPgColumn => apiKeys.id),
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
  usageCount: true,
  rotatedAt: true,
});

export const apiKeyUsageLogs = pgTable("api_key_usage_logs", {
  id: varchar("id", { length: 255 }).primaryKey().notNull().default(sql`gen_random_uuid()`),
  apiKeyId: varchar("api_key_id", { length: 255 }).notNull().references((): AnyPgColumn => apiKeys.id, { onDelete: 'cascade' }),
  endpoint: text("endpoint").notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  statusCode: integer("status_code"),
  responseTime: integer("response_time"), // milliseconds
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const securityEvents = pgTable("security_events", {
  id: varchar("id", { length: 255 }).primaryKey().notNull().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).references(() => tenants.id, { onDelete: 'cascade' }),
  eventType: varchar("event_type", { length: 50 }).notNull(), // 'failed_login', 'privilege_escalation', 'suspicious_activity', etc.
  severity: varchar("severity", { length: 20 }).notNull(), // 'low', 'medium', 'high', 'critical'
  userId: varchar("user_id", { length: 255 }).references(() => users.id),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  endpoint: text("endpoint"),
  method: varchar("method", { length: 10 }),
  details: json("details").$type<Record<string, any>>(),
  resolved: boolean("resolved").notNull().default(false),
  resolvedBy: varchar("resolved_by", { length: 255 }).references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSecurityEventSchema = createInsertSchema(securityEvents).omit({
  id: true,
  createdAt: true,
});

export const ipReputation = pgTable("ip_reputation", {
  ip: text("ip").primaryKey().notNull(),
  violations: integer("violations").notNull().default(0),
  lastViolation: timestamp("last_violation"),
  blockUntil: timestamp("block_until"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const loginAttemptTracker = pgTable("login_attempts", {
  identifier: text("identifier").primaryKey().notNull(),
  count: integer("count").notNull().default(0),
  lastAttempt: timestamp("last_attempt"),
  lockedUntil: timestamp("locked_until"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const aiPromptTemplates = pgTable("ai_prompt_templates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  promptKey: text("prompt_key").notNull().unique(), // e.g., "artistic_director", "technical_director"
  promptName: text("prompt_name").notNull(), // Display name
  promptDescription: text("prompt_description"), // What this prompt does
  systemPrompt: text("system_prompt").notNull(), // The actual prompt template
  isActive: boolean("is_active").default(true).notNull(),
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAiPromptTemplateSchema = createInsertSchema(aiPromptTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAiPromptTemplate = z.infer<typeof insertAiPromptTemplateSchema>;
export type AiPromptTemplate = typeof aiPromptTemplates.$inferSelect;

export const aiGenerationJobs = pgTable("ai_generation_jobs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  jobId: text("job_id").notNull(),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  jobType: text("job_type").notNull(),
  provider: text("provider").notNull(),
  modelName: text("model_name").notNull(),
  status: text("status").notNull().default("queued"),
  errorMessage: text("error_message"),
  resultSnippet: text("result_snippet"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  jobIdUnique: uniqueIndex("ai_gen_jobs_job_id_idx").on(table.jobId),
  tenantIdx: index("ai_gen_jobs_tenant_idx").on(table.tenantId),
}));

export type AiGenerationJob = typeof aiGenerationJobs.$inferSelect;
export type InsertAiGenerationJob = typeof aiGenerationJobs.$inferInsert;

export const replicateJobs = pgTable("replicate_jobs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  jobId: text("job_id").notNull(),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  userId: varchar("user_id").references(() => users.id),
  prompt: text("prompt").notNull(),
  aspectRatio: text("aspect_ratio").notNull(),
  stylize: integer("stylize").default(100).notNull(),
  count: integer("count").default(1).notNull(),
  status: text("status").notNull().default("queued"),
  replicatePredictionId: text("replicate_prediction_id"),
  outputUrls: jsonb("output_urls"),
  mediaLibraryAssetIds: jsonb("media_library_asset_ids"),
  errorMessage: text("error_message"),
  durationMs: integer("duration_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  jobIdUnique: uniqueIndex("replicate_jobs_job_id_idx").on(table.jobId),
  tenantIdx: index("replicate_jobs_tenant_idx").on(table.tenantId),
}));

export type ReplicateJob = typeof replicateJobs.$inferSelect;
export type InsertReplicateJob = typeof replicateJobs.$inferInsert;

// Portfolio-specific prompt overrides
export const portfolioPrompts = pgTable("portfolio_prompts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  promptType: text("prompt_type").notNull().$type<
    'artistic_director' |
    'technical_director' |
    'executive_producer' |
    'split_specialist' |
    'gallery_specialist' |
    'quote_specialist' |
    'fullscreen_specialist'
  >(),
  customPrompt: text("custom_prompt"),
  isActive: boolean("is_active").default(false).notNull(),
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: text("created_by").references(() => users.id),
  updatedBy: text("updated_by").references(() => users.id),
});

export const insertPortfolioPromptSchema = createInsertSchema(portfolioPrompts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePortfolioPromptSchema = insertPortfolioPromptSchema.partial();

export type InsertPortfolioPrompt = z.infer<typeof insertPortfolioPromptSchema>;
export type UpdatePortfolioPrompt = z.infer<typeof updatePortfolioPromptSchema>;
export type PortfolioPrompt = typeof portfolioPrompts.$inferSelect;

// Media Library table for Cloudinary integration
export const mediaLibrary = pgTable("media_library", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  cloudinaryPublicId: text("cloudinary_public_id").notNull(),
  cloudinaryUrl: text("cloudinary_url").notNull(),
  mediaType: text("media_type").notNull().$type<"image" | "video" | "raw">(),
  label: text("label"),
  tags: text("tags").array().default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMediaLibraryAssetSchema = createInsertSchema(mediaLibrary).omit({
  id: true,
  createdAt: true,
}).extend({
  projectId: z.preprocess(
    (val) => (!val || (typeof val === 'string' && val.trim() === '') ? null : val),
    z.string().nullable().optional()
  ),
});

export type MediaLibraryAsset = typeof mediaLibrary.$inferSelect;
export type InsertMediaLibraryAsset = z.infer<typeof insertMediaLibraryAssetSchema>;

// Case Study Schemas
export const caseStudyTextBlockSchema = z.object({
  type: z.literal("text"),
  id: z.string(),
  content: z.string(),
  format: z.enum(["markdown", "html"]).default("markdown"),
  layout: z.enum(["center", "left", "full"]).default("center"),
});

export const caseStudyCarouselBlockSchema = z.object({
  type: z.literal("carousel"),
  id: z.string(),
  items: z.array(z.object({
    mediaId: z.string().optional(),
    url: z.string().optional(),
    type: z.enum(["image", "video"]),
    caption: z.string().optional(),
    alt: z.string().optional(),
  })),
  aspectRatio: z.enum(["video", "square", "wide"]).default("video"),
});

export const caseStudyStatGridSchema = z.object({
  type: z.literal("stat-grid"),
  id: z.string(),
  stats: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })),
});

export const caseStudyBlockSchema = z.discriminatedUnion("type", [
  caseStudyTextBlockSchema,
  caseStudyCarouselBlockSchema,
  caseStudyStatGridSchema,
]);

export const caseStudySectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string().optional(),
  theme: z.object({
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    primaryColor: z.string().optional(),
  }).optional(),
  blocks: z.array(caseStudyBlockSchema),
});

export const caseStudyContentSchema = z.object({
  sections: z.array(caseStudySectionSchema).min(1, "At least one section is required"),
});

export type CaseStudyTextBlock = z.infer<typeof caseStudyTextBlockSchema>;
export type CaseStudyCarouselBlock = z.infer<typeof caseStudyCarouselBlockSchema>;
export type CaseStudyStatGrid = z.infer<typeof caseStudyStatGridSchema>;
export type CaseStudyBlock = z.infer<typeof caseStudyBlockSchema>;
export type CaseStudySection = z.infer<typeof caseStudySectionSchema>;
export type CaseStudyContent = z.infer<typeof caseStudyContentSchema>;

// Project Layer 2 Sections table for flexible expansion content
export const projectLayer2Sections = pgTable("project_layer2_sections", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 255 }).notNull().references(() => projects.id, { onDelete: "cascade" }),
  heading: text("heading").notNull(),
  body: text("body").notNull(),
  orderIndex: integer("order_index").notNull(),
  mediaType: text("media_type").notNull().default("none").$type<"none" | "image" | "video" | "image-carousel" | "video-carousel" | "mixed-carousel">(),
  mediaConfig: jsonb("media_config").$type<{
    mediaId?: string;
    url?: string;
    items?: Array<{
      mediaId?: string;
      url: string;
      type: "image" | "video";
      caption?: string;
    }>;
  }>().default(sql`'{}'::jsonb`),
  styleConfig: jsonb("style_config").$type<{
    backgroundColor?: string;
    textColor?: string;
    headingColor?: string;
    fontFamily?: string;
    headingSize?: "text-xl" | "text-2xl" | "text-3xl" | "text-4xl";
    bodySize?: "text-sm" | "text-base" | "text-lg";
    alignment?: "left" | "center" | "right";
    // Layout controls
    mediaSize?: "standard" | "immersive";
    mediaPosition?: "above" | "below" | "left" | "right";
    textWidth?: number; // 30-70 percentage
    spacing?: "tight" | "normal" | "loose";
  }>().default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  projectOrderIdx: uniqueIndex("project_layer2_sections_project_order_idx").on(table.projectId, table.orderIndex),
  projectIdIdx: index("project_layer2_sections_project_id_idx").on(table.projectId),
}));

export const projectLayer2SectionSchema = z.object({
  heading: z.string().min(1, "Heading is required").max(200, "Heading must be under 200 characters"),
  body: z.string().min(1, "Body text is required").max(2000, "Body must be under 2000 characters"),
  orderIndex: z.number().int().min(0).max(4),
  mediaType: z.enum(["none", "image", "video", "image-carousel", "video-carousel", "mixed-carousel"]),
  mediaConfig: z.object({
    mediaId: z.string().optional(),
    url: z.string().url().optional(),
    items: z.array(z.object({
      mediaId: z.string().optional(),
      url: z.string().url(),
      type: z.enum(["image", "video"]),
      caption: z.string().optional(),
    })).optional(),
  }).optional(),
  styleConfig: z.object({
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    headingColor: z.string().optional(),
    fontFamily: z.string().optional(),
    headingSize: z.enum(["text-xl", "text-2xl", "text-3xl", "text-4xl"]).optional(),
    bodySize: z.enum(["text-sm", "text-base", "text-lg"]).optional(),
    alignment: z.enum(["left", "center", "right"]).optional(),
    // Layout controls
    mediaSize: z.enum(["standard", "immersive"]).optional(),
    mediaPosition: z.enum(["above", "below", "left", "right"]).optional(),
    textWidth: z.number().min(30).max(70).optional(),
    spacing: z.enum(["tight", "normal", "loose"]).optional(),
  }).optional(),
});

export const insertProjectLayer2SectionSchema = createInsertSchema(projectLayer2Sections)
  .omit({ 
    id: true, 
    projectId: true, 
    createdAt: true, 
    updatedAt: true 
  })
  .extend({
    heading: z.string().min(1, "Heading is required").max(200, "Heading must be under 200 characters"),
    body: z.string().min(1, "Body text is required").max(2000, "Body must be under 2000 characters"),
    orderIndex: z.number().int().min(0).max(4),
    mediaType: z.enum(["none", "image", "video", "image-carousel", "video-carousel", "mixed-carousel"]).default("none"),
    mediaConfig: z.object({
      mediaId: z.string().optional(),
      url: z.string().url().optional(),
      items: z.array(z.object({
        mediaId: z.string().optional(),
        url: z.string().url(),
        type: z.enum(["image", "video"]),
        caption: z.string().optional(),
      })).optional(),
    }).optional(),
    styleConfig: z.object({
      backgroundColor: z.string().optional(),
      textColor: z.string().optional(),
      headingColor: z.string().optional(),
      fontFamily: z.string().optional(),
      headingSize: z.enum(["text-xl", "text-2xl", "text-3xl", "text-4xl"]).optional(),
      bodySize: z.enum(["text-sm", "text-base", "text-lg"]).optional(),
      alignment: z.enum(["left", "center", "right"]).optional(),
      // Layout controls
      mediaSize: z.enum(["standard", "immersive"]).optional(),
      mediaPosition: z.enum(["above", "below", "left", "right"]).optional(),
      textWidth: z.number().min(30).max(70).optional(),
      spacing: z.enum(["tight", "normal", "loose"]).optional(),
    }).optional(),
  });

export type ProjectLayer2Section = typeof projectLayer2Sections.$inferSelect;
export type InsertProjectLayer2Section = z.infer<typeof insertProjectLayer2SectionSchema>;
