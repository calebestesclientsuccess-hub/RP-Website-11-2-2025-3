<!-- fd890dcc-20e1-4c91-8187-1bf46afe3901 f8eaac11-d5f7-4be0-89d0-3ab946870715 -->
# User Journey Completion Plan

## Step 1: Discovery & UX Alignment

- Audit existing admin UX (PortfolioBuilder, MediaLibrary, Brand Settings) to map reusable components; catalog touchpoints requiring net-new UI (logo upload inline, component-library selector, section/feature planner, per-section refinement UI).
- Define the desired flow in Figma or markdown, including state transitions (new project wizard vs. edit mode, staged prompt pipeline UI, preview/version sidebar).

## Step 2: Backend Contracts & Data Model Updates

- Extend brand/project schema (`shared/schema.ts`, relevant migrations) to store logo references, component library choice, section/feature preferences, staged prompt metadata, and version history (V1–V6 snapshots with diffs/confidence scores).
- Update REST endpoints in `server/routes.ts` to expose CRUD for the new metadata, asset associations, and a multi-stage `/api/portfolio/pipeline` that sequences the six prompt stages (initial generation through validation) with resumable status.

## Step 3: Asset & Brand Setup Workflow

- Embed logo upload (reusing Cloudinary/media upload logic) and component library selector directly into the builder wizard; add inline asset picker that surfaces tenant media with tagging/filtering so users can drop assets without leaving the flow.
- Implement brand-color swatches with validation, saving immediately to the backend so prompts reference the latest palette.

## Step 4: Section & Feature Planner

- Create a configuration step where users choose number of sections, assign feature types (CTA, e-book, assessment, custom), and capture per-section objectives; persist to project metadata and feed into prompt scaffolding.
- Provide guardrails (min/max sections, mutually exclusive feature combos) and surface their selections in the preview/sidebar for transparency.

## Step 5: Prompting Experience Enhancements

- Build a staged prompt runner UI that shows progress through the six pipeline stages, exposes intermediate JSON (Version 1) after the first pass, and auto-runs the remaining stages while showing status/logs.
- Allow users to optionally pause automation and drill into per-section prompting: a panel listing sections where each has its own prompt textarea, AI response, and “apply to scene” action.

## Step 6: JSON + Preview UX Upgrades

- Add version timeline with diff viewer so users can compare V1 vs V6; store versions server-side and allow rollbacks.
- Keep the live preview synchronized with whichever version/section the user is inspecting; highlight sections undergoing per-section edits.

## Step 7: Testing, Telemetry, and Docs

- Write unit/integration tests for the new endpoints and React components; add end-to-end coverage (Playwright) for the full journey from brand setup through staged prompt completion.
- Instrument analytics/logging around each step (time spent, failure modes) and update internal docs (ENHANCEMENT_PLAN.md, onboarding guides) so the team understands the new flow.