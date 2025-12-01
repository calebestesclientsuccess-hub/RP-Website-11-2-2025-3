import { Router, Request, Response } from "express";
import { db } from "../db";
import { ebookLeadMagnets, leads } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { sendEmail } from "../utils/mailer";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { DEFAULT_TENANT_ID } from "../middleware/tenant";
import { leadLimiter } from "../middleware/rate-limit";
import { sanitizeInput } from "../middleware/input-sanitization";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Schema for lead capture on ebook download
const ebookDownloadSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  role: z.string().optional(),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
});

// PUBLIC: Get ebook config by slug
router.get("/ebooks/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;

    const ebook = await db.query.ebookLeadMagnets.findFirst({
      where: and(
        eq(ebookLeadMagnets.tenantId, tenantId),
        eq(ebookLeadMagnets.slug, slug),
        eq(ebookLeadMagnets.isEnabled, true)
      ),
    });

    if (!ebook) {
      return res.status(404).json({ error: "E-book not found" });
    }

    // Return only public fields
    const publicEbook = {
      id: ebook.id,
      slug: ebook.slug,
      h1Text: ebook.h1Text,
      h2Text: ebook.h2Text,
      bodyText: ebook.bodyText,
      previewImageUrl: ebook.previewImageUrl,
      ctaButtonText: ebook.ctaButtonText,
      successMessage: ebook.successMessage,
      calendlyLink: ebook.calendlyLink,
    };

    return res.json(publicEbook);
  } catch (error) {
    console.error("Error fetching ebook:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUBLIC: Download ebook (with lead capture)
router.post(
  "/ebooks/:slug/download",
  leadLimiter,
  sanitizeInput(["name", "role"]),
  async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const result = ebookDownloadSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }

      const { name, email, role, phone, countryCode } = result.data;
      const tenantId = req.tenantId || DEFAULT_TENANT_ID;

      // Get ebook
      const ebook = await db.query.ebookLeadMagnets.findFirst({
        where: and(
          eq(ebookLeadMagnets.tenantId, tenantId),
          eq(ebookLeadMagnets.slug, slug),
          eq(ebookLeadMagnets.isEnabled, true)
        ),
      });

      if (!ebook) {
        return res.status(404).json({ error: "E-book not found" });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const fullPhone = phone && countryCode ? `${countryCode} ${phone}` : phone;

      // Store lead in centralized table
      await db.insert(leads).values({
        tenantId,
        email: normalizedEmail,
        name,
        phone: fullPhone,
        source: `ebook-download:${slug}`,
        pageUrl: req.get("referer") || undefined,
        userAgent: req.get("user-agent") || undefined,
        ipAddress: req.ip,
        formData: JSON.stringify({
          ebookId: ebook.id,
          ebookSlug: slug,
          ebookTitle: ebook.h1Text,
          role,
        }),
      });

      // Send email to user with PDF
      try {
        await sendEmail({
          to: normalizedEmail,
          subject: `Your Free E-Book: ${ebook.h1Text}`,
          html: `
            <h1>${ebook.h1Text}</h1>
            <p>Hi ${name},</p>
            <p>Thank you for downloading our e-book! You can access it using the link below:</p>
            <p><a href="${ebook.pdfUrl}" style="display: inline-block; padding: 12px 24px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Download PDF</a></p>
            ${ebook.calendlyLink ? `
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
              <h2>Ready to take the next step?</h2>
              <p>Schedule a free consultation to see how we can help you:</p>
              <p><a href="${ebook.calendlyLink}" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Book a Call</a></p>
            ` : ''}
            <p style="margin-top: 30px; color: #888; font-size: 14px;">Revenue Party | Building GTM Systems That Scale</p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send ebook email to user:", emailError);
        // Continue anyway - the user can still download
      }

      // Notify admin
      try {
        const adminEmail = process.env.HELPSCOUT_EMAIL || "support@revenueparty.com";
        await sendEmail({
          to: adminEmail,
          replyTo: normalizedEmail,
          subject: `New E-Book Download: ${ebook.h1Text}`,
          html: `
            <h1>New E-Book Download</h1>
            <p><strong>E-Book:</strong> ${ebook.h1Text} (${slug})</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${normalizedEmail}</p>
            ${role ? `<p><strong>Role:</strong> ${role}</p>` : ''}
            ${fullPhone ? `<p><strong>Phone:</strong> ${fullPhone}</p>` : ''}
            <p><strong>Source:</strong> ${req.get("referer") || "Direct"}</p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send admin notification:", emailError);
      }

      return res.json({
        success: true,
        message: ebook.successMessage,
        pdfUrl: ebook.pdfUrl,
        calendlyLink: ebook.calendlyLink,
      });
    } catch (error) {
      console.error("Error processing ebook download:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ADMIN: List all ebooks for tenant
router.get("/admin/ebooks", requireAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;

    const ebooks = await db.query.ebookLeadMagnets.findMany({
      where: eq(ebookLeadMagnets.tenantId, tenantId),
      orderBy: [desc(ebookLeadMagnets.createdAt)],
    });

    return res.json(ebooks);
  } catch (error) {
    console.error("Error fetching ebooks:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ADMIN: Get single ebook
router.get("/admin/ebooks/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;

    const ebook = await db.query.ebookLeadMagnets.findFirst({
      where: and(
        eq(ebookLeadMagnets.id, id),
        eq(ebookLeadMagnets.tenantId, tenantId)
      ),
    });

    if (!ebook) {
      return res.status(404).json({ error: "E-book not found" });
    }

    return res.json(ebook);
  } catch (error) {
    console.error("Error fetching ebook:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ADMIN: Create new ebook
router.post("/admin/ebooks", requireAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;

    const [newEbook] = await db.insert(ebookLeadMagnets).values({
      ...req.body,
      tenantId,
    }).returning();

    return res.status(201).json(newEbook);
  } catch (error: any) {
    console.error("Error creating ebook:", error);
    
    if (error.code === "23505") {
      return res.status(400).json({ error: "An e-book with this slug already exists" });
    }
    
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ADMIN: Update ebook
router.put("/admin/ebooks/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;

    const [updatedEbook] = await db
      .update(ebookLeadMagnets)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(and(
        eq(ebookLeadMagnets.id, id),
        eq(ebookLeadMagnets.tenantId, tenantId)
      ))
      .returning();

    if (!updatedEbook) {
      return res.status(404).json({ error: "E-book not found" });
    }

    return res.json(updatedEbook);
  } catch (error: any) {
    console.error("Error updating ebook:", error);
    
    if (error.code === "23505") {
      return res.status(400).json({ error: "An e-book with this slug already exists" });
    }
    
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ADMIN: Delete ebook
router.delete("/admin/ebooks/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;

    const [deletedEbook] = await db
      .delete(ebookLeadMagnets)
      .where(and(
        eq(ebookLeadMagnets.id, id),
        eq(ebookLeadMagnets.tenantId, tenantId)
      ))
      .returning();

    if (!deletedEbook) {
      return res.status(404).json({ error: "E-book not found" });
    }

    // TODO: Delete Cloudinary assets if needed (pdf and preview image)
    // This requires the cloudinary service to be imported and used

    return res.json({ success: true, message: "E-book deleted successfully" });
  } catch (error) {
    console.error("Error deleting ebook:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

