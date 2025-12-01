-- Migration: Add image styling fields to E-Book Lead Magnets
-- Created: 2025-12-01
-- Purpose: Add size, orientation, and style controls for preview images

ALTER TABLE "ebook_lead_magnets"
  ADD COLUMN IF NOT EXISTS "image_size" TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS "image_orientation" TEXT DEFAULT 'portrait',
  ADD COLUMN IF NOT EXISTS "image_style" TEXT DEFAULT 'shadow';

-- Add check constraints for valid values
ALTER TABLE "ebook_lead_magnets"
  ADD CONSTRAINT "ebook_lead_magnets_image_size_check" 
  CHECK (image_size IN ('small', 'medium', 'large', 'xlarge', 'full'));

ALTER TABLE "ebook_lead_magnets"
  ADD CONSTRAINT "ebook_lead_magnets_image_orientation_check" 
  CHECK (image_orientation IN ('portrait', 'landscape'));

ALTER TABLE "ebook_lead_magnets"
  ADD CONSTRAINT "ebook_lead_magnets_image_style_check" 
  CHECK (image_style IN ('shadow', 'minimal', 'elevated', 'glow', 'tilted'));

