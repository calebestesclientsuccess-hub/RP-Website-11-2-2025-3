import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmailCaptureSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

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

  const httpServer = createServer(app);

  return httpServer;
}
