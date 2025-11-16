
# Production Deployment Checklist

## Pre-Deployment

### Security
- [ ] All sensitive data moved to Replit Secrets
- [ ] SESSION_SECRET is at least 32 characters
- [ ] Database credentials are secure
- [ ] API keys have appropriate scopes
- [ ] Rate limiting is enabled
- [ ] CORS origins are restricted
- [ ] Security headers are configured
- [ ] CSP policy is strict

### Environment Variables
Required secrets in Replit:
```
DATABASE_URL=postgresql://...
SESSION_SECRET=<32+ character random string>
GEMINI_API_KEY=<your-key>
CLOUDINARY_CLOUD_NAME=<your-cloud>
CLOUDINARY_API_KEY=<your-key>
CLOUDINARY_API_SECRET=<your-secret>
NODE_ENV=production
ALLOWED_ORIGINS=https://your-domain.replit.app
```

Optional:
```
RESEND_API_KEY=<your-key>
GMAIL_USER=<email>
GMAIL_APP_PASSWORD=<app-password>
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_REQUEST_SIZE=10mb
```

### Database
- [ ] Run all migrations: `npm run db:push`
- [ ] Verify indexes are created
- [ ] Connection pooling configured
- [ ] Backup strategy in place

### Performance
- [ ] Compression enabled
- [ ] Cache headers configured
- [ ] Static assets optimized
- [ ] Database queries optimized
- [ ] Bundle size < 500KB

### Monitoring
- [ ] Health check endpoints working
- [ ] Error logging configured
- [ ] Performance monitoring active
- [ ] Slow query logging enabled

## Deployment on Replit

### Using Autoscale Deployments (Recommended)

1. Click "Deploy" button in Replit
2. Select "Autoscale Deployment"
3. Configure:
   - Min instances: 1 (keeps one warm)
   - Max instances: 5 (scales up to 5 under load)
   - Machine size: 0.5 vCPU / 1 GiB (upgrade if needed)
4. Set build command: `npm run build`
5. Set run command: `npm run start`
6. Deploy!

### Deployment Configuration
Build command should compile TypeScript and prepare assets:
```bash
npm run build
```

Run command should start the production server:
```bash
NODE_ENV=production tsx server/index.ts
```

### Custom Domain (Optional)
1. Go to Deployment settings
2. Click "Add custom domain"
3. Follow DNS configuration instructions
4. Update ALLOWED_ORIGINS to include your domain

## Post-Deployment

### Verification
- [ ] Visit /health - should return 200 OK
- [ ] Visit /health/ready - all checks should pass
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
Replit PostgreSQL includes automatic backups.

### Application State
- Portfolio versions stored in database
- Content assets on Cloudinary
- User data in PostgreSQL

### Recovery Steps
1. Restore from Replit database backup
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
3. Check Replit status page
4. Contact Replit support
5. Rollback if critical

---

**Production URL**: https://your-app.replit.app
**Admin Panel**: https://your-app.replit.app/admin
**Health Check**: https://your-app.replit.app/health
