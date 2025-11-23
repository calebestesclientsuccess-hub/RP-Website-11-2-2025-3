# SEO Ops Guide

## Publish Gate
- The blog editor now blocks publishing/scheduling when the meta title (>60 chars), description (>160 chars), or canonical URL (non-HTTPS) violate guardrails.
- Fix the highlighted fields or acknowledge the warning via the checkbox to unlock the Publish button.
- The live SERP preview mirrors Google’s desktop snippet so writers can spot truncation before shipping.

## AI Guardrails
- `/api/ai/text` enforces 60/160 character budgets server-side using smart truncation and content-based padding.
- If the AI tries to return invalid metadata, the server normalizes it before sending it to the UI.

## SEO Health Dashboard
- Filter issues by severity (High/Medium/Low) and status (Open/Resolved/Ignored) from the control card at the top.
- `Fix with AI` supports missing/duplicate meta titles & descriptions. The system ensures generated copy differs from the current value before applying.
- `Ignore issue` marks a false positive and keeps it out of future scans; use sparingly and only with a justification in team notes.
- Resolved/ignored issues display the actor and timestamp for accountability.

## Running Scans
1. Open Admin → SEO Health.
2. Click **Run Scan** to refresh issues.
3. Use filters to focus on high-priority blockers first.

## When to Ignore vs. Fix
- **Fix:** Anything affecting crawlability, duplicate metadata across live posts, or missing descriptions.
- **Ignore:** Legitimate exceptions (compliance copy, intentional canonical offsets). Ignored items can be reopened by editing metadata or via the API if needed.


