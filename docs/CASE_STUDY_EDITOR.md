## Case Study Editor (Founder Mode)

### Route & Access
- URL: `/admin/case-studies/:projectId`
- Guarded by `ProtectedRoute` and uses the standard admin sidebar layout.
- Add links from dashboards using `<Link href="/admin/case-studies/${projectId}">Edit Case Study</Link>`.

### Data Flow
1. Fetch project via `/api/branding/projects/:projectId` (React Query key: same URL).
2. Initialize local state:
   ```ts
   const [sections, setSections] = useState(
     project?.caseStudyContent?.sections ?? []
   );
   ```
3. Mutations call `PATCH /api/projects/:projectId/content` with:
   ```json
   { "content": { "sections": [...] } }
   ```
4. On success: invalidate the same query key so the public branding page refreshes automatically.

### Authoring UX
- **Sections panel (left)**
  - Add / reorder / delete sections.
  - Configure theme colors (background / text / primary).
  - Manage blocks inside each section.
- **Block types**
  - `Text`: Markdown textarea + layout selector.
  - `Carousel`: Embla slider preview; uses `MediaPicker` for each slide; aspect ratio toggle.
  - `Stat Grid`: Simple label/value rows (add/remove).
- Every change marks the form dirty; browser unload + Back button prompt before discarding changes.

### Live Preview (right pane)
- Renders `<CaseStudyRenderer content={{ sections }} />` so the admin view matches the public page exactly.
- Empty state prompts users to add the first section.

### Validation & Safety
- Before saving we run `caseStudyContentSchema.safeParse({ sections })`; errors are surfaced via toast.
- Save button stays disabled while mutation runs or if no sections exist.
- Unsaved changes trigger:
  - `beforeunload` browser prompt.
  - Custom confirmation when leaving via the “Back to Projects” button.

### Extending The Editor
- Add new block types by extending `caseStudyBlockSchema`, implementing a renderer component, and then updating `SectionEditor` ➜ `BlockEditor`.
- Media support reuses the shared `MediaPicker`, so new blocks can leverage the same callback.

### Testing Checklist
- Add at least one section, save, and confirm the branding page `/branding/:slug` switches to the Case Study renderer.
- Remove all sections → Save button disabled (schema enforces minimum 1 section).
- Carousel media referencing another tenant should still be rejected by the PATCH endpoint (integration tests cover this path).*** End Patch***









