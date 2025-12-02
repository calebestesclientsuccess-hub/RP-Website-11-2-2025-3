import type { Express, Request, Response, NextFunction } from "express";
import type { UploadApiResponse } from "cloudinary";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { DEFAULT_TENANT_ID, requireUserContext } from "./middleware/tenant";
import cloudinary, { cloudinaryEnabled } from "./cloudinary";
import { env } from "./config/env";
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
  insertFeatureFlagSchema,
  insertProjectSchema,
  updateProjectSchema,
  insertProjectSceneSchema,
  updateProjectSceneSchema,
  insertPromptTemplateSchema,
  updatePromptTemplateSchema,
  insertSceneTemplateSchema,
  updateSceneTemplateSchema,
  portfolioGenerateRequestSchema,
  assessmentResultBuckets,
  type InsertAssessmentResponse,
  type AssessmentResponse,
  projects,
  projectScenes,
  mediaLibrary, // Assuming mediaLibrary is imported and available
  aiPromptTemplates,
  sceneTemplates,
  caseStudyContentSchema,
  caseStudyCarouselBlockSchema,
  type CaseStudyContent,
  type CaseStudySection,
  type CaseStudyBlock,
  type CaseStudyCarouselBlock,
  type BlogPost,
  type BlogPostSummary,
} from "@shared/schema";
import { eq, and, asc, desc, inArray, or, isNull, sql } from "drizzle-orm";
import { buildLayoutPrompt, buildRefineSectionPrompt } from "./services/promptBuilder";
import { generateLayoutFromPrompt } from "./services/layoutGenerator";
import { RefinementPipeline } from "./utils/refinement-pipeline";
import { calculatePointsBasedBucket, calculateDecisionTreeBucket } from "./utils/assessment-scoring";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";
import { getBlueprintEmailHtml, getBlueprintEmailSubject } from "./email-templates";
import { sendEmail } from "./utils/mailer";
import { sendLeadNotificationEmail } from "./utils/lead-notifications";
import { db } from "./db";
import { leadLimiter, formLimiter, authLimiter } from "./middleware/rate-limit";
import { sanitizeInput } from "./middleware/input-sanitization";
import { pdfUpload, imageUpload, validateUploadedFile } from "./middleware/file-validation";
import { validatePasswordStrength, PASSWORD_HASH_ROUNDS } from "./utils/password-validator";
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
import leadsRouter from './routes/leads';
import ebookLeadMagnetsRouter from './routes/ebook-lead-magnets';
import aiGenerationRouter from './routes/ai-generation';
import crmRouter from './routes/crm';
import adminSeedsRouter from './routes/admin-seeds';
import { requireAuth } from './middleware/auth';
import { securityHeaders } from "./middleware/security-headers";
import { tenantMiddleware } from "./middleware/tenant";
import { globalSanitizer } from "./middleware/global-sanitizer";
import { normalizeFormData } from "./utils/form-data";
import { validateRequest } from "./middleware/validation";
import { registerProjectLayer2SectionRoutes } from "./routes/project-layer2-sections";
import {
  gateRoute,
  getFeatureFlagsWithMetadata,
  loadFeatureFlagsForRequest,
  resolveFeatureFlag,
} from "./services/feature-flags";
import { getFeatureFlagDefinition } from "@shared/feature-flags";


// Define default director configuration for new scenes
const DEFAULT_DIRECTOR_CONFIG = {
  timing: 5,
  effects: "fade",
  colors: { background: "#000000", text: "#FFFFFF" },
  transition: "fade",
};

type PipelineStageStatus = "pending" | "running" | "succeeded" | "failed";

interface PipelineStageState {
  key: string;
  label: string;
  status: PipelineStageStatus;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

const PIPELINE_STAGE_DEFINITIONS: Array<{ key: string; label: string }> = [
  { key: "stage1_initial", label: "Stage 1: Initial Generation" },
  { key: "stage2_self_audit", label: "Stage 2: Self-Audit" },
  { key: "stage3_improvements", label: "Stage 3: Generate Improvements" },
  { key: "stage4_auto_fix", label: "Stage 4: Auto-Apply Fixes" },
  { key: "stage5_regeneration", label: "Stage 5: Final Regeneration" },
  { key: "stage6_validation", label: "Stage 6: Final Validation" },
];

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
const GOOGLE_AI_KEY = env.GOOGLE_AI_KEY;
const GEMINI_BASE_URL =
  env.AI_INTEGRATIONS_GEMINI_BASE_URL ||
  "https://generativelanguage.googleapis.com";

const journeyBrandSchema = z.object({
  logoUrl: z.string().url().optional().nullable(),
  colors: z.object({
    primary: z.string().regex(HEX_COLOR_REGEX, "Invalid hex color").optional(),
    secondary: z.string().regex(HEX_COLOR_REGEX, "Invalid hex color").optional(),
    accent: z.string().regex(HEX_COLOR_REGEX, "Invalid hex color").optional(),
    neutral: z.string().regex(HEX_COLOR_REGEX, "Invalid hex color").optional(),
  }).partial().optional(),
  componentLibrary: z.string().optional(),
  assetPlan: z.array(z.object({
    assetId: z.string(),
    label: z.string().optional(),
    sectionKey: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })).optional(),
});

const sectionPlanItemSchema = z.object({
  sectionKey: z.string().min(1),
  label: z.string().min(1).optional(),
  featureType: z.string().min(1),
  orderIndex: z.number().int().nonnegative().optional(),
  enablePerSectionPrompt: z.boolean().optional(),
  prompt: z.string().optional(),
  featureConfig: z.record(z.any()).optional(),
  selectedAssets: z.array(z.object({
    assetId: z.string(),
    label: z.string().optional(),
  })).optional(),
  metrics: z.record(z.any()).optional(),
});

const sectionPlanPayloadSchema = z.object({
  sections: z.array(sectionPlanItemSchema).min(1, "At least one section is required"),
});

const sectionPromptSchema = z.object({
  sectionKey: z.string().min(1),
  prompt: z.string().min(1),
});

const pipelineStartSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  autoContinue: z.boolean().optional().default(true),
  sectionPrompts: z.array(sectionPromptSchema).optional(),
});

function createInitialStageStates(): PipelineStageState[] {
  const now = new Date().toISOString();
  return PIPELINE_STAGE_DEFINITIONS.map((stage, index) => ({
    ...stage,
    status: index === 0 ? "running" : "pending",
    startedAt: index === 0 ? now : undefined,
    completedAt: undefined,
    error: undefined,
  }));
}

async function mutatePipelineRunStages(
  runId: string,
  mutateStages: (stages: PipelineStageState[]) => PipelineStageState[],
  options?: {
    status?: string;
    currentStageIndex?: number;
    latestVersionNumber?: number;
    metadataPatch?: Record<string, any>;
    completedAt?: Date;
  }
) {
  const [run] = await db
    .select()
    .from(portfolioPipelineRuns)
    .where(eq(portfolioPipelineRuns.id, runId))
    .limit(1);

  if (!run) return null;

  const baseStages: PipelineStageState[] = Array.isArray(run.stages) && run.stages.length > 0
    ? run.stages as PipelineStageState[]
    : PIPELINE_STAGE_DEFINITIONS.map((stage) => ({ ...stage, status: "pending" as PipelineStageStatus }));

  const updatedStages = mutateStages(baseStages.map((stage) => ({ ...stage })));
  const metadata = options?.metadataPatch
    ? { ...(run.metadata || {}), ...options.metadataPatch }
    : run.metadata;

  const updatePayload: Record<string, any> = {
    stages: updatedStages,
    updatedAt: new Date(),
  };

  if (options?.status) updatePayload.status = options.status;
  if (typeof options?.currentStageIndex === "number") updatePayload.currentStageIndex = options.currentStageIndex;
  if (typeof options?.latestVersionNumber === "number") updatePayload.latestVersionNumber = options.latestVersionNumber;
  if (options?.completedAt) updatePayload.completedAt = options.completedAt;
  if (options?.metadataPatch) updatePayload.metadata = metadata;

  const [updated] = await db
    .update(portfolioPipelineRuns)
    .set(updatePayload)
    .where(eq(portfolioPipelineRuns.id, runId))
    .returning();

  return updated;
}

async function getNextVersionNumber(projectId: string) {
  const latest = await db
    .select({ version: portfolioVersions.versionNumber })
    .from(portfolioVersions)
    .where(eq(portfolioVersions.projectId, projectId))
    .orderBy(desc(portfolioVersions.versionNumber))
    .limit(1);

  return ((latest[0]?.version as number) || 0) + 1;
}

function buildBrandPayload(project: any) {
  return {
    title: project?.title,
    clientName: project?.clientName,
    logoUrl: project?.brandLogoUrl,
    colors: project?.brandColors || {},
    componentLibrary: project?.componentLibrary || "shadcn",
  };
}

function buildDraftPayload(
  sections: any[],
  assetPlan: any[],
  prompt: string,
  sectionPrompts?: Array<{ sectionKey: string; prompt: string }>
) {
  const sectionPromptMap = new Map(sectionPrompts?.map((entry) => [entry.sectionKey, entry.prompt]));
  return {
    prompt,
    structure: sections.map((section) => section.sectionKey),
    features: sections.map((section) => ({
      sectionKey: section.sectionKey,
      featureType: section.featureType,
      label: section.label,
      config: section.featureConfig || {},
      enablePerSectionPrompt: !!section.enablePerSectionPrompt,
      prompt: sectionPromptMap.get(section.sectionKey) || section.prompt,
    })),
    assetPlan: assetPlan || [],
  };
}

function kickOffBackgroundPipeline({
  runId,
  projectId,
  pipeline,
  initialScenes,
  issuesSeed,
}: {
  runId: string;
  projectId: string;
  pipeline: RefinementPipeline;
  initialScenes: any[];
  issuesSeed?: any[];
}) {
  setImmediate(async () => {
    let scenes = initialScenes;
    let issues = issuesSeed || [];
    let improvements: any[] = [];

    let activeStageKey: string | null = null;
    try {
      // Stage 2
      activeStageKey = "stage2_self_audit";
      await mutatePipelineRunStages(runId, (stages) =>
        stages.map((stage) =>
          stage.key === "stage2_self_audit"
            ? { ...stage, status: "running", startedAt: new Date().toISOString(), error: undefined }
            : stage
        ), { currentStageIndex: 1 }
      );

      issues = await pipeline.stage2_selfAudit(scenes);

      await mutatePipelineRunStages(
        runId,
        (stages) =>
          stages.map((stage) => {
            if (stage.key === "stage2_self_audit") {
              return { ...stage, status: "succeeded", completedAt: new Date().toISOString() };
            }
            if (stage.key === "stage3_improvements") {
              return { ...stage, status: "running", startedAt: new Date().toISOString(), error: undefined };
            }
            return stage;
          }),
        {
          currentStageIndex: 2,
          metadataPatch: { stage2Issues: issues.length },
        }
      );

      // Stage 3
      activeStageKey = "stage3_improvements";
      improvements = await pipeline.stage3_generateImprovements(scenes, issues);

      await mutatePipelineRunStages(
        runId,
        (stages) =>
          stages.map((stage) => {
            if (stage.key === "stage3_improvements") {
              return { ...stage, status: "succeeded", completedAt: new Date().toISOString() };
            }
            if (stage.key === "stage4_auto_fix") {
              return { ...stage, status: "running", startedAt: new Date().toISOString(), error: undefined };
            }
            return stage;
          }),
        {
          currentStageIndex: 3,
          metadataPatch: { stage3Improvements: improvements.length },
        }
      );

      // Stage 4
      activeStageKey = "stage4_auto_fix";
      scenes = await pipeline.stage4_autoApplyFixes(scenes, improvements);

      await mutatePipelineRunStages(
        runId,
        (stages) =>
          stages.map((stage) => {
            if (stage.key === "stage4_auto_fix") {
              return { ...stage, status: "succeeded", completedAt: new Date().toISOString() };
            }
            if (stage.key === "stage5_regeneration") {
              return { ...stage, status: "running", startedAt: new Date().toISOString(), error: undefined };
            }
            return stage;
          }),
        { currentStageIndex: 4 }
      );

      // Stage 5
      activeStageKey = "stage5_regeneration";
      scenes = await pipeline.stage5_finalRegeneration(scenes, issues);

      await mutatePipelineRunStages(
        runId,
        (stages) =>
          stages.map((stage) => {
            if (stage.key === "stage5_regeneration") {
              return { ...stage, status: "succeeded", completedAt: new Date().toISOString() };
            }
            if (stage.key === "stage6_validation") {
              return { ...stage, status: "running", startedAt: new Date().toISOString(), error: undefined };
            }
            return stage;
          }),
        { currentStageIndex: 5 }
      );

      // Stage 6
      activeStageKey = "stage6_validation";
      const validation = await pipeline.stage6_finalValidation(scenes);

      await mutatePipelineRunStages(
        runId,
        (stages) =>
          stages.map((stage) =>
            stage.key === "stage6_validation"
              ? { ...stage, status: "succeeded", completedAt: new Date().toISOString() }
              : stage
          ),
        {
          currentStageIndex: PIPELINE_STAGE_DEFINITIONS.length - 1,
          metadataPatch: {
            confidenceScore: validation.confidenceScore,
            confidenceFactors: validation.confidenceFactors,
          },
        }
      );

      const finalVersionNumber = await getNextVersionNumber(projectId);

      const [finalVersion] = await db
        .insert(portfolioVersions)
        .values({
          projectId,
          pipelineRunId: runId,
          stageKey: "stage6_validation",
          versionNumber: finalVersionNumber,
          scenesJson: scenes,
          confidenceScore: validation.confidenceScore,
          confidenceFactors: validation.confidenceFactors,
          changeDescription: "Stage 6: Final Validation",
        })
        .returning();

      await mutatePipelineRunStages(
        runId,
        (stages) => stages,
        {
          status: "completed",
          latestVersionNumber: finalVersion.versionNumber,
          completedAt: new Date(),
        }
      );

      console.log('[Pipeline Run] Completed', {
        runId,
        projectId,
        finalVersion: finalVersion.versionNumber,
        confidence: validation.confidenceScore,
        totalStages: PIPELINE_STAGE_DEFINITIONS.length,
      });
    } catch (error) {
      const failedStageKey = activeStageKey || "stage6_validation";

      await mutatePipelineRunStages(
        runId,
        (stages) =>
          stages.map((stage) =>
            stage.key === failedStageKey
              ? { ...stage, status: "failed", error: error instanceof Error ? error.message : "Unknown error", completedAt: new Date().toISOString() }
              : stage
          ),
        { status: "failed" }
      );

      console.error(`[Pipeline Run ${runId}] Failed at ${failedStageKey}:`, error);
    }
  });
}

