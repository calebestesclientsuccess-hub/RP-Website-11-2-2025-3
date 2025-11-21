import { Router, Request, Response } from "express";
import { db } from "../db";
import { companies, contacts, deals, leads, tasks } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { getUncachableResendClient } from "../utils/resend-client";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { DEFAULT_TENANT_ID } from "../middleware/tenant";
import { leadLimiter } from "../middleware/rate-limit";

const router = Router();

const leadSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  message: z.string().optional(),
  source: z.string().default("website"),
  pageUrl: z.string().optional(),
});

router.post("/leads", leadLimiter, async (req: Request, res: Response) => {
  try {
    // 1. Validate Input
    const result = leadSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: fromZodError(result.error).message });
    }
    const { email, firstName, lastName, companyName, message, source, pageUrl } = result.data;
    const tenantId = req.tenantId || DEFAULT_TENANT_ID; // Assuming middleware populates req.tenantId

    // Extract domain
    const normalizedEmail = email.trim().toLowerCase();
    const domain = normalizedEmail.split('@')[1]?.toLowerCase();
    if (!domain) {
      return res.status(400).json({ error: "Invalid email domain" });
    }

    let companyId: string;
    let emailQueued = false;
    let contactId: string | undefined;

    // 2. Transactional DB Write
    await db.transaction(async (tx) => {
      // a. Check/Create Company
      const existingCompany = await tx.query.companies.findFirst({
        where: (c, { eq, and }) => and(eq(c.domain, domain), eq(c.tenantId, tenantId)),
      });

      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        const [newCompany] = await tx.insert(companies).values({
          tenantId,
          name: companyName || domain, // Fallback to domain if name not provided
          domain,
        }).returning();
        companyId = newCompany.id;
      }

      // b. Upsert Contact
      const existingContact = await tx.query.contacts.findFirst({
        where: (c, { eq, and }) => and(eq(c.email, normalizedEmail), eq(c.tenantId, tenantId)),
      });

      if (existingContact) {
        await tx.update(contacts)
          .set({
            firstName: firstName ?? existingContact.firstName,
            lastName: lastName ?? existingContact.lastName,
            companyId,
          })
          .where(eq(contacts.id, existingContact.id));
        contactId = existingContact.id;
      } else {
        const [newContact] = await tx.insert(contacts).values({
          tenantId,
          companyId,
          email: normalizedEmail,
          firstName,
          lastName,
        }).returning();
        contactId = newContact.id;
      }

      // c. Persist Lead entry (for audits)
      const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || null;
      await tx.insert(leads).values({
        tenantId,
        email: normalizedEmail,
        name: fullName,
        company: companyName || domain,
        source,
        pageUrl,
        userAgent: req.get("user-agent") || undefined,
        ipAddress: req.ip,
        formData: message ? JSON.stringify({ message }) : undefined,
      });

      if (contactId) {
        const [newDeal] = await tx.insert(deals).values({
          tenantId,
          companyId,
          contactId,
          ownerId: req.userId,
          name: `New lead from ${companyName || domain}`,
          description: message,
          source,
        }).returning();

        await tx.insert(tasks).values({
          tenantId,
          companyId,
          contactId,
          dealId: newDeal.id,
          ownerId: req.userId,
          title: `Follow up with ${firstName || normalizedEmail}`,
          description: message,
          priority: "high",
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
          status: "open",
        });
      }
    });

    // 3. Send Email (Help Scout)
    // Only happens if transaction succeeded
    try {
      const { client, fromEmail } = await getUncachableResendClient();
      const helpScoutEmail = process.env.HELPSCOUT_EMAIL || "support@revenueparty.com"; // Replace with actual

      await client.emails.send({
        from: fromEmail,
        to: helpScoutEmail,
        replyTo: normalizedEmail,
        subject: `New Lead: ${firstName || ''} ${lastName || ''} from ${companyName || domain}`,
        html: `
          <h1>New Lead Submission</h1>
          <p><strong>Name:</strong> ${firstName || ''} ${lastName || ''}</p>
          <p><strong>Email:</strong> ${normalizedEmail}</p>
          <p><strong>Company:</strong> ${companyName || 'N/A'} (${domain})</p>
          <p><strong>Source:</strong> ${source}</p>
          ${pageUrl ? `<p><strong>Page URL:</strong> ${pageUrl}</p>` : ''}
          <p><strong>Message:</strong></p>
          <blockquote style="border-left: 4px solid #ccc; padding-left: 10px; color: #555;">
            ${message || 'No message'}
          </blockquote>
        `,
      });
      emailQueued = true;
    } catch (emailError) {
      console.error("Failed to send lead email:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Lead captured successfully",
      emailQueued,
      companyId,
    });

  } catch (error) {
    console.error("Lead capture error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

