# Deployment Runbook

## Prerequisites

- [ ] All tests passing (`npm run test:ci`)
- [ ] Environment variables configured in platform secrets
- [ ] Database backups enabled
- [ ] Redis instance provisioned
- [ ] Cloudinary account configured
- [ ] Resend API key obtained
- [ ] Domain DNS configured

## Pre-Deployment Checklist

### 1. Code Review & Testing

```bash
# Run full test suite
npm run test:ci

# Check bundle size
npm run bundle:check

# Verify no linter errors
npm run lint

# Build locally to catch any build issues
npm run build
```

### 2. Environment Variables

Ensure all required secrets are set in your hosting platform (Vercel/Render/Fly.io):

**Required (production will fail without these):**
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SESSION_SECRET=<minimum 32 characters, cryptographically random>
PUBLIC_TENANT_ID=<your primary tenant ID>
GOOGLE_AI_KEY=<Google AI Studio API key>
CLOUDINARY_CLOUD_NAME=<your cloud>
CLOUDINARY_API_KEY=<your key>
CLOUDINARY_API_SECRET=<your secret>
RESEND_API_KEY=<your Resend API key>
RESEND_FROM_EMAIL=notifications@your-domain.com
REDIS_URL=redis://host:6379
APP_BASE_URL=https://your-domain.com
REPLICATE_WEBHOOK_SECRET=<webhook secret>
ALLOWED_ORIGINS=https://your-domain.com
NODE_ENV=production
```

**Optional (recommended):**
```bash
REPLICATE_API_TOKEN=<for AI video/image generation>
HELPSCOUT_EMAIL=support@your-domain.com
SECURITY_ALERT_WEBHOOK_URL=<Slack webhook for security alerts>
SECURITY_ALERT_EMAIL=security@your-domain.com
LOG_SHIP_URL=<Datadog/Mezmo HTTP ingest URL>
LOG_LEVEL=info
DISABLE_INLINE_STYLE_ATTR=false
VITE_ENABLE_PWA=true
```

**Testing/CI only:**
```bash
TEST_DATABASE_URL=<separate database for tests>
DEV_TENANT_FALLBACK=dev_local_tenant
```

### 3. Database Migrations

```bash
# Review pending migrations
npm run db:studio

# Apply migrations to production
npm run db:push
```

**⚠️ CRITICAL**: Always review migrations before applying to production. Use a staging environment first.

## Deployment Steps

### Option A: Vercel (Recommended for Next.js/Vite apps)

1. **Connect Repository**
   ```bash
   npm install -g vercel
   vercel login
   vercel link
   ```

2. **Configure Environment**
   ```bash
   # Add each secret
   vercel env add DATABASE_URL production
   vercel env add SESSION_SECRET production
   # ... repeat for all required vars
   ```

3. **Deploy**
   ```bash
   # Preview deployment
   vercel

   # Production deployment
   vercel --prod
   ```

4. **Run Migrations**
   ```bash
   # After deployment, run migrations
   npm run db:push
   ```

### Option B: Docker Deployment

1. **Build Image**
   ```bash
   docker build -t revenue-party:latest .
   ```

2. **Push to Registry**
   ```bash
   docker tag revenue-party:latest your-registry/revenue-party:latest
   docker push your-registry/revenue-party:latest
   ```

3. **Deploy to Platform**
   ```bash
   # Example: Fly.io
   fly deploy

   # Example: Render
   # Use dashboard to configure image registry
   ```

### Option C: Traditional VPS (Ubuntu/Debian)

1. **Server Setup**
   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2 for process management
   sudo npm install -g pm2

   # Install PostgreSQL client
   sudo apt-get install postgresql-client
   ```

2. **Deploy Code**
   ```bash
   git clone <your-repo>
   cd revenue-party-website
   npm ci --production=false
   npm run build
   ```

3. **Configure Environment**
   ```bash
   cp env.sample .env.production.local
   # Edit .env.production.local with production values
   nano .env.production.local
   ```

4. **Start Application**
   ```bash
   # Start with PM2
   pm2 start npm --name "revenue-party" -- run start
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

## Post-Deployment Verification

### 1. Health Checks

```bash
# Check main health endpoint
curl https://your-domain.com/health

# Expected: {"status":"ok","timestamp":"..."}

# Check detailed health endpoint
curl https://your-domain.com/health/ready

