# Accessibility Audit Report

This document tracks accessibility compliance for the Revenue Party website.

## Testing Methodology

We use [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright) to perform automated accessibility testing against WCAG 2.1 Level AA standards.

### Coverage

The following pages are tested automatically in CI:
- Home (`/`)
- Assessment (`/assessment`)
- Audit (`/audit`)
- Pricing (`/pricing`)
- Contact (`/contact`)
- Blog (`/blog`)

### Running Tests

```bash
# Run all accessibility tests
npm run test:e2e tests/e2e/accessibility.spec.ts

# Run with UI mode for debugging
npx playwright test tests/e2e/accessibility.spec.ts --ui
```

## Standards Compliance

Target: **WCAG 2.1 Level AA**

### Automated Testing

- [x] All primary routes pass axe-core scans
- [x] No critical or serious violations detected
- [x] Forms have proper labels
- [x] Interactive elements meet touch target size guidelines
- [x] Keyboard navigation functional
- [x] Skip-to-main-content link present

### Manual Testing Checklist

The following must be verified manually:

- [ ] **Screen reader compatibility** - Test with NVDA (Windows) or VoiceOver (Mac)
- [ ] **Keyboard-only navigation** - Complete critical user journeys without a mouse
- [ ] **Color contrast** - Verify all text meets 4.5:1 ratio (use browser DevTools)
- [ ] **Zoom/resize** - Test at 200% zoom level, verify no content is cut off
- [ ] **Animations respect prefers-reduced-motion** - Check for users with motion sensitivity

## Known Issues

_Update this section as accessibility issues are discovered and resolved._

### Current Status: ✅ PASSING

No critical or serious accessibility violations detected as of last audit.

## Continuous Monitoring

Accessibility tests run automatically on every pull request via GitHub Actions. The CI pipeline will fail if critical or serious violations are detected.

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe DevTools Browser Extension](https://www.deque.com/axe/devtools/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE Web Accessibility Evaluation Tool](https://wave.webaim.org/)

## Reporting Issues

If you discover an accessibility issue:
1. File a GitHub issue with the "accessibility" label
2. Include: page URL, description of issue, WCAG criterion violated
3. Screenshot or screen recording if applicable
4. Severity: critical / serious / moderate / minor

