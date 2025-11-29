import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import express from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "../../server/db";
import { registerRoutes } from "../../server/routes";
import {
  tenants,
  users,
  projects,
  mediaLibrary,
} from "@shared/schema";

describe("Case Study content routes", () => {
  const tenantId = "test-tenant-case-study";
  let request: supertest.SuperTest<supertest.Test>;
  let projectId: string;
  let mediaId: string;

  beforeAll(async () => {
    const dbInstance = global.testDb || db;

    await dbInstance.insert(tenants).values({
      id: tenantId,
      name: "Case Study Tenant",
      slug: "case-study-tenant",
    });

    const hashedPassword = await bcrypt.hash("TestPass123!", 10);
    await dbInstance.insert(users).values({
      tenantId,
      username: "case-tester",
      email: "case@test.com",
      password: hashedPassword,
    });

    const [project] = await dbInstance
      .insert(projects)
      .values({
        tenantId,
        slug: "case-study-slug",
        title: "Case Study Project",
      })
      .returning();
    projectId = project.id;

    const [media] = await dbInstance
      .insert(mediaLibrary)
      .values({
        tenantId,
        cloudinaryPublicId: "test-public-id",
        cloudinaryUrl: "https://example.com/image.jpg",
        mediaType: "image",
      })
      .returning();
    mediaId = media.id;

    const app = express();
    app.use(express.json());
    app.use(
      session({
        secret: "test-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );
    app.use((req, _res, next) => {
      req.session.tenantId = tenantId;
      req.tenantId = tenantId;
      next();
    });

    await registerRoutes(app);
    request = supertest.agent(app);

    await request.post("/api/auth/login").send({
      username: "case-tester",
      password: "TestPass123!",
    });
  });

  it("saves case study content and returns it via GET route", async () => {
    const payload = {
      content: {
        sections: [
          {
            id: "section-hero",
            title: "Hero",
            theme: { backgroundColor: "#000000" },
            blocks: [
              { type: "text", id: "hero-text", content: "Welcome" },
              {
                type: "carousel",
                id: "hero-carousel",
                items: [{ mediaId, type: "image", caption: "Library asset" }],
              },
            ],
          },
        ],
      },
    };

    const patchResponse = await request
      .patch(`/api/projects/${projectId}/content`)
      .send(payload);

    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body.project.caseStudyContent.sections).toHaveLength(
      1,
    );

    const getResponse = await request.get(
      `/api/branding/projects/${projectId}`,
    );

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.caseStudyContent.sections[0].blocks).toHaveLength(
      2,
    );

    const stored = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));
    expect(stored[0].caseStudyContent?.sections?.length).toBe(1);
  });

  it("rejects content referencing unauthorized media", async () => {
    const dbInstance = global.testDb || db;
    const foreignTenantId = "case-study-foreign-tenant";
    await dbInstance
      .insert(tenants)
      .values({
        id: foreignTenantId,
        name: "Foreign Tenant",
        slug: `foreign-${Date.now()}`,
      })
      .onConflictDoNothing();

    const [foreignMedia] = await dbInstance
      .insert(mediaLibrary)
      .values({
        tenantId: foreignTenantId,
        cloudinaryPublicId: "foreign",
        cloudinaryUrl: "https://example.com/foreign.jpg",
        mediaType: "image",
      })
      .returning();

    const response = await request
      .patch(`/api/projects/${projectId}/content`)
      .send({
        content: {
          sections: [
            {
              id: "invalid-section",
              title: "Bad Section",
              blocks: [
                {
                  type: "carousel",
                  id: "bad-carousel",
                  items: [{ mediaId: foreignMedia.id, type: "image" }],
                },
              ],
            },
          ],
        },
      });

    expect(response.status).toBe(400);
    expect(response.body.invalidIds).toContain(foreignMedia.id);
  });

  it("keeps legacy scene endpoints functional", async () => {
    const response = await request.get(
      `/api/branding/projects/${projectId}/scenes`,
    );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

