# Media Library Upload Fix - Complete

## Problem
Media Library uploads continued to fail with red error toasts for both JPG and MP4 files. Smaller images would sometimes succeed, but anything sizeable or any request coming from an unauthenticated tab consistently failed.

## Root Cause
Two distinct issues were at play:

1. **Authentication** – The upload route is protected by `requireAuth`, but the frontend `fetch` call did not send credentials. Browsers therefore stripped cookies and the backend returned `401 Unauthorized`.
2. **Upload mechanism** – The backend converted every file buffer into a massive base64 Data URI before calling `cloudinary.uploader.upload`. Large videos (50 MB limit) blew up in transit, regularly causing Cloudinary failures and red toasts even when creds were valid.

## Solution Implemented

### Backend Changes (`server/routes.ts`)
1. **Streaming Uploads (current change)**
   ```typescript
   const resourceType = req.file.mimetype.startsWith("video/") ? "video" : "image";
   const result = await new Promise<UploadApiResponse>((resolve, reject) => {
     const uploadStream = cloudinary.uploader.upload_stream(
       { folder: "revenue_party", resource_type: resourceType },
       (error, uploadResult) => {
         if (error) return reject(error);
         if (!uploadResult) return reject(new Error("Cloudinary did not return a result"));
         resolve(uploadResult);
       },
     );

     uploadStream.end(req.file!.buffer);
   });
   ```
   - Streams the original buffer directly to Cloudinary instead of inflating it into a base64 string.
   - Handles both `image` and `video` resource types and logs the exact Cloudinary error when one occurs.
   - Keeps the existing DB insert/tag logic untouched, so downstream consumers still receive the same shape.

2. **(Previous) Added Status Endpoint**
   ```typescript
   app.get("/api/media-library/status", requireAuth, (req, res) => {
     return res.json({ cloudinaryEnabled });
   });
   ```

2. **Added Guard Checks to Upload/Delete**
   - Upload endpoint now returns HTTP 503 with clear error when Cloudinary is disabled
   - Delete endpoint has the same protection
   - Both endpoints provide helpful error messages about required env vars

### Frontend Changes (`client/src/pages/admin/MediaLibrary.tsx`)
1. **Credentialled Upload Requests (current change)**
   ```typescript
   const response = await fetch("/api/media-library/upload", {
     method: "POST",
     body: formData,
     credentials: "include",
   });
   ```
   - Ensures the session cookie rides along so `requireAuth` passes and the server no longer replies with `401 Unauthorized`.

2. **Status Query, Alerts & Guards (previous change)**
   - Added `/api/media-library/status` query with alert banner when uploads are disabled.
   - Blocks file selection when Cloudinary is turned off to prevent wasted attempts.

## How to Enable Uploads

Add these environment variables to `.env` and restart the server (already present in shared `.env` for dev, but included here for completeness):

```
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## Troubleshooting

1. **Red “Unauthorized” toast**
   - Ensure the Admin tab is authenticated (click “Admin Login” button to establish a session).
   - Confirm the upload request includes cookies in DevTools → Network (should show `Cookie` header). The new `credentials: "include"` call handles this automatically.

2. **Large uploads fail immediately**
   - Verify the file is ≤ 50 MB (Multer limit).
   - Inspect server logs for `[Media Upload] Cloudinary upload_stream error` entries. These now surface the exact Cloudinary error message.

3. **Status banner missing**
   - Hard refresh (Cmd+Shift+R) to reload the latest bundle.
   - Hit `http://localhost:5002/api/media-library/status` while authenticated; expect `{"cloudinaryEnabled": true}` when creds are present.
   - Check server startup logs for Cloudinary warnings.

## Files Modified
- `server/routes.ts` - Added status endpoint + guards
- `client/src/pages/admin/MediaLibrary.tsx` - Added status check + UI alerts

## Status
✅ Authenticated upload requests
✅ Streaming uploads for large files
✅ Status endpoint + alerts
✅ Error messages improved

**Manual Verification**: Restart the dev server, log into `/admin/media-library`, upload both a JPG and MP4, confirm success toasts and Cloudinary entries.

