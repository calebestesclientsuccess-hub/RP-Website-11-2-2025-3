
# Production Deployment Checklist

## Pre-Deployment

### Security
- [ ] All sensitive data stored in your hosting provider's secrets manager
- [ ] SESSION_SECRET is at least 32 characters
- [ ] Database credentials are secure
- [ ] API keys have appropriate scopes
- [ ] Rate limiting is enabled
- [ ] CORS origins are restricted
- [ ] Security headers are configured
- [ ] CSP policy is strict (see `docs/CSP_NONCE_AUDIT.md` for current status and remediation plan)
- [ ] Inline JSON-LD scripts moved from `index.html` to React components with nonce support
- [ ] `react-helmet-async` configured to inject CSP nonces into dynamically added scripts
- [ ] No CSP violations in browser console when testing in production mode
- [ ] `DISABLE_INLINE_STYLE_ATTR=true` has been tested (after removing inline React style attributes) before enabling in production

### Privacy & Compliance
- [ ] Cookie consent banner is displayed on first visit (`CookieConsentBanner` component)
- [ ] Analytics tracking respects user consent (gated by `analyticsAllowed` in `lib/analytics.ts`)
- [ ] User can accept/reject analytics via banner
- [ ] Consent choice persists in localStorage (`revparty_analytics_consent_v1`)
- [ ] Privacy policy page is accessible and up-to-date
- [ ] Terms of service page is accessible and up-to-date
- [ ] GDPR compliance: users can request data export/deletion
- [ ] CCPA compliance: "Do Not Sell My Personal Information" link available (if applicable)

### Accessibility (WCAG 2.1 AA)
- [ ] All pages pass `@axe-core/playwright` scans (run `npm run test:e2e tests/e2e/accessibility.spec.ts`)
- [ ] No critical or serious accessibility violations on primary routes (home, assessment, audit, pricing, contact, blog)
- [ ] All interactive elements have sufficient contrast (4.5:1 for normal text, 3:1 for large text)
- [ ] All form inputs have associated labels (via `<label>`, `aria-label`, or `aria-labelledby`)
- [ ] All images have meaningful alt text (or `alt=""` for decorative images)
- [ ] Touch targets are at least 44x44px (WCAG 2.1 Level AAA guideline)
- [ ] Keyboard navigation works on all interactive elements (test with Tab/Shift+Tab)
- [ ] Skip-to-main-content link is available and functional (`SkipLink` component)
- [ ] Focus indicators are visible on all interactive elements
- [ ] Page titles are descriptive and unique (`SEO` component with proper `title` prop)
- [ ] Heading hierarchy is logical (h1 → h2 → h3, no skipped levels)
- [ ] Color is not the only means of conveying information

### Environment Variables
Store these in your platform's secret manager (Render, Fly.io, AWS, etc.):
```
DATABASE_URL=postgresql://...
SESSION_SECRET=<32+ character random string>
PUBLIC_TENANT_ID=<tenant id for public forms>
GOOGLE_AI_KEY=<single Google AI Studio key used for text + image>
CLOUDINARY_CLOUD_NAME=<your-cloud>
CLOUDINARY_API_KEY=<your-key>
CLOUDINARY_API_SECRET=<your-secret>
REPLICATE_API_TOKEN=<your-token>
RESEND_API_KEY=<your-key>
RESEND_FROM_EMAIL=notifications@your-domain.com
APP_BASE_URL=https://app.your-domain.com
REPLICATE_WEBHOOK_SECRET=<replicate-webhook-secret>
REDIS_URL=redis://<host>:6379
NODE_ENV=production
ALLOWED_ORIGINS=https://app.your-domain.com
```

> Legacy variables like `GPT_3_PRO_THINKING_KEY` or `NANA_BANNA_*` will temporarily fall back to `GOOGLE_AI_KEY`, but they log a warning and will be removed soon—migrate now.

Optional configuration:
```
DISABLE_INLINE_STYLE_ATTR=false
SUPABASE_URL=<if using supabase>
SUPABASE_SERVICE_ROLE_KEY=<if using supabase>
SECURITY_ALERT_WEBHOOK_URL=<slack/webhook>
SECURITY_ALERT_EMAIL=<security@your-domain.com>
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_REQUEST_SIZE=10mb
DEV_TENANT_FALLBACK=dev_local_tenant
TEST_DATABASE_URL=postgresql://<test-user>:<password>@<host>/<db>
MAX_RESPONSE_SIZE_BYTES=1048576
```

### Database
- [ ] Run all migrations: `npm run db:push`
- [ ] Verify indexes are created
- [ ] Connection pooling configured
- [ ] Backup strategy in place