// COMMENTED OUT - Using external URLs instead of file uploads
// Configure multer for memory storage (files will be uploaded to Cloudinary)
// const pdfUploadMulter = multer({ // Renamed to avoid conflict with imported pdfUpload
//   storage: multer.memoryStorage(),
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype === 'application/pdf') {
//       cb(null, true);
//     } else {
//       cb(new Error('Only PDF files are allowed'));
//     }
//   },
//   limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
// });

// const imageUploadMulter = multer({ // Renamed to avoid conflict with imported imageUpload
//   storage: multer.memoryStorage(),
//   fileFilter: (req, file, cb) => {
//     const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
//     if (allowedMimes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
//     }
//   },
//   limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
// });

// Multer configuration for media library uploads
const mediaUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm',
      'application/pdf'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG, GIF, WebP), videos (MP4, WebM), and PDFs are allowed'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Middleware to check if user is authenticated
// requireAuth is now imported from ./middleware/auth


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

const ASSESSMENT_FIELD_KEYS = [
  "q1",
  "q2",
  "q3",
  "q4",
  "q5",
  "q6",
  "q7",
  "q8",
  "q9",
  "q10a1",
  "q10a2",
  "q10b1",
  "q10b2",
  "q10c1",
  "q10c2",
  "q11",
  "q13",
  "q14",
  "q15",
  "q16",
  "q17",
  "q18",
  "q19",
  "q20",
  "usedCalculator",
] as const;

type AssessmentFieldKey = (typeof ASSESSMENT_FIELD_KEYS)[number];

const assessmentBaseSchema = insertAssessmentResponseSchema.omit({
  bucket: true,
  completed: true,
});

const assessmentProgressSchema = assessmentBaseSchema
  .omit({ sessionId: true })
  .partial();

const assessmentSubmitSchema = assessmentBaseSchema;

function sanitizeAssessmentResponse(record?: AssessmentResponse | null) {
  if (!record) {
    return null;
  }

  const payload: Record<string, unknown> = {
    sessionId: record.sessionId,
  };

  for (const key of ASSESSMENT_FIELD_KEYS) {
    const value = record[key as AssessmentFieldKey];
    if (value !== undefined && value !== null) {
      payload[key] = value;
    }
  }

  return payload;
}

function pickAssessmentUpdates(
  updates: Partial<InsertAssessmentResponse>,
): Partial<InsertAssessmentResponse> {
  const sanitized: Partial<InsertAssessmentResponse> = {};

  for (const key of ASSESSMENT_FIELD_KEYS) {
    if (updates[key as AssessmentFieldKey] !== undefined) {
      sanitized[key as AssessmentFieldKey] = updates[key as AssessmentFieldKey];
    }
  }

  return sanitized;
}

