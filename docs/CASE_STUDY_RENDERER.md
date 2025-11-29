## Case Study Renderer Contract

### Overview
`CaseStudyRenderer` lives at `client/src/components/branding/CaseStudyRenderer.tsx`. It renders a `CaseStudyContent` payload (same shape returned by `/api/branding/projects/:id`) and wraps each section with the scoped theming engine from Phase 2.

### Props
```ts
type CaseStudyRendererProps = {
  content: CaseStudyContent; // from @shared/schema
}
```

- Each section entry may include `theme.backgroundColor`, `textColor`, `primaryColor`. Missing text color is auto-computed.
- Blocks support `text`, `carousel`, and `stat-grid` today. Unknown block types render a safe placeholder.

### Block Components
| Block | Component | Notes |
| --- | --- | --- |
| `text` | `BlockText` | Markdown via `react-markdown`/`remark-gfm`, obeys `layout` |
| `carousel` | `BlockCarousel` | Embla slider, mixed image/video, `aspectRatio` |
| `stat-grid` | inline markup | Stacked cards using brand tokens |

### Integration Guidance (Phase 4 Editor)
- Import `CaseStudyRenderer` for the live preview pane:
  ```tsx
  <CaseStudyRenderer content={{ sections }} />
  ```
- Wrap editor state in the same `CaseStudyContent` shape you POST to `/api/projects/:id/content`.
- When editing a section theme, update `backgroundColor`/`textColor`/`primaryColor`; the renderer reuses the scoped CSS variables from `CaseStudyWrapper`.

### Traffic Cop Logic
`client/src/pages/BrandingProjectPage.tsx` now decides between:
```tsx
const hasCaseStudy = Boolean(project.caseStudyContent?.sections?.length);
return hasCaseStudy ? (
  <CaseStudyRenderer content={project.caseStudyContent!} />
) : (
  // legacy scenes
);
```
The admin editor should use the same condition when previewing a project so legacy/Case Study experiences stay consistent.









