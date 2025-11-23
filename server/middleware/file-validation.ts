
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// File type validation using magic numbers (file signatures)
const FILE_SIGNATURES: Record<string, Buffer[]> = {
  'application/pdf': [Buffer.from([0x25, 0x50, 0x44, 0x46])], // %PDF
  'image/jpeg': [
    Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]),
    Buffer.from([0xFF, 0xD8, 0xFF, 0xE1]),
    Buffer.from([0xFF, 0xD8, 0xFF, 0xE8]),
  ],
  'image/png': [Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])],
  'image/gif': [
    Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]), // GIF87a
    Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]), // GIF89a
  ],
  'image/webp': [Buffer.from([0x52, 0x49, 0x46, 0x46])], // RIFF
};

/**
 * Verify file type by checking magic numbers
 */
function verifyFileType(buffer: Buffer, mimeType: string): boolean {
  const signatures = FILE_SIGNATURES[mimeType];
  if (!signatures) return false;

  return signatures.some(signature => {
    return buffer.slice(0, signature.length).equals(signature);
  });
}

/**
 * Simple malware detection - check for suspicious patterns
 */
function scanForMalware(buffer: Buffer): boolean {
  const content = buffer.toString('utf-8', 0, Math.min(buffer.length, 10000));
  
  // Check for common malware signatures
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i,
    /onload=/i,
    /eval\(/i,
    /\.exe/i,
    /\.bat/i,
    /\.cmd/i,
    /\.sh/i,
    /<\?php/i,
    /powershell/i,
    /data:text\/html/i,
  ];

  return !suspiciousPatterns.some(pattern => pattern.test(content));
}

/**
 * Configure multer for PDF uploads with validation
 */
export const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Verify MIME type
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }

    // Verify file extension
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf') {
      return cb(new Error('Invalid file extension'));
    }

    cb(null, true);
  },
});

/**
 * Configure multer for image uploads with validation
 */
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    // Verify MIME type
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
    }

    // Verify file extension
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!ext || !allowedExts.includes(ext)) {
      return cb(new Error('Invalid file extension'));
    }

    cb(null, true);
  },
});

/**
 * Additional validation after file upload
 */
export async function validateUploadedFile(
  file: Express.Multer.File,
  expectedMimeType: string
): Promise<{ valid: boolean; error?: string }> {
  // Verify file signature matches MIME type
  if (!verifyFileType(file.buffer, expectedMimeType)) {
    return {
      valid: false,
      error: 'File type mismatch - file content does not match extension',
    };
  }

  // Scan for malware patterns
  if (!scanForMalware(file.buffer)) {
    return {
      valid: false,
      error: 'File contains suspicious content',
    };
  }

  return { valid: true };
}

/**
 * Generate secure random filename
 */
export function generateSecureFilename(originalName: string): string {
  const sanitized = originalName.replace(/[^a-zA-Z0-9._-]/g, '');
  const ext = sanitized.includes('.') ? sanitized.split('.').pop()?.toLowerCase() : undefined;
  const randomName = crypto.randomBytes(16).toString('hex');
  const suffix = ext ? `.${ext}` : '';
  return `${Date.now()}-${randomName}${suffix}`;
}

/**
 * Middleware helper to ensure uploaded file passes validation
 */
export function ensureSafeUpload(expectedMimeType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const validation = await validateUploadedFile(file, expectedMimeType);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }
      next();
    } catch (error) {
      console.error('Upload validation failed:', error);
      res.status(500).json({ error: 'Failed to validate uploaded file' });
    }
  };
}