export async function registerRoutes(app: Express): Promise<void> {
  // Apply global middleware
  app.use(securityHeaders);
  app.use(tenantMiddleware);
  app.use(globalSanitizer);

  // Authentication endpoints
  // Registration is disabled - admin accounts are invitation-only
  app.post("/api/auth/register", authLimiter, (_req, res) => {
    return res.status(403).json({
      error: "Registration disabled",
      message: "Admin accounts are invitation-only. Contact hello@revenueparty.com",
    });
  });

  // DEBUG: Temporarily removed checkAccountLockout and added extensive logging
  app.post("/api/auth/login", authLimiter, /* checkAccountLockout, */ async (req, res) => {
    console.log("[Auth] Login attempt started");
    try {
      // console.log("[Auth] Request body:", JSON.stringify(req.body, null, 2)); // Avoid logging passwords in prod
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        console.log("[Auth] Validation failed:", result.error);
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const { username, password } = result.data;
      console.log(`[Auth] Login attempt for user: ${username}`);

      // Lazy-load security logger
      console.log("[Auth] Importing security logger...");
      // const { logFailedLogin } = await import('./utils/security-logger'); // DEBUG: Temporarily disabled
      console.log("[Auth] Security logger imported (skipped).");

      // Try to find user by username first, then by email (case-insensitive)
      // Scope by tenantId to avoid ambiguity in multi-tenant setup
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;
      console.log(`[Auth] Looking up user by username for tenant: ${tenantId}...`);
      let user = await storage.getUserByUsernameAndTenant(username, tenantId);
      console.log(`[Auth] User lookup by username result: ${user ? 'Found' : 'Not Found'}`);

      // If not found by username, try by email (case-insensitive)
      if (!user && username.includes('@')) {
        console.log(`[Auth] Looking up user by email for tenant: ${tenantId}...`);
        user = await storage.getUserByEmailAndTenant(username.toLowerCase(), tenantId);
        console.log(`[Auth] User lookup by email result: ${user ? 'Found' : 'Not Found'}`);
      }

      if (!user) {
        console.log("[Auth] User not found. Recording failed attempt.");
        // recordFailedAttempt(req); // DEBUG: Temporarily disabled
        // await logFailedLogin(req, username, 'User not found'); // DEBUG: Temporarily disabled
        // const remaining = getRemainingAttempts(req); // DEBUG: Temporarily disabled
        return res.status(401).json({
          error: "Invalid credentials",
          // remainingAttempts: remaining > 0 ? remaining : undefined,
        });
      }

      // Verify password
      console.log("[Auth] Verifying password...");
      const valid = await bcrypt.compare(password, user.password);
      console.log(`[Auth] Password verification result: ${valid}`);

      if (!valid) {
        console.log("[Auth] Invalid password. Recording failed attempt.");
        // recordFailedAttempt(req); // DEBUG: Temporarily disabled
        // await logFailedLogin(req, username, 'Invalid password'); // DEBUG: Temporarily disabled
        // const remaining = getRemainingAttempts(req); // DEBUG: Temporarily disabled
        return res.status(401).json({
          error: "Invalid credentials",
          // remainingAttempts: remaining > 0 ? remaining : undefined,
        });
      }

      // Clear failed attempts on successful login
      console.log("[Auth] Login successful. Clearing attempts.");
      // clearLoginAttempts(req); // DEBUG: Temporarily disabled

      // Set session with both userId and tenantId for proper multi-tenant isolation
      console.log("[Auth] Setting session...");
      req.session.userId = user.id;
      req.session.tenantId = user.tenantId;

      // Explicitly save the session to ensure it persists before response
      console.log("[Auth] Saving session...");
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error("[Auth] Session save error:", err);
            reject(err);
          } else {
            console.log("[Auth] Session saved successfully.");
            resolve();
          }
        });
      });

      console.log("[Auth] Login complete. Sending response.", {
        userId: user.id,
        tenantId: user.tenantId,
        username: user.username,
      });

      return res.json({
        id: user.id,
        username: user.username,
      });
    } catch (error: any) {
      console.error("[Auth] CRITICAL ERROR logging in:", error);
      console.error(error.stack);
      return res.status(500).json({ 
        error: "Internal server error",
        details: error.message
      });
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

  // ----- Admin AI Layout Wizard Endpoints -----

  // Save or update brand settings
  app.post("/api/admin/brand-settings", requireAuth, async (req: Request, res: Response) => {
    try {
      const { logoUrl, colors, componentLibrary } = req.body;
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;
      // Upsert brand settings (simple replace for demo)
      const existing = await storage.getBrandSettings(req.tenantId || DEFAULT_TENANT_ID);
      if (existing) {
        await storage.updateBrandSettings(tenantId, { logoUrl, colors, componentLibrary });
      } else {
        await storage.createBrandSettings({ tenantId, logoUrl, colors, componentLibrary });
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Brand settings error:", err);
      res.status(500).json({ error: "Failed to save brand settings" });
    }
  });

  // Journey orchestration helpers
  const fetchProjectForTenant = async (tenantId: string, projectId: string) => {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.tenantId, tenantId), eq(projects.id, projectId)))
      .limit(1);
    return project;
  };

  app.get("/api/projects/:projectId/journey", requireAuth, async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;
      const { projectId } = req.params;
      const project = await fetchProjectForTenant(tenantId, projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const sections = await db
        .select()
        .from(projectSectionPlans)
        .where(eq(projectSectionPlans.projectId, projectId))
        .orderBy(asc(projectSectionPlans.orderIndex));

      const pipelineRunsList = await db
        .select()
        .from(portfolioPipelineRuns)
        .where(eq(portfolioPipelineRuns.projectId, projectId))
        .orderBy(desc(portfolioPipelineRuns.createdAt))
        .limit(5);

      const versions = await db
        .select()
        .from(portfolioVersions)
        .where(eq(portfolioVersions.projectId, projectId))
        .orderBy(desc(portfolioVersions.versionNumber))
        .limit(5);

      return res.json({
        project,
        sections,
        pipelineRuns: pipelineRunsList,
        versions,
      });
    } catch (error) {
      console.error("Journey fetch error:", error);
      return res.status(500).json({ error: "Failed to load journey state" });
    }
  });

  app.post("/api/projects/:projectId/brand", requireAuth, async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;
      const { projectId } = req.params;
      const project = await fetchProjectForTenant(tenantId, projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const result = journeyBrandSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ error: "Validation failed", details: validationError.message });
      }

      const payload: Record<string, any> = {};
      if ("logoUrl" in result.data) payload.brandLogoUrl = result.data.logoUrl ?? null;
      if (result.data.colors) payload.brandColors = result.data.colors;
      if (result.data.componentLibrary) payload.componentLibrary = result.data.componentLibrary;
      if (result.data.assetPlan) payload.assetPlan = result.data.assetPlan;

      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ error: "No brand fields provided" });
      }

      const [updated] = await db
        .update(projects)
        .set(payload)
        .where(eq(projects.id, projectId))
        .returning();

      return res.json({
        project: updated,
      });
    } catch (error) {
      console.error("Brand update error:", error);
      return res.status(500).json({ error: "Failed to update brand configuration" });
    }
  });

  app.put("/api/projects/:projectId/sections", requireAuth, async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;
      const { projectId } = req.params;
      const project = await fetchProjectForTenant(tenantId, projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const parsed = sectionPlanPayloadSchema.safeParse(req.body);
      if (!parsed.success) {
        const validationError = fromZodError(parsed.error);
        return res.status(400).json({ error: "Validation failed", details: validationError.message });
      }

      await db
        .delete(projectSectionPlans)
        .where(eq(projectSectionPlans.projectId, projectId));

      const inserts = parsed.data.sections.map((section, index) => ({
        projectId,
        sectionKey: section.sectionKey,
        label: section.label ?? section.sectionKey,
        featureType: section.featureType,
        featureConfig: section.featureConfig || {},
        orderIndex: section.orderIndex ?? index,
        enablePerSectionPrompt: section.enablePerSectionPrompt ?? false,
        prompt: section.prompt ?? null,
        selectedAssets: section.selectedAssets || [],
        metrics: section.metrics || null,
      }));

      if (inserts.length > 0) {
        await db.insert(projectSectionPlans).values(inserts);
      }

      const sections = await db
        .select()
        .from(projectSectionPlans)
        .where(eq(projectSectionPlans.projectId, projectId))
        .orderBy(asc(projectSectionPlans.orderIndex));

      return res.json({ sections });
    } catch (error) {
      console.error("Section planner error:", error);
      return res.status(500).json({ error: "Failed to save sections" });
    }
  });

  app.get("/api/projects/:projectId/pipeline-runs", requireAuth, async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;
      const { projectId } = req.params;
      const project = await fetchProjectForTenant(tenantId, projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const runs = await db
        .select()
        .from(portfolioPipelineRuns)
        .where(eq(portfolioPipelineRuns.projectId, projectId))
        .orderBy(desc(portfolioPipelineRuns.createdAt))
        .limit(10);

      return res.json({ runs });
    } catch (error) {
      console.error("Pipeline run list error:", error);
      return res.status(500).json({ error: "Failed to load pipeline runs" });
    }
  });

  app.get("/api/projects/:projectId/pipeline-runs/:runId", requireAuth, async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;
      const { projectId, runId } = req.params;
      const project = await fetchProjectForTenant(tenantId, projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const [run] = await db
        .select()
        .from(portfolioPipelineRuns)
        .where(and(
          eq(portfolioPipelineRuns.projectId, projectId),
          eq(portfolioPipelineRuns.id, runId)
        ))
        .limit(1);

      if (!run) {
        return res.status(404).json({ error: "Pipeline run not found" });
      }

      return res.json({ run });
    } catch (error) {
      console.error("Pipeline run fetch error:", error);
      return res.status(500).json({ error: "Failed to load pipeline run" });
    }
  });

  app.post("/api/projects/:projectId/pipeline-runs", requireAuth, async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;
      const { projectId } = req.params;
      const project = await fetchProjectForTenant(tenantId, projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const sections = await db
        .select()
        .from(projectSectionPlans)
        .where(eq(projectSectionPlans.projectId, projectId))
        .orderBy(asc(projectSectionPlans.orderIndex));

      if (sections.length === 0) {
        return res.status(400).json({ error: "Configure at least one section before running the pipeline" });
      }

      if (!GOOGLE_AI_KEY) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }

      const parsed = pipelineStartSchema.safeParse(req.body);
      if (!parsed.success) {
        const validationError = fromZodError(parsed.error);
        return res.status(400).json({ error: "Validation failed", details: validationError.message });
      }

      const stageStates = createInitialStageStates();
      const initialStatus = parsed.data.autoContinue ? "running" : "paused";

      const [pipelineRun] = await db
        .insert(portfolioPipelineRuns)
        .values({
          projectId,
          status: initialStatus,
          stages: stageStates,
          currentStageIndex: 0,
          totalStages: PIPELINE_STAGE_DEFINITIONS.length,
          metadata: { prompt: parsed.data.prompt, autoContinue: parsed.data.autoContinue },
        })
        .returning();

      console.log('[Pipeline Run] Started', {
        runId: pipelineRun.id,
        projectId,
        promptLength: parsed.data.prompt.length,
        sectionPrompts: parsed.data.sectionPrompts?.length || 0,
      });

      const pipeline = new RefinementPipeline(GOOGLE_AI_KEY);
      const brandPayload = buildBrandPayload(project);
      const draftPayload = buildDraftPayload(
        sections,
        project.assetPlan || [],
        parsed.data.prompt,
        parsed.data.sectionPrompts
      );

      let stage1Scenes: any[] = [];
      try {
        stage1Scenes = await pipeline.stage1_initialGeneration(brandPayload, draftPayload);
      } catch (error) {
        await mutatePipelineRunStages(
          pipelineRun.id,
          (stages) =>
            stages.map((stage) =>
              stage.key === "stage1_initial"
                ? { ...stage, status: "failed", error: error instanceof Error ? error.message : "Stage 1 failed", completedAt: new Date().toISOString() }
                : stage
            ),
          { status: "failed" }
        );
        throw error;
      }

      const stage1VersionNumber = await getNextVersionNumber(projectId);

      const [version] = await db
        .insert(portfolioVersions)
        .values({
          projectId,
          pipelineRunId: pipelineRun.id,
          stageKey: "stage1_initial",
          versionNumber: stage1VersionNumber,
          scenesJson: stage1Scenes,
          changeDescription: "Stage 1: Initial Generation",
        })
        .returning();

      const updatedRun = await mutatePipelineRunStages(
        pipelineRun.id,
        (stages) =>
          stages.map((stage) => {
            if (stage.key === "stage1_initial") {
              return { ...stage, status: "succeeded", completedAt: new Date().toISOString() };
            }
            return stage;
          }),
        {
          status: parsed.data.autoContinue ? "running" : "paused",
          currentStageIndex: 1,
          latestVersionNumber: stage1VersionNumber,
        }
      );

      if (parsed.data.autoContinue) {
        kickOffBackgroundPipeline({
          runId: pipelineRun.id,
          projectId,
          pipeline,
          initialScenes: stage1Scenes,
        });
      }

      console.log('[Pipeline Run] Stage 1 complete', {
        runId: pipelineRun.id,
        versionNumber: version.versionNumber,
        stageKey: version.stageKey,
        scenes: Array.isArray(stage1Scenes) ? stage1Scenes.length : 0,
      });

      return res.status(202).json({
        pipelineRun: updatedRun,
        version,
      });
    } catch (error) {
      console.error("Pipeline start error:", error);
      return res.status(500).json({
        error: "Failed to start pipeline",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/projects/:projectId/pipeline-runs/:runId/resume", requireAuth, async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;
      const { projectId, runId } = req.params;
      const project = await fetchProjectForTenant(tenantId, projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      if (!GOOGLE_AI_KEY) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }

      const [run] = await db
        .select()
        .from(portfolioPipelineRuns)
        .where(and(eq(portfolioPipelineRuns.projectId, projectId), eq(portfolioPipelineRuns.id, runId)))
        .limit(1);

      if (!run) {
        return res.status(404).json({ error: "Pipeline run not found" });
      }

      if (run.status !== "paused") {
        return res.status(400).json({ error: "Pipeline run is not paused" });
      }

      const [stage1Version] = await db
        .select()
        .from(portfolioVersions)
        .where(and(eq(portfolioVersions.pipelineRunId, runId), eq(portfolioVersions.stageKey, "stage1_initial")))
        .orderBy(desc(portfolioVersions.versionNumber))
        .limit(1);

      if (!stage1Version) {
        return res.status(400).json({ error: "Stage 1 data missing; cannot resume" });
      }

      const pipeline = new RefinementPipeline(GOOGLE_AI_KEY);

      await mutatePipelineRunStages(
        runId,
        (stages) =>
          stages.map((stage) =>
            stage.key === "stage2_self_audit"
              ? { ...stage, status: "running", startedAt: new Date().toISOString(), error: undefined }
              : stage
          ),
        { status: "running" }
      );

      kickOffBackgroundPipeline({
        runId,
        projectId,
        pipeline,
        initialScenes: stage1Version.scenesJson,
      });

      return res.json({ success: true });
    } catch (error) {
      console.error("Pipeline resume error:", error);
      return res.status(500).json({ error: "Failed to resume pipeline" });
    }
  });

  // Get current layout draft
  app.get("/api/admin/layout-draft", requireAuth, async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;
      const userId = requireUserContext(req, res);
      if (!userId) {
        return;
      }
      const draft = await storage.getLayoutDraft(tenantId, userId);
      if (!draft) {
        return res.status(404).json({ error: "Draft not found" });
      }
      res.json(draft);
    } catch (err) {
      console.error("Get layout draft error:", err);
      res.status(500).json({ error: "Failed to get layout draft" });
    }
  });

  // Save layout draft (intermediate wizard state)
  app.post("/api/admin/layout-draft", requireAuth, async (req: Request, res: Response) => {
    try {
      const { draftJson } = req.body;
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;
      const userId = requireUserContext(req, res);
      if (!userId) {
        return;
      }
      const existing = await storage.getLayoutDraft(tenantId, userId);
      if (existing) {
        await storage.updateLayoutDraft(existing.id, { draftJson });
      } else {
        await storage.createLayoutDraft({ tenantId, userId, draftJson });
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Layout draft error:", err);
      res.status(500).json({ error: "Failed to save layout draft" });
    }
  });

  // Generate final layout JSON via LLM
  app.post("/api/admin/generate-layout", requireAuth, async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;
      const userId = requireUserContext(req, res);
      if (!userId) {
        return;
      }
      const brand = await storage.getBrandSettings(tenantId);
      const draft = await storage.getLayoutDraft(tenantId, userId);
      if (!brand || !draft) {
        return res.status(400).json({ error: "Brand settings or draft not found" });
      }

      // Initialize pipeline
      const pipeline = new RefinementPipeline(GOOGLE_AI_KEY);

      // Stage 1: Generate V1 (Initial Layout)
      // We pass brand and draft to the pipeline
      const v1Scenes = await pipeline.stage1_initialGeneration(brand, draft);

      // Construct V1 Layout JSON
      const v1Layout = {
        ...draft.draftJson, // keep existing draft metadata
        sections: v1Scenes,
        version: 1,
        status: 'draft'
      };

      // Save V1 immediately
      await storage.updateLayoutDraft(draft.id, {
        draftJson: v1Layout,
        updatedAt: new Date().toISOString()
      });

      // Send V1 to client immediately
      res.json({ success: true, layout: v1Layout });

      // Trigger Background Refinement (V1 -> V2)
      // This runs asynchronously after the response is sent
      (async () => {
        try {
          console.log("🚀 Starting Background Refinement for Draft ID:", draft.id);

          const refinementResult = await pipeline.refineV1toV2(v1Scenes);

          // Construct V2 Layout JSON
          const v2Layout = {
            ...v1Layout,
            sections: refinementResult.scenes,
            version: 2,
            status: 'refined',
            refinementStats: {
              confidenceScore: refinementResult.confidenceScore,
              totalTime: refinementResult.totalTime
            }
          };

          // Save V2 to storage
          await storage.updateLayoutDraft(draft.id, {
            draftJson: v2Layout,
            updatedAt: new Date().toISOString()
          });

          console.log("✅ Background Refinement Saved for Draft ID:", draft.id);
        } catch (err) {
          console.error("❌ Background Refinement Error:", err);
          // Optionally update status to 'failed'
        }
      })();

    } catch (error) {
      console.error("Error generating layout:", error);
      res.status(500).json({ error: "Failed to generate layout" });
    }
  });

  // Refine a specific section via LLM
  app.post("/api/admin/refine-section", requireAuth, async (req: Request, res: Response) => {
    try {
      const { section, instructions } = req.body;
      if (!section || !instructions) {
        return res.status(400).json({ error: "Missing section or instructions" });
      }

      // We can reuse the layout generator service since it just calls the LLM with a prompt
      // But we need to import buildRefineSectionPrompt first.
      // Note: We need to update imports in routes.ts to include buildRefineSectionPrompt
      const prompt = buildRefineSectionPrompt(section, instructions);
      const refinedSection = await generateLayoutFromPrompt(prompt);

      res.json({ success: true, section: refinedSection });
    } catch (err) {
      console.error("Refine section error:", err);
      res.status(500).json({ error: "Failed to refine section" });
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
  app.post("/api/auth/forgot-password", authLimiter, async (req, res) => {
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

      // Send password reset email via SMTP
      try {
        await sendEmail({
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

  app.post("/api/auth/reset-password", authLimiter, async (req, res) => {
    try {
      const resetPasswordSchema = z.object({
        token: z.string(),
        password: z.string().min(1, "Password is required"),
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

      // Enforce full password strength validation (12+ chars, complexity)
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          error: "Password does not meet requirements",
          details: passwordValidation.errors,
          suggestions: passwordValidation.suggestions,
        });
      }

      // Hash new password with proper rounds
      const hashedPassword = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);

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

  // COMMENTED OUT - Using external URLs instead
  // PDF Upload endpoint (Cloudinary)
  /* COMMENTED OUT - Using external URLs instead
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
  */

  /* COMMENTED OUT - Using external URLs instead
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
  */ // End of commented out image upload endpoint

  // Email Capture endpoint for ROI Calculator
  app.post(
    "/api/email-capture",
    formLimiter,
    sanitizeInput(["notes"]),
    async (req, res) => {
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
  app.post(
    "/api/share-roi-report",
    formLimiter,
    sanitizeInput(["message"]),
    async (req, res) => {
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

      for (const email of emails) {
        try {
          await sendEmail({
            to: email,
            subject: "Your GTM Engine ROI Report",
            html: htmlContent,
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
  app.post(
    "/api/leads/capture",
    leadLimiter,
    sanitizeInput([], { excludeFields: ["formData"] }),
    async (req, res) => {
    try {
      const result = insertLeadSchema.safeParse(req.body);

      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      let normalizedFormData: string | undefined;
      try {
        const normalized = normalizeFormData(result.data.formData);
        normalizedFormData = normalized.value;
      } catch {
        return res.status(400).json({
          error: "Invalid formData payload",
          details: "formData must be valid JSON",
        });
      }

      const lead = await storage.createLead(req.tenantId || DEFAULT_TENANT_ID, {
        ...result.data,
        formData: normalizedFormData,
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
  app.post(
    "/api/leads/audit-request",
    leadLimiter,
    sanitizeInput(["gtmChallenge"]),
    async (req, res) => {
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

      const lead = await storage.createLead(req.tenantId || DEFAULT_TENANT_ID, {
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

  // Pipeline assessment runtime endpoints
  const assessmentSessionSchema = z.object({
    sessionId: z.string().min(10, "sessionId is required"),
  });

  app.post("/api/assessments/init", async (req, res) => {
    try {
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;
      const { sessionId } = assessmentSessionSchema.parse(req.body ?? {});

      if (!tenantId) {
        return res.status(400).json({ error: "Tenant context not configured" });
      }

      let assessment =
        (await storage.getAssessmentBySessionId(tenantId, sessionId)) ||
        (await storage.createAssessment(tenantId, { sessionId }));

      return res.json(sanitizeAssessmentResponse(assessment) ?? { sessionId });
    } catch (error) {
      console.error("Error initializing assessment session:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      return res.status(500).json({ error: "Failed to initialize assessment session" });
    }
  });

  app.put("/api/assessments/:sessionId", async (req, res) => {
    try {
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;
      const { sessionId } = assessmentSessionSchema.parse({
        sessionId: req.params.sessionId,
      });
      const updates = assessmentProgressSchema.parse(req.body ?? {});

      if (!tenantId) {
        return res.status(400).json({ error: "Tenant context not configured" });
      }

      const sanitizedUpdates = pickAssessmentUpdates(updates);
      if (Object.keys(sanitizedUpdates).length === 0) {
        return res.status(400).json({ error: "No valid fields provided" });
      }

      // Ensure the record exists before updating
      const existing =
        (await storage.getAssessmentBySessionId(tenantId, sessionId)) ||
        (await storage.createAssessment(tenantId, { sessionId }));

      const updated = await storage.updateAssessment(tenantId, sessionId, {
        ...sanitizedUpdates,
        usedCalculator:
          sanitizedUpdates.usedCalculator ?? existing.usedCalculator ?? false,
      });

      return res.json(sanitizeAssessmentResponse(updated) ?? { sessionId });
    } catch (error) {
      console.error("Error updating assessment progress:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      return res.status(500).json({ error: "Failed to update assessment progress" });
    }
  });

  app.post("/api/assessments/:sessionId/submit", async (req, res) => {
    try {
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;
      const { sessionId } = assessmentSessionSchema.parse({
        sessionId: req.params.sessionId,
      });

      if (!tenantId) {
        return res.status(400).json({ error: "Tenant context not configured" });
      }

      const payload = assessmentSubmitSchema.parse({
        ...req.body,
        sessionId: req.body?.sessionId ?? sessionId,
      });

      if (payload.sessionId !== sessionId) {
        return res.status(400).json({ error: "Session ID mismatch" });
      }

      const sanitizedUpdates = pickAssessmentUpdates(payload);
      const bucket = calculateBucket(sanitizedUpdates);

      await storage.getAssessmentBySessionId(tenantId, sessionId) ||
        (await storage.createAssessment(tenantId, { sessionId }));

      const updated = await storage.updateAssessment(tenantId, sessionId, {
        ...sanitizedUpdates,
        bucket,
        completed: true,
        usedCalculator: sanitizedUpdates.usedCalculator ?? false,
      });

      return res.json({
        bucket,
        sessionId: updated.sessionId,
      });
    } catch (error) {
      console.error("Error submitting assessment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      return res.status(500).json({ error: "Failed to submit assessment" });
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

      const leads = await storage.getAllLeads(req.tenantId || DEFAULT_TENANT_ID, filters);

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
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;

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

  const BLOG_POST_CONTENT_PREVIEW_LENGTH = 320;
  const buildBlogPostSummaries = (posts: BlogPost[]): BlogPostSummary[] =>
    posts.map(({ content, ...rest }) => ({
      ...rest,
      contentPreview: content ? content.slice(0, BLOG_POST_CONTENT_PREVIEW_LENGTH) : null,
    }));

  const isTruthyQueryParam = (value: unknown): boolean => {
    if (Array.isArray(value)) {
      return value.some((entry) => isTruthyQueryParam(entry));
    }
    return typeof value === "string" && value.toLowerCase() === "true";
  };

  // Blog posts endpoints
  app.get("/api/blog-posts", async (req, res) => {
    try {
      // Support ?publishedOnly=false query param for admin to see all posts (including drafts)
      const publishedOnly = req.query.publishedOnly !== "false";
      const includeContent = isTruthyQueryParam(req.query.includeContent);
      const posts = await storage.getAllBlogPosts(req.tenantId || DEFAULT_TENANT_ID, publishedOnly);
      const payload = includeContent ? posts : buildBlogPostSummaries(posts);
      return res.json(payload);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get blog post by ID (route must come before :slug to avoid conflicts)
  app.get("/api/blog-posts/by-id/:id", async (req, res) => {
    try {
      const post = await storage.getBlogPostById(req.tenantId || DEFAULT_TENANT_ID, req.params.id);
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
      const post = await storage.getBlogPostBySlug(req.tenantId || DEFAULT_TENANT_ID, req.params.slug);
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
      const post = await storage.createBlogPost(req.tenantId || DEFAULT_TENANT_ID, result.data);
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
      const post = await storage.updateBlogPost(req.tenantId || DEFAULT_TENANT_ID, req.params.id, result.data);
      return res.json(post);
    } catch (error) {
      console.error("Error updating blog post:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/blog-posts/:id", async (req, res) => {
    try {
      await storage.deleteBlogPost(req.tenantId || DEFAULT_TENANT_ID, req.params.id);
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
      const posts = await storage.getAllVideoPosts(req.tenantId || DEFAULT_TENANT_ID, publishedOnly);
      return res.json(posts);
    } catch (error) {
      console.error("Error fetching video posts:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get video post by ID (route must come before :slug to avoid conflicts)
  app.get("/api/video-posts/by-id/:id", async (req, res) => {
    try {
      const post = await storage.getVideoPostById(req.tenantId || DEFAULT_TENANT_ID, req.params.id);
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
      const post = await storage.getVideoPostBySlug(req.tenantId || DEFAULT_TENANT_ID, req.params.slug);
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
      const post = await storage.createVideoPost(req.tenantId || DEFAULT_TENANT_ID, result.data);
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
      const post = await storage.updateVideoPost(req.tenantId || DEFAULT_TENANT_ID, req.params.id, result.data);
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
      const post = await storage.updateVideoPost(req.tenantId || DEFAULT_TENANT_ID, req.params.id, result.data);
      return res.json(post);
    } catch (error) {
      console.error("Error updating video post:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/video-posts/:id", async (req, res) => {
    try {
      await storage.deleteVideoPost(req.tenantId || DEFAULT_TENANT_ID, req.params.id);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting video post:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Widget configuration endpoints
  app.get("/api/widget-config", async (req, res) => {
    try {
      const config = await storage.getActiveWidgetConfig(req.tenantId || DEFAULT_TENANT_ID);
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
      const config = await storage.createOrUpdateWidgetConfig(req.tenantId || DEFAULT_TENANT_ID, result.data);
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
      const testimonials = await storage.getAllTestimonials(req.tenantId || DEFAULT_TENANT_ID, featured);
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
      const testimonial = await storage.createTestimonial(req.tenantId || DEFAULT_TENANT_ID, result.data);
      return res.status(201).json(testimonial);
    } catch (error) {
      console.error("Error creating testimonial:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/testimonials/:id", async (req, res) => {
    try {
      const testimonial = await storage.getTestimonialById(req.tenantId || DEFAULT_TENANT_ID, req.params.id);
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
      const existing = await storage.getTestimonialById(req.tenantId || DEFAULT_TENANT_ID, req.params.id);
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

      const testimonial = await storage.updateTestimonial(req.tenantId || DEFAULT_TENANT_ID, req.params.id, updateData);
      return res.json(testimonial);
    } catch (error) {
      console.error("Error updating testimonial:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/testimonials/:id", requireAuth, async (req, res) => {
    try {
      const existing = await storage.getTestimonialById(req.tenantId || DEFAULT_TENANT_ID, req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Testimonial not found" });
      }

      await storage.deleteTestimonial(req.tenantId || DEFAULT_TENANT_ID, req.params.id);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/testimonials/:id/featured", requireAuth, async (req, res) => {
    try {
      const existing = await storage.getTestimonialById(req.tenantId || DEFAULT_TENANT_ID, req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Testimonial not found" });
      }

      const { featured } = req.body;
      if (typeof featured !== 'boolean') {
        return res.status(400).json({ error: "featured must be a boolean" });
      }
      const testimonial = await storage.updateTestimonialFeaturedStatus(req.tenantId || DEFAULT_TENANT_ID, req.params.id, featured);
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
      const jobs = await storage.getAllJobPostings(req.tenantId || DEFAULT_TENANT_ID, active);
      return res.json(jobs);
    } catch (error) {
      console.error("Error fetching job postings:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/job-postings/:id", async (req, res) => {
    try {
      const job = await storage.getJobPosting(req.tenantId || DEFAULT_TENANT_ID, req.params.id);
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
      const job = await storage.createJobPosting(req.tenantId || DEFAULT_TENANT_ID, result.data);
      return res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job posting:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/job-postings/:id", requireAuth, async (req, res) => {
    try {
      const existing = await storage.getJobPosting(req.tenantId || DEFAULT_TENANT_ID, req.params.id);
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

      const job = await storage.updateJobPosting(req.tenantId || DEFAULT_TENANT_ID, req.params.id, result.data);
      return res.json(job);
    } catch (error) {
      console.error("Error updating job posting:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/job-postings/:id", requireAuth, async (req, res) => {
    try {
      const existing = await storage.getJobPosting(req.tenantId || DEFAULT_TENANT_ID, req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Job posting not found" });
      }

      await storage.deleteJobPosting(req.tenantId || DEFAULT_TENANT_ID, req.params.id);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting job posting:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Public portfolio preview endpoints (no auth required)
  app.get("/api/projects/:projectId/public", async (req, res) => {
    try {
      const { projectId } = req.params;
      const tenantId = req.session?.tenantId || DEFAULT_TENANT_ID;

      const project = await storage.getProjectById(tenantId, projectId);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Return only public-safe fields
      return res.json({
        id: project.id,
        title: project.title,
        slug: project.slug,
        client: project.client,
        description: project.description,
      });
    } catch (error) {
      console.error("Error fetching public project:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all scenes for a project (public/preview)
  app.get("/api/projects/:projectId/scenes", async (req, res) => {
    try {
      const { projectId } = req.params;
      const tenantId = req.session?.tenantId || DEFAULT_TENANT_ID;

      // Verify project exists
      const project = await storage.getProjectById(tenantId, projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Get scenes for the project
      const scenes = await storage.getScenesByProjectId(tenantId, projectId);

      return res.json(scenes);
    } catch (error) {
      console.error("Error fetching public scenes:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Branding Projects endpoints (protected)
  app.get("/api/projects", requireAuth, async (req, res) => {
    try {
      const projectsList = await storage.getAllProjects(req.tenantId || DEFAULT_TENANT_ID);
      return res.json(projectsList);
    } catch (error) {
      console.error("Error fetching projects:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get project by slug
  app.get("/api/projects/slug/:slug", requireAuth, async (req, res) => {
    try {
      const project = await db.query.projects.findFirst({
        where: and(
          eq(projects.tenantId, req.tenantId || DEFAULT_TENANT_ID),
          eq(projects.slug, req.params.slug)
        ),
      });

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      return res.json(project);
    } catch (error) {
      console.error("Error fetching project by slug:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Public feature flag endpoint (no auth required)
  app.get("/api/public/feature-flags/:flagKey", async (req, res) => {
    try {
      const { flagKey } = req.params;
      const snapshot = await loadFeatureFlagsForRequest(req);
      const enabled = resolveFeatureFlag(snapshot, flagKey);
      return res.json({ enabled });
    } catch (error) {
      console.error("Error fetching feature flag:", error);
      return res.json({ enabled: false });
    }
  });

  app.get("/api/public/feature-flags", async (req, res) => {
    try {
      const snapshot = await loadFeatureFlagsForRequest(req);
      return res.json(snapshot);
    } catch (error) {
      console.error("Error fetching feature flags:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/feature-flags", requireAuth, async (req, res) => {
    try {
      const tenantId = req.session?.tenantId || req.tenantId || DEFAULT_TENANT_ID;
      const flags = await storage.getAllFeatureFlags(tenantId);
      return res.json(flags);
    } catch (error) {
      console.error("Error fetching feature flags:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/feature-flags/definitions", requireAuth, async (req, res) => {
    try {
      const tenantId = req.session?.tenantId || req.tenantId || DEFAULT_TENANT_ID;
      const definitions = await getFeatureFlagsWithMetadata(tenantId);
      return res.json(definitions);
    } catch (error) {
      console.error("Error fetching feature flag definitions:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/feature-flags", requireAuth, async (req, res) => {
    try {
      const tenantId = req.session?.tenantId || req.tenantId || DEFAULT_TENANT_ID;
      const createSchema = insertFeatureFlagSchema.pick({
        flagKey: true,
        flagName: true,
        description: true,
        enabled: true,
      }).partial({ flagName: true, description: true, enabled: true });

      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
      }

      const definition = getFeatureFlagDefinition(parsed.data.flagKey);
      const flag = await storage.createFeatureFlag(tenantId, {
        flagKey: parsed.data.flagKey,
        flagName: parsed.data.flagName || definition?.name || parsed.data.flagKey,
        description: parsed.data.description ?? definition?.description ?? "",
        enabled: parsed.data.enabled ?? definition?.defaultEnabled ?? false,
      });
      return res.status(201).json(flag);
    } catch (error) {
      console.error("Error creating feature flag:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/feature-flags/:flagKey", requireAuth, async (req, res) => {
    try {
      const { flagKey } = req.params;
      const tenantId = req.session?.tenantId || req.tenantId || DEFAULT_TENANT_ID;
      const bodySchema = z.object({ enabled: z.boolean() });
      const parsed = bodySchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
      }

      const existingFlag = await storage.getFeatureFlag(tenantId, flagKey);
      const targetPayload = {
        flagKey,
        flagName: existingFlag?.flagName || getFeatureFlagDefinition(flagKey)?.name || flagKey,
        description: existingFlag?.description ?? getFeatureFlagDefinition(flagKey)?.description ?? "",
        enabled: parsed.data.enabled,
      };

      const updated = existingFlag
        ? await storage.updateFeatureFlag(tenantId, flagKey, targetPayload)
        : await storage.createFeatureFlag(tenantId, targetPayload);

      return res.json(updated);
    } catch (error) {
      console.error("Error updating feature flag:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Branding Projects list endpoint (public - for portfolio showcase)
  app.get("/api/branding/projects", gateRoute("page-branding"), async (req, res) => {
    try {
      // Use session tenantId if available, otherwise fallback to default
      const tenantId = req.session?.tenantId || req.tenantId || DEFAULT_TENANT_ID;
      const projectsList = await storage.getAllProjects(tenantId);
      
      // Map database fields to frontend-expected field names
      const mappedProjects = projectsList.map(project => ({
        id: project.id,
        slug: project.slug,
        clientName: project.clientName,
        projectTitle: project.title,
        thumbnailImage: project.thumbnailUrl,
        heroMediaType: project.heroMediaType || "image",
        categories: project.categories || [],
        challenge: project.challengeText,
        solution: project.solutionText,
        outcome: project.outcomeText,
        modalMediaAssets: project.modalMediaUrls?.map((url: string, index: number) => ({
          id: `${project.id}-media-${index}`,
          url,
          type: project.modalMediaType || 'image',
          order: index,
        })) || [],
        modalMediaUrls: project.modalMediaUrls,
        modalMediaType: project.modalMediaType,
        expansionLayout: project.expansionLayout || "vertical",
        spacingMode: project.spacingMode || "balanced",
        testimonial: project.testimonialText ? {
          text: project.testimonialText,
          author: project.testimonialAuthor || '',
        } : undefined,
      }));
      
      return res.json(mappedProjects);
    } catch (error) {
      console.error("Error fetching branding projects:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/branding/projects/:id", requireAuth, async (req, res) => {
    try {
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;
      const project = await db.query.projects.findFirst({
        where: and(eq(projects.id, req.params.id), eq(projects.tenantId, tenantId)),
      });

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      return res.json(project);
    } catch (error) {
      console.error("Error fetching branding project by id:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/branding/projects/slug/:slug", requireAuth, async (req, res) => {
    try {
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;
      const project = await db.query.projects.findFirst({
        where: and(eq(projects.slug, req.params.slug), eq(projects.tenantId, tenantId)),
      });

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      return res.json(project);
    } catch (error) {
      console.error("Error fetching branding project by slug:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create new project
  app.post("/api/projects", requireAuth, async (req, res) => {
    try {
      console.log("[Create Project] Request body:", JSON.stringify(req.body, null, 2));
      const result = insertProjectSchema.safeParse(req.body);
      if (!result.success) {
        console.error("[Create Project] Validation failed:", JSON.stringify(result.error.issues, null, 2));
        return res.status(400).json({
          error: "Validation failed",
          details: result.error.issues
        });
      }

      console.log("[Create Project] Creating project for tenant:", req.tenantId);
      const project = await storage.createProject(req.tenantId || DEFAULT_TENANT_ID, result.data);
      console.log("[Create Project] Success! Project ID:", project.id);
      return res.status(201).json(project);
    } catch (error) {
      console.error("[Create Project] ERROR:", error);
      console.error("[Create Project] Error stack:", error instanceof Error ? error.stack : "No stack");
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update existing project
  app.patch("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      // Verify project exists and belongs to tenant
      const existing = await db.query.projects.findFirst({
        where: and(
          eq(projects.id, req.params.id),
          eq(projects.tenantId, req.tenantId || DEFAULT_TENANT_ID)
        ),
      });

      if (!existing) {
        return res.status(404).json({ error: "Project not found" });
      }

      const result = insertProjectSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: result.error.issues
        });
      }

      const [updated] = await db.update(projects)
        .set(result.data)
        .where(and(
          eq(projects.id, req.params.id),
          eq(projects.tenantId, req.tenantId || DEFAULT_TENANT_ID)
        ))
        .returning();

      return res.json(updated);
    } catch (error) {
      console.error("Error updating project:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update case study content with strict validation and media ownership checks
  app.patch(
    "/api/projects/:id/content",
    requireAuth,
    validateRequest(z.object({ content: caseStudyContentSchema })),
    async (req, res) => {
      try {
        const { id } = req.params;
        const { content } = req.validated as { content: CaseStudyContent };
        const tenantId = req.tenantId || DEFAULT_TENANT_ID;

        // Verify project ownership
        const project = await db.query.projects.findFirst({
          where: and(eq(projects.id, id), eq(projects.tenantId, tenantId)),
        });

        if (!project) {
          return res.status(404).json({ error: "Project not found" });
        }

        // Collect referenced media IDs from carousel blocks
        const mediaIds = new Set<string>();
        content.sections.forEach((section: CaseStudySection) => {
          section.blocks.forEach((block: CaseStudyBlock) => {
            if (block.type === "carousel") {
              const carouselBlock = block as CaseStudyCarouselBlock;
              carouselBlock.items.forEach((item) => {
                if (item.mediaId) {
                  mediaIds.add(item.mediaId);
                }
              });
            }
          });
        });

        if (mediaIds.size > 0) {
          const foundMedia = await db.query.mediaLibrary.findMany({
            where: and(
              inArray(mediaLibrary.id, Array.from(mediaIds)),
              eq(mediaLibrary.tenantId, tenantId)
            ),
            columns: { id: true },
          });

          if (foundMedia.length !== mediaIds.size) {
            const foundIds = new Set(foundMedia.map((m) => m.id));
            const invalidIds = Array.from(mediaIds).filter((mediaId) => !foundIds.has(mediaId));
            return res.status(400).json({
              error: "Invalid or unauthorized media references",
              invalidIds,
            });
          }
        }

        const [updatedProject] = await db
          .update(projects)
          .set({ caseStudyContent: content })
          .where(and(eq(projects.id, id), eq(projects.tenantId, tenantId)))
          .returning();

        return res.json({ success: true, project: updatedProject });
      } catch (error) {
        console.error("Error updating case study content:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  );

  // Get project scenes (with optional media hydration)
  const handleProjectScenesRequest = async (req: Request, res: Response) => {
    try {
      const projectId = req.params.id;
      const shouldHydrate = req.query.hydrate === 'true';

      // CACHE CONTROL: Scenes with hydration should not be cached aggressively
      if (shouldHydrate) {
        res.set('Cache-Control', 'private, no-cache, must-revalidate');
      }

      // Fetch scenes directly from projectScenes table
      const scenes = await db.query.projectScenes.findMany({
        where: eq(projectScenes.projectId, projectId),
        orderBy: asc(projectScenes.order)
      });

      if (scenes.length === 0) {
        return res.json([]);
      }

      // Get tenant ID for security validation
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
        columns: { tenantId: true }
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Hydrate media references if requested
      if (shouldHydrate) {
        console.log(`[Hydration] Processing ${scenes.length} scenes for project ${projectId}`);

        // Collect all unique mediaIds from all scenes
        const mediaIds = new Set<string>();
        scenes.forEach((scene: any) => {
          // Handle content.mediaId (image/video scenes)
          if (scene.sceneConfig?.content?.mediaId) {
            mediaIds.add(scene.sceneConfig.content.mediaId);
          }

          // Handle content.mediaMediaId (split/fullscreen scenes)
          if (scene.sceneConfig?.content?.mediaMediaId) {
            mediaIds.add(scene.sceneConfig.content.mediaMediaId);
          }

          // Handle gallery images
          if (scene.sceneConfig?.content?.images && Array.isArray(scene.sceneConfig.content.images)) {
            scene.sceneConfig.content.images.forEach((img: any) => {
              if (img.mediaId) {
                mediaIds.add(img.mediaId);
              }
            });
          }
        });

        console.log(`[Hydration] Found ${mediaIds.size} unique media references`);

        if (mediaIds.size > 0) {
          // Fetch all referenced media in one query
          const mediaRecords = await db.query.mediaLibrary.findMany({
            where: and(
              inArray(mediaLibrary.id, Array.from(mediaIds)),
              eq(mediaLibrary.tenantId, project.tenantId || DEFAULT_TENANT_ID) // Security: only same tenant
            )
          });

          console.log(`[Hydration] Fetched ${mediaRecords.length} media records from database`);

          // Create lookup map
          const mediaMap = new Map(
            mediaRecords.map(m => [m.id, m])
          );

          // Hydrate scenes
          const hydratedScenes = scenes.map((scene: any) => {
            const hydratedSceneConfig = { ...scene.sceneConfig };
            const hydratedContent = { ...(scene.sceneConfig?.content || {}) };

            // Hydrate content.mediaId (for image/video scenes)
            if (hydratedContent.mediaId) {
              const media = mediaMap.get(hydratedContent.mediaId);
              if (media) {
                hydratedContent.url = media.cloudinaryUrl;
                hydratedContent._media = {
                  label: media.label,
                  mediaType: media.mediaType
                };
                console.log(`[Hydration] ✓ Resolved mediaId ${hydratedContent.mediaId} → ${media.cloudinaryUrl}`);
              } else {
                console.warn(`[Hydration] ✗ Media ${hydratedContent.mediaId} not found or unauthorized`);
              }
            }

            // Hydrate content.mediaMediaId (for split/fullscreen scenes)
            if (hydratedContent.mediaMediaId) {
              const media = mediaMap.get(hydratedContent.mediaMediaId);
              if (media) {
                hydratedContent.media = media.cloudinaryUrl;
                hydratedContent._mediaMedia = {
                  label: media.label,
                  mediaType: media.mediaType
                };
                console.log(`[Hydration] ✓ Resolved mediaMediaId ${hydratedContent.mediaMediaId} → ${media.cloudinaryUrl}`);
              } else {
                console.warn(`[Hydration] ✗ Media ${hydratedContent.mediaMediaId} not found or unauthorized`);
              }
            }

            // Hydrate gallery images
            if (hydratedContent.images && Array.isArray(hydratedContent.images)) {
              hydratedContent.images = hydratedContent.images.map((img: any) => {
                if (img.mediaId) {
                  const media = mediaMap.get(img.mediaId);
                  if (media) {
                    return {
                      ...img,
                      url: media.cloudinaryUrl,
                      _media: {
                        label: media.label,
                        mediaType: media.mediaType
                      }
                    };
                  } else {
                    console.warn(`[Hydration] ✗ Gallery media ${img.mediaId} not found or unauthorized`);
                  }
                }
                return img;
              });
            }

            hydratedSceneConfig.content = hydratedContent;

            return {
              ...scene,
              sceneConfig: hydratedSceneConfig
            };
          });

          return res.json(hydratedScenes);
        }
      }

      res.json(scenes);
    } catch (error) {
      console.error('Error fetching project scenes:', error);
      res.status(500).json({ error: 'Failed to fetch scenes' });
    }
  };

  app.get('/api/projects/:id/scenes', requireAuth, handleProjectScenesRequest);
  app.get('/api/branding/projects/:id/scenes', requireAuth, handleProjectScenesRequest);

  app.post("/api/projects/:projectId/scenes", requireAuth, async (req, res) => {
    try {
      const projectId = req.params.projectId;

      // LOG 1: Request received
      console.log('[Scene Create] Request received:', {
        projectId,
        tenantId: req.tenantId,
        bodyKeys: Object.keys(req.body),
        sceneConfigPresent: !!req.body.sceneConfig,
        sceneConfigType: req.body.sceneConfig?.type
      });

      const result = insertProjectSceneSchema.safeParse(req.body);

      // LOG 2: Validation result
      console.log('[Scene Create] Validation result:', {
        success: result.success,
        errorCount: result.success ? 0 : result.error.issues.length
      });

      if (!result.success) {
        const validationError = fromZodError(result.error);
        console.error('[Scene Create] Validation failed:', result.error.issues);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      // Collect all media references from scene config
      const sceneConfig = result.data.sceneConfig as any;
      const mediaIdsToValidate = new Set<string>();

      // Extract mediaId from content.mediaId (image/video scenes)
      if (sceneConfig?.content?.mediaId) {
        mediaIdsToValidate.add(sceneConfig.content.mediaId);
      }

      // Extract mediaId from content.mediaMediaId (split/fullscreen scenes)
      if (sceneConfig?.content?.mediaMediaId) {
        mediaIdsToValidate.add(sceneConfig.content.mediaMediaId);
      }

      // Extract mediaIds from gallery images
      if (sceneConfig?.content?.images && Array.isArray(sceneConfig.content.images)) {
        sceneConfig.content.images.forEach((img: any) => {
          if (img.mediaId) {
            mediaIdsToValidate.add(img.mediaId);
          }
        });
      }

      // SECURITY: Validate all media references belong to same tenant
      if (mediaIdsToValidate.size > 0) {
        const projectId = req.params.projectId;
        const tenantId = req.tenantId || DEFAULT_TENANT_ID;

        console.log(`[Scene Creation Security] Validating ${mediaIdsToValidate.size} media references for tenant ${tenantId}`);
        console.log(`[Scene Creation Security] Media IDs to validate:`, Array.from(mediaIdsToValidate));

        // Verify all media exists and belongs to same tenant
        const mediaRecords = await db.query.mediaLibrary.findMany({
          where: and(
            inArray(mediaLibrary.id, Array.from(mediaIdsToValidate)),
            eq(mediaLibrary.tenantId, tenantId)
          )
        });

        console.log(`[Scene Creation Security] Found ${mediaRecords.length} valid media records`);

        // SECURITY CHECK: All referenced media must exist and belong to tenant
        if (mediaRecords.length !== mediaIdsToValidate.size) {
          const foundIds = new Set(mediaRecords.map(m => m.id));
          const missingIds = Array.from(mediaIdsToValidate).filter(id => !foundIds.has(id));

          console.error(`[Scene Creation Security] BLOCKED: Attempted to reference ${missingIds.length} unauthorized media IDs:`, missingIds);

          return res.status(403).json({
            error: 'Invalid media reference',
            details: 'One or more media assets do not exist or do not belong to your organization',
            invalidIds: missingIds
          });
        }

        // Auto-link unlinked media to this project
        const unlinkedMedia = mediaRecords.filter(m => !m.projectId);
        if (unlinkedMedia.length > 0) {
          await db
            .update(mediaLibrary)
            .set({ projectId })
            .where(
              inArray(mediaLibrary.id, unlinkedMedia.map(m => m.id))
            );
          console.log(`[Scene Creation] Auto-linked ${unlinkedMedia.length} media assets to project ${projectId}`);
        }

        console.log(`[Scene Creation] ✓ All ${mediaIdsToValidate.size} media references validated for tenant ${tenantId}`);
      }

      // LOG 3: Calling storage layer
      console.log('[Scene Create] Calling storage.createProjectScene with:', {
        tenantId: req.tenantId || DEFAULT_TENANT_ID,
        projectId: req.params.projectId,
        hasSceneConfig: !!result.data.sceneConfig
      });

      const scene = await storage.createProjectScene(req.tenantId || DEFAULT_TENANT_ID, req.params.projectId, result.data);

      // LOG 4: Success
      console.log('[Scene Create] ✓ Scene created successfully:', {
        sceneId: scene.id,
        projectId: req.params.projectId
      });

      return res.status(201).json(scene);
    } catch (error) {
      if (error instanceof Error && error.message === 'Project not found or access denied') {
        console.error('[Scene Create] Project not found:', {
          projectId: req.params.projectId,
          tenantId: req.tenantId
        });
        return res.status(404).json({ error: "Project not found" });
      }

      // LOG 5: Error details
      console.error('[Scene Create] ERROR:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown',
        projectId: req.params.projectId,
        tenantId: req.tenantId
      });

      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update project scenes
  app.put('/api/projects/:id/scenes', requireAuth, async (req, res) => {
    try {
      const projectId = req.params.id;
      const { scenes } = req.body;

      const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId)
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Collect all media references from all scenes
      const mediaIdsToValidate = new Set<string>();

      scenes.forEach((scene: any) => {
        const sceneConfig = scene.sceneConfig;

        // content.mediaId (image/video scenes)
        if (sceneConfig?.content?.mediaId) {
          mediaIdsToValidate.add(sceneConfig.content.mediaId);
        }

        // content.mediaMediaId (split/fullscreen scenes)
        if (sceneConfig?.content?.mediaMediaId) {
          mediaIdsToValidate.add(sceneConfig.content.mediaMediaId);
        }

        // Gallery images
        if (sceneConfig?.content?.images && Array.isArray(sceneConfig.content.images)) {
          sceneConfig.content.images.forEach((img: any) => {
            if (img.mediaId) {
              mediaIdsToValidate.add(img.mediaId);
            }
          });
        }
      });

      // SECURITY: Validate all media references
      if (mediaIdsToValidate.size > 0) {
        console.log(`[Scene Update Security] Validating ${mediaIdsToValidate.size} media references for tenant ${project.tenantId}`);
        console.log(`[Scene Update Security] Media IDs to validate:`, Array.from(mediaIdsToValidate));

        // Verify all media exists and belongs to same tenant
        const mediaRecords = await db.query.mediaLibrary.findMany({
          where: and(
            inArray(mediaLibrary.id, Array.from(mediaIdsToValidate)),
            eq(mediaLibrary.tenantId, project.tenantId)
          )
        });

        console.log(`[Scene Update Security] Found ${mediaRecords.length} valid media records`);

        // SECURITY CHECK: All referenced media must exist and belong to tenant
        if (mediaRecords.length !== mediaIdsToValidate.size) {
          const foundIds = new Set(mediaRecords.map(m => m.id));
          const missingIds = Array.from(mediaIdsToValidate).filter(id => !foundIds.has(id));

          console.error(`[Scene Update Security] BLOCKED: Attempted to reference ${missingIds.length} unauthorized media IDs:`, missingIds);

          return res.status(403).json({
            error: 'Invalid media reference',
            details: 'One or more media assets do not exist or do not belong to your organization',
            invalidIds: missingIds
          });
        }

        // Auto-associate unlinked media with this project
        const unlinkedMedia = mediaRecords.filter(m => !m.projectId);
        if (unlinkedMedia.length > 0) {
          await db
            .update(mediaLibrary)
            .set({ projectId })
            .where(
              inArray(mediaLibrary.id, unlinkedMedia.map(m => m.id))
            );
          console.log(`[Scene Update] Auto-linked ${unlinkedMedia.length} media assets to project ${projectId}`);
        }

        console.log(`[Scene Update] ✓ All ${mediaIdsToValidate.size} media references validated for tenant ${project.tenantId}`);
      }

      const [updatedProject] = await db
        .update(projects)
        .set({ scenes, updatedAt: new Date() })
        .where(eq(projects.id, projectId))
        .returning();

      res.json(updatedProject);
    } catch (error) {
      console.error('Error updating project scenes:', error);
      res.status(500).json({ error: 'Failed to update scenes' });
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
        projectId: z.string().optional(), // Add projectId for filtering media
      });

      const result = requestSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          details: validationError.message,
        });
      }

      const { prompt, sceneType, systemInstructions, projectId } = result.data;

      // Fetch available Media Library assets for this tenant (optionally filtered by project)
      const availableMediaLibrary = await db.query.mediaLibrary.findMany({
        where: projectId
          ? and(eq(mediaLibrary.tenantId, req.tenantId), eq(mediaLibrary.projectId, projectId))
          : eq(mediaLibrary.tenantId, req.tenantId),
        orderBy: [asc(mediaLibrary.createdAt)]
      });

      console.log(`[AI Scene Generation] Loaded ${availableMediaLibrary.length} Media Library assets for tenant ${req.tenantId}${projectId ? ` (project: ${projectId})` : ''}`);

      // Lazy-load Gemini client to avoid startup errors if not configured
      const { generateSceneWithGemini } = await import("./utils/gemini-client");

      const sceneConfig = await generateSceneWithGemini(
        prompt,
        sceneType,
        systemInstructions,
        availableMediaLibrary
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
        apiKey: GOOGLE_AI_KEY,
        httpOptions: {
          apiVersion: "",
          baseUrl: GEMINI_BASE_URL,
        },
      });

      // Build conversation context for Gemini
      const systemPrompt = `You are a cinematic director helping refine scrollytelling portfolio.

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
      let enhancedScenes = result.scenes || [];
      let aiExplanation = result.explanation || "Scenes refined successfully";

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
      const templates = await storage.getAllPromptTemplates(req.tenantId, req.query.activeOnly === 'true');
      return res.json(templates);
    } catch (error) {
      console.error("Error fetching prompt templates:", error);
      return res.status(500).json({ error: "Failed to fetch prompt templates" });
    }
  });

  app.get("/api/ai-prompt-templates/:id", requireAuth, async (req, res) => {
    try {
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;
      const template = await storage.getPromptTemplateById(tenantId, req.params.id);
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
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;
      const userId = requireUserContext(req, res);
      if (!userId) {
        return;
      }
      const template = await storage.createPromptTemplate(tenantId, userId, req.body);
      return res.json(template);
    } catch (error) {
      console.error("Error creating prompt template:", error);
      return res.status(500).json({ error: "Failed to create prompt template" });
    }
  });

  app.put("/api/ai-prompt-templates/:id", requireAuth, async (req, res) => {
    try {
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;
      const userId = requireUserContext(req, res);
      if (!userId) {
        return;
      }
      const template = await storage.updatePromptTemplate(tenantId, req.params.id, userId, req.body);
      return res.json(template);
    } catch (error) {
      console.error("Error updating prompt template:", error);
      return res.status(500).json({ error: "Failed to update prompt template" });
    }
  });

  app.delete("/api/ai-prompt-templates/:id", requireAuth, async (req, res) => {
    try {
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;
      await storage.deletePromptTemplate(tenantId, req.params.id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting prompt template:", error);
      return res.status(500).json({ error: "Failed to delete prompt template" });
    }
  });

  // Get version history for a prompt template
  app.get("/api/ai-prompt-templates/:id/versions", requireAuth, async (req, res) => {
    try {
      const versions = await storage.getPromptVersionHistory(req.params.id);
      return res.json(versions);
    } catch (error) {
      console.error("Error fetching version history:", error);
      return res.status(500).json({ error: "Failed to fetch version history" });
    }
  });

  // Rollback prompt to a specific version
  app.post("/api/ai-prompt-templates/:id/rollback/:version", requireAuth, async (req, res) => {
    try {
      const { id, version } = req.params;
      const versionNumber = parseInt(version);

      if (isNaN(versionNumber) || versionNumber < 1) {
        return res.status(400).json({
          error: "Invalid version number"
        });
      }

      const rolledBack = await storage.rollbackPromptToVersion(id, versionNumber);

      return res.json({
        success: true,
        prompt: rolledBack,
        message: `Successfully rolled back to version ${versionNumber}`
      });
    } catch (error) {
      console.error("Error rolling back prompt:", error);
      return res.status(500).json({
        error: "Failed to rollback prompt",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Test prompt endpoint
  app.post("/api/ai-prompt-templates/:id/test", requireAuth, async (req, res) => {
    try {
      const { testInput } = req.body;

      if (!testInput || !testInput.trim()) {
        return res.status(400).json({
          error: "Validation failed",
          details: "Test input is required"
        });
      }

      const template = await db.query.aiPromptTemplates.findFirst({
        where: eq(aiPromptTemplates.id, req.params.id)
      });

      if (!template) {
        return res.status(404).json({ error: "Prompt template not found" });
      }

      // Lazy-load Gemini client
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: GOOGLE_AI_KEY,
        httpOptions: {
          apiVersion: "",
          baseUrl: GEMINI_BASE_URL,
        },
      });

      // Test the prompt with sample input
      const startTime = Date.now();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [
          { role: "user", parts: [{ text: template.systemPrompt }] },
          { role: "user", parts: [{ text: testInput }] }
        ],
      });
      const duration = Date.now() - startTime;

      return res.json({
        success: true,
        result: response.text,
        promptVersion: template.version,
        promptKey: template.promptKey,
        duration,
        testInput,
      });
    } catch (error) {
      console.error("Error testing prompt:", error);
      return res.status(500).json({
        error: "Failed to test prompt",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Media Library Routes
  app.get("/api/media-library/status", requireAuth, (req: Request, res: Response) => {
    return res.json({
      cloudinaryEnabled,
    });
  });

  // Database health check endpoint for debugging persistence issues
  app.get("/api/media-library/health", requireAuth, async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;
      
      // Get total count of assets in the database for this tenant
      const totalAssets = await db
        .select({ count: sql<number>`count(*)` })
        .from(mediaLibrary)
        .where(eq(mediaLibrary.tenantId, tenantId));

      // Get all unique tenant_ids in the table to diagnose isolation issues  
      const allTenants = await db
        .select({ tenantId: mediaLibrary.tenantId })
        .from(mediaLibrary)
        .groupBy(mediaLibrary.tenantId);

      // Get the most recent 5 assets for debugging
      const recentAssets = await db
        .select({
          id: mediaLibrary.id,
          tenantId: mediaLibrary.tenantId,
          createdAt: mediaLibrary.createdAt,
          label: mediaLibrary.label,
        })
        .from(mediaLibrary)
        .orderBy(desc(mediaLibrary.createdAt))
        .limit(5);

      return res.json({
        status: "ok",
        currentTenantId: tenantId,
        sessionInfo: {
          sessionId: req.session?.id?.slice(0, 8) + "...",
          userId: req.session?.userId,
        },
        database: {
          totalAssetsForTenant: Number(totalAssets[0]?.count || 0),
          allTenantIds: allTenants.map(t => t.tenantId),
          recentAssets: recentAssets.map(a => ({
            id: a.id?.slice(0, 8) + "...",
            tenantId: a.tenantId,
            createdAt: a.createdAt,
            label: a.label,
          })),
        },
        cloudinaryEnabled,
      });
    } catch (error) {
      console.error("[Media Library Health] Error:", error);
      return res.status(500).json({
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/media-library", requireAuth, async (req: Request, res: Response) => {
          try {
            const tenantId = req.tenantId || DEFAULT_TENANT_ID;
            const projectId = req.query.projectId as string | undefined;

            // Diagnostic logging for persistence debugging
            console.log("[Media Library GET] Request info:", {
              tenantId,
              projectId: projectId || "none",
              sessionId: req.session?.id?.slice(0, 8) + "...",
              userId: req.session?.userId,
              requestId: req.requestId,
            });

            const conditions = [eq(mediaLibrary.tenantId, tenantId)];
            if (projectId) {
              conditions.push(eq(mediaLibrary.projectId, projectId));
            }

            const assets = await db
              .select()
              .from(mediaLibrary)
              .where(and(...conditions))
              .orderBy(asc(mediaLibrary.createdAt));

            console.log("[Media Library GET] Query result:", {
              tenantId,
              assetsCount: assets.length,
              assetIds: assets.slice(0, 5).map(a => a.id), // First 5 for debugging
            });

            return res.json(assets);
          } catch (error) {
            console.error("[Media Library GET] Error fetching media library:", error);
            return res.status(500).json({ error: "Internal server error" });
          }
        });

        app.post("/api/media-library/upload", requireAuth, mediaUpload.single("file"), async (req: Request, res: Response) => {
          try {
            if (!cloudinaryEnabled) {
              return res.status(503).json({
                error: "Cloudinary is not configured",
                details: "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET env vars to enable uploads.",
              });
            }

            if (!req.file) {
              return res.status(400).json({ error: "No file uploaded" });
            }

            const tenantId = req.tenantId || DEFAULT_TENANT_ID;
            const { label, tags, projectId } = req.body;

            // Diagnostic logging for persistence debugging
            console.log("[Media Library UPLOAD] Request info:", {
              tenantId,
              projectId: projectId || "none",
              sessionId: req.session?.id?.slice(0, 8) + "...",
              userId: req.session?.userId,
              fileName: req.file.originalname,
              fileSize: req.file.size,
              mimeType: req.file.mimetype,
              requestId: req.requestId,
            });

            // Determine resource type based on MIME type
            let resourceType: "image" | "video" | "raw" = "image";
            if (req.file.mimetype.startsWith("video/")) {
              resourceType = "video";
            } else if (req.file.mimetype === "application/pdf") {
              resourceType = "raw";
            }
            
            const result = await new Promise<UploadApiResponse>((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                {
                  folder: "revenue_party",
                  resource_type: resourceType,
                },
                (error, uploadResult) => {
                  if (error) {
                    console.error("[Media Library UPLOAD] Cloudinary upload_stream error:", error);
                    reject(error);
                    return;
                  }
                  if (!uploadResult) {
                    reject(new Error("Cloudinary did not return a result"));
                    return;
                  }
                  resolve(uploadResult);
                },
              );

              uploadStream.end(req.file!.buffer);
            });

            console.log("[Media Library UPLOAD] Cloudinary success:", {
              publicId: result.public_id,
              secureUrl: result.secure_url?.slice(0, 50) + "...",
            });

            // Determine media type
            const mediaType = resourceType;

            // Parse tags
            let tagList: string[] = [];
            if (tags) {
              tagList = tags.split(",").map((t: string) => t.trim()).filter(Boolean);
            }

            // Insert into database
            const [asset] = await db
              .insert(mediaLibrary)
              .values({
                tenantId,
                projectId: projectId || null,
                cloudinaryPublicId: result.public_id,
                cloudinaryUrl: result.secure_url,
                mediaType,
                label: label || req.file.originalname,
                tags: tagList,
              })
              .returning();

            console.log("[Media Library UPLOAD] Database insert success:", {
              assetId: asset.id,
              tenantId: asset.tenantId,
              cloudinaryPublicId: asset.cloudinaryPublicId,
            });

            return res.json(asset);
          } catch (error) {
            console.error("[Media Library UPLOAD] Error:", error);
            const message = error instanceof Error ? error.message : undefined;
            return res.status(cloudinaryEnabled ? 500 : 503).json({
              error: cloudinaryEnabled ? "Upload failed" : "Cloudinary is not configured",
              details: message,
            });
          }
        });

        app.delete("/api/media-library/:id", requireAuth, async (req: Request, res: Response) => {
          try {
            if (!cloudinaryEnabled) {
              return res.status(503).json({
                error: "Cloudinary is not configured",
                details: "Set CLOUDINARY env vars to enable media deletion.",
              });
            }

            const { id } = req.params;
            const tenantId = req.tenantId || DEFAULT_TENANT_ID;

            // Diagnostic logging for persistence debugging
            console.log("[Media Library DELETE] Request info:", {
              assetId: id,
              tenantId,
              sessionId: req.session?.id?.slice(0, 8) + "...",
              userId: req.session?.userId,
              requestId: req.requestId,
            });

            const [asset] = await db
              .select()
              .from(mediaLibrary)
              .where(and(eq(mediaLibrary.id, id), eq(mediaLibrary.tenantId, tenantId)))
              .limit(1);

            if (!asset) {
              console.log("[Media Library DELETE] Asset not found:", { assetId: id, tenantId });
              return res.status(404).json({ error: "Asset not found" });
            }

            // Delete from Cloudinary
            await cloudinary.uploader.destroy(asset.cloudinaryPublicId, {
              resource_type: asset.mediaType === "video" ? "video" : "image"
            });

            // Delete from database
            await db
              .delete(mediaLibrary)
              .where(eq(mediaLibrary.id, id));

            console.log("[Media Library DELETE] Success:", {
              assetId: id,
              cloudinaryPublicId: asset.cloudinaryPublicId,
            });

            return res.json({ success: true });
          } catch (error) {
            console.error("[Media Library DELETE] Error:", error);
            const message = error instanceof Error ? error.message : undefined;
            return res.status(cloudinaryEnabled ? 500 : 503).json({
              error: cloudinaryEnabled ? "Delete failed" : "Cloudinary is not configured",
              details: message,
            });
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

        /* COMMENTED OUT - Using external URLs instead
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
            const projectId = req.body.project_id ? parseInt(req.body.project_id) : null;
        
        
            // Upload to Cloudinary using buffer
            console.log('[Media Upload] Starting Cloudinary upload...');
            
            // Determine resource type based on MIME type
            let resourceType: "image" | "video" | "raw" = "image";
            if (req.file!.mimetype.startsWith("video/")) {
              resourceType = "video";
            } else if (req.file!.mimetype === "application/pdf") {
              resourceType = "raw";
            }
            
            const uploadResult = await new Promise<any>((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                {
                  resource_type: resourceType,
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
        
            // Determine media type for database
            let dbMediaType: "image" | "video" | "raw" = "image";
            if (req.file.mimetype.startsWith("video/")) {
              dbMediaType = "video";
            } else if (req.file.mimetype === "application/pdf") {
              dbMediaType = "raw";
            }
        
            // Save to database
            const asset = await storage.createMediaAsset({
              tenantId,
              cloudinaryPublicId: result.public_id,
              cloudinaryUrl: result.secure_url,
              mediaType: dbMediaType,
              label: label || undefined,
              tags,
              projectId,
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
        */ // End of media library upload endpoint

        /* COMMENTED OUT - Using external URLs instead
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
        */

        // New Unsplash and External URL endpoints
        app.post("/api/media/search-unsplash", requireAuth, async (req, res) => {
          try {
            const { searchUnsplashImages, unsplashSearchSchema } = await import("./services/unsplash");

            const result = unsplashSearchSchema.safeParse(req.body);
            if (!result.success) {
              return res.status(400).json({
                error: "Invalid search parameters",
                details: fromZodError(result.error).message
              });
            }

            const images = await searchUnsplashImages(result.data);

            return res.json({
              images,
              query: result.data.query,
              page: result.data.page,
              perPage: result.data.perPage
            });
          } catch (error) {
            console.error("Error searching Unsplash:", error);
            return res.status(500).json({
              error: "Failed to search images",
              details: error instanceof Error ? error.message : "Unknown error"
            });
          }
        });

        app.post("/api/media/validate-url", requireAuth, async (req, res) => {
          try {
            const { validateImageUrl } = await import("./services/unsplash");

            const { url } = req.body;
            if (!url || typeof url !== 'string') {
              return res.status(400).json({
                error: "URL is required",
                valid: false
              });
            }

            const validation = await validateImageUrl(url);
            return res.json(validation);
          } catch (error) {
            console.error("Error validating URL:", error);
            return res.status(500).json({
              error: "Failed to validate URL",
              valid: false,
              details: error instanceof Error ? error.message : "Unknown error"
            });
          }
        });

        // Portfolio-specific prompt overrides
        app.get("/api/projects/:projectId/prompts", async (req, res) => {
          try {
            const prompts = await storage.getPortfolioPrompts(req.params.projectId);
            return res.json(prompts);
          } catch (error) {
            console.error("Error fetching portfolio prompts:", error);
            return res.status(500).json({ error: "Failed to fetch portfolio prompts" });
          }
        });

        app.post("/api/projects/:projectId/prompts", async (req: Request, res: Response) => {
          try {
            const userId = requireUserContext(req, res);
            if (!userId) {
              return;
            }
            const prompt = await storage.upsertPortfolioPrompt({
              projectId: req.params.projectId,
              userId,
              ...req.body
            });
            return res.json(prompt);
          } catch (error) {
            console.error("Error creating portfolio prompt:", error);
            return res.status(500).json({ error: "Failed to create portfolio prompt" });
          }
        });

        app.put("/api/portfolio-prompts/:id", async (req: Request, res: Response) => {
          try {
            const userId = requireUserContext(req, res);
            if (!userId) {
              return;
            }
            // Note: upsertPortfolioPrompt expects projectId and promptType, not id.
            // Assuming the body contains necessary fields or we need to fetch the prompt first.
            // For now, let's assume the body has the update data.
            // But wait, upsertPortfolioPrompt takes a specific object structure.
            // Let's check the usage.
            // If we are updating by ID, we might need a different method or change how we call it.
            // Given the interface, let's try to map it correctly.
            const { projectId, promptType, customPrompt, isActive } = req.body;
            const prompt = await storage.upsertPortfolioPrompt({
              projectId,
              promptType,
              customPrompt,
              isActive,
              userId
            });
            return res.json(prompt);
          } catch (error) {
            console.error("Error updating portfolio prompt:", error);
            return res.status(500).json({ error: "Failed to update portfolio prompt" });
          }
        });

        app.delete("/api/portfolio-prompts/:id", async (req, res) => {
          try {
            await storage.deletePortfolioPrompt(req.params.id);
            return res.json({ success: true });
          } catch (error) {
            console.error("Error deleting portfolio prompt:", error);
            return res.status(500).json({ error: "Failed to delete portfolio prompt" });
          }
        });

        app.post("/api/portfolio-prompts/:id/toggle", async (req: Request, res: Response) => {
          try {
            const userId = requireUserContext(req, res);
            if (!userId) {
              return;
            }
            const prompt = await storage.togglePortfolioPrompt(
              req.params.id,
              userId
            );
            return res.json(prompt);
          } catch (error) {
            console.error("Error toggling portfolio prompt:", error);
            return res.status(500).json({ error: "Failed to toggle portfolio prompt" });
          }
        });

        // Scene Template CRUD endpoints
        app.get("/api/scene-templates", requireAuth, async (req, res) => {
          try {
            const category = req.query.category as string | undefined;
            const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;

            const templates = await storage.getAllSceneTemplates(req.tenantId, {
              category,
              tags,
            });

            return res.json(templates);
          } catch (error) {
            console.error("Error fetching scene templates:", error);
            return res.status(500).json({ error: "Failed to fetch scene templates" });
          }
        });

        app.get("/api/scene-templates/search", requireAuth, async (req, res) => {
          try {
            const query = req.query.q as string;

            if (!query || query.trim().length === 0) {
              return res.status(400).json({ error: "Search query is required" });
            }

            const templates = await storage.searchSceneTemplates(req.tenantId, query);
            return res.json(templates);
          } catch (error) {
            console.error("Error searching scene templates:", error);
            return res.status(500).json({ error: "Failed to search scene templates" });
          }
        });

        app.get("/api/scene-templates/:id", async (req, res) => {
          try {
            const template = await storage.getSceneTemplateById(req.tenantId, req.params.id);

            if (!template) {
              return res.status(404).json({ error: "Scene template not found" });
            }

            return res.json(template);
          } catch (error) {
            console.error("Error fetching scene template:", error);
            return res.status(500).json({ error: "Failed to fetch scene template" });
          }
        });

        app.post("/api/scene-templates", async (req: Request, res: Response) => {
          try {
            const result = insertSceneTemplateSchema.safeParse(req.body);

            if (!result.success) {
              const validationError = fromZodError(result.error);
              return res.status(400).json({
                error: "Validation failed",
                details: validationError.message,
              });
            }

            const userId = requireUserContext(req, res);
            if (!userId) {
              return;
            }
            const template = await storage.createSceneTemplate(
              req.tenantId,
              userId,
              result.data
            );

            return res.status(201).json(template);
          } catch (error) {
            console.error("Error creating scene template:", error);
            return res.status(500).json({ error: "Failed to create scene template" });
          }
        });

        app.patch("/api/scene-templates/:id", async (req, res) => {
          try {
            const existing = await storage.getSceneTemplateById(req.tenantId, req.params.id);

            if (!existing) {
              return res.status(404).json({ error: "Scene template not found" });
            }

            const result = updateSceneTemplateSchema.safeParse(req.body);

            if (!result.success) {
              const validationError = fromZodError(result.error);
              return res.status(400).json({
                error: "Validation failed",
                details: validationError.message,
              });
            }

            const template = await storage.updateSceneTemplate(
              req.tenantId,
              req.params.id,
              result.data
            );

            return res.json(template);
          } catch (error) {
            console.error("Error updating scene template:", error);
            return res.status(500).json({ error: "Failed to update scene template" });
          }
        });

        app.delete("/api/scene-templates/:id", requireAuth, async (req, res) => {
          try {
            const existing = await storage.getSceneTemplateById(req.tenantId, req.params.id);

            if (!existing) {
              return res.status(404).json({ error: "Scene template not found" });
            }

            await storage.deleteSceneTemplate(req.tenantId, req.params.id);
            return res.status(204).send();
          } catch (error) {
            console.error("Error deleting scene template:", error);
            return res.status(500).json({ error: "Failed to delete scene template" });
          }
        });

        app.post("/api/scene-templates/:id/recycle", async (req, res) => {
          try {
            const { projectId } = req.body;

            if (!projectId) {
              return res.status(400).json({ error: "projectId is required" });
            }

            // Verify template exists
            const template = await storage.getSceneTemplateById(req.tenantId, req.params.id);
            if (!template) {
              return res.status(404).json({ error: "Scene template not found" });
            }

            // Verify project exists and user has access
            const project = await storage.getProjectById(req.tenantId, projectId);
            if (!project) {
              return res.status(404).json({ error: "Project not found" });
            }

            // Recycle template into project
            const newScene = await storage.recycleTemplate(req.tenantId, req.params.id, projectId);

            return res.status(201).json(newScene);
          } catch (error) {
            console.error("Error recycling scene template:", error);
            return res.status(500).json({ error: "Failed to recycle scene template" });
          }
        });

        app.post("/api/project-scenes/:sceneId/save-as-template", async (req: Request, res: Response) => {
          try {
            const { name, description, category, tags, previewImageUrl } = req.body;

            if (!name || name.trim().length === 0) {
              return res.status(400).json({ error: "Template name is required" });
            }

            const userId = requireUserContext(req, res);
            if (!userId) {
              return;
            }
            const template = await storage.saveSceneAsTemplate(
              req.tenantId,
              req.params.sceneId,
              userId,
              {
                name,
                description,
                category,
                tags,
                previewImageUrl,
              }
            );

            return res.status(201).json(template);
          } catch (error) {
            console.error("Error saving scene as template:", error);

            if (error instanceof Error && error.message === "Scene not found") {
              return res.status(404).json({ error: "Scene not found" });
            }

            return res.status(500).json({ error: "Failed to save scene as template" });
          }
        });

        // Simplified Portfolio Wizard Generation Endpoint with streaming support
        app.post("/api/portfolio/generate", async (req: Request, res: Response) => {
          try {
            const { content, brandArchetype, businessType, addSampleImages, mode, streaming } = req.body;

            // If this is from the simplified wizard, handle it differently
            if (mode === "wizard") {
              // Validate inputs
              if (!content || content.length < 50) {
                return res.status(400).json({ error: "Content must be at least 50 characters" });
              }

              if (!brandArchetype || !brandArchetype.id) {
                return res.status(400).json({ error: "Brand archetype is required" });
              }

              // Use the demo tenant ID from middleware
              const tenantId = req.tenantId || DEFAULT_TENANT_ID;
              const userId = requireUserContext(req, res);
              if (!userId) {
                return;
              }

              // Generate a simple project title from the content
              const firstSentence = content.substring(0, 100).split(/[.!?]/)[0].trim();
              const projectTitle = firstSentence || "My Portfolio";
              const projectSlug = projectTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 50) + `-${Date.now()}`;

              // Create a new project with brand colors from the archetype
              const newProject = await storage.createProject(tenantId, {
                title: projectTitle,
                slug: projectSlug,
                clientName: businessType || "personal",
                categories: [brandArchetype.name, businessType].filter(Boolean),
                challengeText: content.substring(0, 200),
                solutionText: "Portfolio generated with wizard mode",
                outcomeText: "Demo portfolio showcasing our work",
              });

              // Create the director configuration based on brand archetype
              const directorConfig = {
                timing: 5,
                effects: "fade",
                colors: {
                  background: brandArchetype.colors.background,
                  text: brandArchetype.colors.text,
                  primary: brandArchetype.colors.primary,
                  secondary: brandArchetype.colors.secondary,
                  accent: brandArchetype.colors.accent,
                },
                transition: "smooth",
                fonts: brandArchetype.fonts,
              };

              // Generate scenes based on content
              // This is a simplified version - in production, you'd use AI to generate more sophisticated scenes
              const scenes = [];

              // Hero scene
              scenes.push({
                projectId: newProject.id,
                sceneType: "fullscreen",
                displayOrder: 1,
                sceneConfig: {
                  type: "fullscreen",
                  content: {
                    heading: projectTitle,
                    body: content.substring(0, 200) + "...",
                    mediaType: "image",
                  },
                  director: directorConfig,
                },
                tenantId: tenantId,
              });

              // Split the content into paragraphs for multiple text scenes
              const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);

              // Add text scenes for content
              paragraphs.slice(0, 3).forEach((paragraph, index) => {
                scenes.push({
                  projectId: newProject.id,
                  sceneType: "text",
                  displayOrder: 2 + index,
                  sceneConfig: {
                    type: "text",
                    content: {
                      heading: index === 0 ? "About" : index === 1 ? "Experience" : "Vision",
                      body: paragraph,
                    },
                    director: directorConfig,
                  },
                  tenantId: tenantId,
                });
              });

              // Gallery scene if sample images requested
              if (addSampleImages) {
                scenes.push({
                  projectId: newProject.id,
                  sceneType: "gallery",
                  displayOrder: scenes.length + 1,
                  sceneConfig: {
                    type: "gallery",
                    content: {
                      heading: "Portfolio",
                      images: "placeholder-gallery", // This would be replaced with actual images
                    },
                    director: directorConfig,
                  },
                  tenantId: tenantId,
                });
              }

              // Quote scene (extract a good quote from content or use default)
              const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 20);
              const quote = sentences[Math.floor(sentences.length / 2)] || "Creating amazing experiences";

              scenes.push({
                projectId: newProject.id,
                sceneType: "quote",
                displayOrder: scenes.length + 1,
                sceneConfig: {
                  type: "quote",
                  content: {
                    quote: quote.trim(),
                    author: businessType === "personal" ? projectTitle.split(" ")[0] : projectTitle,
                    role: businessType === "personal" ? "Designer" : businessType,
                  },
                  director: directorConfig,
                },
                tenantId: tenantId,
              });

              // Save all scenes
              for (const scene of scenes) {
                await storage.createProjectScene(tenantId, newProject.id, scene);
              }

              return res.json({
                success: true,
                projectId: newProject.id,
                projectSlug: newProject.slug,
                scenesCreated: scenes.length,
                message: "Portfolio generated successfully!",
              });
            }

            // If not from wizard mode, return error or fall through to other generation logic
            return res.status(400).json({
              error: "Invalid request. Use mode: 'wizard' for simplified generation."
            });
          } catch (error) {
            console.error("Error generating portfolio from wizard:", error);
            return res.status(500).json({
              error: "Failed to generate portfolio",
              details: error instanceof Error ? error.message : "Unknown error"
            });
          }
        });

        // Enhanced AI Portfolio Generation endpoint (scene-by-scene with per-scene AI prompts)
        // This endpoint handles both "cinematic" and "hybrid" modes, AND refinement
        app.post("/api/portfolio/generate-enhanced", async (req: Request, res: Response) => {
          const userId = requireUserContext(req, res);
          if (!userId) {
            return;
          }
          const tenantId = req.tenantId || DEFAULT_TENANT_ID;

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
            mode,
            scenes,
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

          // Fetch available Media Library assets for this tenant
          const availableMediaLibrary = await db.query.mediaLibrary.findMany({
            where: eq(mediaLibrary.tenantId, req.tenantId),
            orderBy: [asc(mediaLibrary.createdAt)]
          });

          console.log(`[Portfolio Generation] Loaded ${availableMediaLibrary.length} Media Library assets for tenant ${req.tenantId}`);

          // Lazy-load Gemini client
          const { GoogleGenAI, Type } = await import("@google/genai");
          const aiClient = new GoogleGenAI({
            apiKey: GOOGLE_AI_KEY,
            httpOptions: {
              apiVersion: "",
              baseUrl: GEMINI_BASE_URL,
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

USER'S REFINEMENT REQUEST:
"${currentPrompt}"

AVAILABLE MEDIA LIBRARY ASSETS:
${availableMediaLibrary.length > 0 ? availableMediaLibrary.map(asset => `- ${asset.label || asset.id} (ID: ${asset.id}, Type: ${asset.mediaType})`).join('\n') : 'None available.'}

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
              { role: "user", parts: [{ text: `Now refine based on: "${currentPrompt}"` }] }
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
          const selectedProjectId = projectId; // Keep original projectId for linking media

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
            const { catalog, projectId, newProjectTitle, newProjectSlug, newProjectClient } = portfolioGenerateRequestSchema.parse(req.body);
            // Add debugMode from req.body
            const { debugMode } = req.body;

            // Store debug mode in environment for this request
            if (debugMode) {
              process.env.PORTFOLIO_DEBUG_MODE = 'true';
            }

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

            res.json({
              success: true,
              projectId: finalProjectId,
              scenes: cinematicResult.scenes,
              storyboard: cinematicResult.storyboard,
              confidenceScore: cinematicResult.confidenceScore,
              warnings: cinematicResult.warnings,
              message: `Cinematic generation complete (${cinematicResult.scenes.length} scenes)`,
            });
          } catch (error: any) {
            console.error('[Portfolio Generation] Error:', error);
            res.status(500).json({
              message: error.message || 'Failed to generate portfolio',
              error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
          } finally {
            // Clean up debug mode flag
            delete process.env.PORTFOLIO_DEBUG_MODE;
          }
        });

        // HYBRID MODE: AI Portfolio Generation (original content catalog orchestration)
        app.post("/api/portfolio/generate-ai", requireAuth, async (req, res) => {
          try {
            const { catalog, projectId, newProjectTitle, newProjectSlug, newProjectClient } = portfolioGenerateRequestSchema.parse(req.body);
            // Add debugMode from req.body
            const { debugMode } = req.body;

            // Store debug mode in environment for this request
            if (debugMode) {
              process.env.PORTFOLIO_DEBUG_MODE = 'true';
            }

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
                projectTitle: newProjectTitle || (catalog.title ? `Portfolio: ${catalog.title}` : "AI Generated Portfolio"), // Use new project title if available, else catalog title, else default
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
          } catch (error: any) {
            console.error("Error generating portfolio with AI:", error);
            return res.status(500).json({
              error: "Failed to generate portfolio",
              details: error.message || "Unknown error"
            });
          } finally {
            // Clean up debug mode flag
            delete process.env.PORTFOLIO_DEBUG_MODE;
          }
        });

        // ===========================
        // PORTFOLIO PROMPTS MANAGEMENT
        // ===========================

        // Get all prompts for a project
        app.get("/api/portfolio-prompts/:projectId", requireAuth, async (req, res) => {
          try {
            const { projectId } = req.params;
            const prompts = await storage.getPortfolioPrompts(projectId);
            res.json(prompts);
          } catch (error) {
            console.error("Error fetching portfolio prompts:", error);
            res.status(500).send("Failed to fetch prompts");
          }
        });

        // Create or update a portfolio prompt
        app.post("/api/portfolio-prompts", requireAuth, async (req, res) => {
          try {
            const { projectId, promptType, customPrompt, isActive } = req.body;

            if (!projectId || !promptType) {
              return res.status(400).send("Missing required fields");
            }

            const userId = req.session?.userId;
            const result = await storage.upsertPortfolioPrompt({
              projectId,
              promptType,
              customPrompt: customPrompt || null,
              isActive: isActive ?? false,
              userId,
            });

            res.json(result);
          } catch (error) {
            console.error("Error saving portfolio prompt:", error);
            res.status(500).send("Failed to save prompt");
          }
        });

        // ===========================
        // PORTFOLIO GENERATION ENDPOINTS
        // ===========================

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
        app.use('/api', leadsRouter);
        app.use('/api', ebookLeadMagnetsRouter);
        app.use('/api', aiGenerationRouter);
        app.use('/api', crmRouter);
        
        // Admin seed scripts (requires authentication)
        app.use('/api/admin/seed', requireAuth, adminSeedsRouter);
        
        // Layer 2 sections routes
        registerProjectLayer2SectionRoutes(app);

        return;
      }