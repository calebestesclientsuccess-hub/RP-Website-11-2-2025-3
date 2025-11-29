# Test Verification Guide

## Overview

This guide walks through running the full test suite locally before deployment. The test suite is critical for MVP readiness and must pass before launching to production.

## Prerequisites

### 1. Test Database Setup

The test suite requires a separate database to avoid mutating production data.

**Option A: Local PostgreSQL with Different Database**
```bash
# Set in .env.test.local or export in shell
export TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/revenue_party_test"

# Create the test database if it doesn't exist
psql -U postgres -c "CREATE DATABASE revenue_party_test;"
```

**Option B: Neon Test Branch**
```bash
# Create a test branch in Neon dashboard
# Copy the connection string and set it
export TEST_DATABASE_URL="postgresql://user:password@ep-test-branch.neon.tech/neondb"
```

**Option C: Docker Container**
```bash
# Start a test postgres instance
docker run -d \
  --name postgres-test \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=revenue_party_test \
  -p 5433:5432 \
  postgres:15-alpine

# Set the connection string
export TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5433/revenue_party_test"
```

### 2. Redis (Optional - Mocked in Tests)

The test suite mocks Redis by default, but if you want to run integration tests with real Redis:

```bash
# Option A: Local Redis
brew install redis
brew services start redis

# Option B: Docker
docker run -d --name redis-test -p 6379:6379 redis:7-alpine

# Set in environment
export REDIS_URL="redis://localhost:6379"
```

### 3. Environment Variables

Create `.env.test.local` in the project root:

```bash
# Database
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/revenue_party_test
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/revenue_party_test

# Redis (optional, mocked by default)
REDIS_URL=redis://localhost:6379

# Required for app initialization (can be dummy values for tests)
SESSION_SECRET=test-session-secret-min-32-chars-long-for-testing-purposes
GOOGLE_AI_KEY=test-google-ai-key
CLOUDINARY_CLOUD_NAME=test-cloud
CLOUDINARY_API_KEY=test-key
CLOUDINARY_API_SECRET=test-secret
RESEND_API_KEY=test-resend-key
RESEND_FROM_EMAIL=test@example.com
REPLICATE_WEBHOOK_SECRET=test-webhook-secret
APP_BASE_URL=http://0.0.0.0:5000
ALLOWED_ORIGINS=http://localhost:5173,http://0.0.0.0:5000

# Test mode
NODE_ENV=test
```

> **Important:** Even if you are only running `npm run test:unit`, `DATABASE_URL`, `SESSION_SECRET`, and `REDIS_URL` must be set.  
> The shared environment loader (`server/config/env.ts`) validates these at import time and will abort the test run if they are missing.

## Running the Test Suite

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Install Playwright Browsers

```bash
npx playwright install --with-deps
```

### Step 3: Apply Test Migrations

```bash
npm run test:setup
```

**Expected Output**:
```
[test:setup] Database migrations applied to test database.
```

**If you see an error**:
- `TEST_DATABASE_URL is not defined` → Check your environment variables
- `Connection refused` → Ensure your test database is running
- `Migration failed` → Check database permissions

### Step 4: Run Full Test Suite

```bash
npm run test:ci
```

This runs:
1. `npm run test:setup` - Apply migrations
2. `npm run test:unit` - Vitest unit tests
3. `npm run test:e2e` - Playwright E2E tests

**Expected Output**:
```
✓ tests/unit/*.test.ts (X passed)
✓ tests/integration/*.test.ts (Y passed)
✓ tests/e2e/*.spec.ts (Z passed)

Test Files  X passed (X total)
     Tests  Y passed (Y total)
```

### Step 5: Verify No Failures

**If you see failures**, diagnose by running test suites individually:

