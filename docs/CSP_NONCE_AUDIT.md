# CSP Nonce Audit Report

## Summary

The application has CSP nonce infrastructure in place (`assignCspNonce` middleware, `security-headers` middleware), but **inline scripts in HTML templates do not currently use nonces**, which will cause CSP violations when strict CSP is enforced in production.

## Current State

### ✅ What's Working

1. **Nonce generation**: `server/middleware/csp-nonce.ts` generates a unique nonce per request
2. **CSP header configuration**: `server/middleware/security-headers.ts` includes nonce in CSP policy when available
3. **External scripts**: All external JavaScript/CSS loaded from CDNs are properly whitelisted in CSP
4. **React inline styles**: JSX `style={{}}` props are not blocked (they're applied via JavaScript, not HTML attributes)

### ❌ Issues Found

#### 1. Static HTML Inline Scripts (Critical)

**Location**: `/index.html` lines 52-82

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  ...
}
</script>
```

**Problem**: These inline JSON-LD scripts lack `nonce` attributes and will be blocked by CSP when `'unsafe-inline'` is removed from `script-src` directive.

**Impact**: Structured data for SEO will not render, potentially harming search rankings.

#### 2. React Helmet Scripts (Moderate)

**Location**: `client/src/components/schemas/*.tsx`

Example from `OrganizationSchema.tsx`:
```tsx
<Helmet>
  <script type="application/ld+json">
    {JSON.stringify(schema)}
  </script>
</Helmet>
```

**Problem**: `react-helmet-async` injects scripts client-side without CSP nonces. While currently allowed in development (unsafe-inline), they will be blocked in strict production CSP.

**Impact**: Dynamically loaded structured data (articles, products, etc.) will not render.

## Recommended Solutions

### Option 1: Move JSON-LD to React Components Only (Recommended)

**Effort**: Low  
**Security**: High

1. Remove inline scripts from `index.html` and `/client/index.html`
2. Ensure `OrganizationSchema` and `WebSiteSchema` components are imported in `App.tsx`
3. Add a Helmet plugin to support nonces: configure `react-helmet-async` to read `window.__CSP_NONCE__` and inject it into script tags

**Implementation**:

```tsx
// In server/vite.ts (development) and production HTML generation
template = template.replace(
  '</head>',
  `<script>window.__CSP_NONCE__ = '${res.locals.cspNonce}';</script></head>`
);
```

```tsx
// In App.tsx or a wrapper
import { Helmet, HelmetProvider } from 'react-helmet-async';

const helmetContext = {};
const cspNonce = (window as any).__CSP_NONCE__;

<HelmetProvider context={helmetContext}>
  <Helmet 
    defaultTitle="Revenue Party"
    script={[{ nonce: cspNonce }]}
  />
  ...
</HelmetProvider>
```

### Option 2: Server-Side HTML Transformation

**Effort**: Medium  
**Security**: High

Modify `server/vite.ts` to inject nonces into existing inline scripts:

```typescript
// In setupVite and serveStatic
let template = await fs.promises.readFile(clientTemplate, 'utf-8');
const nonce = res.locals.cspNonce;

// Inject nonce into all inline scripts
template = template.replace(
  /<script([^>]*)type="application\/ld\+json"([^>]*)>/g,
  `<script$1type="application/ld+json"$2 nonce="${nonce}">`
);
```

**Trade-off**: Requires HTML parsing/transformation on every request in production.

### Option 3: External JSON-LD Files

**Effort**: Low  
**Security**: Medium

Move structured data to static JSON files served from `/public/structured-data/*.json` and reference via `<script src>`.

**Trade-offs**:
- Static data only (can't include dynamic page-specific values)
- Additional HTTP requests
- CSP allows external scripts by default

## Action Items

- [ ] Choose solution approach (recommend Option 1)
- [ ] Remove inline scripts from `index.html` files
- [ ] Configure `react-helmet-async` to use CSP nonces
- [ ] Test with `DISABLE_INLINE_STYLE_ATTR=true` to verify no CSP violations
- [ ] Add CSP violation reporting endpoint (optional):
  ```typescript
  app.post('/api/csp-report', (req, res) => {
    console.warn('CSP Violation:', req.body);
    res.status(204).end();
  });
  ```
  Update CSP: `report-uri /api/csp-report; report-to default;`

## Testing CSP Compliance

### Manual Test

1. Set `NODE_ENV=production`
2. Build and serve: `npm run build && npm run start`
3. Open browser DevTools Console
4. Look for CSP violations (indicated by red errors like "Refused to execute inline script")

### Automated Test

Add to `tests/e2e/security.spec.ts`:

```typescript
test('no CSP violations on homepage', async ({ page }) => {
  const violations: any[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
      violations.push(msg.text());
    }
  });
  
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  expect(violations, 'Found CSP violations').toHaveLength(0);
});
```

## Status

✅ **RESOLVED** - Option 2 (Server-Side HTML Transformation) has been implemented in `server/vite.ts`. CSP nonces are now automatically injected into all inline `<script type="application/ld+json">` tags for both development (`setupVite`) and production (`serveStatic`) modes.

### Implementation Details

**Changes Made**:
- Modified `server/vite.ts` `setupVite()` to inject nonces into JSON-LD scripts during development
- Modified `server/vite.ts` `serveStatic()` to inject nonces into JSON-LD scripts in production builds
- Updated `client/index.html` to use inline JSON-LD scripts (removed broken external `src` references)

**Code Location**: `/Users/caleb/Desktop/Revenue Party Website 11 19 5/server/vite.ts` lines 66-73 (dev) and lines 128-138 (prod)

**Testing Recommended**: 
- Build production bundle: `npm run build`
- Start production server: `npm run start` (with `NODE_ENV=production`)
- Open browser DevTools Console and verify no CSP violations for JSON-LD scripts

## References

- [CSP Nonce Best Practices](https://content-security-policy.com/nonce/)
- [react-helmet-async Nonce Support](https://github.com/staylor/react-helmet-async#using-nonces)
- [Google's CSP Evaluator](https://csp-evaluator.withgoogle.com/)

