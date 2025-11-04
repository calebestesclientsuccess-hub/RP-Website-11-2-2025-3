import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
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
  widgetType: text("widget_type").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  position: text("position").default("bottom-right").notNull(),
  settings: text("settings"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  publishedAt: true,
  updatedAt: true,
});

export const insertVideoPostSchema = createInsertSchema(videoPosts).omit({
  id: true,
  publishedAt: true,
  updatedAt: true,
});

export const insertWidgetConfigSchema = createInsertSchema(widgetConfig).omit({
  id: true,
  updatedAt: true,
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
});

export const insertJobPostingSchema = createInsertSchema(jobPostings).omit({
  id: true,
  createdAt: true,
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  createdAt: true,
});

export const insertLeadCaptureSchema = createInsertSchema(leadCaptures)
  .omit({
    id: true,
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
