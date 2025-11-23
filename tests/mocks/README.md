# Test Mocks

This directory contains mock implementations of external services used during testing.

## Available Mocks

### Redis Mock (`redis.mock.ts`)

In-memory Redis implementation with TTL support. All Redis operations are isolated per test.

**Usage in tests:**

```typescript
import { mockRedis } from '../mocks/redis.mock';

test('lockout counter increments', async () => {
  await mockRedis.set('lockout:user:123', '3', 'EX', 300);
  const count = await mockRedis.get('lockout:user:123');
  expect(count).toBe('3');
});
```

### Resend Mock (`resend.mock.ts`)

Email service mock that captures sent emails without hitting the Resend API.

**Usage in tests:**

```typescript
import { mockResend } from '../mocks/resend.mock';

test('welcome email is sent', async () => {
  // Trigger code that sends email
  await sendWelcomeEmail('user@example.com');
  
  // Assert email was sent
  const sentEmails = mockResend.getSentEmails();
  expect(sentEmails).toHaveLength(1);
  expect(sentEmails[0].to).toBe('user@example.com');
  expect(sentEmails[0].subject).toContain('Welcome');
});

test('handles email failure', async () => {
  mockResend.emails.simulateFailure(new Error('Network error'));
  
  await expect(sendEmail('user@example.com')).rejects.toThrow('Network error');
  
  mockResend.emails.restoreSuccess();
});
```

### Cloudinary Mock (`cloudinary.mock.ts`)

Media upload mock that returns dummy URLs without uploading to cloud storage.

**Usage in tests:**

```typescript
import { mockCloudinary } from '../mocks/cloudinary.mock';

test('image upload returns secure URL', async () => {
  const result = await cloudinaryUpload(imageBuffer, { folder: 'avatars' });
  
  expect(result.secure_url).toContain('https://');
  
  const uploads = mockCloudinary.getUploads();
  expect(uploads).toHaveLength(1);
  expect(uploads[0].public_id).toContain('avatars/');
});
```

## How Mocks Are Registered

Mocks are automatically registered via `tests/setup-mocks.ts`, which is imported at the top of `tests/setup.ts`. This ensures:

1. All tests use mocks by default (no real network calls)
2. Mock state is cleared before each test (`beforeEach`)
3. Mocks are available globally without per-test imports

## Assertion Helpers

Each mock exposes helper methods for test assertions:

### Redis
- `mockRedis.clear()` - Clear all data
- `mockRedis.keys(pattern)` - List keys matching pattern
- `mockRedis.get/set/incr/expire` - Standard Redis operations

### Resend
- `mockResend.getSentEmails()` - Get all sent emails
- `mockResend.getLastSentEmail()` - Get most recent email
- `mockResend.getEmailsTo(recipient)` - Filter by recipient
- `mockResend.getEmailsBySubject(text)` - Filter by subject
- `mockResend.clear()` - Clear sent emails

### Cloudinary
- `mockCloudinary.getUploads()` - Get all uploads
- `mockCloudinary.getLastUpload()` - Get most recent upload
- `mockCloudinary.v2.uploader.getUploadsByFolder(folder)` - Filter by folder
- `mockCloudinary.clear()` - Clear uploads

## When to Use Real Services

For E2E tests (Playwright), you may want real services. To bypass mocks in E2E:

1. E2E tests run in a separate process (not Vitest)
2. They use `TEST_DATABASE_URL` but can use real Redis/Resend/Cloudinary
3. Configure real service URLs in `.env.test.local` for E2E scenarios

For most unit and integration tests, use these mocks to ensure:
- Fast execution (no network I/O)
- Deterministic results (no external dependencies)
- Isolated test state (mocks cleared per test)

