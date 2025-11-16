# Testing Infrastructure

This directory contains the complete test suite for the Revenue Party application.

## Test Structure

```
tests/
├── unit/              # Unit tests for individual functions and utilities
├── integration/       # Integration tests for API endpoints and database operations
├── e2e/              # End-to-end tests for complete user flows
└── setup.ts          # Global test configuration and utilities
```

## Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests only
npm run test:e2e

# Run accessibility tests only
npx playwright test tests/e2e/accessibility.spec.ts

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Accessibility Testing

Our accessibility tests use axe-core to validate WCAG 2.1 Level AA compliance:

```bash
# Run accessibility tests
npx playwright test tests/e2e/accessibility.spec.ts

# Run with UI mode for debugging
npx playwright test tests/e2e/accessibility.spec.ts --ui
```

Tests cover:
- WCAG 2.1 Level AA compliance
- Form label associations
- Touch target sizes
- Keyboard navigation
- Focus management

## Test Database

Tests use a separate test database to avoid affecting production data. Set the `TEST_DATABASE_URL` environment variable to specify a dedicated test database:

```bash
export TEST_DATABASE_URL="postgresql://user:password@localhost:5432/test_db"
```

If not set, tests will use the main `DATABASE_URL` with a warning.

## Writing Tests

### Unit Tests

Unit tests focus on individual functions without external dependencies:

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../../server/utils/my-function';

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Integration Tests

Integration tests verify API endpoints and database operations:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { db } from '../../server/db';

describe('API Endpoint', () => {
  beforeAll(async () => {
    // Setup test data
  });

  afterAll(async () => {
    // Cleanup test data
  });

  it('should return data', async () => {
    const response = await request.get('/api/endpoint');
    expect(response.status).toBe(200);
  });
});
```

### E2E Tests

E2E tests verify complete user workflows using Playwright:

```typescript
import { test, expect } from '@playwright/test';

test('complete user flow', async ({ page }) => {
  await page.goto('/');
  await page.click('button');
  await expect(page).toHaveURL('/result');
});
```

## Test Utilities

Global test utilities are available via `global.testUtils`:

- `cleanDatabase()`: Truncates all tables (except migrations and sessions)
- `createTestTenant(id)`: Creates a test tenant for multi-tenant testing

## CI/CD

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

The CI pipeline:
1. Sets up PostgreSQL
2. Runs database migrations
3. Executes unit tests
4. Executes integration tests
5. Executes E2E tests
6. Generates coverage reports
7. Uploads results to Codecov

## Debugging Tests

### Verbose Output
```bash
VERBOSE_TESTS=true npm test
```

### Playwright UI Mode
```bash
npm run playwright:ui
```

### Single Test File
```bash
npx vitest run tests/unit/my-test.test.ts
```

## Coverage Goals

- Unit tests: 80%+ coverage
- Integration tests: All API endpoints
- E2E tests: All critical user flows