-- Migration: Add E-Book Lead Magnets table
-- Created: 2025-12-01
-- Purpose: Support downloadable e-book lead magnets with PDF uploads

CREATE TABLE IF NOT EXISTS "ebook_lead_magnets" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" VARCHAR NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "slug" TEXT NOT NULL,
  "h1_text" TEXT NOT NULL,
  "h2_text" TEXT,
  "body_text" TEXT,
  "pdf_url" TEXT NOT NULL,
  "pdf_public_id" TEXT,
  "preview_image_url" TEXT,
  "preview_image_public_id" TEXT,
  "cta_button_text" TEXT DEFAULT 'Get Free Access',
  "success_message" TEXT DEFAULT 'Check your email for your free e-book!',
  "calendly_link" TEXT,
  "is_enabled" BOOLEAN DEFAULT FALSE NOT NULL,
  "sort_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  CONSTRAINT "ebook_lead_magnets_tenant_id_slug_unique" UNIQUE ("tenant_id", "slug")
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS "ebook_lead_magnets_tenant_enabled_idx" ON "ebook_lead_magnets" ("tenant_id", "is_enabled");
CREATE INDEX IF NOT EXISTS "ebook_lead_magnets_slug_idx" ON "ebook_lead_magnets" ("slug");

