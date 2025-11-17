import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { DEFAULT_TENANT_ID } from "./middleware/tenant";
import cloudinary from "./cloudinary";
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
  insertConfigurableAssessmentResponseSchema,
  insertCampaignSchema,
  insertEventSchema,
  insertLeadSchema,
  insertProjectSchema,
  updateProjectSchema,
  insertProjectSceneSchema,
  updateProjectSceneSchema,
  insertPromptTemplateSchema,
  updatePromptTemplateSchema,
  portfolioGenerateRequestSchema,
  assessmentResultBuckets,
  type InsertAssessmentResponse,
  projects,
  projectScenes,
  aiPromptTemplates,
} from "@shared/schema";
import { eq, and, asc } from "drizzle-orm";
import { calculatePointsBasedBucket, calculateDecisionTreeBucket } from "./utils/assessment-scoring";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";
import { getBlueprintEmailHtml, getBlueprintEmailSubject } from "./email-templates";
import { sendGmailEmail } from "./utils/gmail-client";
import { sendLeadNotificationEmail } from "./utils/lead-notifications";
import { db } from "./db";
import { leadLimiter } from "./middleware/rate-limit";
import { sanitizeInput } from "./middleware/input-sanitization";
import { pdfUpload, imageUpload, validateUploadedFile } from "./middleware/file-validation";
import { validatePasswordStrength } from "./utils/password-validator";
import {
  checkAccountLockout,
  recordFailedAttempt,
  clearLoginAttempts,
  getRemainingAttempts
} from "./middleware/account-lockout";
import seoHealthRouter from "./routes/seo-health";
import sitemapRouter from './routes/sitemap';
import internalLinkingRouter from './routes/internal-linking';
import relatedContentRouter from './routes/related-content';
import analyticsRouter from './routes/analytics';


// Define default director configuration for new scenes
const DEFAULT_DIRECTOR_CONFIG = {
  timing: 5,
  effects: "fade",
  colors: { background: "#000000", text: "#FFFFFF" },
  transition: "fade",
};

