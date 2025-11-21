import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertCampaignSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { requireAuth } from "../middleware/auth";
import { DEFAULT_TENANT_ID } from "../middleware/tenant";

const router = Router();

// Public endpoints
router.get("/public/campaigns", async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;
    const campaigns = await storage.getAllCampaigns(tenantId);
    // Filter active campaigns only for public view
    const activeCampaigns = campaigns.filter(c => c.isActive);
    return res.json(activeCampaigns);
  } catch (error) {
    console.error("Error fetching public campaigns:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Admin endpoints (Protected)
router.get("/campaigns", requireAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;
    const campaigns = await storage.getAllCampaigns(tenantId);
    return res.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/campaigns", requireAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;
    const result = insertCampaignSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: fromZodError(result.error).message 
      });
    }

    const campaign = await storage.createCampaign(tenantId, result.data);
    return res.status(201).json(campaign);
  } catch (error) {
    console.error("Error creating campaign:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/campaigns/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;
    const campaign = await storage.getCampaignById(tenantId, req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    
    return res.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/campaigns/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;
    const existing = await storage.getCampaignById(tenantId, req.params.id);
    
    if (!existing) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const result = insertCampaignSchema.partial().safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: fromZodError(result.error).message 
      });
    }

    const updated = await storage.updateCampaign(tenantId, req.params.id, result.data);
    return res.json(updated);
  } catch (error) {
    console.error("Error updating campaign:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/campaigns/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;
    const existing = await storage.getCampaignById(tenantId, req.params.id);
    
    if (!existing) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    await storage.deleteCampaign(tenantId, req.params.id);
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