```bash
# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only E2E tests
npm run test:e2e

# Run specific unit test file
npx vitest run tests/unit/specific-file.test.ts

# Run specific Case Study Engine tests
npx vitest run tests/unit/case-study-schema.test.ts
npx vitest run tests/unit/case-study-migration.test.ts
npx vitest run tests/unit/tailwind-theme.test.ts
npx vitest run tests/unit/validate-request.test.ts
npx vitest run client/src/lib/__tests__/color-utils.test.ts
npx vitest run client/src/components/branding/__tests__/CaseStudyWrapper.test.tsx

# Case Study API integration tests
npx vitest run tests/integration/case-study-content.test.ts

# Run specific E2E test
npx playwright test tests/e2e/specific-file.spec.ts
```

## Common Issues and Fixes

### Issue 1: TEST_DATABASE_URL Not Set

**Error**: `TEST_DATABASE_URL is not defined`

**Fix**:
```bash
export TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5433/revenue_party_test"
npm run test:ci
```

### Issue 2: Database Connection Refused

**Error**: `Connection refused` or `ECONNREFUSED`

**Diagnosis**: Database not running

**Fix**:
```bash
# Check if database is running
psql -U postgres -c "SELECT version();"

# Or check Docker container
docker ps | grep postgres-test

# Start database if needed
docker start postgres-test
```

### Issue 3: Redis Connection Errors

**Error**: `Redis connection failed` (if not using mocks)

**Fix**: Redis is mocked by default. If you see this error, verify `tests/setup-mocks.ts` is properly configured.

```typescript
// tests/setup-mocks.ts should have:
vi.mock('../server/lib/redis', () => import('./mocks/redis.mock'));
```

### Issue 4: E2E Server Startup Timeout

**Error**: `Timed out waiting for http://0.0.0.0:5000`

**Diagnosis**: Dev server failed to start

**Fix**:
```bash
# Check if port 5000 is already in use
lsof -i :5000
kill -9 <PID>

# Try running dev server manually
npm run dev
```

### Issue 5: Playwright Browsers Not Installed

**Error**: `Executable doesn't exist at /path/to/browser`

**Fix**:
```bash
npx playwright install --with-deps
```

### Issue 6: CSP Violations in E2E Tests

**Error**: Console errors about Content Security Policy

**Fix**: This should be resolved by the CSP nonce implementation. If you still see violations:
```bash
# Build production bundle and check for violations
npm run build
NODE_ENV=production npm run start
# Open http://localhost:5000 in browser DevTools
```

## Test Coverage

To generate and view test coverage reports:

```bash
npm run test:coverage:report
```

This opens an HTML report showing which code paths are tested.

## CI/CD Integration

The test suite runs automatically in GitHub Actions on every push and pull request. The workflow:

1. Spins up PostgreSQL and Redis services
2. Sets all required environment variables
3. Runs `npm run test:ci`
4. Uploads test results and coverage

**Check CI status**: Go to your repository's Actions tab on GitHub.

## Success Criteria

The test suite is ready when:

- ✅ `npm run test:setup` completes without errors
- ✅ `npm run test:unit` passes all unit tests
- ✅ `npm run test:integration` passes all integration tests
- ✅ `npm run test:e2e` passes all E2E tests
- ✅ No CSP violations in browser console during E2E tests
- ✅ Test coverage is above 70% (target)

## Next Steps After Tests Pass

Once the test suite is green:

1. ✅ Mark `verify-tests-critical` as completed
2. Proceed with staging deployment verification
3. Run smoke tests in staging environment
4. Document any test failures or flakiness for future improvement

## Troubleshooting Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Drizzle ORM Testing](https://orm.drizzle.team/docs/get-started-postgresql)
- Project-specific: `docs/TESTING.md` (if exists)

## Support

If tests consistently fail after following this guide:

1. Check GitHub Actions logs for CI environment differences
2. Verify all mocks in `tests/mocks/` are properly configured
3. Review test setup in `tests/setup.ts` and `tests/setup-mocks.ts`
4. Check for environment-specific issues (Windows vs Unix, Node version, etc.)

