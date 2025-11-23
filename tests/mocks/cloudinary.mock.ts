/**
 * Cloudinary media service mock for testing
 * Returns dummy URLs without uploading to real cloud storage
 */

export interface MockUploadResult {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  type: string;
  url: string;
  secure_url: string;
}

export interface MockUploadOptions {
  folder?: string;
  public_id?: string;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: any;
  tags?: string[];
}

class MockCloudinaryUploader {
  private uploads: MockUploadResult[] = [];
  private shouldFail = false;
  private failureError: Error | null = null;

  async upload(
    file: string | Buffer,
    options?: MockUploadOptions
  ): Promise<MockUploadResult> {
    if (this.shouldFail) {
      throw this.failureError || new Error('Mock upload failure');
    }

    const publicId = options?.public_id || `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const folder = options?.folder || 'test';
    const fullPublicId = `${folder}/${publicId}`;

    const result: MockUploadResult = {
      public_id: fullPublicId,
      version: Date.now(),
      signature: 'mock-signature',
      width: 1920,
      height: 1080,
      format: 'jpg',
      resource_type: options?.resource_type || 'image',
      created_at: new Date().toISOString(),
      bytes: typeof file === 'string' ? file.length : file.length,
      type: 'upload',
      url: `http://res.cloudinary.com/mock-cloud/image/upload/${fullPublicId}.jpg`,
      secure_url: `https://res.cloudinary.com/mock-cloud/image/upload/${fullPublicId}.jpg`,
    };

    this.uploads.push(result);
    return result;
  }

  async destroy(publicId: string): Promise<{ result: string }> {
    if (this.shouldFail) {
      throw this.failureError || new Error('Mock destroy failure');
    }

    const index = this.uploads.findIndex((u) => u.public_id === publicId);
    if (index !== -1) {
      this.uploads.splice(index, 1);
      return { result: 'ok' };
    }

    return { result: 'not found' };
  }

  // Test helpers
  getUploads(): MockUploadResult[] {
    return [...this.uploads];
  }

  getLastUpload(): MockUploadResult | undefined {
    return this.uploads[this.uploads.length - 1];
  }

  clear(): void {
    this.uploads = [];
    this.shouldFail = false;
    this.failureError = null;
  }

  simulateFailure(error?: Error): void {
    this.shouldFail = true;
    this.failureError = error || new Error('Simulated upload failure');
  }

  restoreSuccess(): void {
    this.shouldFail = false;
    this.failureError = null;
  }

  getUploadCount(): number {
    return this.uploads.length;
  }

  getUploadsByFolder(folder: string): MockUploadResult[] {
    return this.uploads.filter((upload) => upload.public_id.startsWith(`${folder}/`));
  }
}

class MockCloudinaryApi {
  async resource(publicId: string): Promise<MockUploadResult | null> {
    // Simulate fetching resource metadata
    return {
      public_id: publicId,
      version: Date.now(),
      signature: 'mock-signature',
      width: 1920,
      height: 1080,
      format: 'jpg',
      resource_type: 'image',
      created_at: new Date().toISOString(),
      bytes: 12345,
      type: 'upload',
      url: `http://res.cloudinary.com/mock-cloud/image/upload/${publicId}.jpg`,
      secure_url: `https://res.cloudinary.com/mock-cloud/image/upload/${publicId}.jpg`,
    };
  }

  async resources(options?: any): Promise<{ resources: MockUploadResult[] }> {
    return { resources: [] };
  }
}

export class MockCloudinaryV2 {
  public uploader: MockCloudinaryUploader;
  public api: MockCloudinaryApi;

  constructor() {
    this.uploader = new MockCloudinaryUploader();
    this.api = new MockCloudinaryApi();
  }

  config(options: any): void {
    // Mock config - does nothing
  }

  // Expose test helpers at top level
  getUploads(): MockUploadResult[] {
    return this.uploader.getUploads();
  }

  clear(): void {
    this.uploader.clear();
  }
}

export const mockCloudinary = {
  v2: new MockCloudinaryV2(),
};

