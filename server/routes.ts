import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
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
  type InsertAssessmentResponse
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { getBlueprintEmailHtml, getBlueprintEmailSubject } from "./email-templates";

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

      const { username, password } = result.data;

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        username,
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
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const { username, password } = result.data;

      // Get user
      const user = await storage.getUserByUsername(username);
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
      const posts = await storage.getAllBlogPosts(true);
      return res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
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
      const posts = await storage.getAllVideoPosts(true);
      return res.json(posts);
    } catch (error) {
      console.error("Error fetching video posts:", error);
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

  const httpServer = createServer(app);

  return httpServer;
}
