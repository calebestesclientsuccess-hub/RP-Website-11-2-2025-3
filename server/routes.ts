import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { storage } from "./storage";
import { 
  insertEmailCaptureSchema, 
  insertBlogPostSchema,
  insertVideoPostSchema,
  insertWidgetConfigSchema,
  insertTestimonialSchema,
  insertJobPostingSchema,
  insertJobApplicationSchema,
  insertLeadCaptureSchema,
  insertBlueprintCaptureSchema,
  insertAssessmentResponseSchema,
  insertNewsletterSignupSchema,
  insertUserSchema,
  loginSchema,
  insertAssessmentConfigSchema,
  insertAssessmentQuestionSchema,
  insertAssessmentAnswerSchema,
  insertAssessmentResultBucketSchema,
  assessmentResultBuckets,
  type InsertAssessmentResponse
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";
import { getBlueprintEmailHtml, getBlueprintEmailSubject } from "./email-templates";
import { sendGmailEmail } from "./utils/gmail-client";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";

// Middleware to check if user is authenticated
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

/**
 * Calculate assessment bucket based on core philosophy answers
 * Bucket assignment is determined by Q1 (Own vs Rent), Q2 (Sale Type), 
 * Q3 (Critical Piece), and Q11 (Budget)
 * 
 * Priority order (highest to lowest):
 * 1. Person Trap (q3='a') - overrides all other combinations
 * 2. Hot MQL Architect - Own + Consultative + System + $8k+ budget
 * 3. Architecture Gap - Own + Consultative + System + <$8k budget  
 * 4. Agency - Rent + Transactional
 * 5. Freelancer - Own + Transactional
 * 6. Default: Architecture Gap (catch-all for nurture)
 */
function calculateBucket(data: Partial<InsertAssessmentResponse>): string {
  const { q1, q2, q3, q11 } = data;

  // Priority 1: Person Trap (selecting "The Person" as critical piece)
  // This overrides all other combinations
  if (q3 === 'a') {
    return 'person-trap';
  }

  // Priority 2: Hot MQL Architect 
  // Own + Consultative + System + High Budget = Ready for GTM Pod
  if (q1 === 'b' && q2 === 'b' && q3 === 'e' && q11 === 'ii') {
    return 'hot-mql-architect';
  }

  // Priority 3: Architecture Gap (specific)
  // Own + Consultative + System + Low Budget = Need to nurture
  if (q1 === 'b' && q2 === 'b' && q3 === 'e' && q11 === 'i') {
    return 'architecture-gap';
  }

  // Priority 4: Agency
  // Rent + Transactional = Black Box Trap
  if (q1 === 'a' && q2 === 'a') {
    return 'agency';
  }

  // Priority 5: Freelancer
  // Own + Transactional = Freelancer approach  
  if (q1 === 'b' && q2 === 'a') {
    return 'freelancer';
  }

  // Default: Architecture Gap (catch-all for any other combination)
  // This is the safest nurture-focused PDF for unclear profiles
  return 'architecture-gap';
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const { username, email, password } = result.data;

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
      });

      // Set session
      req.session.userId = user.id;

      return res.status(201).json({
        id: user.id,
        username: user.username,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const { username, password } = result.data;

      // Try to find user by username first, then by email (case-insensitive)
      let user = await storage.getUserByUsername(username);

      // If not found by username, try by email (case-insensitive)
      if (!user && username.includes('@')) {
        user = await storage.getUserByEmail(username.toLowerCase());
      }

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Set session
      req.session.userId = user.id;

      return res.json({
        id: user.id,
        username: user.username,
      });
    } catch (error) {
      console.error("Error logging in:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      return res.json({ success: true });
    });
  });

  app.get("/api/auth/session", async (req, res) => {
    if (!req.session.userId) {
      return res.json({ user: null });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.json({ user: null });
      }

      return res.json({
        user: {
          id: user.id,
          username: user.username,
        },
      });
    } catch (error) {
      console.error("Error fetching session:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/auth/has-users", async (req, res) => {
    try {
      const hasUsers = await storage.hasAnyUsers();
      return res.json({ hasUsers });
    } catch (error) {
      console.error("Error checking for users:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Password reset endpoints
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const emailSchema = z.object({
        email: z.string().email("Invalid email address"),
      });

      const result = emailSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const { email } = result.data;

      // Find user by email
      const user = await storage.getUserByEmail(email);

      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({
          success: true,
          message: "If an account exists with this email, a password reset link has been sent.",
        });
      }

      // Generate secure random token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Store token in database
      await storage.createPasswordResetToken({
        token,
        userId: user.id,
        expiresAt,
      });

      // Get the base URL from request
      const protocol = req.protocol;
      const host = req.get('host');
      const resetLink = `${protocol}://${host}/admin/reset-password/${token}`;

      // Send password reset email via Gmail
      try {
        await sendGmailEmail({
          to: email,
          subject: "Reset Your Admin Password",
          html: `
            <html>
              <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Password Reset Request</h2>
                <p>You requested to reset your admin password. Click the link below to reset your password:</p>
                <p style="margin: 30px 0;">
                  <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Reset Password
                  </a>
                </p>
                <p style="color: #6B7280; font-size: 14px;">
                  This link will expire in 1 hour.
                </p>
                <p style="color: #6B7280; font-size: 14px;">
                  If you didn't request this, you can safely ignore this email.
                </p>
                <p style="color: #6B7280; font-size: 14px;">
                  Or copy and paste this link: ${resetLink}
                </p>
              </body>
            </html>
          `,
        });
      } catch (emailError) {
        console.error("Error sending password reset email:", emailError);
        // Return success anyway to prevent information leakage
        return res.json({
          success: true,
          message: "If an account exists with this email, a password reset link has been sent.",
        });
      }

      return res.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent.",
      });
    } catch (error) {
      console.error("Error in forgot password:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/auth/verify-reset-token/:token", async (req, res) => {
    try {
      const { token } = req.params;

      const resetToken = await storage.getPasswordResetToken(token);

      if (!resetToken) {
        return res.status(400).json({ 
          valid: false, 
          error: "Invalid reset token" 
        });
      }

      if (resetToken.used) {
        return res.status(400).json({ 
          valid: false, 
          error: "This reset link has already been used" 
        });
      }

      if (new Date() > new Date(resetToken.expiresAt)) {
        return res.status(400).json({ 
          valid: false, 
          error: "This reset link has expired" 
        });
      }

      return res.json({ valid: true });
    } catch (error) {
      console.error("Error verifying reset token:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const resetPasswordSchema = z.object({
        token: z.string(),
        password: z.string().min(8, "Password must be at least 8 characters"),
      });

      const result = resetPasswordSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const { token, password } = result.data;

      // Verify token
      const resetToken = await storage.getPasswordResetToken(token);

      if (!resetToken) {
        return res.status(400).json({ error: "Invalid reset token" });
      }

      if (resetToken.used) {
        return res.status(400).json({ error: "This reset link has already been used" });
      }

      if (new Date() > new Date(resetToken.expiresAt)) {
        return res.status(400).json({ error: "This reset link has expired" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user password
      await storage.updateUserPassword(resetToken.userId, hashedPassword);

      // Mark token as used
      await storage.markPasswordResetTokenAsUsed(token);

      return res.json({
        success: true,
        message: "Password has been reset successfully",
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Email Capture endpoint for ROI Calculator
  app.post("/api/email-capture", async (req, res) => {
    try {
      // Validate request body
      const result = insertEmailCaptureSchema.safeParse(req.body);

      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      // Store email capture
      const emailCapture = await storage.createEmailCapture(result.data);

      // In a real application, this would trigger an email send
      // For now, we just return success
      return res.status(201).json({
        success: true,
        message: "Your results have been saved! Check your email for the detailed report.",
        id: emailCapture.id,
      });
    } catch (error) {
      console.error("Error creating email capture:", error);
      return res.status(500).json({
        error: "Internal server error",
        message: "Failed to save your results. Please try again.",
      });
    }
  });

  // Get all email captures (for admin/debugging purposes)
  app.get("/api/email-captures", async (req, res) => {
    try {
      const captures = await storage.getAllEmailCaptures();
      return res.json(captures);
    } catch (error) {
      console.error("Error fetching email captures:", error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  });

  // Blog posts endpoints
  app.get("/api/blog-posts", async (req, res) => {
    try {
      // Support ?publishedOnly=false query param for admin to see all posts (including drafts)
      const publishedOnly = req.query.publishedOnly !== 'false';
      const posts = await storage.getAllBlogPosts(publishedOnly);
      return res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get blog post by ID (route must come before :slug to avoid conflicts)
  app.get("/api/blog-posts/by-id/:id", async (req, res) => {
    try {
      const post = await storage.getBlogPostById(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      return res.json(post);
    } catch (error) {
      console.error("Error fetching blog post by ID:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/blog-posts/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      return res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/blog-posts", async (req, res) => {
    try {
      const result = insertBlogPostSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }
      const post = await storage.createBlogPost(result.data);
      return res.status(201).json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/blog-posts/:id", async (req, res) => {
    try {
      const result = insertBlogPostSchema.partial().safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }
      const post = await storage.updateBlogPost(req.params.id, result.data);
      return res.json(post);
    } catch (error) {
      console.error("Error updating blog post:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/blog-posts/:id", async (req, res) => {
    try {
      await storage.deleteBlogPost(req.params.id);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting blog post:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Video posts endpoints
  app.get("/api/video-posts", async (req, res) => {
    try {
      // Support ?publishedOnly=false query param for admin to see all posts (including drafts)
      const publishedOnly = req.query.publishedOnly !== 'false';
      const posts = await storage.getAllVideoPosts(publishedOnly);
      return res.json(posts);
    } catch (error) {
      console.error("Error fetching video posts:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get video post by ID (route must come before :slug to avoid conflicts)
  app.get("/api/video-posts/by-id/:id", async (req, res) => {
    try {
      const post = await storage.getVideoPostById(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Video post not found" });
      }
      return res.json(post);
    } catch (error) {
      console.error("Error fetching video post by ID:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/video-posts/:slug", async (req, res) => {
    try {
      const post = await storage.getVideoPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ error: "Video post not found" });
      }
      return res.json(post);
    } catch (error) {
      console.error("Error fetching video post:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/video-posts", async (req, res) => {
    try {
      const result = insertVideoPostSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }
      const post = await storage.createVideoPost(result.data);
      return res.status(201).json(post);
    } catch (error) {
      console.error("Error creating video post:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/video-posts/:id", async (req, res) => {
    try {
      const result = insertVideoPostSchema.partial().safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }
      const post = await storage.updateVideoPost(req.params.id, result.data);
      return res.json(post);
    } catch (error) {
      console.error("Error updating video post:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/video-posts/:id", async (req, res) => {
    try {
      const result = insertVideoPostSchema.partial().safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }
      const post = await storage.updateVideoPost(req.params.id, result.data);
      return res.json(post);
    } catch (error) {
      console.error("Error updating video post:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/video-posts/:id", async (req, res) => {
    try {
      await storage.deleteVideoPost(req.params.id);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting video post:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Widget configuration endpoints
  app.get("/api/widget-config", async (req, res) => {
    try {
      const config = await storage.getActiveWidgetConfig();
      return res.json(config);
    } catch (error) {
      console.error("Error fetching widget config:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/widget-config", async (req, res) => {
    try {
      const result = insertWidgetConfigSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }
      const config = await storage.createOrUpdateWidgetConfig(result.data);
      return res.json(config);
    } catch (error) {
      console.error("Error saving widget config:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Testimonials endpoints
  app.get("/api/testimonials", async (req, res) => {
    try {
      const featured = req.query.featured === 'true';
      const testimonials = await storage.getAllTestimonials(featured);
      return res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/testimonials", async (req, res) => {
    try {
      const result = insertTestimonialSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }
      const testimonial = await storage.createTestimonial(result.data);
      return res.status(201).json(testimonial);
    } catch (error) {
      console.error("Error creating testimonial:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Job postings endpoints
  app.get("/api/job-postings", async (req, res) => {
    try {
      const active = req.query.active !== 'false';
      const jobs = await storage.getAllJobPostings(active);
      return res.json(jobs);
    } catch (error) {
      console.error("Error fetching job postings:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/job-postings/:id", async (req, res) => {
    try {
      const job = await storage.getJobPosting(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job posting not found" });
      }
      return res.json(job);
    } catch (error) {
      console.error("Error fetching job posting:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/job-postings", async (req, res) => {
    try {
      const result = insertJobPostingSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }
      const job = await storage.createJobPosting(result.data);
      return res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job posting:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Job applications endpoint
  app.post("/api/job-applications", async (req, res) => {
    try {
      const result = insertJobApplicationSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }
      const application = await storage.createJobApplication(result.data);
      return res.status(201).json({
        success: true,
        message: "Application submitted successfully! We'll be in touch soon.",
        id: application.id,
      });
    } catch (error) {
      console.error("Error creating job application:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Lead magnet download endpoint
  app.post("/api/lead-magnets/download", async (req, res) => {
    try {
      const result = insertLeadCaptureSchema.safeParse(req.body);

      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const leadCapture = await storage.createLeadCapture(result.data);

      const downloadUrl = `/downloads/${result.data.resourceDownloaded}.pdf`;

      return res.status(201).json({
        success: true,
        downloadUrl,
        message: "Download ready! Check your email for the resource.",
        id: leadCapture.id,
        downloadedAt: leadCapture.downloadedAt,
      });
    } catch (error) {
      console.error("Error creating lead capture:", error);
      return res.status(500).json({
        error: "Internal server error",
        message: "Failed to process your request. Please try again.",
      });
    }
  });

  // Get all lead captures (for admin/analytics purposes)
  app.get("/api/lead-captures", async (req, res) => {
    try {
      const captures = await storage.getAllLeadCaptures();
      return res.json(captures);
    } catch (error) {
      console.error("Error fetching lead captures:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Blueprint capture endpoint for GTM Assessment
  app.post("/api/v1/capture-blueprint", async (req, res) => {
    try {
      const result = insertBlueprintCaptureSchema.safeParse(req.body);

      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const capture = await storage.createBlueprintCapture(result.data);

      // Generate email content
      const emailHtml = getBlueprintEmailHtml({
        email: result.data.email,
        path: result.data.path,
        q1: result.data.q1,
        q2: result.data.q2 || undefined,
      });
      const emailSubject = getBlueprintEmailSubject({
        email: result.data.email,
        path: result.data.path,
        q1: result.data.q1,
        q2: result.data.q2 || undefined,
      });

      // TODO: Send email via Resend when integration is set up
      // For now, we log the email content and return success
      console.log('Blueprint email generated:', {
        to: result.data.email,
        subject: emailSubject,
        captureId: capture.id,
      });

      return res.status(201).json({
        success: true,
        message: "Your assessment results have been saved! Check your email for the detailed report.",
        id: capture.id,
      });
    } catch (error) {
      console.error("Error creating blueprint capture:", error);
      return res.status(500).json({
        error: "Internal server error",
        message: "Failed to save your assessment results. Please try again.",
      });
    }
  });

  // Get all blueprint captures (for admin/analytics purposes)
  app.get("/api/v1/blueprint-captures", async (req, res) => {
    try {
      const captures = await storage.getAllBlueprintCaptures();
      return res.json(captures);
    } catch (error) {
      console.error("Error fetching blueprint captures:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Assessment endpoints
  app.post("/api/assessments/init", async (req, res) => {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }

      const existing = await storage.getAssessmentBySessionId(sessionId);

      if (existing) {
        return res.json(existing);
      }

      const assessment = await storage.createAssessment({
        sessionId,
        completed: false,
        usedCalculator: false,
      });

      return res.status(201).json(assessment);
    } catch (error) {
      console.error("Error initializing assessment:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/assessments/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const updates = req.body;

      const assessment = await storage.updateAssessment(sessionId, updates);

      return res.json(assessment);
    } catch (error) {
      console.error("Error updating assessment:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/assessments/:sessionId/submit", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const data = req.body;

      const bucket = calculateBucket(data);

      const assessment = await storage.updateAssessment(sessionId, {
        ...data,
        bucket,
        completed: true,
      });

      return res.json({
        success: true,
        bucket,
        assessment,
      });
    } catch (error) {
      console.error("Error submitting assessment:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/assessments", async (req, res) => {
    try {
      const { bucket, startDate, endDate, search } = req.query;

      const filters = {
        bucket: bucket as string | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        search: search as string | undefined,
      };

      const assessments = await storage.getAllAssessments(filters);

      return res.json(assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/newsletter-signups", async (req, res) => {
    try {
      const result = insertNewsletterSignupSchema.safeParse(req.body);

      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const signup = await storage.createNewsletterSignup(result.data);

      return res.status(201).json({
        success: true,
        id: signup.id,
      });
    } catch (error) {
      console.error("Error creating newsletter signup:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/newsletter-signups", async (req, res) => {
    try {
      const signups = await storage.getAllNewsletterSignups();
      return res.json(signups);
    } catch (error) {
      console.error("Error fetching newsletter signups:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Assessment Config Management API
  app.get("/api/assessment-configs", requireAuth, async (req, res) => {
    try {
      const configs = await storage.getAllAssessmentConfigs();
      return res.json(configs);
    } catch (error) {
      console.error("Error fetching assessment configs:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/assessment-configs/slug/:slug", async (req, res) => {
    try {
      const config = await storage.getAssessmentConfigBySlug(req.params.slug);
      if (!config) {
        return res.status(404).json({ error: "Assessment config not found" });
      }
      return res.json(config);
    } catch (error) {
      console.error("Error fetching assessment config by slug:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/assessment-configs/:id", requireAuth, async (req, res) => {
    try {
      const config = await storage.getAssessmentConfigById(req.params.id);
      if (!config) {
        return res.status(404).json({ error: "Assessment config not found" });
      }
      return res.json(config);
    } catch (error) {
      console.error("Error fetching assessment config:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/assessment-configs", requireAuth, async (req, res) => {
    try {
      const result = insertAssessmentConfigSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const config = await storage.createAssessmentConfig(result.data);
      return res.status(201).json(config);
    } catch (error) {
      console.error("Error creating assessment config:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/assessment-configs/:id", requireAuth, async (req, res) => {
    try {
      const result = insertAssessmentConfigSchema.partial().safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const config = await storage.updateAssessmentConfig(req.params.id, result.data);
      return res.json(config);
    } catch (error) {
      console.error("Error updating assessment config:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/assessment-configs/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteAssessmentConfig(req.params.id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting assessment config:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Assessment Questions API
  app.get("/api/assessment-configs/:assessmentId/questions", async (req, res) => {
    try {
      const questions = await storage.getQuestionsByAssessmentId(req.params.assessmentId);
      return res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/assessment-configs/:assessmentId/questions", requireAuth, async (req, res) => {
    try {
      const result = insertAssessmentQuestionSchema.safeParse({
        ...req.body,
        assessmentId: req.params.assessmentId,
      });
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const question = await storage.createAssessmentQuestion(result.data);
      return res.status(201).json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/assessment-questions/:id", requireAuth, async (req, res) => {
    try {
      const result = insertAssessmentQuestionSchema.partial().safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const question = await storage.updateAssessmentQuestion(req.params.id, result.data);
      return res.json(question);
    } catch (error) {
      console.error("Error updating question:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/assessment-questions/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteAssessmentQuestion(req.params.id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting question:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Assessment Answers API
  app.get("/api/assessment-configs/:assessmentId/answers", async (req, res) => {
    try {
      const answers = await storage.getAnswersByAssessmentId(req.params.assessmentId);
      return res.json(answers);
    } catch (error) {
      console.error("Error fetching answers:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/assessment-questions/:questionId/answers", requireAuth, async (req, res) => {
    try {
      const answers = await storage.getAnswersByQuestionId(req.params.questionId);
      return res.json(answers);
    } catch (error) {
      console.error("Error fetching answers:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/assessment-questions/:questionId/answers", requireAuth, async (req, res) => {
    try {
      const result = insertAssessmentAnswerSchema.safeParse({
        ...req.body,
        questionId: req.params.questionId,
      });
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const answer = await storage.createAssessmentAnswer(result.data);
      return res.status(201).json(answer);
    } catch (error) {
      console.error("Error creating answer:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/assessment-answers/:id", requireAuth, async (req, res) => {
    try {
      const result = insertAssessmentAnswerSchema.partial().safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const answer = await storage.updateAssessmentAnswer(req.params.id, result.data);
      return res.json(answer);
    } catch (error) {
      console.error("Error updating answer:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/assessment-answers/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteAssessmentAnswer(req.params.id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting answer:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Assessment Result Buckets API
  app.get("/api/assessment-configs/:assessmentId/buckets", requireAuth, async (req, res) => {
    try {
      const buckets = await storage.getBucketsByAssessmentId(req.params.assessmentId);
      return res.json(buckets);
    } catch (error) {
      console.error("Error fetching buckets:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/assessment-configs/:assessmentId/buckets", requireAuth, async (req, res) => {
    try {
      const result = insertAssessmentResultBucketSchema.safeParse({
        ...req.body,
        assessmentId: req.params.assessmentId,
      });
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const bucket = await storage.createAssessmentResultBucket(result.data);
      return res.status(201).json(bucket);
    } catch (error) {
      console.error("Error creating bucket:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/assessment-buckets/:id", requireAuth, async (req, res) => {
    try {
      const result = insertAssessmentResultBucketSchema.partial().safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const bucket = await storage.updateAssessmentResultBucket(req.params.id, result.data);
      return res.json(bucket);
    } catch (error) {
      console.error("Error updating bucket:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/assessment-buckets/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteAssessmentResultBucket(req.params.id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting bucket:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get result buckets for a specific assessment config
  app.get("/api/assessment-configs/:id/results", async (req, res) => {
    try {
      const results = await db.query.assessmentResultBuckets.findMany({
        where: eq(assessmentResultBuckets.assessmentId, req.params.id),
        orderBy: [asc(assessmentResultBuckets.order)]
      });
      res.json(results);
    } catch (error) {
      console.error('Error fetching result buckets:', error);
      res.status(500).json({ error: 'Failed to fetch result buckets' });
    }
  });

  // Create a new result bucket
  app.post("/api/assessment-configs/:id/results", async (req, res) => {
    try {
      const [result] = await db.insert(assessmentResultBuckets).values({
        assessmentId: req.params.id,
        ...req.body
      }).returning();
      res.json(result);
    } catch (error) {
      console.error('Error creating result bucket:', error);
      res.status(500).json({ error: 'Failed to create result bucket' });
    }
  });

  // Update a result bucket
  app.put("/api/assessment-configs/:configId/results/:id", async (req, res) => {
    try {
      const [result] = await db.update(assessmentResultBuckets)
        .set(req.body)
        .where(eq(assessmentResultBuckets.id, req.params.id))
        .returning();
      res.json(result);
    } catch (error) {
      console.error('Error updating result bucket:', error);
      res.status(500).json({ error: 'Failed to update result bucket' });
    }
  });

  // Delete a result bucket
  app.delete("/api/assessment-configs/:configId/results/:id", async (req, res) => {
    try {
      await db.delete(assessmentResultBuckets).where(eq(assessmentResultBuckets.id, req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting result bucket:', error);
      res.status(500).json({ error: 'Failed to delete result bucket' });
    }
  });

  // Public assessment config endpoint (for frontend widget)
  app.get("/api/public/assessments/:slug", async (req, res) => {
    try {
      const config = await storage.getAssessmentConfigBySlug(req.params.slug);
      if (!config || !config.published) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      const questions = await storage.getQuestionsByAssessmentId(config.id);
      const questionsWithAnswers = await Promise.all(
        questions.map(async (q) => ({
          ...q,
          answers: await storage.getAnswersByQuestionId(q.id),
        }))
      );

      const buckets = await storage.getBucketsByAssessmentId(config.id);

      return res.json({
        config,
        questions: questionsWithAnswers,
        buckets,
      });
    } catch (error) {
      console.error("Error fetching public assessment:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}