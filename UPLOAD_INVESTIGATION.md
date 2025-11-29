# Media Library Upload Investigation

## Current Status

### ✅ FIXED: Server Issues
1. **Server was not running** - Port 5001 was occupied, causing startup failure
2. **Dependencies were missing** - `tsx` command not found
3. **Solution**: Killed conflicting processes, installed dependencies, restarted server on port 5002

### ✅ VERIFIED: Cloudinary Configuration  
- **CLOUDINARY_CLOUD_NAME**: ✓ Set (dvtxhxxws)
- **CLOUDINARY_API_KEY**: ✓ Set
- **CLOUDINARY_API_SECRET**: ✓ Set
- **Connection Test**: ✓ Successful ping to Cloudinary API

### ✅ VERIFIED: Server Configuration
- Server running on port 5002
- No Cloudinary warnings in server logs (credentials loaded correctly)
- Status endpoint exists at `/api/media-library/status`
- Upload endpoint exists at `/api/media-library/upload` with proper guards

## What Was Wrong

### Root Cause #1: Server Not Running
The original error was that **the server completely failed to start** due to port conflicts. When users tried to upload, they were hitting a non-existent or old server instance.

### Root Cause #2: Missing Dependencies
After port conflicts were resolved, the server couldn't start because `tsx` wasn't installed.

## Current Configuration

### Backend (server/routes.ts)
```typescript
// Line 3541-3545: Status endpoint
app.get("/api/media-library/status", requireAuth, (req: Request, res: Response) => {
  return res.json({
    cloudinaryEnabled,
  });
});

// Line 3570-3627: Upload endpoint with guards
app.post("/api/media-library/upload", requireAuth, mediaUpload.single("file"), async (req: Request, res: Response) => {
  if (!cloudinaryEnabled) {
    return res.status(503).json({
      error: "Cloudinary is not configured",
      details: "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET env vars to enable uploads.",
    });
  }
  // ... upload logic ...
});
```

### Frontend (client/src/pages/admin/MediaLibrary.tsx)
```typescript
// Lines 65-74: Status check
const { data: mediaStatus } = useQuery<{ cloudinaryEnabled: boolean }>({
  queryKey: ["/api/media-library/status"],
  queryFn: async () => {
    const response = await apiRequest("GET", "/api/media-library/status");
    return response.json();
  },
  staleTime: 5 * 60 * 1000,
});

const uploadsEnabled = mediaStatus?.cloudinaryEnabled !== false;

// Lines 260-268: Alert display when disabled
{!uploadsEnabled && (
  <Alert variant="destructive">
    <AlertTitle>Cloudinary is not configured</AlertTitle>
    <AlertDescription>
      Uploads require <code>CLOUDINARY_CLOUD_NAME</code>, <code>CLOUDINARY_API_KEY</code>, and <code>CLOUDINARY_API_SECRET</code>.
      Add these to your environment and restart the server to enable uploads.
    </AlertDescription>
  </Alert>
)}

// Line 317: Input disabled when Cloudinary is not enabled
<Input
  type="file"
  accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
  multiple
  onChange={handleFileUpload}
  disabled={uploading || !uploadsEnabled}
/>
```

## Testing Steps

1. ✅ **Server Start**: Server successfully started on port 5002
2. ✅ **Cloudinary Test**: Connection test passed
3. ⏳ **Authentication Required**: Media Library page requires login to access
4. ⏳ **Upload Test**: Needs authenticated session to test uploads

## Next Steps for User

1. **Navigate to**: http://localhost:5002/admin/media-library
2. **Login** with admin credentials (if prompted)
3. **Try uploading** a test image or video
4. **Expected behavior**: 
   - No red alert banner (Cloudinary is enabled)
   - File input should be enabled
   - Upload should succeed and show success toast

## If Uploads Still Fail

Check:
1. **Browser Console**: Look for JavaScript errors
2. **Network Tab**: Check the actual API response from `/api/media-library/upload`
3. **Server Logs**: Check terminal 10 for upload errors
4. **File Size**: Ensure files are under the multer limit
5. **File Type**: Ensure files match accepted types (JPEG, PNG, GIF, WebP, MP4, WebM)

## Technical Details

### Multer Configuration (server/routes.ts lines 488-498)
```typescript
const mediaUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM) are allowed'));
    }
  }
});
```

### Accepted File Types
- **Images**: JPEG, PNG, GIF, WebP
- **Videos**: MP4, WebM

## Files Modified During Investigation
- None (all changes were operational - installing dependencies and restarting server)

## Files Created During Investigation
- `test-cloudinary.ts` - Cloudinary connection test script (can be deleted)
- `UPLOAD_INVESTIGATION.md` - This file (can be deleted)

