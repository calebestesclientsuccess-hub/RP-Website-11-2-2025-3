## User Journey Completion Blueprint

### Goals
- Give builders a single linear flow: brand setup → asset prep → section/feature planning → staged AI prompting → preview + version control.
- Reuse existing admin surfaces (AI Layout Wizard, Portfolio Builder, Media Library) where possible, but eliminate context switching.
- Ensure every step persists to backend tables so Gemini prompts have deterministic context.
- Keep brand identity canonical: wizard + builder share the same layered palette, logo, component library, and asset plan so the first portfolio feels “done” immediately.

### Current Building Blocks
- `Wizard.tsx`: multi-step shell already supports brand colors, asset upload, structure list, and polling for refinements.
- `PortfolioBuilder.tsx`: chat-first prompting, live preview, optimistic scene updates, JSON editing.
- `MediaLibrary` + `/api/media-library/*`: handles actual file uploads/storage via Cloudinary.
- `/api/admin/brand-settings`: stores logo/colors/component library but not integrated into builder flow.

### Target Flow (Single Wizard)
1. **Brand Identity**
   - Upload/select logo (previewed inline).
   - Choose brand colors (primary/secondary/accent) and component library.
2. **Asset Preparation**
   - Upload assets or pick from media library without leaving wizard.
   - Tag assets per section/intent for better prompting.
3. **Structure & Feature Planner**
   - Select number of sections (min/max guardrails).
   - Assign feature templates per section (CTA, e-book, assessment, custom).
   - Mark optional “per-section prompt” toggle.
4. **Prompt & Configuration**
   - Global prompt field.
   - Optional per-section prompts appear if enabled; each shows context (selected assets + features).
5. **Staged Pipeline Runner**
   - Visual pipeline (6 stages). Stage 1 returns JSON V1 immediately; stages 2-6 auto-run with status/logs.
   - Users can pause/skip stages, edit prompts, or trigger per-section refinement between stages.
6. **Version Review & Preview**
   - Version timeline storing each stage’s JSON + metadata (confidence, diffs).
   - Preview panel linked to selected version/scene, with share + rollback.

### Key UX Notes
- Keep wizard persistent state (React Query + localStorage) so refreshes don’t lose setup.
- Provide escape hatches to open full Portfolio Builder for advanced editing, but default path should be wizard.
- Align copy with marketing tone (“Deploy your revenue system”) to maintain narrative cohesion.

### Current Implementation Highlights (Nov 2025)
- **Brand & Asset Sheet** now lives inside `PortfolioBuilder.tsx`. Once a project exists, admins can:
  - Upload logos directly to the media library (`/api/media-library/upload`) and bind them to the active project.
  - Manage a 1–5 layer palette via the shared `ColorLayerEditor`, which enforces primary/secondary requirements while letting users rank usage (background/text/accent/neutral). The same editor powers both the inline Step 2 card and the Brand sheet so changes stay in sync.
  - See inline `AssetStatusIndicator` feedback plus a “Commit Assets” action that immediately persists references to `/api/projects/:id/brand`, eliminating the old 900 ms auto-save race.
  - Curate an `assetPlan` by toggling tenant assets inline—no context switching to the Media Library screen—and know exactly when the save finished.
- **Section & Feature Planner** sits beneath the project setup accordion. Each section row lets users:
  - Name/slug sections, assign feature templates (CTA, assessment, ebook, hero, etc.).
  - Toggle per-section prompts and capture the instruction snippet that rides along with the pipeline request.
  - Persist the plan via `PUT /api/projects/:projectId/sections`, which hydrates the new `project_section_plans` table.
- **Step-aware Builder Header** now shows “Step X of 7” progress, keeps “Share” + “Brand & Assets” as the only primary buttons, and tucks every other utility (guided tour, dev JSON panel toggle, preview toggle) inside a `Builder Tools` dropdown so the run/commit buttons feel magical instead of overwhelming.
- **Staged Prompt Runner** exposes the six-stage Gemini pipeline:
  - Users author a global prompt, optionally leveraging the per-section prompts they configured.
  - `/api/projects/:id/pipeline-runs` kicks off Stage 1 synchronously (returning Version 1 JSON) and streams Stages 2-6 in the background.
  - The UI polls while a run is `running`, showing stage-level status chips and surfacing per-stage errors.
  - Recent versions appear as buttons that load their JSON back into the preview/editor for quick comparison.
- **Version Timeline & Preview Hooks**
  - Journey responses now include the five most recent `portfolio_versions` rows (stage key, confidence, scenes).
  - Selecting a version updates both `previewScenes` and the raw JSON editor, effectively acting as a rollback/light diff surface.
- **Wizard → Builder Hand-off**:
  - The streamlined `/api/portfolio/generate` flow now creates a project with a layered palette derived from the selected archetype. When users jump into `/admin/portfolio-builder?projectId=...`, Step 2 already lists the prioritized colors and Step 3 defaults to the same `shadcn/ui` library, so their “first build” feels instantaneous instead of redundant.
  - Wizard-run projects immediately show up in “Recent Projects,” allowing builders to continue refinement without repeating any setup.

### Testing & Telemetry Checklist
- **Manual walk-through**
  1. Create/save a project in the builder, then open the Brand sheet; verify logo upload + palette persistence via `/api/projects/:id/brand`.
  2. Add 2–3 section rows (with at least one per-section prompt) and ensure the payload lands in `project_section_plans`.
  3. Run the pipeline with a global prompt; confirm Stage 1 returns immediately and Stages 2–6 transition through statuses.
  4. Inspect `portfolio_pipeline_runs` to ensure stage metadata updates; check `portfolio_versions` for V1 + V6 rows.
  5. Click a stored version in the UI and verify the preview/JSON editor swap to that snapshot.
- **Logging**
  - Server logs Stage start/completion per run (`console.log` statements inside `RefinementPipeline` methods and the route).
  - Each pipeline run row keeps a `metadata` JSON blob capturing issue/improvement counts and final confidence for downstream analytics dashboards.

Future telemetry work: pipe pipeline run metadata into the analytics service and emit browser events (Segment/Snowplow) when users save brand configs or start runs.

