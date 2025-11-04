import { 
  type User, type InsertUser, 
  type EmailCapture, type InsertEmailCapture,
  type BlogPost, type InsertBlogPost,
  type VideoPost, type InsertVideoPost,
  type WidgetConfig, type InsertWidgetConfig,
  type Testimonial, type InsertTestimonial,
  type JobPosting, type InsertJobPosting,
  type JobApplication, type InsertJobApplication,
  type LeadCapture, type InsertLeadCapture,
  type BlueprintCapture, type InsertBlueprintCapture,
  type AssessmentResponse, type InsertAssessmentResponse,
  type NewsletterSignup, type InsertNewsletterSignup,
  type PasswordResetToken, type InsertPasswordResetToken,
  users, emailCaptures, blogPosts, videoPosts, widgetConfig, testimonials, jobPostings, jobApplications, leadCaptures, blueprintCaptures, assessmentResponses, newsletterSignups, passwordResetTokens
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, ilike, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(userId: string, password: string): Promise<User>;
  hasAnyUsers(): Promise<boolean>;
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenAsUsed(token: string): Promise<void>;
  createEmailCapture(emailCapture: InsertEmailCapture): Promise<EmailCapture>;
  getAllEmailCaptures(): Promise<EmailCapture[]>;
  
  getAllBlogPosts(publishedOnly?: boolean): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getBlogPostById(id: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: string): Promise<void>;
  
  getAllVideoPosts(publishedOnly?: boolean): Promise<VideoPost[]>;
  getVideoPostBySlug(slug: string): Promise<VideoPost | undefined>;
  getVideoPostById(id: string): Promise<VideoPost | undefined>;
  createVideoPost(post: InsertVideoPost): Promise<VideoPost>;
  updateVideoPost(id: string, post: Partial<InsertVideoPost>): Promise<VideoPost>;
  deleteVideoPost(id: string): Promise<void>;
  
  getActiveWidgetConfig(): Promise<WidgetConfig | undefined>;
  createOrUpdateWidgetConfig(config: InsertWidgetConfig): Promise<WidgetConfig>;
  
  getAllTestimonials(featuredOnly?: boolean): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  
  getAllJobPostings(activeOnly?: boolean): Promise<JobPosting[]>;
  getJobPosting(id: string): Promise<JobPosting | undefined>;
  createJobPosting(job: InsertJobPosting): Promise<JobPosting>;
  
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  
  createLeadCapture(leadCapture: InsertLeadCapture): Promise<LeadCapture>;
  getAllLeadCaptures(): Promise<LeadCapture[]>;
  
  createBlueprintCapture(capture: InsertBlueprintCapture): Promise<BlueprintCapture>;
  getAllBlueprintCaptures(): Promise<BlueprintCapture[]>;
  
  getAssessmentBySessionId(sessionId: string): Promise<AssessmentResponse | undefined>;
  createAssessment(assessment: InsertAssessmentResponse): Promise<AssessmentResponse>;
  updateAssessment(sessionId: string, data: Partial<InsertAssessmentResponse>): Promise<AssessmentResponse>;
  getAllAssessments(filters?: { bucket?: string; startDate?: Date; endDate?: Date; search?: string }): Promise<AssessmentResponse[]>;
  
  createNewsletterSignup(signup: InsertNewsletterSignup): Promise<NewsletterSignup>;
  getAllNewsletterSignups(): Promise<NewsletterSignup[]>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(sql`LOWER(${users.email}) = LOWER(${email})`);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserPassword(userId: string, password: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ password })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async hasAnyUsers(): Promise<boolean> {
    const result = await db.select().from(users).limit(1);
    return result.length > 0;
  }

  async createPasswordResetToken(insertToken: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [token] = await db.insert(passwordResetTokens).values(insertToken).returning();
    return token;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return resetToken;
  }

  async markPasswordResetTokenAsUsed(token: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.token, token));
  }

  async createEmailCapture(insertEmailCapture: InsertEmailCapture): Promise<EmailCapture> {
    const [emailCapture] = await db.insert(emailCaptures).values(insertEmailCapture).returning();
    return emailCapture;
  }

  async getAllEmailCaptures(): Promise<EmailCapture[]> {
    return await db.select().from(emailCaptures).orderBy(desc(emailCaptures.createdAt));
  }

  async getAllBlogPosts(publishedOnly = true): Promise<BlogPost[]> {
    if (publishedOnly) {
      return await db.select().from(blogPosts)
        .where(eq(blogPosts.published, true))
        .orderBy(desc(blogPosts.publishedAt));
    }
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt));
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async getBlogPostById(id: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db.insert(blogPosts).values(insertPost).returning();
    return post;
  }

  async updateBlogPost(id: string, updatePost: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [post] = await db
      .update(blogPosts)
      .set({ ...updatePost, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return post;
  }

  async deleteBlogPost(id: string): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  async getAllVideoPosts(publishedOnly = true): Promise<VideoPost[]> {
    if (publishedOnly) {
      return await db.select().from(videoPosts)
        .where(eq(videoPosts.published, true))
        .orderBy(desc(videoPosts.publishedAt));
    }
    return await db.select().from(videoPosts).orderBy(desc(videoPosts.publishedAt));
  }

  async getVideoPostBySlug(slug: string): Promise<VideoPost | undefined> {
    const [post] = await db.select().from(videoPosts).where(eq(videoPosts.slug, slug));
    return post;
  }

  async getVideoPostById(id: string): Promise<VideoPost | undefined> {
    const [post] = await db.select().from(videoPosts).where(eq(videoPosts.id, id));
    return post;
  }

  async createVideoPost(insertPost: InsertVideoPost): Promise<VideoPost> {
    const [post] = await db.insert(videoPosts).values(insertPost).returning();
    return post;
  }

  async updateVideoPost(id: string, updatePost: Partial<InsertVideoPost>): Promise<VideoPost> {
    const [post] = await db
      .update(videoPosts)
      .set({ ...updatePost, updatedAt: new Date() })
      .where(eq(videoPosts.id, id))
      .returning();
    return post;
  }

  async deleteVideoPost(id: string): Promise<void> {
    await db.delete(videoPosts).where(eq(videoPosts.id, id));
  }

  async getActiveWidgetConfig(): Promise<WidgetConfig | undefined> {
    const [config] = await db.select().from(widgetConfig)
      .where(eq(widgetConfig.enabled, true))
      .orderBy(desc(widgetConfig.updatedAt))
      .limit(1);
    return config;
  }

  async createOrUpdateWidgetConfig(insertConfig: InsertWidgetConfig): Promise<WidgetConfig> {
    const existing = await db.select().from(widgetConfig).limit(1);
    
    if (existing.length > 0) {
      const [config] = await db
        .update(widgetConfig)
        .set({ ...insertConfig, updatedAt: new Date() })
        .where(eq(widgetConfig.id, existing[0].id))
        .returning();
      return config;
    } else {
      const [config] = await db.insert(widgetConfig).values(insertConfig).returning();
      return config;
    }
  }

  async getAllTestimonials(featuredOnly = false): Promise<Testimonial[]> {
    if (featuredOnly) {
      return await db.select().from(testimonials)
        .where(eq(testimonials.featured, true))
        .orderBy(desc(testimonials.createdAt));
    }
    return await db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const [testimonial] = await db.insert(testimonials).values(insertTestimonial).returning();
    return testimonial;
  }

  async getAllJobPostings(activeOnly = true): Promise<JobPosting[]> {
    if (activeOnly) {
      return await db.select().from(jobPostings)
        .where(eq(jobPostings.active, true))
        .orderBy(desc(jobPostings.createdAt));
    }
    return await db.select().from(jobPostings).orderBy(desc(jobPostings.createdAt));
  }

  async getJobPosting(id: string): Promise<JobPosting | undefined> {
    const [job] = await db.select().from(jobPostings).where(eq(jobPostings.id, id));
    return job;
  }

  async createJobPosting(insertJob: InsertJobPosting): Promise<JobPosting> {
    const [job] = await db.insert(jobPostings).values(insertJob).returning();
    return job;
  }

  async createJobApplication(insertApplication: InsertJobApplication): Promise<JobApplication> {
    const [application] = await db.insert(jobApplications).values(insertApplication).returning();
    return application;
  }

  async createLeadCapture(insertLeadCapture: InsertLeadCapture): Promise<LeadCapture> {
    const [leadCapture] = await db.insert(leadCaptures).values(insertLeadCapture).returning();
    return leadCapture;
  }

  async getAllLeadCaptures(): Promise<LeadCapture[]> {
    return await db.select().from(leadCaptures).orderBy(desc(leadCaptures.downloadedAt));
  }

  async createBlueprintCapture(insertCapture: InsertBlueprintCapture): Promise<BlueprintCapture> {
    const [capture] = await db.insert(blueprintCaptures).values(insertCapture).returning();
    return capture;
  }

  async getAllBlueprintCaptures(): Promise<BlueprintCapture[]> {
    return await db.select().from(blueprintCaptures).orderBy(desc(blueprintCaptures.createdAt));
  }

  async getAssessmentBySessionId(sessionId: string): Promise<AssessmentResponse | undefined> {
    const [assessment] = await db.select().from(assessmentResponses).where(eq(assessmentResponses.sessionId, sessionId));
    return assessment;
  }

  async createAssessment(insertAssessment: InsertAssessmentResponse): Promise<AssessmentResponse> {
    const [assessment] = await db.insert(assessmentResponses).values(insertAssessment).returning();
    return assessment;
  }

  async updateAssessment(sessionId: string, data: Partial<InsertAssessmentResponse>): Promise<AssessmentResponse> {
    const [assessment] = await db
      .update(assessmentResponses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(assessmentResponses.sessionId, sessionId))
      .returning();
    return assessment;
  }

  async getAllAssessments(filters?: { bucket?: string; startDate?: Date; endDate?: Date; search?: string }): Promise<AssessmentResponse[]> {
    let query = db.select().from(assessmentResponses);

    const conditions = [];
    
    if (filters?.bucket) {
      conditions.push(eq(assessmentResponses.bucket, filters.bucket));
    }
    
    if (filters?.startDate) {
      conditions.push(eq(assessmentResponses.createdAt, filters.startDate));
    }
    
    if (filters?.endDate) {
      conditions.push(eq(assessmentResponses.createdAt, filters.endDate));
    }
    
    if (filters?.search) {
      conditions.push(like(assessmentResponses.q20, `%${filters.search}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(assessmentResponses.createdAt));
  }

  async createNewsletterSignup(insertSignup: InsertNewsletterSignup): Promise<NewsletterSignup> {
    const [signup] = await db.insert(newsletterSignups).values(insertSignup).returning();
    return signup;
  }

  async getAllNewsletterSignups(): Promise<NewsletterSignup[]> {
    return await db.select().from(newsletterSignups).orderBy(desc(newsletterSignups.createdAt));
  }
}

export const storage = new DbStorage();