// Configure multer for memory storage (files will be uploaded to Cloudinary)
const pdfUploadMulter = multer({ // Renamed to avoid conflict with imported pdfUpload
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const imageUploadMulter = multer({ // Renamed to avoid conflict with imported imageUpload
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Multer configuration for media library uploads
const mediaUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM) are allowed'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Middleware to check if user is authenticated
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

/**
 * Generate a unique slug from a title for assessment configs
 *
 * @param title - The title to convert into a slug
 * @param tenantId - The tenant ID to check uniqueness within
 * @param storage - Storage instance to check for existing slugs
 * @param excludeId - Optional ID to exclude from uniqueness check (for updates)
 * @returns A unique slug string
 */
async function generateSlug(
  title: string,
  tenantId: string,
  storage: any,
  excludeId?: string
): Promise<string> {
  // Convert title to lowercase and replace spaces/special chars with hyphens
  let baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens and spaces
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  // If the slug is empty after sanitization, use a default
  if (!baseSlug) {
    baseSlug = 'assessment';
  }

  let slug = baseSlug;
  let attempt = 0;
  const maxAttempts = 100;

  // Check for uniqueness and append random suffix if needed
  while (attempt < maxAttempts) {
    const existing = await storage.getAssessmentConfigBySlug(tenantId, slug);

    // If no existing config found, or if it's the same one we're updating, slug is unique
    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug;
    }

    // Generate random 6-character suffix
    const suffix = crypto.randomBytes(3).toString('hex');
    slug = `${baseSlug}-${suffix}`;
    attempt++;
  }

  // Fallback: use timestamp-based suffix if all random attempts failed
  const timestamp = Date.now().toString(36);
  return `${baseSlug}-${timestamp}`;
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

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          error: "Password does not meet security requirements",
          details: passwordValidation.errors,
          suggestions: passwordValidation.suggestions,
        });
      }

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

  app.post("/api/auth/login", checkAccountLockout, async (req, res) => {
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

      // Lazy-load security logger
      const { logFailedLogin } = await import('./utils/security-logger');

      // Try to find user by username first, then by email (case-insensitive)
      let user = await storage.getUserByUsername(username);

      // If not found by username, try by email (case-insensitive)
      if (!user && username.includes('@')) {
        user = await storage.getUserByEmail(username.toLowerCase());
      }

      if (!user) {
        recordFailedAttempt(req);
        await logFailedLogin(req, username, 'User not found');
        const remaining = getRemainingAttempts(req);
        return res.status(401).json({
          error: "Invalid credentials",
          remainingAttempts: remaining > 0 ? remaining : undefined,
        });
      }

      // Verify password
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        recordFailedAttempt(req);
        await logFailedLogin(req, username, 'Invalid password');
        const remaining = getRemainingAttempts(req);
        return res.status(401).json({
          error: "Invalid credentials",
          remainingAttempts: remaining > 0 ? remaining : undefined,
        });
      }

      // Clear failed attempts on successful login
      clearLoginAttempts(req);

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

  // Password strength check endpoint
  app.post('/api/auth/check-password-strength', (req, res) => {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const result = validatePasswordStrength(password);
    res.json(result);
  });

  // PDF Upload endpoint (Cloudinary)
  app.post("/api/upload/pdf", requireAuth, pdfUploadMulter.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No PDF file uploaded" });
      }

      // Validate file content
      const validation = await validateUploadedFile(req.file, 'application/pdf');
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      // Upload to Cloudinary using buffer
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw',
            folder: 'revenue-party/pdfs',
            public_id: `pdf-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`,
            format: 'pdf'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file!.buffer);
      });

      const pdfUrl = (uploadResult as any).secure_url;
      return res.json({ url: pdfUrl });
    } catch (error) {
      console.error("Error uploading PDF to Cloudinary:", error);
      return res.status(500).json({ error: "Failed to upload PDF" });
    }
  });

  // Image Upload endpoint (Cloudinary)
  app.post("/api/upload/image", requireAuth, imageUploadMulter.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file uploaded" });
      }

      // Validate file content
      const validation = await validateUploadedFile(req.file, req.file.mimetype);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      // Upload to Cloudinary using buffer with automatic optimization
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'revenue-party/images',
            public_id: `image-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`,
            transformation: [
              { quality: 'auto', fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file!.buffer);
      });

      const imageUrl = (uploadResult as any).secure_url;
      return res.json({ url: imageUrl });
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      return res.status(500).json({ error: "Failed to upload image" });
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

  // Share ROI Report endpoint
  app.post("/api/share-roi-report", async (req, res) => {
    try {
      const { emails, ltv, closeRate, engineName, monthlyInvestment, monthlySQOs,
              costPerMeeting, projectedDealsPerMonth, projectedLTVPerMonth, monthlyROI,
              annualSQOs, projectedLTVPerYear } = req.body;

      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({
          error: "At least one email address is required"
        });
      }

      // Validate email formats
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emails.filter((email: string) => !emailRegex.test(email));

      if (invalidEmails.length > 0) {
        return res.status(400).json({
          error: "Invalid email format",
          details: `Invalid emails: ${invalidEmails.join(', ')}`
        });
      }

      // Validate numeric fields
      if (typeof ltv !== 'number' || typeof closeRate !== 'number' ||
          typeof monthlyInvestment !== 'number' || typeof monthlySQOs !== 'number' ||
          typeof costPerMeeting !== 'number' || typeof projectedDealsPerMonth !== 'number' ||
          typeof projectedLTVPerMonth !== 'number' || typeof monthlyROI !== 'number') {
        return res.status(400).json({
          error: "Invalid data format - numeric fields required"
        });
      }

      // Format the email content
      const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      };

      const formatNumber = (value: number, decimals = 0) => {
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value);
      };

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .metric { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #ef4444; }
    .metric-label { font-size: 14px; color: #6b7280; margin-bottom: 5px; }
    .metric-value { font-size: 24px; font-weight: bold; color: #1f2937; }
    .highlight { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 25px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .highlight-value { font-size: 36px; font-weight: bold; margin: 10px 0; }
    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px; }
    .cta { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Your GTM Engine ROI Report</h1>
      <p style="margin: 10px 0 0 0;">Customized analysis from Revenue Party</p>
    </div>
    <div class="content">
      <p>Here's your personalized ROI analysis for a guaranteed sales engine:</p>

      <div class="metric">
        <div class="metric-label">Average LTV</div>
        <div class="metric-value">${formatCurrency(ltv)}</div>
      </div>

      <div class="metric">
        <div class="metric-label">Your Close Rate from Qualified Meetings</div>
        <div class="metric-value">${closeRate}%</div>
      </div>

      <div class="metric">
        <div class="metric-label">Selected Engine</div>
        <div class="metric-value">${engineName}</div>
      </div>

      <div class="metric">
        <div class="metric-label">Monthly Investment</div>
        <div class="metric-value">${formatCurrency(monthlyInvestment)}</div>
      </div>

      <div class="metric">
        <div class="metric-label">Guaranteed SQOs per Month</div>
        <div class="metric-value">${monthlySQOs} meetings</div>
      </div>

      <div class="metric">
        <div class="metric-label">Cost per Guaranteed Meeting</div>
        <div class="metric-value">${costPerMeeting > 0 ? formatCurrency(costPerMeeting) : 'N/A'}</div>
      </div>

      <div class="metric">
        <div class="metric-label">Projected New Deals per Month</div>
        <div class="metric-value">${formatNumber(projectedDealsPerMonth, 1)} deals</div>
      </div>

      <div class="metric">
        <div class="metric-label">New Revenue Booked Per Month</div>
        <div class="metric-value">${projectedLTVPerMonth > 0 ? formatCurrency(projectedLTVPerMonth) : '$0'}</div>
      </div>

      <div class="metric">
        <div class="metric-label">New Revenue Booked Per Year</div>
        <div class="metric-value">${projectedLTVPerYear > 0 ? formatCurrency(projectedLTVPerYear) : '$0'}</div>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">Based on ${annualSQOs} meetings/year*<br><em>*December excluded for training</em></p>
      </div>

      <div class="highlight">
        <div class="metric-label" style="color: rgba(255,255,255,0.9);">Your Monthly ROI</div>
        <div class="highlight-value">${monthlyROI > 0 ? `${formatNumber(monthlyROI, 1)}x` : '0x'}</div>
        <p style="margin: 10px 0 0 0; font-size: 14px;">Return on Investment Multiplier</p>
      </div>

      <div style="text-align: center;">
        <a href="https://revenueparty.com/roi-calculator" class="cta">View Full Calculator</a>
      </div>

      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
        <strong>What This Means:</strong> For every dollar invested in your GTM Engine, you're projected to generate ${monthlyROI > 0 ? `${formatNumber(monthlyROI, 1)}x` : '0x'} in client lifetime value. This assumes a ${closeRate}% close rate from qualified meetings and an average client LTV of ${formatCurrency(ltv)}.
      </p>
    </div>
    <div class="footer">
      <p>This report was generated by the Revenue Party ROI Calculator</p>
      <p>Ready to build your guaranteed revenue engine? <a href="https://revenueparty.com/assessment" style="color: #ef4444;">Take our assessment</a></p>
    </div>
  </div>
</body>
</html>
      `;

      // Send email to all recipients
      for (const email of emails) {
        try {
          await sendGmailEmail({
            to: email,
            subject: "Your GTM Engine ROI Report",
            html: htmlContent
          });
        } catch (emailError) {
          console.error(`Failed to send email to ${email}:`, emailError);
        }
      }

      return res.status(200).json({
        success: true,
        message: `Report sent to ${emails.length} recipient${emails.length > 1 ? 's' : ''}`
      });
    } catch (error) {
      console.error("Error sharing ROI report:", error);
      return res.status(500).json({
        error: "Failed to share report. Please try again."
      });
    }
  });

  // Lead capture endpoint for DynamicForm submissions
  app.post("/api/leads/capture", async (req, res) => {
    try {
      const result = insertLeadSchema.safeParse(req.body);

      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const lead = await storage.createLead(req.tenantId, {
        ...result.data,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      // Send notification email to all users (don't await - run in background)
      sendLeadNotificationEmail(lead).catch(err =>
        console.error("Failed to send lead notification:", err)
      );

      return res.status(201).json({
        success: true,
        message: "Thank you! We'll be in touch soon.",
        id: lead.id,
      });
    } catch (error) {
      console.error("Error creating lead:", error);
      return res.status(500).json({
        error: "Internal server error",
        message: "Failed to submit your information. Please try again.",
      });
    }
  });

  // Lead submission endpoints
  app.post("/api/leads/audit-request", leadLimiter, async (req, res) => {
    try {
      const auditSchema = z.object({
        fullName: z.string().min(2, "Full name is required"),
        workEmail: z.string().email("Please enter a valid work email"),
        companyName: z.string().min(2, "Company name is required"),
        website: z.string().url("Please enter a valid website URL").or(z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/, "Please enter a valid domain")),
        gtmChallenge: z.string().min(10, "Please describe your GTM challenge (at least 10 characters)")
      });

      const result = auditSchema.safeParse(req.body);

      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const { fullName, workEmail, companyName, website, gtmChallenge } = result.data;

      const lead = await storage.createLead(req.tenantId, {
        email: workEmail,
        name: fullName,
        company: companyName,
        source: "audit-request",
        pageUrl: req.headers.referer || "/audit",
        formData: JSON.stringify({ website, gtmChallenge }),
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      // Send notification email to all users (don't await - run in background)
      sendLeadNotificationEmail(lead).catch(err =>
        console.error("Failed to send lead notification:", err)
      );

      return res.status(201).json({
        success: true,
        message: "Audit request submitted successfully",
        id: lead.id,
      });
    } catch (error) {
      console.error("Error creating audit request:", error);
      return res.status(500).json({
        error: "Internal server error",
        message: "Failed to submit audit request. Please try again.",
      });
    }
  });

  // Export all leads (admin only)
  app.get("/api/leads/export", requireAuth, async (req, res) => {
    try {
      const filters: { source?: string; startDate?: Date; endDate?: Date } = {};

      if (req.query.source) {
        filters.source = req.query.source as string;
      }

      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }

      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }

      const leads = await storage.getAllLeads(req.tenantId, filters);

      return res.json({
        success: true,
        count: leads.length,
        leads: leads.map(lead => ({
          id: lead.id,
          email: lead.email,
          name: lead.name,
          company: lead.company,
          phone: lead.phone,
          source: lead.source,
          pageUrl: lead.pageUrl,
          formData: lead.formData ? JSON.parse(lead.formData) : null,
          createdAt: lead.createdAt,
        }))
      });
    } catch (error) {
      console.error("Error exporting leads:", error);
      return res.status(500).json({
        error: "Internal server error",
        message: "Failed to export leads.",
      });
    }
  });

  // Unified Content Library API - aggregates all content types
  app.get("/api/admin/content", requireAuth, async (req, res) => {
    try {
      const { type, status, search } = req.query;
      const tenantId = req.tenantId;

      // Fetch all content types in parallel
      const [blogs, videos, testimonials, portfolios, jobs] = await Promise.all([
        storage.getAllBlogPosts(tenantId, false), // Get all, filter later
        storage.getAllVideoPosts(tenantId, false),
        storage.getAllTestimonials(tenantId, false),
        storage.getAllProjects(tenantId),
        storage.getAllJobPostings(tenantId, false),
      ]);

      // Helper function to calculate status based on timestamps
      const calculateStatus = (published: boolean, scheduledFor: Date | null | undefined, publishedAt: Date | null | undefined): 'published' | 'draft' | 'scheduled' => {
        if (scheduledFor && new Date(scheduledFor) > new Date()) {
          return 'scheduled';
        }
        if (published && publishedAt) {
          return 'published';
        }
        return 'draft';
      };

      // Map each content type to unified ContentSummary format
      const content = [
        ...blogs.map(b => ({
          id: b.id,
          type: 'blog' as const,
          title: b.title,
          status: calculateStatus(b.published, b.scheduledFor, b.publishedAt),
          scheduledFor: b.scheduledFor || null,
          publishedAt: b.publishedAt || null,
          featured: false, // blogs don't have featured field
          thumbnailUrl: b.featuredImage || null,
          excerpt: b.excerpt || '',
          author: b.author || '',
        })),
        ...videos.map(v => ({
          id: v.id,
          type: 'video' as const,
          title: v.title,
          status: calculateStatus(v.published, v.scheduledFor, v.publishedAt),
          scheduledFor: v.scheduledFor || null,
          publishedAt: v.publishedAt || null,
          featured: false, // videos don't have featured field
          thumbnailUrl: v.thumbnailUrl || null,
          excerpt: v.description || '',
          author: v.author || '',
        })),
        ...testimonials.map(t => ({
          id: t.id,
          type: 'testimonial' as const,
          title: t.name,
          status: 'published' as const, // testimonials are always published
          scheduledFor: null,
          publishedAt: t.createdAt ? new Date(t.createdAt).toISOString() : null,
          featured: t.featured || false,
          thumbnailUrl: t.avatarUrl || null,
          excerpt: t.quote ? (t.quote.substring(0, 100) + (t.quote.length > 100 ? '...' : '')) : '',
          author: `${t.title || ''} at ${t.company || ''}`,
        })),
        ...portfolios.map(p => ({
          id: p.id,
          type: 'portfolio' as const,
          title: p.title || '',
          status: 'published' as const, // portfolios are always published
          scheduledFor: null,
          publishedAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
          featured: false,
          thumbnailUrl: p.thumbnailUrl || null,
          excerpt: p.clientName || '',
          author: p.clientName || '',
        })),
        ...jobs.map(j => ({
          id: j.id,
          type: 'job' as const,
          title: j.title || '',
          status: j.active ? 'published' as const : 'draft' as const,
          scheduledFor: null,
          publishedAt: j.createdAt ? new Date(j.createdAt).toISOString() : null,
          featured: false,
          thumbnailUrl: null,
          excerpt: `${j.department || ''} - ${j.location || ''}`,
          author: j.department || '',
        })),
      ];

      // Apply filters
      let filtered = content;

      if (type && type !== 'all') {
        filtered = filtered.filter(item => item.type === type);
      }

      if (status && status !== 'all') {
        if (status === 'scheduled') {
          filtered = filtered.filter(item =>
            item.scheduledFor && new Date(item.scheduledFor) > new Date()
          );
        } else {
          filtered = filtered.filter(item => item.status === status);
        }
      }

      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(item =>
          item.title.toLowerCase().includes(searchLower) ||
          (item.excerpt && item.excerpt.toLowerCase().includes(searchLower)) ||
          (item.author && item.author.toLowerCase().includes(searchLower))
        );
      }

      // Sort by publishedAt descending (most recent first), with fallback to createdAt for drafts
      filtered.sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : (a.scheduledFor ? new Date(a.scheduledFor).getTime() : 0);
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : (b.scheduledFor ? new Date(b.scheduledFor).getTime() : 0);
        return dateB - dateA;
      });

      return res.json(filtered);
    } catch (error) {
      console.error("Error fetching unified content:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Blog posts endpoints
  app.get("/api/blog-posts", async (req, res) => {
    try {
      // Support ?publishedOnly=false query param for admin to see all posts (including drafts)
      const publishedOnly = req.query.publishedOnly !== 'false';
      const posts = await storage.getAllBlogPosts(req.tenantId, publishedOnly);
      return res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get blog post by ID (route must come before :slug to avoid conflicts)
  app.get("/api/blog-posts/by-id/:id", async (req, res) => {
    try {
      const post = await storage.getBlogPostById(req.tenantId, req.params.id);
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
      const post = await storage.getBlogPostBySlug(req.tenantId, req.params.slug);
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      return res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/blog-posts", sanitizeInput(['content', 'excerpt']), async (req, res) => {
    try {
      const result = insertBlogPostSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }
      const post = await storage.createBlogPost(req.tenantId, result.data);
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
      const post = await storage.updateBlogPost(req.tenantId, req.params.id, result.data);
      return res.json(post);
    } catch (error) {
      console.error("Error updating blog post:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/blog-posts/:id", async (req, res) => {
    try {
      await storage.deleteBlogPost(req.tenantId, req.params.id);
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
      const posts = await storage.getAllVideoPosts(req.tenantId, publishedOnly);
      return res.json(posts);
    } catch (error) {
      console.error("Error fetching video posts:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get video post by ID (route must come before :slug to avoid conflicts)
  app.get("/api/video-posts/by-id/:id", async (req, res) => {
    try {
      const post = await storage.getVideoPostById(req.tenantId, req.params.id);
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
      const post = await storage.getVideoPostBySlug(req.tenantId, req.params.slug);
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
      const post = await storage.createVideoPost(req.tenantId, result.data);
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
      const post = await storage.updateVideoPost(req.tenantId, req.params.id, result.data);
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
      const post = await storage.updateVideoPost(req.tenantId, req.params.id, result.data);
      return res.json(post);
    } catch (error) {
      console.error("Error updating video post:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/video-posts/:id", async (req, res) => {
    try {
      await storage.deleteVideoPost(req.tenantId, req.params.id);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting video post:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Widget configuration endpoints
  app.get("/api/widget-config", async (req, res) => {
    try {
      const config = await storage.getActiveWidgetConfig(req.tenantId);
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
      const config = await storage.createOrUpdateWidgetConfig(req.tenantId, result.data);
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
      const testimonials = await storage.getAllTestimonials(req.tenantId, featured);
      return res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/testimonials", requireAuth, async (req, res) => {
    try {
      const result = insertTestimonialSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }
      const testimonial = await storage.createTestimonial(req.tenantId, result.data);
      return res.status(201).json(testimonial);
    } catch (error) {
      console.error("Error creating testimonial:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/testimonials/:id", async (req, res) => {
    try {
      const testimonial = await storage.getTestimonialById(req.tenantId, req.params.id);
      if (!testimonial) {
        return res.status(404).json({ error: "Testimonial not found" });
      }
      return res.json(testimonial);
    } catch (error) {
      console.error("Error fetching testimonial:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/testimonials/:id", requireAuth, async (req, res) => {
    try {
      const existing = await storage.getTestimonialById(req.tenantId, req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Testimonial not found" });
      }

      const result = insertTestimonialSchema.partial().safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      // Strip undefined keys while preserving null (allows clearing optional fields)
      const updateData = Object.fromEntries(
        Object.entries(result.data).filter(([_, value]) => value !== undefined)
      );

      const testimonial = await storage.updateTestimonial(req.tenantId, req.params.id, updateData);
      return res.json(testimonial);
    } catch (error) {
      console.error("Error updating testimonial:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/testimonials/:id", requireAuth, async (req, res) => {
    try {
      const existing = await storage.getTestimonialById(req.tenantId, req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Testimonial not found" });
      }

      await storage.deleteTestimonial(req.tenantId, req.params.id);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/testimonials/:id/featured", requireAuth, async (req, res) => {
    try {
      const existing = await storage.getTestimonialById(req.tenantId, req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Testimonial not found" });
      }

      const { featured } = req.body;
      if (typeof featured !== 'boolean') {
        return res.status(400).json({ error: "featured must be a boolean" });
      }
      const testimonial = await storage.updateTestimonialFeaturedStatus(req.tenantId, req.params.id, featured);
      return res.json(testimonial);
    } catch (error) {
      console.error("Error updating testimonial featured status:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Public collection endpoints
  app.get("/api/collections/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getAllTestimonials(DEFAULT_TENANT_ID, true);
      return res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials collection:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/collections/videos", async (req, res) => {
    try {
      const videos = await storage.getAllVideoPosts(DEFAULT_TENANT_ID, true);
      return res.json(videos);
    } catch (error) {
      console.error("Error fetching videos collection:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/collections/blogs", async (req, res) => {
    try {
      const blogs = await storage.getAllBlogPosts(DEFAULT_TENANT_ID, true);
      return res.json(blogs);
    } catch (error) {
      console.error("Error fetching blogs collection:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Job postings endpoints
  app.get("/api/job-postings", async (req, res) => {
    try {
      const active = req.query.active !== 'false';
      const jobs = await storage.getAllJobPostings(req.tenantId, active);
      return res.json(jobs);
    } catch (error) {
      console.error("Error fetching job postings:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/job-postings/:id", async (req, res) => {
    try {
      const job = await storage.getJobPosting(req.tenantId, req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job posting not found" });
      }
      return res.json(job);
    } catch (error) {
      console.error("Error fetching job posting:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/job-postings", requireAuth, async (req, res) => {
    try {
      const result = insertJobPostingSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }
      const job = await storage.createJobPosting(req.tenantId, result.data);
      return res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job posting:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/job-postings/:id", requireAuth, async (req, res) => {
    try {
      const existing = await storage.getJobPosting(req.tenantId, req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Job posting not found" });
      }

      const result = insertJobPostingSchema.partial().safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const job = await storage.updateJobPosting(req.tenantId, req.params.id, result.data);
      return res.json(job);
    } catch (error) {
      console.error("Error updating job posting:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/job-postings/:id", requireAuth, async (req, res) => {
    try {
      const existing = await storage.getJobPosting(req.tenantId, req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Job posting not found" });
      }

      await storage.deleteJobPosting(req.tenantId, req.params.id);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting job posting:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Branding Projects endpoints
  app.get("/api/projects", requireAuth, async (req, res) => {
    try {
      const projectsList = await storage.getAllProjects(req.tenantId);
      return res.json(projectsList);
    } catch (error) {
      console.error("Error fetching projects:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/projects/:projectId", requireAuth, async (req, res) => {
    try {
      const project = await storage.getProjectById(req.tenantId, req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      const scenes = await storage.getScenesByProjectId(req.tenantId, req.params.projectId);
      const assetMap = await storage.getAssetMap(req.params.projectId);
      return res.json({ ...project, scenes, assetMap });
    } catch (error) {
      console.error("Error fetching project:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/projects", requireAuth, async (req, res) => {
    try {
      const result = insertProjectSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }
      const project = await storage.createProject(req.tenantId, result.data);
      return res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const result = updateProjectSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      // Strip undefined keys while preserving null (allows clearing optional fields)
      const updateData = Object.fromEntries(
        Object.entries(result.data).filter(([_, value]) => value !== undefined)
      );

      const project = await storage.updateProject(req.tenantId, req.params.id, updateData);
      if (!project) {
        return res.status(404).json({ error: "Project not found or access denied" });
      }
      return res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteProject(req.tenantId, req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Project not found or access denied" });
      }
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting project:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Project Scenes endpoints
  app.get("/api/projects/:projectId/scenes", requireAuth, async (req, res) => {
    try {
      const scenes = await storage.getScenesByProjectId(req.tenantId, req.params.projectId);
      if (scenes === null) {
        return res.status(404).json({ error: "Project not found or access denied" });
      }
      return res.json(scenes);
    } catch (error) {
      console.error("Error fetching project scenes:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/projects/:projectId/scenes", requireAuth, async (req, res) => {
    try {
      const result = insertProjectSceneSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }
      const scene = await storage.createProjectScene(req.tenantId, req.params.projectId, result.data);
      return res.status(201).json(scene);
    } catch (error) {
      if (error instanceof Error && error.message === 'Project not found or access denied') {
        return res.status(404).json({ error: "Project not found" });
      }
      console.error("Error creating project scene:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/projects/:projectId/scenes/:id", requireAuth, async (req, res) => {
    try {
      const result = updateProjectSceneSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }
      const scene = await storage.updateProjectScene(req.tenantId, req.params.projectId, req.params.id, result.data);
      if (!scene) {
        return res.status(404).json({ error: "Scene not found or access denied" });
      }
      return res.json(scene);
    } catch (error) {
      console.error("Error updating project scene:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/projects/:projectId/scenes/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteProjectScene(req.tenantId, req.params.projectId, req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Scene not found or access denied" });
      }
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting project scene:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // AI Scene Generation endpoint (single scene, quick generation)
  app.post("/api/scenes/generate-with-ai", requireAuth, async (req, res) => {
    try {
      const requestSchema = z.object({
        prompt: z.string().min(1, "Prompt is required"),
        sceneType: z.string().optional(),
        systemInstructions: z.string().optional(),
      });

      const result = requestSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const { prompt, sceneType, systemInstructions } = result.data;

      // Lazy-load Gemini client to avoid startup errors if not configured
      const { generateSceneWithGemini } = await import("./utils/gemini-client");

      const sceneConfig = await generateSceneWithGemini(
        prompt,
        sceneType,
        systemInstructions
      );

      return res.json(sceneConfig);
    } catch (error) {
      console.error("Error generating scene with AI:", error);
      return res.status(500).json({
        error: "Failed to generate scene",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Conversational AI refinement endpoint
  app.post("/api/portfolio/refine-conversation", requireAuth, async (req, res) => {
    try {
      const { conversationHistory, currentScenes, userPrompt, projectContext } = req.body;

      if (!userPrompt || !userPrompt.trim()) {
        return res.status(400).json({ error: "User prompt is required" });
      }

      if (!currentScenes) {
        return res.status(400).json({ error: "Current scenes context is required" });
      }

      // Parse current scenes
      const parsedScenes = typeof currentScenes === 'string' ? JSON.parse(currentScenes) : currentScenes;

      // Lazy-load Gemini client
      const { GoogleGenAI, Type } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "",
        httpOptions: {
          apiVersion: "",
          baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "",
        },
      });

      // Build conversation context for Gemini
      const systemPrompt = `You are a cinematic director helping refine a scrollytelling portfolio.

CURRENT PROJECT:
Title: ${projectContext?.title || "Portfolio"}
Client: ${projectContext?.client || "N/A"}

CURRENT SCENES (JSON):
${JSON.stringify(parsedScenes, null, 2)}

USER'S REFINEMENT REQUEST:
"${userPrompt}"

SECTION REFERENCE SUPPORT:
- If user mentions "Scene 1", "Scene 2", etc., focus on that specific scene
- If user says "all scenes", apply changes globally
- If user says "make it more dramatic", increase entryDuration, use power3 easing, add parallax
- If user says "faster", reduce durations and use quicker effects

RESPONSE FORMAT:
1. Explain what changes you're making and why (in plain English)
2. Return the complete refined scenes JSON with your improvements

Your explanation should be conversational and reference specific scene numbers.`;

      const conversationMessages = [
        { role: "user", parts: [{ text: systemPrompt }] },
        ...(conversationHistory || []).map((msg: any) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        })),
        { role: "user", parts: [{ text: `Now refine based on: "${userPrompt}"` }] }
      ];

      const geminiResponse = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: conversationMessages,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              explanation: {
                type: Type.STRING,
                description: "Plain English explanation of changes made"
              },
              scenes: {
                type: Type.ARRAY,
                description: "Complete refined scenes array with ALL original structure preserved",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    content: { type: Type.OBJECT },
                    director: { type: Type.OBJECT },
                    layout: { type: Type.STRING }
                  },
                  required: ["type", "content", "director"]
                }
              }
            },
            required: ["explanation", "scenes"]
          }
        }
      });

      const result = JSON.parse(geminiResponse.text || '{}');
      enhancedScenes = result.scenes || [];
      aiExplanation = result.explanation || "Scenes refined successfully";

      console.log(`[Portfolio Enhanced] Gemini refined ${enhancedScenes.length} scenes`);

      // CRITICAL VALIDATION: Check if scenes are actually populated
      if (enhancedScenes.length > 0) {
        const firstScene = enhancedScenes[0];
        if (!firstScene.type || !firstScene.content || !firstScene.director) {
          console.error('[Portfolio Enhanced] ❌ CRITICAL ERROR: Gemini returned empty scene objects!');
          console.error('[Portfolio Enhanced] First scene structure:', JSON.stringify(firstScene, null, 2));
          console.error('[Portfolio Enhanced] Full Gemini response:', geminiResponse.text?.substring(0, 1000));

          // FALLBACK: Use original scenes and warn the user
          enhancedScenes = parsedScenes; // Use parsedScenes here
          aiExplanation = "⚠️ AI refinement encountered an error and returned invalid data. Your original scenes have been preserved. Please try rephrasing your request or contact support if this persists.";

          console.log('[Portfolio Enhanced] 🔄 Falling back to original scenes to prevent data loss');
        }
      }

      return res.json({
        explanation: aiExplanation,
        scenes: enhancedScenes,
      });
    } catch (error) {
      console.error("Conversational refinement error:", error);
      return res.status(500).json({
        error: "Failed to refine scenes",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // AI Prompt Templates CRUD endpoints
  app.get("/api/ai-prompt-templates", requireAuth, async (req, res) => {
    try {
      const activeOnly = req.query.activeOnly === 'true';
      const templates = await storage.getAllPromptTemplates(req.tenantId, activeOnly);
      return res.json(templates);
    } catch (error) {
      console.error("Error fetching prompt templates:", error);
      return res.status(500).json({ error: "Failed to fetch prompt templates" });
    }
  });

  app.get("/api/ai-prompt-templates/:key", requireAuth, async (req, res) => {
    try {
      const template = await storage.getPromptTemplateByKey(req.params.key);
      if (!template) {
        return res.status(404).json({ error: "Prompt template not found" });
      }
      return res.json(template);
    } catch (error) {
      console.error("Error fetching prompt template:", error);
      return res.status(500).json({ error: "Failed to fetch prompt template" });
    }
  });

  app.post("/api/ai-prompt-templates", requireAuth, async (req, res) => {
    try {
      const template = await storage.createPromptTemplate(req.body);
      return res.json(template);
    } catch (error) {
      console.error("Error creating prompt template:", error);
      return res.status(500).json({ error: "Failed to create prompt template" });
    }
  });

  app.put("/api/ai-prompt-templates/:id", requireAuth, async (req, res) => {
    try {
      const template = await storage.updatePromptTemplate(req.params.id, req.body);
      return res.json(template);
    } catch (error) {
      console.error("Error updating prompt template:", error);
      return res.status(500).json({ error: "Failed to update prompt template" });
    }
  });

  app.delete("/api/ai-prompt-templates/:id", requireAuth, async (req, res) => {
    try {
      await storage.deletePromptTemplate(req.params.id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting prompt template:", error);
      return res.status(500).json({ error: "Failed to delete prompt template" });
    }
  });

  // Media Library endpoints
  app.get("/api/media-library", requireAuth, async (req, res) => {
    try {
      const tenantId = (req as any).tenantId || "default";
      const projectId = req.query.projectId as string | undefined;
      const assets = await storage.getMediaAssets(tenantId, projectId);
      return res.json(assets);
    } catch (error) {
      console.error("Error fetching media library:", error);
      return res.status(500).json({ error: "Failed to fetch media library" });
    }
  });

  app.get("/api/projects/:projectId/media", requireAuth, async (req, res) => {
    try {
      const assets = await storage.getMediaAssetsByProject(req.params.projectId);
      return res.json(assets);
    } catch (error) {
      console.error("Error fetching project media:", error);
      return res.status(500).json({ error: "Failed to fetch project media" });
    }
  });

  // Custom multer error handler for media uploads
  const handleMediaUpload = (req: any, res: any, next: any) => {
    console.log('[Media Upload] Request received');
    console.log('[Media Upload] Content-Type:', req.headers['content-type']);
    
    mediaUpload.single('file')(req, res, (err: any) => {
      if (err) {
        console.error('[Media Upload] Multer error:', err);
        return res.status(400).json({ 
          error: 'File upload error',
          details: err.message 
        });
      }
      console.log('[Media Upload] Multer completed successfully, file present:', !!req.file);
      next();
    });
  };

  app.post("/api/media-library/upload", requireAuth, handleMediaUpload, async (req, res) => {
    try {
      const tenantId = (req as any).tenantId || "default";

      if (!req.file) {
        console.error('[Media Upload] No file in request after multer');
        return res.status(400).json({ error: "No file uploaded" });
      }

      console.log('[Media Upload] Processing file:', {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      const label = req.body.label || "";
      const tags = req.body.tags ? req.body.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [];

      // Upload to Cloudinary using buffer
      console.log('[Media Upload] Starting Cloudinary upload...');
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: req.file!.mimetype.startsWith("video/") ? "video" : "image",
            folder: `tenants/${tenantId}/media-library`,
          },
          (error, result) => {
            if (error) {
              console.error('[Media Upload] Cloudinary error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(req.file!.buffer);
      });

      const result = uploadResult as any;
      console.log('[Media Upload] Cloudinary upload successful:', result.public_id);

      // Save to database
      const asset = await storage.createMediaAsset({
        tenantId,
        cloudinaryPublicId: result.public_id,
        cloudinaryUrl: result.secure_url,
        mediaType: req.file.mimetype.startsWith("video/") ? "video" : "image",
        label: label || undefined,
        tags,
      });

      console.log('[Media Upload] Database record created:', asset.id);
      return res.json(asset);
    } catch (error) {
      console.error("[Media Upload] Error:", error);
      return res.status(500).json({ 
        error: "Failed to upload media",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.delete("/api/media-library/:id", requireAuth, async (req, res) => {
    try {
      const asset = await storage.getMediaAsset(req.params.id);
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }

      // Delete from Cloudinary
      await cloudinary.uploader.destroy(asset.cloudinaryPublicId);

      // Delete from database
      await storage.deleteMediaAsset(req.params.id);

      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting media:", error);
      return res.status(500).json({ error: "Failed to delete media" });
    }
  });

  // Portfolio-specific prompt overrides
  app.get("/api/projects/:projectId/prompts", requireAuth, async (req, res) => {
    try {
      const prompts = await storage.getPortfolioPrompts(req.params.projectId);
      return res.json(prompts);
    } catch (error) {
      console.error("Error fetching portfolio prompts:", error);
      return res.status(500).json({ error: "Failed to fetch portfolio prompts" });
    }
  });

  app.post("/api/projects/:projectId/prompts", requireAuth, async (req, res) => {
    try {
      const prompt = await storage.createPortfolioPrompt(
        req.params.projectId,
        req.session.userId!,
        req.body
      );
      return res.json(prompt);
    } catch (error) {
      console.error("Error creating portfolio prompt:", error);
      return res.status(500).json({ error: "Failed to create portfolio prompt" });
    }
  });

  app.put("/api/portfolio-prompts/:id", requireAuth, async (req, res) => {
    try {
      const prompt = await storage.updatePortfolioPrompt(
        req.params.id,
        req.session.userId!,
        req.body
      );
      return res.json(prompt);
    } catch (error) {
      console.error("Error updating portfolio prompt:", error);
      return res.status(500).json({ error: "Failed to update portfolio prompt" });
    }
  });

  app.delete("/api/portfolio-prompts/:id", requireAuth, async (req, res) => {
    try {
      await storage.deletePortfolioPrompt(req.params.id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting portfolio prompt:", error);
      return res.status(500).json({ error: "Failed to delete portfolio prompt" });
    }
  });

  app.post("/api/portfolio-prompts/:id/toggle", requireAuth, async (req, res) => {
    try {
      const prompt = await storage.togglePortfolioPrompt(
        req.params.id,
        req.session.userId!
      );
      return res.json(prompt);
    } catch (error) {
      console.error("Error toggling portfolio prompt:", error);
      return res.status(500).json({ error: "Failed to toggle portfolio prompt" });
    }
  });

  // Enhanced AI Portfolio Generation endpoint (scene-by-scene with per-scene AI prompts)
  // This endpoint handles both "cinematic" and "hybrid" modes, AND refinement
  app.post("/api/portfolio/generate-enhanced", requireAuth, async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Log for debugging
    console.log('[Portfolio Enhanced] Request received:', {
      hasProjectId: !!req.body.projectId,
      hasScenes: !!req.body.scenes,
      hasCurrentPrompt: !!req.body.currentPrompt,
      hasConversationHistory: !!req.body.conversationHistory,
      hasCurrentSceneJson: !!req.body.currentSceneJson,
    });

    // Basic validation of required fields
    const {
      projectId,
      newProjectTitle,
      newProjectSlug,
      newProjectClient,
      scenes,
      mode,
      portfolioAiPrompt,
      currentPrompt,
      conversationHistory: clientConversationHistory = [],
      currentSceneJson
    } = req.body;

    // Load conversation history from database if projectId exists
    let conversationHistory = clientConversationHistory;
    if (projectId) {
      const dbHistory = await storage.getConversationHistory(projectId);
      conversationHistory = dbHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      console.log('[Portfolio Enhanced] Loaded conversation history from DB:', conversationHistory.length, 'messages');
    }

    // Determine if this is refinement mode
    const isRefinementMode = !!(conversationHistory.length > 0 || currentSceneJson);

    console.log('[Portfolio Enhanced] Mode detection:', {
      isRefinementMode,
      conversationHistoryLength: conversationHistory.length,
      hasCurrentSceneJson: !!currentSceneJson
    });

    // Validate prompt based on mode
    const promptToValidate = isRefinementMode ? currentPrompt : portfolioAiPrompt;

    if (!promptToValidate || !promptToValidate.trim()) {
      console.error('[Portfolio Enhanced] Missing prompt:', {
        isRefinementMode,
        hasCurrentPrompt: !!currentPrompt,
        hasPortfolioPrompt: !!portfolioAiPrompt
      });
      return res.status(400).json({
        error: "Validation failed",
        details: isRefinementMode
          ? "Please enter a message to refine your scenes"
          : "Portfolio AI prompt is required"
      });
    }

    // Validate based on mode
    if (!isRefinementMode) {
      // Initial generation mode - need project details and scenes
      if (!projectId && (!newProjectTitle || !newProjectSlug)) {
        console.error('[Portfolio Enhanced] Missing project identification');
        return res.status(400).json({
          error: "Validation failed",
          details: "Either projectId or new project details (title, slug) are required"
        });
      }

      if (!scenes || scenes.length === 0) {
        console.error('[Portfolio Enhanced] Missing scenes array');
        return res.status(400).json({
          error: "Validation failed",
          details: "At least one scene is required for initial generation"
        });
      }
    } else {
      // Refinement mode - need either projectId or currentSceneJson
      if (!projectId && !currentSceneJson) {
        console.error('[Portfolio Enhanced] Refinement mode missing context');
        return res.status(400).json({
          error: "Validation failed",
          details: "Refinement requires either a projectId or currentSceneJson"
        });
      }
    }

    // Lazy-load Gemini client
    const { GoogleGenAI, Type } = await import("@google/genai");
    const aiClient = new GoogleGenAI({
      apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "",
      httpOptions: {
        apiVersion: "",
        baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "",
      },
    });

    let enhancedScenes: any[] = [];
    let aiExplanation = "";
    let currentScenes: any[] = []; // Define currentScenes here

    if (isRefinementMode) {
      // REFINEMENT MODE: Use conversation API with Gemini
      console.log('[Portfolio Enhanced] REFINEMENT MODE: Using conversation API');

      // Parse current scenes
      if (currentSceneJson) {
        try {
          currentScenes = JSON.parse(currentSceneJson);
          console.log(`[Portfolio Enhanced] Parsed ${currentScenes.length} scenes from JSON`);
        } catch (error) {
          console.error('[Portfolio Enhanced] Failed to parse currentSceneJson:', error);
          return res.status(400).json({
            error: "Invalid scene JSON",
            details: "Could not parse currentSceneJson"
          });
        }
      }

      // Build conversation context for Gemini
      const systemPrompt = `You are a cinematic director helping refine portfolio scenes through conversation.

CURRENT SCENES (JSON):
${JSON.stringify(currentScenes, null, 2)}

Your job is to:
1. Listen to the user's refinement request
2. Explain what changes you're making in plain English
3. Return the COMPLETE refined scenes array with improvements

CRITICAL REQUIREMENT:
YOU MUST RETURN ALL ${currentScenes.length} SCENES IN YOUR RESPONSE.
Even if the user only asks to modify "Scene 3", you must return ALL scenes with Scene 3 modified and the rest unchanged.
NEVER return a partial array - always return the complete scene array.

SCENE REFERENCE:
- Users can say "Scene 1", "Scene 2", etc. to reference specific scenes
- "all scenes" means apply changes globally
- Be specific about which scenes you're modifying
- When modifying a single scene, keep all other scenes EXACTLY as they are

RESPONSE FORMAT:
- explanation: Plain English explanation of changes made (which scenes were modified)
- scenes: COMPLETE array of ALL ${currentScenes.length} scenes (modified + unmodified)`;

      // Build conversation messages
      const messages = [
        { role: "user", parts: [{ text: systemPrompt }] },
        ...conversationHistory.map((msg: any) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        })),
        { role: "user", parts: [{ text: currentPrompt }] }
      ];

      console.log('[Portfolio Enhanced] Sending conversation to Gemini:', {
        messageCount: messages.length,
        currentPromptLength: currentPrompt.length
      });

      const geminiResponse = await aiClient.models.generateContent({
        model: "gemini-2.5-pro",
        contents: messages,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              explanation: {
                type: Type.STRING,
                description: "Plain English explanation of changes made"
              },
              scenes: {
                type: Type.ARRAY,
                description: "Complete refined scenes array with ALL original structure preserved",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    content: { type: Type.OBJECT },
                    director: { type: Type.OBJECT },
                    layout: { type: Type.STRING }
                  },
                  required: ["type", "content", "director"]
                }
              }
            },
            required: ["explanation", "scenes"]
          }
        }
      });

      const result = JSON.parse(geminiResponse.text || '{}');
      enhancedScenes = result.scenes || [];
      aiExplanation = result.explanation || "Scenes refined successfully";

      console.log(`[Portfolio Enhanced] Gemini refined ${enhancedScenes.length} scenes`);

      // CRITICAL VALIDATION: Check if scenes are actually populated
      if (enhancedScenes.length > 0) {
        const firstScene = enhancedScenes[0];
        if (!firstScene.type || !firstScene.content || !firstScene.director) {
          console.error('[Portfolio Enhanced] ❌ CRITICAL ERROR: Gemini returned empty scene objects!');
          console.error('[Portfolio Enhanced] First scene structure:', JSON.stringify(firstScene, null, 2));
          console.error('[Portfolio Enhanced] Full Gemini response:', geminiResponse.text?.substring(0, 1000));

          // FALLBACK: Use original scenes and warn the user
          enhancedScenes = currentScenes;
          aiExplanation = "⚠️ AI refinement encountered an error and returned invalid data. Your original scenes have been preserved. Please try rephrasing your request or contact support if this persists.";

          console.log('[Portfolio Enhanced] 🔄 Falling back to original scenes to prevent data loss');
        }
      }
    } else {
      // INITIAL GENERATION MODE: Process scenes one-by-one
      console.log(`[Portfolio Enhanced] INITIAL MODE: Generating ${scenes.length} scenes`);

      const { generateSceneWithGemini } = await import("./utils/gemini-client");

      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        console.log(`[Portfolio Enhanced] Processing scene ${i + 1}: ${scene.sceneType}`);

        const systemInstructions = `Portfolio Context: ${portfolioAiPrompt}\n\nThis is scene ${i + 1} of ${scenes.length}.`;

        try {
          const aiEnhanced = await generateSceneWithGemini(
            scene.aiPrompt,
            scene.sceneType,
            systemInstructions
          );

          const sceneConfig: any = {
            type: aiEnhanced.sceneType || scene.sceneType,
            content: {},
            director: {
              ...DEFAULT_DIRECTOR_CONFIG,
              ...(aiEnhanced.director || {}),
              ...(scene.director || {})
            }
          };

          // Map content based on scene type
          if (sceneConfig.type === "text") {
            sceneConfig.content.heading = scene.content.heading || aiEnhanced.headline || "Untitled";
            sceneConfig.content.body = scene.content.body || aiEnhanced.bodyText || "";
          } else if (sceneConfig.type === "image") {
            sceneConfig.content.url = scene.content.url || aiEnhanced.mediaUrl || "";
            sceneConfig.content.alt = scene.content.alt || aiEnhanced.alt || "Image";
          } else if (sceneConfig.type === "quote") {
            sceneConfig.content.quote = scene.content.quote || aiEnhanced.quote || "";
            sceneConfig.content.author = scene.content.author || aiEnhanced.author || "";
          }

          enhancedScenes.push(sceneConfig);
        } catch (error) {
          console.error(`[Portfolio Enhanced] Scene ${i + 1} generation failed:`, error);
          throw new Error(`Failed to generate scene ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      aiExplanation = `Generated ${enhancedScenes.length} scenes successfully`;
      console.log(`[Portfolio Enhanced] All ${enhancedScenes.length} scenes generated`);
    }

    // Save to database (only if we have a project to save to)
    let finalProjectId = projectId;

    if (!isRefinementMode || !projectId) {
      // Create new project if needed
      if (!newProjectTitle || !newProjectSlug) {
        return res.status(400).json({
          error: "Cannot save scenes without project context"
        });
      }

      try {
        const [newProject] = await db.insert(projects).values({
          tenantId: req.tenantId,
          title: newProjectTitle,
          slug: newProjectSlug,
          clientName: newProjectClient,
          description: `AI-generated portfolio with ${enhancedScenes.length} scenes`,
          thumbnailUrl: "",
        }).returning();

        finalProjectId = newProject.id;
        console.log(`[Portfolio Enhanced] Created new project ${finalProjectId}`);
      } catch (error) {
        console.error('[Portfolio Enhanced] Project creation failed:', error);
        return res.status(500).json({
          error: "Failed to create project",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    // Persist conversation to database
    if (finalProjectId) {
      try {
        // Save user message
        await storage.createConversationMessage(
          finalProjectId,
          'user',
          isRefinementMode ? currentPrompt : portfolioAiPrompt
        );

        // Save assistant response
        await storage.createConversationMessage(
          finalProjectId,
          'assistant',
          aiExplanation
        );

        // Get current version number
        const latestVersion = await storage.getLatestPortfolioVersion(finalProjectId);
        const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

        // Save version
        const savedVersion = await storage.createPortfolioVersion(
          finalProjectId,
          nextVersionNumber,
          enhancedScenes,
          undefined, // confidenceScore - calculate if needed
          undefined, // confidenceFactors
          isRefinementMode ? currentPrompt : portfolioAiPrompt
        );

        console.log('[Portfolio Enhanced] Persisted conversation and version to DB');

        // Return response with conversation context
        const responseData = {
          success: true,
          scenes: enhancedScenes,
          explanation: aiExplanation,
          projectId: finalProjectId,
          // Include conversation data for frontend to update state
          conversationUpdate: {
            userMessage: isRefinementMode ? currentPrompt : portfolioAiPrompt,
            assistantMessage: aiExplanation
          },
          // Version data for frontend
          versionData: {
            id: savedVersion.id,
            timestamp: Date.now(),
            label: isRefinementMode ? `Iteration ${nextVersionNumber}` : "Initial Generation",
            json: JSON.stringify(enhancedScenes, null, 2),
            changeDescription: isRefinementMode ? currentPrompt : portfolioAiPrompt,
            versionNumber: nextVersionNumber
          }
        };

        console.log('[Portfolio Enhanced] Returning response:', {
          sceneCount: enhancedScenes.length,
          hasProjectId: !!finalProjectId,
          isRefinement: isRefinementMode,
          versionNumber: nextVersionNumber
        });

        return res.json(responseData);
      } catch (dbError) {
        console.error('[Portfolio Enhanced] Failed to persist to DB:', dbError);
        // Continue with response even if DB save fails
        const responseData = {
          success: true,
          scenes: enhancedScenes,
          explanation: aiExplanation,
          projectId: finalProjectId,
          conversationUpdate: {
            userMessage: isRefinementMode ? currentPrompt : portfolioAiPrompt,
            assistantMessage: aiExplanation
          },
          versionData: {
            id: `v-${Date.now()}`,
            timestamp: Date.now(),
            label: isRefinementMode ? `Iteration ${conversationHistory.length / 2 + 1}` : "Initial Generation",
            json: JSON.stringify(enhancedScenes, null, 2),
            changeDescription: isRefinementMode ? currentPrompt : portfolioAiPrompt
          },
          warning: 'Changes saved but history persistence failed'
        };
        return res.json(responseData);
      }
    }

    // Fallback if no projectId (shouldn't happen but handle gracefully)
    const responseData = {
      success: true,
      scenes: enhancedScenes,
      explanation: aiExplanation,
      conversationUpdate: {
        userMessage: isRefinementMode ? currentPrompt : portfolioAiPrompt,
        assistantMessage: aiExplanation
      },
      versionData: {
        id: `v-${Date.now()}`,
        timestamp: Date.now(),
        label: isRefinementMode ? `Iteration ${conversationHistory.length / 2 + 1}` : "Initial Generation",
        json: JSON.stringify(enhancedScenes, null, 2),
        changeDescription: isRefinementMode ? currentPrompt : portfolioAiPrompt
      }
    };
    return res.json(responseData);
  });

  // CINEMATIC MODE: Full AI Director (4-stage pipeline)
  app.post("/api/portfolio/generate-cinematic", requireAuth, async (req, res) => {
    try {
      const result = portfolioGenerateRequestSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const { catalog, projectId, newProjectTitle, newProjectSlug, newProjectClient } = result.data;

      // Validate catalog has sections
      if (!catalog.sections || catalog.sections.length === 0) {
        return res.status(400).json({
          error: "Cinematic mode requires section-level structure in catalog",
        });
      }

      console.log(`[Cinematic Mode] Generating from ${catalog.sections.length} sections`);

      // Lazy-load cinematic director
      const { generateCinematicPortfolio } = await import("./utils/cinematic-director");

      // Generate using 4-stage pipeline
      const cinematicResult = await generateCinematicPortfolio(catalog);

      // Convert to scene configs (same format as existing system)
      const { convertToSceneConfigs } = await import("./utils/portfolio-director");
      const sceneConfigs = convertToSceneConfigs(cinematicResult.scenes, catalog);

      // Save to database
      const isNewProject = !projectId || projectId === null;
      let finalProjectId: string;

      if (isNewProject) {
        if (!newProjectTitle || !newProjectSlug) {
          return res.status(400).json({ error: "New project requires title and slug" });
        }

        const newProject = await storage.createProject({
          slug: newProjectSlug,
          title: newProjectTitle,
          clientName: newProjectClient || null,
          thumbnailUrl: catalog.images[0]?.url || null,
          categories: [],
        }, req.tenantId);

        finalProjectId = newProject.id;
      } else {
        finalProjectId = projectId;
      }

      // Create scenes
      for (let i = 0; i < sceneConfigs.length; i++) {
        await storage.createProjectScene({
          projectId: finalProjectId,
          sceneConfig: sceneConfigs[i],
          order: i,
        });
      }

      return res.json({
        success: true,
        projectId: finalProjectId,
        scenes: cinematicResult.scenes,
        storyboard: cinematicResult.storyboard,
        confidenceScore: cinematicResult.confidenceScore,
        warnings: cinematicResult.warnings,
        message: `Cinematic generation complete (${cinematicResult.scenes.length} scenes)`,
      });
    } catch (error) {
      console.error("Cinematic generation error:", error);
      return res.status(500).json({
        error: "Failed to generate cinematic portfolio",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // HYBRID MODE: AI Portfolio Generation (original content catalog orchestration)
  app.post("/api/portfolio/generate-ai", requireAuth, async (req, res) => {
    try {
      const result = portfolioGenerateRequestSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const { catalog, projectId, newProjectTitle, newProjectSlug, newProjectClient } = result.data;

      // Validate catalog has at least one asset
      const totalAssets = catalog.texts.length + catalog.images.length + catalog.videos.length + catalog.quotes.length;
      if (totalAssets === 0) {
        return res.status(400).json({
          error: "Catalog must contain at least one asset (text, image, video, or quote)",
        });
      }

      // Validate new project requirements
      const isNewProject = !projectId || projectId === null;
      if (isNewProject && (!newProjectTitle || !newProjectSlug)) {
        return res.status(400).json({
          error: "New project requires title and slug",
        });
      }

      console.log(`[Portfolio AI] Processing request - Project: ${isNewProject ? 'NEW' : projectId}, Assets: ${totalAssets}`);

      // Lazy-load portfolio director
      const { generatePortfolio } = await import("./utils/portfolio-director");

      // Call AI to orchestrate scenes
      console.log(`[Portfolio AI] Generating scenes for ${catalog.texts.length} texts, ${catalog.images.length} images, ${catalog.videos.length} videos, ${catalog.quotes.length} quotes`);

      let portfolioResult;
      try {
        // Generate portfolio using AI director
        portfolioResult = await generatePortfolio({
          projectTitle: newProjectTitle || catalog.title || "AI Generated Portfolio", // Use new project title if available, else catalog title, else default
          projectDescription: catalog.description || "AI generated portfolio from content catalog",
          projectSlug: newProjectSlug || crypto.randomBytes(6).toString('hex'), // Generate a random slug if new project and no slug provided
          contentCatalog: catalog,
          directorConfig: {}, // Placeholder for director config if needed
          briefingNotes: req.body.briefingNotes, // Pass briefing notes if provided
          projectId: projectId || undefined, // Pass projectId for custom prompt loading
        });

        console.log(`[Portfolio AI] Generated ${portfolioResult.scenes.length} scenes`);
      } catch (aiError) {
        console.error('[Portfolio AI] Portfolio generation failed:', aiError);
        return res.status(500).json({
          error: "AI portfolio generation failed",
          details: aiError instanceof Error ? aiError.message : "Unknown error"
        });
      }

      // Convert AI scenes to database scene configs
      // NOTE: This part might need adjustment based on the actual output format of `generatePortfolio`
      // Assuming `generatePortfolio` returns an array of scene configurations compatible with `convertToSceneConfigs`
      // If `generatePortfolio` returns structured data, we might need to adapt `convertToSceneConfigs` or replace it.
      // For this example, let's assume a direct mapping is possible or `convertToSceneConfigs` handles the output.

      // Let's assume `generatePortfolio` returns scenes in a format that can be directly used or needs minimal transformation.
      // If `convertToSceneConfigs` is a separate utility, we'd call it here.
      // If `generatePortfolio` already returns scene configs, we can use that directly.
      // For this example, let's assume `portfolioResult.scenes` is the array of scene configs.

      // Wrap project creation and scene inserts in a transaction for atomicity
      const result_data = await db.transaction(async (tx) => {
        // Determine or create project
        let finalProjectId: string;

        if (projectId && projectId !== null && projectId !== '') {
          // Verify existing project access
          const [existingProject] = await tx.select()
            .from(projects)
            .where(and(eq(projects.tenantId, req.tenantId), eq(projects.id, projectId)));

          if (!existingProject) {
            throw new Error('Project not found or access denied');
          }
          finalProjectId = projectId;
          console.log(`[Portfolio AI] Using existing project: ${finalProjectId}`);
        } else {
          // Create new project within transaction using tx client
          // Use provided title and slug, or fallback if not available
          const projectTitle = newProjectTitle || (catalog.title ? `Portfolio: ${catalog.title}` : "AI Generated Portfolio");
          const projectSlug = newProjectSlug || crypto.randomBytes(6).toString('hex'); // Generate a unique slug

          const [newProject] = await tx.insert(projects).values({
            tenantId: req.tenantId,
            title: projectTitle,
            slug: projectSlug,
            clientName: newProjectClient || catalog.clientName || null,
            thumbnailUrl: catalog.images[0]?.url || null,
            categories: catalog.categories || [],
            challengeText: catalog.challenge,
            solutionText: catalog.solution,
            outcomeText: catalog.outcome,
            modalMediaType: "video", // Default or derived from catalog
            modalMediaUrls: catalog.videos.map(v => v.url) || [],
            testimonialText: catalog.testimonial?.text || null,
            testimonialAuthor: catalog.testimonial?.author || null,
            description: `AI-generated portfolio based on catalog. ${portfolioResult.scenes.length} scenes generated.`,
          }).returning();
          finalProjectId = newProject.id;
          console.log(`[Portfolio AI] Created new project: ${finalProjectId}`);
        }

        // Bulk create scenes within transaction using tx client
        const createdScenes = [];
        for (let i = 0; i < portfolioResult.scenes.length; i++) {
          const sceneConfig = portfolioResult.scenes[i];
          const [scene] = await tx.insert(projectScenes).values({
            projectId: finalProjectId,
            sceneConfig,
            order: i,
          }).returning();
          createdScenes.push(scene);
        }

        console.log(`[Portfolio AI] Created ${createdScenes.length} scenes for project ${finalProjectId}`);

        return {
          projectId: finalProjectId,
          scenesCreated: createdScenes.length,
          scenes: createdScenes,
        };
      });

      res.json({
        success: true,
        scenes: portfolioResult.scenes,
        confidenceScore: portfolioResult.confidenceScore,
        confidenceFactors: portfolioResult.confidenceFactors,
        message: `Generated ${portfolioResult.scenes.length} scenes successfully (Confidence: ${portfolioResult.confidenceScore}%)`,
      });
    } catch (error) {
      console.error("Error generating portfolio with AI:", error);
      return res.status(500).json({
        error: "Failed to generate portfolio",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Prompt Templates endpoints (for AI scene generation)
  // NOTE: These routes use requireAuth only. For production, consider adding
  // role-based authorization (e.g., requireTenantRole('admin')) to mutation endpoints
  app.get("/api/prompt-templates", requireAuth, async (req, res) => {
    try {
      const activeOnly = req.query.activeOnly === 'true';
      const templates = await storage.getAllPromptTemplates(req.tenantId, activeOnly);
      return res.json(templates);
    } catch (error) {
      console.error("Error fetching prompt templates:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // IMPORTANT: /default route MUST come before /:id to avoid conflicts
  app.get("/api/prompt-templates/default", requireAuth, async (req, res) => {
    try {
      const sceneType = req.query.sceneType as string | undefined;
      const scope = (req.query.scope as string) || 'global';

      // Validate scope against schema constraints
      if (scope !== 'global' && scope !== 'tenant') {
        return res.status(400).json({
          error: "Invalid scope parameter. Must be 'global' or 'tenant'"
        });
      }

      const template = await storage.getDefaultPromptTemplate(
        req.tenantId,
        sceneType === 'null' ? null : sceneType,
        scope
      );

      if (!template) {
        return res.status(404).json({ error: "Default template not found" });
      }

      return res.json(template);
    } catch (error) {
      console.error("Error fetching default prompt template:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/prompt-templates/:id", requireAuth, async (req, res) => {
    try {
      const template = await storage.getPromptTemplateById(req.tenantId, req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Prompt template not found" });
      }
      return res.json(template);
    } catch (error) {
      console.error("Error fetching prompt template:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/prompt-templates", requireAuth, async (req, res) => {
    try {
      const result = insertPromptTemplateSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const template = await storage.createPromptTemplate(
        req.tenantId,
        req.session.userId,
        result.data
      );
      return res.status(201).json(template);
    } catch (error) {
      console.error("Error creating prompt template:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/prompt-templates/:id", requireAuth, async (req, res) => {
    try {
      const result = updatePromptTemplateSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const template = await storage.updatePromptTemplate(
        req.tenantId,
        req.params.id,
        req.session.userId,
        result.data
      );
      return res.json(template);
    } catch (error) {
      console.error("Error updating prompt template:", error);
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({ error: "Prompt template not found or access denied" });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/prompt-templates/:id", requireAuth, async (req, res) => {
    try {
      await storage.deletePromptTemplate(req.tenantId, req.params.id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting prompt template:", error);
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({ error: "Prompt template not found or access denied" });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // AI Scene Generation endpoint (uses Gemini via Replit AI Integrations)
  app.post("/api/scenes/generate-with-ai", requireAuth, async (req, res) => {
    try {
      const schema = z.object({
        prompt: z.string().min(10, "Prompt must be at least 10 characters"),
        sceneType: z.string().optional(),
        templateId: z.string().optional(),
        projectId: z.string().optional(), // For validating against existing scenes
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const { prompt, sceneType, templateId, projectId } = result.data;

      // Load prompt template if specified
      let systemInstructions: string | undefined;
      if (templateId) {
        const template = await storage.getPromptTemplateById(req.tenantId, templateId);
        if (template && template.isActive) {
          systemInstructions = template.templateContent;
        }
      }

      // Lazy-load Gemini client to avoid module errors if not yet used
      const { generateSceneWithGemini } = await import("./utils/gemini-client");

      // Generate scene configuration using Gemini
      const sceneConfig = await generateSceneWithGemini(
        prompt,
        sceneType,
        systemInstructions
      );

      return res.status(200).json({
        success: true,
        sceneConfig,
        message: "Scene generated successfully. Please review before saving."
      });
    } catch (error) {
      console.error("Error generating scene with AI:", error);
      if (error instanceof Error) {
        return res.status(500).json({
          error: "AI generation failed",
          details: error.message
        });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Public Branding Project endpoints (for scrollytelling pages)
  app.get("/api/branding/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects(req.tenantId);

      // Map database format to frontend-expected format
      const mapped = projects.map(p => ({
        id: p.id,
        slug: p.slug,
        clientName: p.clientName || p.title, // Fallback to title if clientName not set
        projectTitle: p.title,
        thumbnailImage: p.thumbnailUrl,
        categories: p.categories || [],
        challenge: p.challengeText,
        solution: p.solutionText,
        outcome: p.outcomeText,
        galleryImages: p.modalMediaUrls || [],
        testimonial: (p.testimonialText && p.testimonialAuthor) ? {
          text: p.testimonialText,
          author: p.testimonialAuthor
        } : undefined
      }));

      return res.json(mapped);
    } catch (error) {
      console.error("Error fetching all projects:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/branding/projects/slug/:slug", async (req, res) => {
    try {
      const project = await storage.getProjectBySlug(req.tenantId, req.params.slug);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      return res.json(project);
    } catch (error) {
      console.error("Error fetching project by slug:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/branding/projects/:id/scenes", async (req, res) => {
    try {
      const scenes = await storage.getScenesByProjectId(req.tenantId, req.params.id);
      if (scenes === null) {
        return res.status(404).json({ error: "Project not found" });
      }
      // Normalize to empty array instead of null for simpler frontend handling
      return res.json(scenes || []);
    } catch (error) {
      console.error("Error fetching project scenes:", error);
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
      const application = await storage.createJobApplication(req.tenantId, result.data);
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

      const leadCapture = await storage.createLeadCapture(req.tenantId, result.data);

      // Also save to unified leads table
      const lead = await storage.createLead(req.tenantId, {
        email: result.data.email,
        name: result.data.firstName ? `${result.data.firstName} ${result.data.lastName || ''}`.trim() : undefined,
        company: result.data.company,
        source: "lead-magnet",
        pageUrl: req.headers.referer || result.data.source,
        formData: JSON.stringify({ resourceDownloaded: result.data.resourceDownloaded }),
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      // Send notification email to all users (don't await - run in background)
      sendLeadNotificationEmail(lead).catch(err =>
        console.error("Failed to send lead notification:", err)
      );

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
      const captures = await storage.getAllLeadCaptures(req.tenantId);
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

      // Also save to unified leads table
      const lead = await storage.createLead(req.tenantId, {
        email: result.data.email,
        source: "gtm-assessment-blueprint",
        pageUrl: result.data.path,
        formData: JSON.stringify({
          q1: result.data.q1,
          q2: result.data.q2
        }),
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      // Send notification email to all users (don't await - run in background)
      sendLeadNotificationEmail(lead).catch(err =>
        console.error("Failed to send lead notification:", err)
      );

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

      const existing = await storage.getAssessmentBySessionId(req.tenantId, sessionId);

      if (existing) {
        return res.json(existing);
      }

      const assessment = await storage.createAssessment(req.tenantId, {
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

      const assessment = await storage.updateAssessment(req.tenantId, sessionId, updates);

      return res.json(assessment);
    } catch (error) {
      console.error("Error updating assessment:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/assessments/:sessionId/submit", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { assessmentId, ...submittedData } = req.body;

      let bucket: string | null = null;

      // If assessmentId is provided, use config-based scoring
      if (assessmentId) {
        // Fetch assessment config
        const config = await storage.getAssessmentConfigById(req.tenantId, assessmentId);

        if (!config) {
          return res.status(404).json({
            error: "Assessment configuration not found",
            details: `No assessment found with ID: ${assessmentId}`
          });
        }

        // Check scoring method
        if (config.scoringMethod === 'points') {
          console.log(`Using points-based scoring for assessment: ${config.title}`);

          // Fetch all answers for this assessment
          const answers = await storage.getAnswersByAssessmentId(assessmentId);

          if (answers.length === 0) {
            return res.status(400).json({
              error: "No answers configured",
              details: "This assessment has no answers configured for scoring"
            });
          }

          // Fetch result buckets
          const buckets = await storage.getBucketsByAssessmentId(assessmentId);

          if (buckets.length === 0) {
            return res.status(400).json({
              error: "No result buckets configured",
              details: "This assessment has no result buckets configured"
            });
          }

          // Calculate points-based bucket
          bucket = calculatePointsBasedBucket(submittedData, answers, buckets);

          // Handle case where no bucket matches
          if (!bucket) {
            // Try to find a default bucket (first one, or one with no score bounds)
            const defaultBucket = buckets.find(b =>
              b.minScore === null && b.maxScore === null
            ) || buckets[0];

            if (defaultBucket) {
              console.warn(`No exact match found, using default bucket: ${defaultBucket.bucketKey}`);
              bucket = defaultBucket.bucketKey;
            } else {
              return res.status(400).json({
                error: "No matching result found",
                details: "Your score did not match any configured result bucket"
              });
            }
          }
        } else {
          // Use decision-tree logic for non-points assessments
          console.log(`Using decision-tree scoring for assessment: ${config.title}`);
          bucket = calculateBucket(submittedData);
        }
      } else {
        // Fallback to legacy decision-tree logic if no assessmentId provided
        console.log("No assessmentId provided, using legacy decision-tree scoring");
        bucket = calculateBucket(submittedData);
      }

      // Update assessment with results
      const assessment = await storage.updateAssessment(req.tenantId, sessionId, {
        ...submittedData,
        bucket,
        completed: true,
      });

      // If email (q20) is provided, save to unified leads table
      if (submittedData.q20) {
        const lead = await storage.createLead(req.tenantId, {
          email: submittedData.q20,
          source: "pipeline-assessment",
          pageUrl: "/pipeline-assessment",
          formData: JSON.stringify({
            sessionId,
            bucket,
            assessmentData: submittedData
          }),
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip,
        });

        // Send notification email to all users (don't await - run in background)
        sendLeadNotificationEmail(lead).catch(err =>
          console.error("Failed to send lead notification:", err)
        );
      }

      return res.json({
        success: true,
        bucket,
        assessment,
      });
    } catch (error) {
      console.error("Error submitting assessment:", error);
      return res.status(500).json({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      });
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

      const assessments = await storage.getAllAssessments(req.tenantId, filters);

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
      const configs = await storage.getAllAssessmentConfigs(req.tenantId);
      return res.json(configs);
    } catch (error) {
      console.error("Error fetching assessment configs:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/assessment-configs/slug/:slug", async (req, res) => {
    try {
      const config = await storage.getAssessmentConfigBySlug(req.tenantId, req.params.slug);
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
      const config = await storage.getAssessmentConfigById(req.tenantId, req.params.id);
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

      // Auto-generate slug if not provided or empty
      let configData = result.data;
      if (!configData.slug || configData.slug.trim() === '') {
        if (!configData.title) {
          return res.status(400).json({
            error: "Title is required to generate slug"
          });
        }
        configData.slug = await generateSlug(configData.title, req.tenantId, storage);
      }

      const config = await storage.createAssessmentConfig(req.tenantId, configData);
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

      let updateData = result.data;

      // Auto-generate slug if explicitly set to empty or if title is being updated without a slug
      if (updateData.slug !== undefined && (!updateData.slug || updateData.slug.trim() === '')) {
        // If slug is being cleared, we need a title to generate a new one
        const existingConfig = await storage.getAssessmentConfigById(req.tenantId, req.params.id);
        if (!existingConfig) {
          return res.status(404).json({ error: "Assessment config not found" });
        }

        const titleForSlug = updateData.title || existingConfig.title;
        updateData.slug = await generateSlug(titleForSlug, req.tenantId, storage, req.params.id);
      }

      const config = await storage.updateAssessmentConfig(req.tenantId, req.params.id, updateData);
      return res.json(config);
    } catch (error) {
      console.error("Error updating assessment config:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/assessment-configs/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteAssessmentConfig(req.tenantId, req.params.id);
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
      const { questionId } = req.params;
      console.log('[API] Fetching answers for questionId:', questionId);

      const answers = await storage.getAnswersByQuestionId(questionId);
      console.log('[API] Found', answers.length, 'answers for questionId:', questionId);

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
      const config = await storage.getAssessmentConfigBySlug(req.tenantId, req.params.slug);
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

  // Public assessment config by ID endpoint (for embedded widgets)
  app.get("/api/public/assessment-configs/:id", async (req, res) => {
    try {
      const config = await storage.getAssessmentConfigById(req.tenantId, req.params.id);
      if (!config || !config.published) {
        return res.status(404).json({ error: "Assessment config not found or not published" });
      }
      return res.json(config);
    } catch (error) {
      console.error("Error fetching public assessment config:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Public campaigns endpoint (for WidgetZone)
  app.get("/api/public/campaigns", async (req, res) => {
    try {
      const { zone, page, displayAs, active } = req.query;
      let campaigns = await storage.getAllCampaigns(req.tenantId);

      // Filter by active status (default to true for public endpoint)
      campaigns = campaigns.filter(c => c.isActive);

      // Filter by displayAs
      if (displayAs) {
        campaigns = campaigns.filter(c => c.displayAs === displayAs);
      }

      // Filter by zone
      if (zone) {
        campaigns = campaigns.filter(c => c.targetZone === zone);
      }

      // Filter by page
      if (page) {
        campaigns = campaigns.filter(c => {
          // If targetPages is empty or null, campaign targets all pages
          if (!c.targetPages || c.targetPages.length === 0) {
            return true;
          }
          // Check if page is in targetPages
          return c.targetPages.includes(page as string);
        });
      }

      return res.json(campaigns);
    } catch (error) {
      console.error("Error fetching public campaigns:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Campaign routes
  app.get("/api/campaigns", requireAuth, async (req, res) => {
    try {
      const { zone, page, displayAs, active } = req.query;
      // TENANT ISOLATION: Only fetch campaigns for authenticated user's tenant
      let campaigns = await storage.getAllCampaigns(req.tenantId);

      // Filter by active status
      if (active === "true") {
        campaigns = campaigns.filter(c => c.isActive);
      }

      // Filter by displayAs
      if (displayAs) {
        campaigns = campaigns.filter(c => c.displayAs === displayAs);
      }

      // Filter by zone
      if (zone) {
        campaigns = campaigns.filter(c => c.targetZone === zone);
      }

      // Filter by page
      if (page) {
        campaigns = campaigns.filter(c => {
          // If targetPages is empty or null, campaign targets all pages
          if (!c.targetPages || c.targetPages.length === 0) {
            return true;
          }
          // Check if page is in targetPages
          return c.targetPages.includes(page as string);
        });
      }

      return res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/campaigns/:id", requireAuth, async (req, res) => {
    try {
      // TENANT ISOLATION: Verify campaign belongs to user's tenant
      const campaign = await storage.getCampaignById(req.tenantId, req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      return res.json(campaign);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/campaigns", requireAuth, async (req, res) => {
    try {
      const result = insertCampaignSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const campaignData = result.data;

      // Zone conflict validation for inline campaigns
      // TENANT ISOLATION: Only check conflicts within same tenant
      if (campaignData.displayAs === "inline" && campaignData.targetZone) {
        const allCampaigns = await storage.getAllCampaigns(req.tenantId);

        for (const existingCampaign of allCampaigns) {
          // Skip if not active or not inline or no target zone
          if (!existingCampaign.isActive ||
              existingCampaign.displayAs !== "inline" ||
              !existingCampaign.targetZone) {
            continue;
          }

          // Check if same zone
          if (existingCampaign.targetZone === campaignData.targetZone) {
            // Check for overlapping pages
            const existingPages = existingCampaign.targetPages || [];
            const newPages = campaignData.targetPages || [];

            // If either campaign targets all pages (empty array), there's a conflict
            // Or if there are any overlapping pages
            const hasOverlap = existingPages.length === 0 ||
                              newPages.length === 0 ||
                              existingPages.some(page => newPages.includes(page));

            if (hasOverlap) {
              const overlappingPages = existingPages.length === 0 || newPages.length === 0
                ? ["all pages"]
                : existingPages.filter(page => newPages.includes(page));

              return res.status(400).json({
                error: `Zone ${campaignData.targetZone} is already used by campaign '${existingCampaign.campaignName}' on page(s): ${overlappingPages.join(", ")}`
              });
            }
          }
        }
      }

      // TENANT ISOLATION: Automatically assign tenantId from session
      const campaign = await storage.createCampaign(req.tenantId, campaignData);
      return res.status(201).json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/campaigns/:id", requireAuth, async (req, res) => {
    try {
      const result = insertCampaignSchema.partial().safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const campaignData = result.data;

      // Zone conflict validation for inline campaigns
      // TENANT ISOLATION: Only check conflicts within same tenant
      if (campaignData.displayAs === "inline" && campaignData.targetZone) {
        const allCampaigns = await storage.getAllCampaigns(req.tenantId);

        for (const existingCampaign of allCampaigns) {
          // Skip the campaign being updated
          if (existingCampaign.id === req.params.id) {
            continue;
          }

          // Skip if not active or not inline or no target zone
          if (!existingCampaign.isActive ||
              existingCampaign.displayAs !== "inline" ||
              !existingCampaign.targetZone) {
            continue;
          }

          // Check if same zone
          if (existingCampaign.targetZone === campaignData.targetZone) {
            // Check for overlapping pages
            const existingPages = existingCampaign.targetPages || [];
            const newPages = campaignData.targetPages || [];

            // If either campaign targets all pages (empty array), there's a conflict
            // Or if there are any overlapping pages
            const hasOverlap = existingPages.length === 0 ||
                              newPages.length === 0 ||
                              existingPages.some(page => newPages.includes(page));

            if (hasOverlap) {
              const overlappingPages = existingPages.length === 0 || newPages.length === 0
                ? ["all pages"]
                : existingPages.filter(page => newPages.includes(page));

              return res.status(400).json({
                error: `Zone ${campaignData.targetZone} is already used by campaign '${existingCampaign.campaignName}' on page(s): ${overlappingPages.join(", ")}`
              });
            }
          }
        }
      }

      const campaign = await storage.updateCampaign(req.tenantId, req.params.id, campaignData);
      return res.json(campaign);
    } catch (error) {
      console.error("Error updating campaign:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/campaigns/:id", requireAuth, async (req, res) => {
    try {
      // TENANT ISOLATION: Verify campaign exists and belongs to user's tenant before deletion
      const existingCampaign = await storage.getCampaignById(req.tenantId, req.params.id);
      if (!existingCampaign) {
        return res.status(404).json({ error: "Campaign not found or access denied" });
      }

      await storage.deleteCampaign(req.tenantId, req.params.id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting campaign:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Feature Flags endpoints
  app.get("/api/feature-flags", requireAuth, async (req, res) => {
    try {
      const flags = await storage.getAllFeatureFlags(req.tenantId);
      return res.json(flags);
    } catch (error) {
      console.error("Error fetching feature flags:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/feature-flags/:flagKey", requireAuth, async (req, res) => {
    try {
      const { enabled } = req.body;
      const flag = await storage.updateFeatureFlag(req.tenantId, req.params.flagKey, { enabled });
      return res.json(flag);
    } catch (error) {
      console.error("Error updating feature flag:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Public endpoint to check if a feature is enabled
  app.get("/api/public/feature-flags/:flagKey", async (req, res) => {
    try {
      const flag = await storage.getFeatureFlag(req.tenantId, req.params.flagKey);
      return res.json({ enabled: flag?.enabled ?? true });
    } catch (error) {
      console.error("Error fetching feature flag:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Configurable Assessment Response endpoints

  // POST /api/configurable-assessments/:id/submit - Submit assessment answers
  app.post("/api/configurable-assessments/:id/submit", async (req, res) => {
    try {
      const assessmentId = req.params.id;

      // Get the assessment config
      const config = await storage.getAssessmentConfigById(req.tenantId, assessmentId);
      if (!config) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      // Validate request body structure
      const submissionSchema = z.object({
        answers: z.array(z.object({
          questionId: z.string(),
          answerId: z.string()
        })),
        email: z.string().email().optional(),
        name: z.string().optional(),
        company: z.string().optional(),
      });

      const validationResult = submissionSchema.safeParse(req.body);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const { answers, email, name, company } = validationResult.data;

      // Generate unique session ID
      const sessionId = crypto.randomBytes(16).toString('hex');

      // Get all questions, answers, and buckets for scoring
      const questions = await storage.getQuestionsByAssessmentId(assessmentId);
      const allAnswers = await storage.getAnswersByAssessmentId(assessmentId);
      const buckets = await storage.getBucketsByAssessmentId(assessmentId);

      // Calculate final bucket based on scoring method
      let finalBucketKey: string | null = null;
      let finalScore: number | null = null;

      if (config.scoringMethod === "points-based") {
        finalBucketKey = calculatePointsBasedBucket(answers, allAnswers, buckets);
        // Calculate total score for display
        finalScore = answers.reduce((total, answer) => {
          const answerData = allAnswers.find(a => a.id === answer.answerId);
          return total + (answerData?.points || 0);
        }, 0);
      } else if (config.scoringMethod === "decision-tree") {
        if (!config.entryQuestionId) {
          return res.status(400).json({ error: "Decision tree assessment requires entry question" });
        }
        finalBucketKey = calculateDecisionTreeBucket(
          answers,
          questions,
          allAnswers,
          config.entryQuestionId
        );
      }

      if (!finalBucketKey) {
        return res.status(400).json({ error: "Unable to determine result bucket" });
      }

      // Create the response record
      const responseData = {
        assessmentConfigId: assessmentId,
        sessionId,
        answers: JSON.stringify(answers),
        finalScore,
        finalBucketKey,
        name: name || null,
        email: email || null,
        company: company || null,
        resultUrl: null,
      };

      const response = await storage.createConfigurableResponse(req.tenantId, responseData);

      // If email is provided (PRE_GATED or UNGATED with optional email), save to unified leads table
      if (email) {
        const lead = await storage.createLead(req.tenantId, {
          email,
          name: name || undefined,
          company: company || undefined,
          source: "configurable-assessment",
          pageUrl: req.headers.referer || `/assessments/${assessmentId}`,
          formData: JSON.stringify({
            assessmentId,
            sessionId,
            finalScore,
            finalBucketKey
          }),
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip,
        });

        // Send notification email to all users (don't await - run in background)
        sendLeadNotificationEmail(lead).catch(err =>
          console.error("Failed to send lead notification:", err)
        );
      }

      // Get the result bucket details
      const resultBucket = buckets.find(b => b.bucketKey === finalBucketKey);

      // Handle different gate behaviors
      if (config.gateBehavior === "UNGATED") {
        // Return full result immediately
        return res.json({
          sessionId,
          result: resultBucket,
          score: finalScore,
        });
      } else if (config.gateBehavior === "PRE_GATED") {
        // Email was required in submission, generate result URL and return result
        const resultUrl = `/assessments/results/${sessionId}`;
        await storage.updateConfigurableResponse(req.tenantId, sessionId, { resultUrl });

        return res.json({
          sessionId,
          resultUrl,
          result: resultBucket,
          score: finalScore,
        });
      } else if (config.gateBehavior === "POST_GATED") {
        // Return session ID only, require lead capture later
        return res.json({
          sessionId,
          bucketKey: finalBucketKey,
        });
      }

      return res.status(400).json({ error: "Invalid gate behavior" });
    } catch (error) {
      console.error("Error submitting assessment:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // PUT /api/configurable-assessments/sessions/:sessionId/capture-lead - Capture lead info
  app.put("/api/configurable-assessments/sessions/:sessionId/capture-lead", async (req, res) => {
    try {
      const { sessionId } = req.params;

      // Validate lead capture data
      const leadCaptureSchema = z.object({
        email: z.string().email("Valid email is required"),
        name: z.string().min(1, "Name is required"),
        company: z.string().optional(),
      });

      const validationResult = leadCaptureSchema.safeParse(req.body);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const { email, name, company } = validationResult.data;

      // Get existing response
      const response = await storage.getConfigurableResponseBySessionId(req.tenantId, sessionId);
      if (!response) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Generate result URL
      const resultUrl = `/assessments/results/${sessionId}`;

      // Update response with lead info and result URL
      const updatedResponse = await storage.updateConfigurableResponse(
        req.tenantId,
        sessionId,
        {
          email,
          name,
          company: company || null,
          resultUrl,
        }
      );

      // Save to unified leads table
      const lead = await storage.createLead(req.tenantId, {
        email,
        name,
        company: company || undefined,
        source: "configurable-assessment",
        pageUrl: req.headers.referer || `/assessments/${response.assessmentConfigId}`,
        formData: JSON.stringify({
          assessmentId: response.assessmentConfigId,
          sessionId,
          finalScore: response.finalScore,
          finalBucketKey: response.finalBucketKey
        }),
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      // Send notification email to all users (don't await - run in background)
      sendLeadNotificationEmail(lead).catch(err =>
        console.error("Failed to send lead notification:", err)
      );

      // Get the result bucket details
      const buckets = await storage.getBucketsByAssessmentId(response.assessmentConfigId);
      const resultBucket = buckets.find(b => b.bucketKey === response.finalBucketKey);

      return res.json({
        resultUrl,
        result: resultBucket,
        score: response.finalScore,
      });
    } catch (error) {
      console.error("Error capturing lead:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET /api/configurable-assessments/results/:sessionId - Public result page
  app.get("/api/configurable-assessments/results/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;

      // Get the response
      const response = await storage.getConfigurableResponseBySessionId(req.tenantId, sessionId);
      if (!response) {
        return res.status(404).json({ error: "Result not found" });
      }

      // Get assessment config
      const config = await storage.getAssessmentConfigById(req.tenantId, response.assessmentConfigId);
      if (!config) {
        return res.status(404).json({ error: "Assessment configuration not found" });
      }

      // Get the result bucket
      const buckets = await storage.getBucketsByAssessmentId(response.assessmentConfigId);
      const resultBucket = buckets.find(b => b.bucketKey === response.finalBucketKey);

      if (!resultBucket) {
        return res.status(404).json({ error: "Result bucket not found" });
      }

      return res.json({
        assessment: {
          title: config.title,
          description: config.description,
        },
        result: resultBucket,
        score: response.finalScore,
        submittedAt: response.createdAt,
      });
    } catch (error) {
      console.error("Error fetching result:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET /api/configurable-assessments/:id/responses - Admin submissions list
  app.get("/api/configurable-assessments/:id/responses", requireAuth, async (req, res) => {
    try {
      const assessmentId = req.params.id;

      // Parse filters from query params
      const filters: { startDate?: Date; endDate?: Date; bucketKey?: string } = {};

      if (req.query.startDate && typeof req.query.startDate === 'string') {
        filters.startDate = new Date(req.query.startDate);
      }

      if (req.query.endDate && typeof req.query.endDate === 'string') {
        filters.endDate = new Date(req.query.endDate);
      }

      if (req.query.bucketKey && typeof req.query.bucketKey === 'string') {
        filters.bucketKey = req.query.bucketKey;
      }

      // Get all responses for this assessment
      const responses = await storage.getAllConfigurableResponses(
        req.tenantId,
        assessmentId,
        filters
      );

      // Get buckets for enriching response data
      const buckets = await storage.getBucketsByAssessmentId(assessmentId);
      const bucketMap = new Map(buckets.map(b => [b.bucketKey, b.bucketName]));

      // Enrich responses with bucket names
      const enrichedResponses = responses.map(r => ({
        ...r,
        bucketName: bucketMap.get(r.finalBucketKey || '') || 'Unknown',
      }));

      return res.json(enrichedResponses);
    } catch (error) {
      console.error("Error fetching responses:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Event routes
  app.post("/api/events/track", async (req, res) => {
    try {
      const result = insertEventSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      // TENANT ISOLATION: Automatically assign tenantId from request
      const event = await storage.createEvent(req.tenantId, result.data);
      return res.status(201).json(event);
    } catch (error) {
      console.error("Error tracking event:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/events", requireAuth, async (req, res) => {
    try {
      const filters: { campaignId?: string; eventType?: string } = {};

      if (req.query.campaignId && typeof req.query.campaignId === 'string') {
        filters.campaignId = req.query.campaignId;
      }

      if (req.query.eventType && typeof req.query.eventType === 'string') {
        filters.eventType = req.query.eventType;
      }

      // TENANT ISOLATION: Only fetch events for authenticated user's tenant
      const events = await storage.getAllEvents(req.tenantId, filters);
      return res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Prompt Templates - GET all templates
  app.get("/api/ai-prompt-templates", async (req, res, next) => {
    try {
      const templates = await db.query.aiPromptTemplates.findMany({
        orderBy: (templates, { asc }) => [asc(templates.promptKey)],
      });
      res.json(templates);
    } catch (error) {
      next(error);
    }
  });

  // AI Prompt Templates - UPDATE template
  app.put("/api/ai-prompt-templates/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const [updated] = await db
        .update(aiPromptTemplates)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(aiPromptTemplates.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      next(error);
    }
  });


  // SEO health check
  app.use(seoHealthRouter);
  app.use(sitemapRouter);
  app.use(internalLinkingRouter);
  app.use(relatedContentRouter);
  app.use(analyticsRouter);

  return httpServer;
}