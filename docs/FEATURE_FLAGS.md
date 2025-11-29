# Feature Flags

This document describes how feature flags are defined, consumed, and managed across the Revenue Party application. Every flag must have a single source of truth entry in [`shared/feature-flags.ts`](../shared/feature-flags.ts); the backend, frontend, and tooling all reference this registry to guarantee consistency.

## Naming & Scopes

| Scope      | Purpose                                             | Naming pattern                    |
|------------|-----------------------------------------------------|-----------------------------------|
| `global`   | Platform-wide switches (e.g., maintenance mode)     | `maintenance-mode`, `site-*`      |
| `page`     | Toggle entire routes                                | `page-{slug}` (`page-branding`)   |
| `section`  | Show/hide major screen sections or flows            | `section-*` or descriptive names  |
| `component`| Small visual/UI controls (buttons, toggles, nav)    | `component-*` or descriptive names|
| `api`      | Backend-only gates for feeds or integrations        | `api-*`                           |

Guidelines:

1. Keys are lowercase kebab-case.
2. Prefer reusing a page flag for all routes that present the same experience (e.g., `/branding` and `/branding/:slug` both use `page-branding`).
3. Default states belong in the registry. Database rows inherit these defaults when seeded.

## Adding a Flag

1. **Registry** – Append an entry to `featureFlagRegistry` with `key`, `name`, `description`, `scope`, and `defaultEnabled`.
2. **Seed Script** – The registry is used to populate the database via `scripts/seed-feature-flags.ts`. No extra work is required unless a tenant-specific override is needed.
3. **Backend** – Protect any relevant routes using the helpers from `server/services/feature-flags.ts` (`isFeatureEnabled`, `gateRoute`, etc.).
4. **Frontend** – Wrap pages in `FeatureFlaggedRoute` or sections in `FeatureGate`. Remove dead code paths; the flag decides visibility.
5. **Admin UI** – Confirm the flag appears on `/admin/feature-flags`, has the correct description, and behaves as expected when toggled.

## Lifecycle

1. **Introduce** (default disabled). Deploy behind the flag while QA happens in production-like environments.
2. **Enable** for staged tenants or specific environments.
3. **Ramp** – Gradually enable in production.
4. **Retire** – Once the feature is permanent, delete usages, remove the registry entry, and run the seed to clean up DB rows.

## Operational Notes

- Flag evaluations must fail *closed*—if a key is missing or an API errors, the feature should stay hidden.
- All public surfaces (routes, sitemap, navigation, cards) must respect the same flag to prevent backdoor access.
- Use the audit logs emitted by the feature flag service to understand who toggled what and when.
- Re-run `npx tsx scripts/seed-feature-flags.ts` whenever registry entries change to sync environments.

Keeping these rules in place guarantees that unfinished pages (like Branding) or the entire site (“Maintenance Mode”) can be hidden instantly without invasive deploys.