#### Testing database
- [ ] Provision a dedicated Neon branch (or database) for tests
- [ ] Set `TEST_DATABASE_URL` in `.env.test.local` / CI secrets
- [ ] Run `npm run test:setup` before executing `npm run test:unit` / `npm run test:e2e`

### Performance
- [ ] Compression enabled (via `server/middleware/compression.ts`)
- [ ] Cache headers configured (see `server/vite.ts` for static asset caching)
- [ ] Service worker cache strategy implemented (see `client/public/sw.js`):
  - Navigation: Network First (offline fallback)
  - Assets: Cache First (long-term caching)
  - Fonts/styles/images: Stale While Revalidate
  - API: Network First with cache
- [ ] Service worker enabled in production (set `VITE_ENABLE_PWA=true` to enable)
- [ ] Static assets optimized
- [ ] Database queries optimized
- [ ] Code splitting implemented (React.lazy for all admin routes, vendor chunk splitting in `vite.config.ts`)
- [ ] Bundle size within budget (verify with `npm run bundle:check`)
- [ ] Bundle analysis available (`ANALYZE=true npm run build` generates `dist/bundle-report.html`)

### Monitoring
- [ ] Health check endpoints working
- [ ] Structured logging implemented (see `docs/LOGGING.md`)
- [ ] Log shipping configured (set `LOG_SHIP_URL` for Datadog/Mezmo/etc.)
- [ ] Critical server code migrated from `console.log` to `logger` (see `server/lib/logger.ts`)
- [ ] Error logging configured with proper context
- [ ] Performance monitoring active
- [ ] Slow query logging enabled

## Deployment

### Build & Release Steps
1. Run tests and database migrations locally.
2. Build the client + server bundle:
   ```bash
   npm run build
   ```
3. Package the server (Docker, Heroku release, etc.) so that `npm run start` boots the API.
4. Configure your process manager or platform to run:
   ```bash
   NODE_ENV=production npm run start
   ```
5. Point your load balancer / CDN to the deployment URL and update `ALLOWED_ORIGINS`.

### Scaling Guidance
- Start with 1–2 instances (1 vCPU / 1–2 GB RAM) for low traffic.
- Enable horizontal autoscaling once CPU > 70% sustained.
- Use a CDN (Cloudflare/Fastly) for static assets and Cloudinary for media.

## Post-Deployment

### Verification
- [ ] Visit /health - should return 200 OK
- [ ] Visit /health/ready - database, Gemini, Cloudinary, and Replicate checks should pass
- [ ] Test authentication flow
- [ ] Test portfolio creation
- [ ] Test admin functions
- [ ] Check browser console for errors
- [ ] Verify SSL certificate

### Monitoring
- [ ] Check /health/metrics for performance
- [ ] Monitor error logs
- [ ] Watch database connections
- [ ] Track response times

### Performance Testing
```bash
# Test with load
ab -n 1000 -c 10 https://your-app.replit.app/
```

## Rollback Plan

If issues occur:
1. Click "Rollback" in Deployment history
2. Or: Stop deployment and debug in dev mode
3. Fix issues in editor
4. Redeploy when ready

## Scaling

### When to Scale Up
- Response times > 1 second
- Error rate > 1%
- Memory usage > 80%
- CPU usage > 80%

### How to Scale
1. Increase max instances (horizontal)
2. Upgrade machine size (vertical)
3. Optimize database queries
4. Enable Redis caching (future)

## Security Monitoring

Watch for:
- Failed login attempts
- Rate limit violations
- Unusual traffic patterns
- SQL injection attempts
- XSS attempts

All logged to security_events table.

## Backup & Recovery

### Database Backups
Ensure your managed Postgres provider has automated backups enabled (Neon, RDS, etc.).

### Application State
- Portfolio versions stored in database
- Content assets on Cloudinary
- User data in PostgreSQL

### Recovery Steps
1. Restore from latest managed database backup
2. Verify data integrity
3. Test critical flows
4. Notify users if needed

## Cost Optimization

### Autoscale Best Practices
- Start with min=1, max=3
- Monitor usage in first week
- Adjust based on traffic patterns
- Scale down max instances during low-traffic hours

### Expected Costs (Approximate)
- Low traffic (< 10k requests/month): $10-20/month
- Medium traffic (10k-100k requests/month): $20-50/month
- High traffic (100k+ requests/month): $50-200/month

## Support

If issues arise:
1. Check health endpoints
2. Review error logs
3. Check your hosting provider status page
4. Contact platform support if needed
5. Rollback if critical

---

**Production URL**: https://app.your-domain.com
**Admin Panel**: https://app.your-domain.com/admin
**Health Check**: https://app.your-domain.com/health
