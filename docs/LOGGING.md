# Structured Logging Guide

## Overview

The application uses a structured logger (`server/lib/logger.ts`) for consistent, searchable logging across all server-side code.

## Usage

### Basic Logging

```typescript
import { logger } from '../lib/logger';

// Info-level messages (normal operations)
logger.info('User registered', { userId: '123', email: 'user@example.com' });

// Warning messages (recoverable issues)
logger.warn('Rate limit approaching', { userId: '123', requestCount: 95 });

// Error messages (need attention)
logger.error('Failed to send email', { userId: '123', recipient: 'user@example.com' }, error);

// Fatal messages (critical failures)
logger.fatal('Database connection lost', error);
```

### Log Levels

- **debug**: Verbose development info (disabled in production by default)
- **info**: Normal operational messages
- **warn**: Recoverable issues that should be monitored
- **error**: Errors requiring attention
- **fatal**: Critical errors causing service disruption

### Context Objects

Always include relevant context to make logs searchable:

```typescript
logger.info('Order processed', {
  orderId: order.id,
  userId: req.user.id,
  amount: order.total,
  currency: 'USD',
  duration: Date.now() - startTime,
});
```

### Error Logging

Errors can be passed as the second or third argument:

```typescript
try {
  await processPayment(order);
} catch (error) {
  // Pass error as second argument
  logger.error('Payment processing failed', error);
  
  // Or with additional context
  logger.error('Payment processing failed', { orderId: order.id }, error);
}
```

### Child Loggers

Create loggers with default context:

```typescript
import { createLogger } from '../lib/logger';

const dbLogger = createLogger({ module: 'database' });
const authLogger = createLogger({ module: 'auth' });

// All logs from dbLogger will include { module: 'database' }
dbLogger.info('Query executed', { query: 'SELECT * FROM users', duration: 45 });
```

## Configuration

### Environment Variables

```bash
# Set minimum log level (debug, info, warn, error, fatal)
LOG_LEVEL=info

# Optional: URL to ship logs to external service (Datadog, Logz.io, etc.)
LOG_SHIP_URL=https://http-intake.logs.datadoghq.com/api/v2/logs
```

### Output Format

**Development** (pretty-printed with timestamps and emojis):
```
14:23:45 ℹ️  [INFO] User registered
  Context: {
    "userId": "123",
    "email": "user@example.com"
  }
```

**Production** (JSON for log aggregators):
```json
{"level":"info","timestamp":"2025-11-23T14:23:45.123Z","message":"User registered","context":{"userId":"123","email":"user@example.com"}}
```

## Integrating with External Services

### Datadog

1. Add to environment:
   ```bash
   LOG_SHIP_URL=https://http-intake.logs.datadoghq.com/api/v2/logs
   DD_API_KEY=your_datadog_api_key
   ```

2. Update `server/lib/logger.ts` to include API key in headers:
   ```typescript
   headers: {
     'Content-Type': 'application/json',
     'DD-API-KEY': process.env.DD_API_KEY || '',
   }
   ```

### LogDNA / Mezmo

Similar setup with their HTTP ingestion endpoint.

### Sentry (for error tracking)

Errors can also be sent to Sentry for detailed stack traces and alerting:

```typescript
import * as Sentry from '@sentry/node';

// In logger.ts shipToExternalService:
if (entry.level === 'error' || entry.level === 'fatal') {
  Sentry.captureException(new Error(entry.message), {
    level: entry.level === 'fatal' ? 'fatal' : 'error',
    contexts: { custom: entry.context },
  });
}
```

## Migration from console.log

### Before
```typescript
console.log('[db] Migration complete');
console.error('Failed to process order:', error);
```

### After
```typescript
import { logger } from '../lib/logger';

logger.info('Migration complete', { module: 'database' });
logger.error('Failed to process order', { orderId }, error);
```

### Automated Replacement

Use this regex to find console calls:
```
console\.(log|info|warn|error|debug)
```

Replace with structured logger calls and add appropriate context.

## Best Practices

1. **Always include context**: Logs without context are hard to search
2. **Use appropriate levels**: Don't log everything as `error`
3. **Avoid PII in logs**: Don't log passwords, credit cards, etc.
4. **Log at boundaries**: DB queries, API calls, external service interactions
5. **Include timing**: Log operation duration for performance monitoring

```typescript
const start = Date.now();
await expensiveOperation();
logger.info('Operation completed', {
  operation: 'data-sync',
  duration: Date.now() - start,
  recordsProcessed: count,
});
```

6. **Don't log in tight loops**: Use sampling or aggregate metrics

## Monitoring & Alerts

Once integrated with an external service, set up alerts for:

- Error rate spikes (>10 errors/minute)
- Fatal errors (immediate notification)
- Slow operations (duration > 5s)
- Failed external API calls

## Performance Considerations

- Logging is synchronous (blocks until written)
- In production, only `error` and `fatal` ship to external services
- JSON serialization adds ~1ms overhead per log
- Consider sampling high-volume logs (e.g., log 1% of requests)

