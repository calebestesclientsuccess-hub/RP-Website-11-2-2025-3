# PDF Upload Fix for E-Book Lead Magnets

## Problem
The E-Book Lead Magnet admin page couldn't upload PDFs because the media library upload system only accepted images and videos.

## Root Cause
1. **Multer file filter** (line 501-515 in `server/routes.ts`) only allowed image and video MIME types
2. **Cloudinary upload** logic didn't handle PDF files (which need `resource_type: "raw"`)
3. **Database schema** typed `mediaType` as only `"image" | "video"`

## Changes Made

### 1. Updated Multer Configuration (`server/routes.ts` line 501-515)
**Before:**
```typescript
const allowedMimes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm'
];
```

**After:**
```typescript
const allowedMimes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm',
  'application/pdf'  // ✅ Added PDF support
];
```

### 2. Updated Cloudinary Upload Logic (2 locations)

**Location 1:** `server/routes.ts` line ~3997
**Before:**
```typescript
const resourceType = req.file.mimetype.startsWith("video/") ? "video" : "image";
```

**After:**
```typescript
// Determine resource type based on MIME type
let resourceType: "image" | "video" | "raw" = "image";
if (req.file.mimetype.startsWith("video/")) {
  resourceType = "video";
} else if (req.file.mimetype === "application/pdf") {
  resourceType = "raw";  // ✅ PDFs must use "raw" in Cloudinary
}
```

**Location 2:** `server/routes.ts` line ~4185
Applied the same fix to the second upload endpoint.

**Location 3:** `server/routes.ts` line ~4217
Updated the mediaType determination for database storage.

### 3. Updated Database Schema (`shared/schema.ts` line 1986)
**Before:**
```typescript
mediaType: text("media_type").notNull().$type<"image" | "video">(),
```

**After:**
```typescript
mediaType: text("media_type").notNull().$type<"image" | "video" | "raw">(),
```

## Testing
1. Go to Admin → Marketing → E-Book Lead Magnets
2. Click "Create E-Book"
3. Upload a PDF (up to 50MB)
4. Upload a preview image
5. Fill in the form and save
6. ✅ PDF should upload successfully to Cloudinary

## File Size Limits
- **PDFs:** 50MB max (same as videos)
- **Images:** 50MB max
- **Videos:** 50MB max

All limits are defined in the multer configuration at line 514 of `server/routes.ts`.

## Cloudinary Resource Types
- **Images** (JPEG, PNG, GIF, WebP) → `resource_type: "image"`
- **Videos** (MP4, WebM) → `resource_type: "video"`
- **PDFs** → `resource_type: "raw"` ✅

## Notes
- No database migration needed (column already stores text)
- No restart required if using hot reload
- PDFs will be stored in Cloudinary's "raw" resources section
- The same PDF upload fix applies to all media library uploads across the site