# Expected: {"status":"ok","checks":{"database":"ok","redis":"ok",...}}
```

### 2. Smoke Tests

- [ ] Homepage loads (`/`)
- [ ] Assessment page works (`/assessment`)
- [ ] Admin login works (`/admin/login`)
- [ ] API endpoints respond (`/api/health`)
- [ ] Static assets load (check browser DevTools Network tab)
- [ ] No console errors (check browser DevTools Console)

### 3. Monitor Initial Traffic

```bash
# View application logs
# Vercel:
vercel logs

# PM2:
pm2 logs revenue-party

# Docker:
docker logs <container-id> -f
```

Watch for:
- Database connection errors
- Redis connection failures
- API authentication failures
- Unexpected 500 errors
- High response times (>1s)

## Known Limitations (MVP Launch)

The following features are implemented but **disabled by default** or **partially migrated** for MVP launch. They can be enabled/completed post-launch without code changes:

### 1. Service Worker / PWA (Dormant)

**Current State**: Code exists in `client/public/sw.js` with full caching strategies, but PWA is disabled by default.

**Configuration**: Set `VITE_ENABLE_PWA=false` (default)

**To Enable Post-Launch**:
```bash
# In production .env or platform secrets
VITE_ENABLE_PWA=true

# Rebuild and redeploy
npm run build
```

**What It Does**:
- Enables offline functionality
- Caches static assets and API responses
- Improves repeat visit performance
- Provides app-like experience on mobile devices

**Why Disabled for MVP**: Offline mode is not critical for initial launch. Enable once core functionality is validated in production.

### 2. Queue Monitoring Dashboard (Not Exposed)

**Current State**: BullMQ infrastructure is fully operational and processing jobs correctly. Bull Board admin UI is not mounted.

**Impact**: Background jobs (AI generation, email queues) work correctly, but there's no web UI to monitor them.

**Monitoring Alternatives**:
- Check Redis for queue metrics: `redis-cli KEYS bull:*`
- View logs: `npm run logs` (will show job processing)
- Direct database inspection: Jobs complete and results appear in database

**To Add Bull Board Post-Launch**:
```typescript
// In server/routes.ts
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [new BullMQAdapter(aiQueue), new BullMQAdapter(emailQueue)],
  serverAdapter
});
app.use('/admin/queues', authenticateAdmin, serverAdapter.getRouter());
```

### 3. Structured Logging (Partial Migration)

**Current State**: Critical infrastructure uses structured logger, but ~420 console.log calls remain in non-critical paths.

**What's Using Structured Logging** (✅):
- `server/db.ts` - Database connection errors
- `server/config/env.ts` - Environment validation warnings
- `server/middleware/account-lockout.ts` - Security events
- `server/middleware/intrusion-detection.ts` - IP blocking
- `server/vite.ts` - Server initialization

**What's Still Using console.log** (⏳):
- `server/routes.ts` (190 calls) - Main API routes
- `server/utils/portfolio-director.ts` (103 calls) - AI generation workers
- `server/workers/*` - Background job workers
- `server/seed*.ts` - Database seeding scripts
- Admin-only routes and utilities

**Impact**: 
- Production errors in **user-facing flows** (auth, lead capture, health checks) will be properly logged and shipped to external services
- AI worker logs and admin operations still use console.log but are lower priority

**Log Shipping**: 
Configure `LOG_SHIP_URL` environment variable to send structured logs to Datadog, Mezmo, or ELK stack.

**Migration Priority** (post-launch):
1. High-traffic user routes (routes.ts, leads.ts, health.ts)
2. AI generation workers (for debugging issues)
3. Admin routes and utilities (lowest priority)

### 4. Extended Accessibility Testing (Core Pages Only)

**Current State**: Automated accessibility tests cover primary user journeys:
- ✅ Home page
- ✅ Assessment flow
- ✅ Audit page

**Not Yet Covered**:
- ⏳ Pricing page
- ⏳ Contact page
- ⏳ Blog listing/detail pages
- ⏳ Admin dashboard pages

**Impact**: Core user journeys are WCAG 2.1 AA compliant. Secondary pages should be manually tested post-launch.

**Post-Launch Expansion**:
Add tests to `tests/e2e/accessibility.spec.ts` for remaining pages.

### 5. CSP Reporting Endpoint (Not Configured)

**Current State**: CSP violations will be **prevented** (scripts blocked), but not **reported** to a monitoring endpoint.

**To Add CSP Reporting** (optional):
```typescript
// In server/routes.ts
app.post('/api/csp-report', express.json({ type: 'application/csp-report' }), (req, res) => {
  logger.warn('CSP Violation Reported', { 
    violation: req.body['csp-report'],
    ip: req.ip 
  });
  res.status(204).end();
});
```

Update CSP header in `server/middleware/security-headers.ts`:
```typescript
const directives = [
  // ... existing directives
  "report-uri /api/csp-report",
  "report-to default"
].join("; ");
```

---

**Summary**: These limitations are **by design** for MVP launch. All infrastructure is production-ready; optional features can be enabled incrementally based on real user feedback and operational needs.

## Rollback Procedure

### Vercel

```bash
# List recent deployments
vercel ls

# Promote previous deployment to production
vercel promote <deployment-url>
```

### Docker/Kubernetes

```bash
# Revert to previous image tag
kubectl set image deployment/revenue-party app=revenue-party:v1.2.3

# Or manually:
docker pull revenue-party:v1.2.3
docker stop current-container
docker run -d --name revenue-party revenue-party:v1.2.3
```

### PM2

```bash
# Checkout previous commit
git log
git checkout <previous-commit-hash>

# Rebuild and restart
npm run build
pm2 restart revenue-party
```

## Troubleshooting

### Issue: Database Connection Errors

```bash
# Verify DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check if migrations are applied
npm run db:studio
```

### Issue: Redis Connection Failures

```bash
# Verify REDIS_URL
echo $REDIS_URL

# Test connection
redis-cli -u $REDIS_URL ping

# Expected: PONG
```

### Issue: High Memory Usage

```bash
# Check Node.js memory usage
pm2 monit

# Increase memory limit if needed
NODE_OPTIONS=--max-old-space-size=2048 npm run start
```

### Issue: Slow Response Times

1. Check database query performance
   ```sql
   SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
   ```

2. Enable query logging
   ```bash
   LOG_LEVEL=debug npm run start
   ```

3. Check Redis latency
   ```bash
   redis-cli --latency-history -u $REDIS_URL
   ```

## Scaling Guidance

### Horizontal Scaling

- **1-10 requests/sec**: 1 instance, 1 vCPU, 1GB RAM
- **10-100 requests/sec**: 2-3 instances, 2 vCPU, 2GB RAM each
- **100+ requests/sec**: 5+ instances, 4 vCPU, 4GB RAM each

### Database Scaling

- Enable connection pooling (already configured in `server/db.ts`)
- Consider read replicas for heavy read workloads
- Monitor slow queries and add indexes as needed

### Redis Scaling

- Use Redis Cluster for high availability
- Enable persistence (AOF) for data durability
- Consider separate Redis instances for different use cases (cache, sessions, queues)

## Maintenance Windows

### Weekly Maintenance

- [ ] Review error logs for recurring issues
- [ ] Check database size and growth trends
- [ ] Verify backup integrity
- [ ] Update dependencies (security patches only)

### Monthly Maintenance

- [ ] Full dependency updates
- [ ] Database vacuum/analyze
- [ ] Review and optimize slow queries
- [ ] Security audit (npm audit, Snyk scan)

### Quarterly Maintenance

- [ ] Load testing
- [ ] Disaster recovery drill
- [ ] Review and update runbooks
- [ ] Capacity planning review

## Emergency Contacts

- **On-call Engineer**: [phone/slack]
- **Database Admin**: [contact]
- **Infrastructure Team**: [contact]
- **Platform Support**: 
  - Vercel: support@vercel.com
  - Render: support@render.com
  - Neon: support@neon.tech

## Monitoring & Alerts

### Key Metrics to Monitor

- Request rate (req/sec)
- Error rate (%)
- Response time (p50, p95, p99)
- Database connection pool usage
- Redis memory usage
- Disk I/O
- CPU utilization
- Memory utilization

### Recommended Alerts

- Error rate > 5% for 5 minutes
- P95 response time > 2 seconds for 10 minutes
- Database connections > 80% of pool for 5 minutes
- Disk usage > 85%
- Memory usage > 90%
- Health check failures (3 consecutive)

## Changelog

Track all production deployments:

```markdown
## 2025-11-23 - v1.0.0
- Initial production deployment
- All core features enabled
- Database migrations applied

## [Add your deployments here]
```

## Additional Resources

- Production Checklist: `docs/PRODUCTION_CHECKLIST.md`
- Logging Guide: `docs/LOGGING.md`
- Accessibility Report: `docs/ACCESSIBILITY_REPORT.md`
- CSP Audit: `docs/CSP_NONCE_AUDIT.md`
- API Documentation: `docs/API.md`

