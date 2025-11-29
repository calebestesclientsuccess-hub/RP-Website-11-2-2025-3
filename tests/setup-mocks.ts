/**
 * Centralized mock registration for external services
 * Import this file at the top of tests/setup.ts to enable mocks globally
 */

import { vi, beforeEach } from 'vitest';
import { mockRedis } from './mocks/redis.mock';
import { mockResend } from './mocks/resend.mock';
import { mockCloudinary } from './mocks/cloudinary.mock';

// Mock Redis (ioredis)
vi.mock('ioredis', () => {
  class RedisCtor {
    constructor() {
      return mockRedis;
    }
  }
  return {
    __esModule: true,
    default: RedisCtor,
  };
});

// Mock Resend email service
vi.mock('resend', () => ({
  Resend: vi.fn(() => mockResend),
}));

// Mock Cloudinary
vi.mock('cloudinary', () => ({
  v2: mockCloudinary.v2,
}));

// Clear mock data before each test to ensure isolation
beforeEach(() => {
  mockRedis.clear();
  mockResend.clear();
  mockCloudinary.v2.clear();
});

// Export mocks for test assertions
export { mockRedis, mockResend, mockCloudinary };

