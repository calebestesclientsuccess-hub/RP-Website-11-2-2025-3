import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertEmailCaptureSchema, 
  insertBlogPostSchema,
  insertTestimonialSchema,
  insertJobPostingSchema,
  insertJobApplicationSchema,
  insertLeadCaptureSchema,
  insertBlueprintCaptureSchema,
  insertAssessmentResponseSchema,
  insertNewsletterSignupSchema,
  type InsertAssessmentResponse
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { getBlueprintEmailHtml, getBlueprintEmailSubject } from "./email-templates";

function calculateBucket(data: Partial<InsertAssessmentResponse>): string {
  const { q1, q2, q3, q11 } = data;
  
  if (q3 === 'a') {
    return 'person-trap';
  }
  
  if (q1 === 'b' && q2 === 'b' && q3 === 'e' && q11 === 'ii') {
    return 'hot-mql-architect';
  }
  
  if (q1 === 'b' && q2 === 'b' && q3 === 'e' && q11 === 'i') {
    return 'architecture-gap';
  }
  
  if (q1 === 'a' && q2 === 'a') {
    return 'agency';
  }
  
  if (q1 === 'b' && q2 === 'a') {
    return 'freelancer';
  }
  
  return 'architecture-gap';
}

export async function registerRoutes(app: Express): Promise<Server> {
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
