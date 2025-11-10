import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { DEFAULT_TENANT_ID } from "./middleware/tenant";
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
  assessmentResultBuckets,
  type InsertAssessmentResponse
} from "@shared/schema";
import { calculatePointsBasedBucket, calculateDecisionTreeBucket } from "./utils/assessment-scoring";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";
import { getBlueprintEmailHtml, getBlueprintEmailSubject } from "./email-templates";
import { sendGmailEmail } from "./utils/gmail-client";
import { sendLeadNotificationEmail } from "./utils/lead-notifications";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";

// Configure multer for PDF uploads
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/pdfs');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const pdfUpload = multer({
  storage: pdfStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Configure multer for image uploads
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/images');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const imageUpload = multer({
  storage: imageStorage,
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

  // PDF Upload endpoint
  app.post("/api/upload/pdf", requireAuth, pdfUpload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No PDF file uploaded" });
      }

      const pdfUrl = `/uploads/pdfs/${req.file.filename}`;
      return res.json({ url: pdfUrl });
    } catch (error) {
      console.error("Error uploading PDF:", error);
      return res.status(500).json({ error: "Failed to upload PDF" });
    }
  });

  // Image Upload endpoint
  app.post("/api/upload/image", requireAuth, imageUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file uploaded" });
      }

      const imageUrl = `/uploads/images/${req.file.filename}`;
      return res.json({ url: imageUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
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
              costPerMeeting, projectedDealsPerMonth, projectedLTVPerMonth, monthlyROI } = req.body;

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
        <div class="metric-label">Your Average 24-Month Client LTV</div>
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
        <div class="metric-value">${data.projectedLTVPerYear > 0 ? formatCurrency(data.projectedLTVPerYear) : '$0'}</div>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">Based on ${data.annualSQOs} meetings/year*<br><em>*December excluded for training</em></p>
      </div>
      
      <div class="highlight">
        <div class="metric-label" style="color: rgba(255,255,255,0.9);">Your Monthly ROI</div>
        <div class="highlight-value">${monthlyROI > 0 ? `${formatNumber(monthlyROI, 0)}x` : '0x'}</div>
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

  // Lead capture endpoint for GTM Audit requests
  app.post("/api/leads/audit-request", async (req, res) => {
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
      const testimonial = await storage.createTestimonial(req.tenantId, result.data);
      return res.status(201).json(testimonial);
    } catch (error) {
      console.error("Error creating testimonial:", error);
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
      const job = await storage.createJobPosting(req.tenantId, result.data);
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
          bucket = await calculatePointsBasedBucket(submittedData, answers, buckets);

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

      const events = await storage.getAllEvents(req.tenantId, filters);
      return res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}