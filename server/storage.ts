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
  type AssessmentConfig, type InsertAssessmentConfig,
  type AssessmentQuestion, type InsertAssessmentQuestion,
  type AssessmentAnswer, type InsertAssessmentAnswer,
  type AssessmentResultBucket, type InsertAssessmentResultBucket,
  users, emailCaptures, blogPosts, videoPosts, widgetConfig, testimonials, jobPostings, jobApplications, leadCaptures, blueprintCaptures, assessmentResponses, newsletterSignups, passwordResetTokens,
  assessmentConfigs, assessmentQuestions, assessmentAnswers, assessmentResultBuckets, tenants
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
  
  getAllBlogPosts(tenantId: string, publishedOnly?: boolean): Promise<BlogPost[]>;
  getBlogPostBySlug(tenantId: string, slug: string): Promise<BlogPost | undefined>;
  getBlogPostById(tenantId: string, id: string): Promise<BlogPost | undefined>;
  createBlogPost(tenantId: string, post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(tenantId: string, id: string, post: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(tenantId: string, id: string): Promise<void>;
  
  getAllVideoPosts(tenantId: string, publishedOnly?: boolean): Promise<VideoPost[]>;
  getVideoPostBySlug(tenantId: string, slug: string): Promise<VideoPost | undefined>;
  getVideoPostById(tenantId: string, id: string): Promise<VideoPost | undefined>;
  createVideoPost(tenantId: string, post: InsertVideoPost): Promise<VideoPost>;
  updateVideoPost(tenantId: string, id: string, post: Partial<InsertVideoPost>): Promise<VideoPost>;
  deleteVideoPost(tenantId: string, id: string): Promise<void>;
  
  getActiveWidgetConfig(tenantId: string): Promise<WidgetConfig | undefined>;
  createOrUpdateWidgetConfig(tenantId: string, config: InsertWidgetConfig): Promise<WidgetConfig>;
  
  getAllTestimonials(tenantId: string, featuredOnly?: boolean): Promise<Testimonial[]>;
  createTestimonial(tenantId: string, testimonial: InsertTestimonial): Promise<Testimonial>;
  
  getAllJobPostings(tenantId: string, activeOnly?: boolean): Promise<JobPosting[]>;
  getJobPosting(tenantId: string, id: string): Promise<JobPosting | undefined>;
  createJobPosting(tenantId: string, job: InsertJobPosting): Promise<JobPosting>;
  
  createJobApplication(tenantId: string, application: InsertJobApplication): Promise<JobApplication>;
  
  createLeadCapture(tenantId: string, leadCapture: InsertLeadCapture): Promise<LeadCapture>;
  getAllLeadCaptures(tenantId: string): Promise<LeadCapture[]>;
  
  createBlueprintCapture(capture: InsertBlueprintCapture): Promise<BlueprintCapture>;
  getAllBlueprintCaptures(): Promise<BlueprintCapture[]>;
  
  getAssessmentBySessionId(tenantId: string, sessionId: string): Promise<AssessmentResponse | undefined>;
  createAssessment(tenantId: string, assessment: InsertAssessmentResponse): Promise<AssessmentResponse>;
  updateAssessment(tenantId: string, sessionId: string, data: Partial<InsertAssessmentResponse>): Promise<AssessmentResponse>;
  getAllAssessments(tenantId: string, filters?: { bucket?: string; startDate?: Date; endDate?: Date; search?: string }): Promise<AssessmentResponse[]>;
  
  createNewsletterSignup(signup: InsertNewsletterSignup): Promise<NewsletterSignup>;
  getAllNewsletterSignups(): Promise<NewsletterSignup[]>;
  
  getAllAssessmentConfigs(tenantId: string): Promise<AssessmentConfig[]>;
  getAssessmentConfigById(tenantId: string, id: string): Promise<AssessmentConfig | undefined>;
  getAssessmentConfigBySlug(tenantId: string, slug: string): Promise<AssessmentConfig | undefined>;
  createAssessmentConfig(tenantId: string, config: InsertAssessmentConfig): Promise<AssessmentConfig>;
  updateAssessmentConfig(tenantId: string, id: string, config: Partial<InsertAssessmentConfig>): Promise<AssessmentConfig>;
  deleteAssessmentConfig(tenantId: string, id: string): Promise<void>;
  
  getQuestionsByAssessmentId(assessmentId: string): Promise<AssessmentQuestion[]>;
  createAssessmentQuestion(question: InsertAssessmentQuestion): Promise<AssessmentQuestion>;
  updateAssessmentQuestion(id: string, question: Partial<InsertAssessmentQuestion>): Promise<AssessmentQuestion>;
  deleteAssessmentQuestion(id: string): Promise<void>;
  
  getAnswersByQuestionId(questionId: string): Promise<AssessmentAnswer[]>;
  getAnswersByAssessmentId(assessmentId: string): Promise<AssessmentAnswer[]>;
  createAssessmentAnswer(answer: InsertAssessmentAnswer): Promise<AssessmentAnswer>;
  updateAssessmentAnswer(id: string, answer: Partial<InsertAssessmentAnswer>): Promise<AssessmentAnswer>;
  deleteAssessmentAnswer(id: string): Promise<void>;
  
  getBucketsByAssessmentId(assessmentId: string): Promise<AssessmentResultBucket[]>;
  createAssessmentResultBucket(bucket: InsertAssessmentResultBucket): Promise<AssessmentResultBucket>;
  updateAssessmentResultBucket(id: string, bucket: Partial<InsertAssessmentResultBucket>): Promise<AssessmentResultBucket>;
  deleteAssessmentResultBucket(id: string): Promise<void>;
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

  async getAllBlogPosts(tenantId: string, publishedOnly = true): Promise<BlogPost[]> {
    if (publishedOnly) {
      return await db.select().from(blogPosts)
        .where(and(eq(blogPosts.tenantId, tenantId), eq(blogPosts.published, true)))
        .orderBy(desc(blogPosts.publishedAt));
    }
    return await db.select().from(blogPosts)
      .where(eq(blogPosts.tenantId, tenantId))
      .orderBy(desc(blogPosts.publishedAt));
  }

  async getBlogPostBySlug(tenantId: string, slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts)
      .where(and(eq(blogPosts.tenantId, tenantId), eq(blogPosts.slug, slug)));
    return post;
  }

  async getBlogPostById(tenantId: string, id: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts)
      .where(and(eq(blogPosts.tenantId, tenantId), eq(blogPosts.id, id)));
    return post;
  }

  async createBlogPost(tenantId: string, insertPost: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db.insert(blogPosts)
      .values({ tenantId, ...insertPost })
      .returning();
    return post;
  }

  async updateBlogPost(tenantId: string, id: string, updatePost: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [post] = await db
      .update(blogPosts)
      .set({ ...updatePost, updatedAt: new Date() })
      .where(and(eq(blogPosts.tenantId, tenantId), eq(blogPosts.id, id)))
      .returning();
    return post;
  }

  async deleteBlogPost(tenantId: string, id: string): Promise<void> {
    await db.delete(blogPosts)
      .where(and(eq(blogPosts.tenantId, tenantId), eq(blogPosts.id, id)));
  }

  async getAllVideoPosts(tenantId: string, publishedOnly = true): Promise<VideoPost[]> {
    if (publishedOnly) {
      return await db.select().from(videoPosts)
        .where(and(eq(videoPosts.tenantId, tenantId), eq(videoPosts.published, true)))
        .orderBy(desc(videoPosts.publishedAt));
    }
    return await db.select().from(videoPosts)
      .where(eq(videoPosts.tenantId, tenantId))
      .orderBy(desc(videoPosts.publishedAt));
  }

  async getVideoPostBySlug(tenantId: string, slug: string): Promise<VideoPost | undefined> {
    const [post] = await db.select().from(videoPosts)
      .where(and(eq(videoPosts.tenantId, tenantId), eq(videoPosts.slug, slug)));
    return post;
  }

  async getVideoPostById(tenantId: string, id: string): Promise<VideoPost | undefined> {
    const [post] = await db.select().from(videoPosts)
      .where(and(eq(videoPosts.tenantId, tenantId), eq(videoPosts.id, id)));
    return post;
  }

  async createVideoPost(tenantId: string, insertPost: InsertVideoPost): Promise<VideoPost> {
    const [post] = await db.insert(videoPosts)
      .values({ tenantId, ...insertPost })
      .returning();
    return post;
  }

  async updateVideoPost(tenantId: string, id: string, updatePost: Partial<InsertVideoPost>): Promise<VideoPost> {
    const [post] = await db
      .update(videoPosts)
      .set({ ...updatePost, updatedAt: new Date() })
      .where(and(eq(videoPosts.tenantId, tenantId), eq(videoPosts.id, id)))
      .returning();
    return post;
  }

  async deleteVideoPost(tenantId: string, id: string): Promise<void> {
    await db.delete(videoPosts)
      .where(and(eq(videoPosts.tenantId, tenantId), eq(videoPosts.id, id)));
  }

  async getActiveWidgetConfig(tenantId: string): Promise<WidgetConfig | undefined> {
    const [config] = await db.select().from(widgetConfig)
      .where(and(eq(widgetConfig.tenantId, tenantId), eq(widgetConfig.enabled, true)))
      .orderBy(desc(widgetConfig.updatedAt))
      .limit(1);
    return config;
  }

  async createOrUpdateWidgetConfig(tenantId: string, insertConfig: InsertWidgetConfig): Promise<WidgetConfig> {
    const existing = await db.select().from(widgetConfig)
      .where(eq(widgetConfig.tenantId, tenantId))
      .limit(1);
    
    if (existing.length > 0) {
      const [config] = await db
        .update(widgetConfig)
        .set({ ...insertConfig, updatedAt: new Date() })
        .where(and(eq(widgetConfig.tenantId, tenantId), eq(widgetConfig.id, existing[0].id)))
        .returning();
      return config;
    } else {
      const [config] = await db.insert(widgetConfig)
        .values({ tenantId, ...insertConfig })
        .returning();
      return config;
    }
  }

  async getAllTestimonials(tenantId: string, featuredOnly = false): Promise<Testimonial[]> {
    if (featuredOnly) {
      return await db.select().from(testimonials)
        .where(and(eq(testimonials.tenantId, tenantId), eq(testimonials.featured, true)))
        .orderBy(desc(testimonials.createdAt));
    }
    return await db.select().from(testimonials)
      .where(eq(testimonials.tenantId, tenantId))
      .orderBy(desc(testimonials.createdAt));
  }

  async createTestimonial(tenantId: string, insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const [testimonial] = await db.insert(testimonials)
      .values({ tenantId, ...insertTestimonial })
      .returning();
    return testimonial;
  }

  async getAllJobPostings(tenantId: string, activeOnly = true): Promise<JobPosting[]> {
    if (activeOnly) {
      return await db.select().from(jobPostings)
        .where(and(eq(jobPostings.tenantId, tenantId), eq(jobPostings.active, true)))
        .orderBy(desc(jobPostings.createdAt));
    }
    return await db.select().from(jobPostings)
      .where(eq(jobPostings.tenantId, tenantId))
      .orderBy(desc(jobPostings.createdAt));
  }

  async getJobPosting(tenantId: string, id: string): Promise<JobPosting | undefined> {
    const [job] = await db.select().from(jobPostings)
      .where(and(eq(jobPostings.tenantId, tenantId), eq(jobPostings.id, id)));
    return job;
  }

  async createJobPosting(tenantId: string, insertJob: InsertJobPosting): Promise<JobPosting> {
    const [job] = await db.insert(jobPostings)
      .values({ tenantId, ...insertJob })
      .returning();
    return job;
  }

  async createJobApplication(tenantId: string, insertApplication: InsertJobApplication): Promise<JobApplication> {
    const [application] = await db.insert(jobApplications)
      .values({ tenantId, ...insertApplication })
      .returning();
    return application;
  }

  async createLeadCapture(tenantId: string, insertLeadCapture: InsertLeadCapture): Promise<LeadCapture> {
    const [leadCapture] = await db.insert(leadCaptures)
      .values({ tenantId, ...insertLeadCapture })
      .returning();
    return leadCapture;
  }

  async getAllLeadCaptures(tenantId: string): Promise<LeadCapture[]> {
    return await db.select().from(leadCaptures)
      .where(eq(leadCaptures.tenantId, tenantId))
      .orderBy(desc(leadCaptures.downloadedAt));
  }

  async createBlueprintCapture(insertCapture: InsertBlueprintCapture): Promise<BlueprintCapture> {
    const [capture] = await db.insert(blueprintCaptures).values(insertCapture).returning();
    return capture;
  }

  async getAllBlueprintCaptures(): Promise<BlueprintCapture[]> {
    return await db.select().from(blueprintCaptures).orderBy(desc(blueprintCaptures.createdAt));
  }

  async getAssessmentBySessionId(tenantId: string, sessionId: string): Promise<AssessmentResponse | undefined> {
    const [assessment] = await db.select().from(assessmentResponses)
      .where(and(eq(assessmentResponses.tenantId, tenantId), eq(assessmentResponses.sessionId, sessionId)));
    return assessment;
  }

  async createAssessment(tenantId: string, insertAssessment: InsertAssessmentResponse): Promise<AssessmentResponse> {
    const [assessment] = await db.insert(assessmentResponses)
      .values({ tenantId, ...insertAssessment })
      .returning();
    return assessment;
  }

  async updateAssessment(tenantId: string, sessionId: string, data: Partial<InsertAssessmentResponse>): Promise<AssessmentResponse> {
    const [assessment] = await db
      .update(assessmentResponses)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(assessmentResponses.tenantId, tenantId), eq(assessmentResponses.sessionId, sessionId)))
      .returning();
    return assessment;
  }

  async getAllAssessments(tenantId: string, filters?: { bucket?: string; startDate?: Date; endDate?: Date; search?: string }): Promise<AssessmentResponse[]> {
    let query = db.select().from(assessmentResponses);

    const conditions = [eq(assessmentResponses.tenantId, tenantId)];
    
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

    query = query.where(and(...conditions)) as any;

    return await query.orderBy(desc(assessmentResponses.createdAt));
  }

  async createNewsletterSignup(insertSignup: InsertNewsletterSignup): Promise<NewsletterSignup> {
    const [signup] = await db.insert(newsletterSignups).values(insertSignup).returning();
    return signup;
  }

  async getAllNewsletterSignups(): Promise<NewsletterSignup[]> {
    return await db.select().from(newsletterSignups).orderBy(desc(newsletterSignups.createdAt));
  }

  async getAllAssessmentConfigs(tenantId: string): Promise<AssessmentConfig[]> {
    return await db.select().from(assessmentConfigs)
      .where(eq(assessmentConfigs.tenantId, tenantId))
      .orderBy(desc(assessmentConfigs.createdAt));
  }

  async getAssessmentConfigById(tenantId: string, id: string): Promise<AssessmentConfig | undefined> {
    const [config] = await db.select().from(assessmentConfigs)
      .where(and(eq(assessmentConfigs.tenantId, tenantId), eq(assessmentConfigs.id, id)));
    return config;
  }

  async getAssessmentConfigBySlug(tenantId: string, slug: string): Promise<AssessmentConfig | undefined> {
    const [config] = await db.select().from(assessmentConfigs)
      .where(and(eq(assessmentConfigs.tenantId, tenantId), eq(assessmentConfigs.slug, slug)));
    return config;
  }

  async createAssessmentConfig(tenantId: string, insertConfig: InsertAssessmentConfig): Promise<AssessmentConfig> {
    const [config] = await db.insert(assessmentConfigs)
      .values({ tenantId, ...insertConfig })
      .returning();
    return config;
  }

  async updateAssessmentConfig(tenantId: string, id: string, data: Partial<InsertAssessmentConfig>): Promise<AssessmentConfig> {
    const [config] = await db
      .update(assessmentConfigs)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(assessmentConfigs.tenantId, tenantId), eq(assessmentConfigs.id, id)))
      .returning();
    return config;
  }

  async deleteAssessmentConfig(tenantId: string, id: string): Promise<void> {
    await db.delete(assessmentConfigs)
      .where(and(eq(assessmentConfigs.tenantId, tenantId), eq(assessmentConfigs.id, id)));
  }

  async getQuestionsByAssessmentId(assessmentId: string): Promise<AssessmentQuestion[]> {
    return await db.select().from(assessmentQuestions).where(eq(assessmentQuestions.assessmentId, assessmentId)).orderBy(assessmentQuestions.order);
  }

  async createAssessmentQuestion(insertQuestion: InsertAssessmentQuestion): Promise<AssessmentQuestion> {
    const [question] = await db.insert(assessmentQuestions).values(insertQuestion).returning();
    return question;
  }

  async updateAssessmentQuestion(id: string, data: Partial<InsertAssessmentQuestion>): Promise<AssessmentQuestion> {
    const [question] = await db
      .update(assessmentQuestions)
      .set(data)
      .where(eq(assessmentQuestions.id, id))
      .returning();
    return question;
  }

  async deleteAssessmentQuestion(id: string): Promise<void> {
    await db.delete(assessmentQuestions).where(eq(assessmentQuestions.id, id));
  }

  async getAnswersByQuestionId(questionId: string): Promise<AssessmentAnswer[]> {
    return await db.select().from(assessmentAnswers).where(eq(assessmentAnswers.questionId, questionId)).orderBy(assessmentAnswers.order);
  }

  async getAnswersByAssessmentId(assessmentId: string): Promise<AssessmentAnswer[]> {
    const questions = await this.getQuestionsByAssessmentId(assessmentId);
    if (questions.length === 0) return [];
    
    const questionIds = questions.map(q => q.id);
    const answers = await db.select()
      .from(assessmentAnswers)
      .where(sql`${assessmentAnswers.questionId} IN (${sql.join(questionIds.map(id => sql`${id}`), sql`, `)})`)
      .orderBy(assessmentAnswers.order);
    return answers;
  }

  async createAssessmentAnswer(insertAnswer: InsertAssessmentAnswer): Promise<AssessmentAnswer> {
    const [answer] = await db.insert(assessmentAnswers).values(insertAnswer).returning();
    return answer;
  }

  async updateAssessmentAnswer(id: string, data: Partial<InsertAssessmentAnswer>): Promise<AssessmentAnswer> {
    const [answer] = await db
      .update(assessmentAnswers)
      .set(data)
      .where(eq(assessmentAnswers.id, id))
      .returning();
    return answer;
  }

  async deleteAssessmentAnswer(id: string): Promise<void> {
    await db.delete(assessmentAnswers).where(eq(assessmentAnswers.id, id));
  }

  async getBucketsByAssessmentId(assessmentId: string): Promise<AssessmentResultBucket[]> {
    return await db.select().from(assessmentResultBuckets).where(eq(assessmentResultBuckets.assessmentId, assessmentId)).orderBy(assessmentResultBuckets.order);
  }

  async createAssessmentResultBucket(insertBucket: InsertAssessmentResultBucket): Promise<AssessmentResultBucket> {
    const [bucket] = await db.insert(assessmentResultBuckets).values(insertBucket).returning();
    return bucket;
  }

  async updateAssessmentResultBucket(id: string, data: Partial<InsertAssessmentResultBucket>): Promise<AssessmentResultBucket> {
    const [bucket] = await db
      .update(assessmentResultBuckets)
      .set(data)
      .where(eq(assessmentResultBuckets.id, id))
      .returning();
    return bucket;
  }

  async deleteAssessmentResultBucket(id: string): Promise<void> {
    await db.delete(assessmentResultBuckets).where(eq(assessmentResultBuckets.id, id));
  }
}

export const storage = new DbStorage();