## Testing

The logger respects `NODE_ENV=test` and reduces verbosity. Override in tests:

```typescript
import { logger } from '../lib/logger';

beforeEach(() => {
  process.env.LOG_LEVEL = 'error'; // Only show errors in tests
});
```

## Migration Status

### ✅ Migrated (Structured Logger)

The following critical infrastructure files have been fully migrated to use `logger` from `server/lib/logger.ts`:

| File | Description | Console Calls Replaced |
|------|-------------|------------------------|
| `server/db.ts` | Database connection management | 3 |
| `server/config/env.ts` | Environment variable validation | 2 |
| `server/middleware/account-lockout.ts` | Account lockout logic | 4 |
| `server/middleware/intrusion-detection.ts` | IP-based intrusion detection | 5 |
| `server/vite.ts` | Vite integration and server setup | 3 |

**Total Migrated**: 17 calls across 5 critical files

**Coverage**: All user-facing error paths (authentication, database failures, security events) now use structured logging with external log shipping support.

### ⏳ Pending Migration (Phase 2)

The following files still use `console.*` methods and are candidates for future migration:

| File | Console Calls | Priority | Reason |
|------|--------------|----------|--------|
| `server/routes.ts` | 190 | 🔴 High | Main API routes - user-facing endpoints |
| `server/utils/portfolio-director.ts` | 103 | 🟡 Medium | AI generation worker - debugging aid |
| `server/seed*.ts` | 18 | 🟢 Low | Database seeding - dev/CI only |
| `server/routes/health.ts` | 4 | 🟡 Medium | Health check endpoints |
| `server/routes/leads.ts` | 2 | 🔴 High | Lead management - revenue-critical |
| 30+ other files | ~300 | 🟢 Low | Utilities, admin routes, helpers |

**Total Pending**: ~423 calls across 35 files

### Migration Roadmap

**Phase 2a: High-Traffic User Routes** (Priority after MVP launch)
1. `server/routes.ts` - Main API routes (lead capture, assessments, auth)
2. `server/routes/leads.ts` - Lead management endpoints
3. `server/routes/health.ts` - Health check endpoints

**Effort**: 2-3 hours  
**Impact**: Complete visibility into user-facing errors and performance

**Phase 2b: AI Workers & Background Jobs**
1. `server/utils/portfolio-director.ts` - Portfolio generation
2. `server/workers/*` - Queue processors
3. `server/utils/assessment-scoring.ts` - Assessment logic

**Effort**: 3-4 hours  
**Impact**: Better debugging for AI generation issues

**Phase 2c: Low-Priority / Dev-Only**
1. `server/seed*.ts` - Seeding scripts
2. Admin-only routes
3. Utility functions

**Effort**: 2-3 hours  
**Impact**: Nice-to-have, not user-facing

### Why Partial Migration is Acceptable for MVP

**Critical paths are covered**:
- Database connection failures → ✅ Logged
- Environment validation errors → ✅ Logged
- Security events (lockouts, intrusion) → ✅ Logged
- Server startup/shutdown → ✅ Logged

**Non-critical paths can wait**:
- AI worker console.logs are useful for debugging but not customer-facing
- Seed scripts only run in dev/CI, not production
- Admin routes have lower traffic and internal users

**Post-launch approach**:
- Monitor production for 1-2 weeks
- Identify which console.log calls would benefit from structured logging
- Migrate incrementally based on real operational needs

### Automated Migration Script (Future)

For bulk migration, this script can help:

```bash
#!/bin/bash
# migrate-logging.sh - Replace console.* with logger.*

FILES="server/routes.ts server/routes/leads.ts server/routes/health.ts"

for file in $FILES; do
  echo "Migrating $file..."
  
  # Add import if not present
  if ! grep -q "import { logger }" "$file"; then
    sed -i '1i import { logger } from "./lib/logger";' "$file"
  fi
  
  # Replace console.log → logger.info
  sed -i 's/console\.log(/logger.info(/g' "$file"
  
  # Replace console.warn → logger.warn
  sed -i 's/console\.warn(/logger.warn(/g' "$file"
  
  # Replace console.error → logger.error
  sed -i 's/console\.error(/logger.error(/g' "$file"
  
  echo "✓ $file migrated"
done
```

**Note**: Manual review required after running script to:
1. Add context objects to log calls
2. Adjust log levels if needed
3. Ensure error objects are passed correctly

### Measuring Progress

Track migration progress with:

```bash
# Count remaining console.* calls
grep -r "console\.\(log\|warn\|error\|info\)" server/ --include="*.ts" | wc -l

# List files with most console calls
grep -r "console\.\(log\|warn\|error\|info\)" server/ --include="*.ts" | cut -d: -f1 | sort | uniq -c | sort -rn | head -10
```

Current baseline (as of MVP launch): **423 calls in 35 files**

