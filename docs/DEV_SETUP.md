# Development Environment Setup

This guide covers setting up and running the application in local development mode.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Neon hosted database)
- Redis instance (or Redis Cloud)
- Environment variables configured in `.env`

## Quick Start

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

The application will start on **http://localhost:5001** by default.

## Environment Variables

Create a `.env` file in the root directory with the following required variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Session
SESSION_SECRET=<generate-a-32-character-secret>

# Redis
REDIS_URL=redis://default:password@host:port

# Server
PORT=5001

# Optional: Third-party services
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GOOGLE_AI_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

### Generating SESSION_SECRET

You can generate a secure session secret using:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Development Mode Features

### Content Security Policy (CSP)

**Important**: CSP is **disabled** in development mode to allow Vite's Hot Module Replacement (HMR) and development tools to function properly.

- In development (`NODE_ENV=development`), the `securityHeaders` middleware skips all CSP directives
- In production (`NODE_ENV=production`), strict CSP rules are enforced
- This prevents the "white screen of death" caused by CSP blocking Vite scripts

**Implementation**: See `server/middleware/security-headers.ts` lines 40-43

### Port Configuration

The default development port is **5001** to avoid conflicts with macOS AirPlay Receiver, which uses port 5000.

To change the port:
1. Update `PORT` in your `.env` file
2. Restart the dev server

### Redis Warnings

You may see warnings in the console about Redis eviction policy:

```
IMPORTANT! Eviction policy is volatile-lru. It should be "noeviction"
```

**This is safe to ignore in local development.** The warning is a best practice reminder for production environments. In development, Redis is used for rate limiting and session storage, and the default eviction policy is sufficient.

## Accessing the Application

### Public Routes
- Homepage: http://localhost:5001
- Branding Projects: http://localhost:5001/branding/projects/:slug

### Admin Routes
- Admin Dashboard: http://localhost:5001/admin
- Case Study Editor: http://localhost:5001/admin/case-studies/:projectId

## Browser Compatibility

During development, test in multiple browsers:
- Chrome/Edge (recommended for DevTools)
- Safari (for macOS-specific testing)
- Firefox (for standards compliance)

## Troubleshooting

### White Screen / CSP Errors

If you see a white screen and CSP errors in the browser console:
1. Verify `NODE_ENV=development` is set (check terminal output)
2. Ensure you're using the correct URL with `http://` (not `https://`)
3. Clear browser cache and hard reload (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
4. Check `server/middleware/security-headers.ts` to ensure CSP is skipped in dev mode

### Port Already in Use

If port 5001 is in use:
```
Error: listen EADDRINUSE: address already in use :::5001
```

Solutions:
1. Change `PORT` in `.env` to a different port (e.g., 3001, 8080)
2. Find and kill the process using the port:
   ```bash
   lsof -ti:5001 | xargs kill -9
   ```

### Database Connection Errors

If you see `ECONNREFUSED` for database:
1. Verify `DATABASE_URL` in `.env` is correct
2. For Neon database, ensure the connection string includes `?sslmode=require`
3. Test connectivity: `psql $DATABASE_URL`

### Redis Connection Errors

If you see `ECONNREFUSED` for Redis:
1. Verify `REDIS_URL` in `.env` is correct
2. For Redis Cloud, use the connection string from your Redis Cloud dashboard
3. Redis is optional in development; the app will function without it (with degraded rate limiting)

## Running Database Migrations

```bash
# Push schema changes to the database
npm run db:push

# Generate new migration
npm run db:generate

# Run migrations
npm run db:migrate
```

## Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# All tests
npm test
```

Ensure `TEST_DATABASE_URL` is set in your `.env` or test environment for integration tests.

## Hot Module Replacement (HMR)

Vite's HMR is enabled in development. Changes to client-side code will update in the browser without a full page reload.

If HMR stops working:
1. Check the browser console for WebSocket connection errors
2. Ensure `connect-src` in CSP allows `ws://localhost:5001` (should be disabled in dev)
3. Restart the dev server

## Additional Resources

- [Deployment Guide](./DEPLOYMENT.md)
- [Production Checklist](./PRODUCTION_CHECKLIST.md)
- [Security Documentation](./SECURITY_INCIDENT_RESPONSE.md)
- [Test Verification Guide](./TEST_VERIFICATION_GUIDE.md)









