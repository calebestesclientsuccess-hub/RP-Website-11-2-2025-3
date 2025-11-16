
# Accessibility Documentation

## Overview

Revenue Party is committed to providing an accessible experience for all users, including those with disabilities. This document outlines our accessibility features, keyboard shortcuts, and WCAG 2.1 Level AA compliance.

## Keyboard Navigation

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Navigate to next interactive element |
| `Shift + Tab` | Navigate to previous interactive element |
| `Enter` or `Space` | Activate buttons and links |
| `Escape` | Close modals and dialogs |
| `?` | Show keyboard shortcuts help |
| `/` | Focus search (where available) |

### Form Navigation

| Shortcut | Action |
|----------|--------|
| `Tab` | Move to next form field |
| `Shift + Tab` | Move to previous form field |
| `Arrow Keys` | Navigate within select dropdowns and radio groups |
| `Space` | Toggle checkboxes |
| `Enter` | Submit forms |

### Assessment Navigation

| Shortcut | Action |
|----------|--------|
| `Arrow Keys` | Navigate between answer options |
| `Space` or `Enter` | Select answer option |
| `Right Arrow` or `N` | Next question |
| `Left Arrow` or `P` | Previous question |

## Screen Reader Support

### Tested Screen Readers

- **NVDA** (Windows) - Fully supported
- **JAWS** (Windows) - Fully supported
- **VoiceOver** (macOS/iOS) - Fully supported
- **TalkBack** (Android) - Supported

### ARIA Labels

All interactive elements include proper ARIA labels for screen reader users:

- Forms include `aria-required` for required fields
- Errors use `aria-invalid` and `aria-describedby`
- Dynamic content uses `aria-live` regions
- Buttons include descriptive `aria-label` attributes
- Navigation uses `aria-current` for active pages

## Visual Accessibility

### Focus Indicators

- All interactive elements have high-contrast focus indicators (3px solid outline)
- Focus indicators meet WCAG 2.1 Level AA contrast requirements (minimum 3:1)
- Focus outline offset provides clear separation from element borders

### Color Contrast

All text and interactive elements meet WCAG 2.1 Level AA requirements:

- Normal text: minimum 4.5:1 contrast ratio
- Large text (18pt+): minimum 3:1 contrast ratio
- Interactive elements: minimum 3:1 contrast ratio

### Touch Targets

All interactive elements meet WCAG 2.1 Level AAA requirements:

- Minimum size: 44x44 pixels
- Adequate spacing between adjacent targets
- Optimized for mobile and tablet devices

## Media Accessibility

### Video Content

All video content includes:

- **Captions**: Synchronized text captions for all dialogue and relevant sounds
- **Transcripts**: Full text transcripts available below each video
- **Audio Descriptions**: Extended descriptions for visual content
- **Keyboard Controls**: Play, pause, mute, and caption controls accessible via keyboard

### Images

- All images include descriptive `alt` text
- Decorative images use `alt=""` or `role="presentation"`
- Complex images (charts, diagrams) include extended descriptions

## Form Accessibility

### Features

- All form inputs have associated labels
- Required fields clearly indicated with asterisk (*) and `aria-required`
- Real-time validation with clear error messages
- Error messages linked to fields via `aria-describedby`
- Autocomplete attributes for common fields (name, email, organization)

### Error Prevention

- Confirmation dialogs for destructive actions
- Clear warning messages before data loss
- Ability to review and edit before submission

## Testing

### Automated Testing

We use automated accessibility testing in our CI/CD pipeline:

- **axe-core**: Tests all pages against WCAG 2.1 Level AA
- **Lighthouse**: Performance and accessibility audits
- **pa11y**: Automated scanning for common issues

### Manual Testing

Regular manual testing includes:

- Screen reader navigation (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation
- High contrast mode testing
- Zoom and text resize testing (up to 200%)

## Known Issues

We maintain transparency about accessibility issues:

- None currently identified

Report accessibility issues to: accessibility@revenueparty.com

## WCAG 2.1 Compliance

Revenue Party conforms to WCAG 2.1 Level AA standards.

### Conformance Status

**Conformance Level**: WCAG 2.1 Level AA

**Last Reviewed**: January 2025

**Scope**: All public-facing pages and authenticated user areas

## Additional Resources

- [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)

## Contact

For accessibility questions or to report issues:

- Email: accessibility@revenueparty.com
- Phone: [Your phone number]
- Support: [Your support URL]

We aim to respond to accessibility inquiries within 2 business days.
