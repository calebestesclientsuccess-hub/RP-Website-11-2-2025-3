
# Portfolio Director Enhancement Plan v2.0

## Overview
This document outlines a phased approach to enhancing the AI-powered Portfolio Director system, organized by dependencies and risk levels rather than arbitrary groupings.

---

## Phase 0: Foundation (CRITICAL - Must Complete First)

These are prerequisites for all other enhancements. Nothing else can work reliably without these.

### 1. Asset Whitelist Validation System
**Priority:** P0 (Blocker)
**Reason:** AI currently references non-existent assets, causing broken scenes

**Implementation:**
- Validate all asset IDs before sending to Gemini
- Reject prompts referencing invalid IDs
- Add asset ID autocomplete in UI
- Log validation failures for debugging

**Acceptance Criteria:**
- 100% of generated scenes use valid asset IDs
- User sees real-time validation in catalog editor
- Clear error messages when invalid IDs detected

---

### 2. Default Config Fallback Logic
**Priority:** P0 (Blocker)
**Reason:** Missing director fields cause rendering failures

**Implementation:**
- Define complete DEFAULT_DIRECTOR_CONFIG with all 40+ fields
- Merge defaults before saving to database
- Validate completeness in scene-validator.ts
- Add TypeScript type guards

**Acceptance Criteria:**
- Every scene has all required director fields
- No undefined/null values in director config
- Scenes render correctly even with partial AI output

---

### 3. Conflict Detection Rules Engine
**Priority:** P0 (Blocker)
**Reason:** parallax + scaleOnScroll conflicts break animations

**Implementation:**
- Create conflict matrix (parallax vs scaleOnScroll, etc.)
- Auto-fix conflicts with priority order
- Warn user in confidence factors
- Add validation to DirectorConfigForm

**Acceptance Criteria:**
- No conflicting effects in same scene
- Auto-fix applied before saving
- User sees warnings for manual conflicts

**Conflict Matrix:**
```typescript
const CONFLICT_RULES = {
  parallax_scale: {
    condition: (d) => d.parallaxIntensity > 0 && d.scaleOnScroll,
    fix: (d) => ({ ...d, scaleOnScroll: false }),
    message: "parallax conflicts with scaleOnScroll"
  },
  blur_performance: {
    condition: (d) => d.blurOnScroll && d.parallaxIntensity > 0,
    fix: (d) => ({ ...d, blurOnScroll: false }),
    message: "blurOnScroll + parallax causes performance issues"
  }
};
```

---

### 4. Error Boundary Components
**Priority:** P0 (Blocker)
**Reason:** Scene rendering errors crash entire page

**Implementation:**
- Wrap SceneRenderer in error boundary
- Fallback to static content on error
- Log errors to analytics
- Show user-friendly error message

**Acceptance Criteria:**
- One broken scene doesn't crash page
- User sees "Scene temporarily unavailable"
- Errors logged for debugging

---

### 5. Database Schema Migrations
**Priority:** P0 (Blocker)
**Reason:** Version storage and conversation history need DB tables

**Implementation:**
- Create `portfolio_versions` table
- Add `conversation_history` JSONB field to projects
- Add `asset_catalog` JSONB field to projects
- Create indexes for performance

**Schema:**
```sql
CREATE TABLE portfolio_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  scenes_json JSONB NOT NULL,
  confidence_score INT,
  change_description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE projects ADD COLUMN conversation_history JSONB DEFAULT '[]';
ALTER TABLE projects ADD COLUMN asset_catalog JSONB;
```

---

## Phase 1: Core AI Pipeline (Build on Phase 0)

### 6. 6-Stage Refinement Pipeline
**Priority:** P1 (High)
**Dependencies:** Phase 0 complete

**Current Implementation:** Partially exists in portfolio-director.ts
**Enhancement:** Complete all 6 stages with proper error handling

**Stages:**
1. Initial Generation (form-filling)
2. Self-Audit (AI finds inconsistencies)
3. Generate 10 Improvements
4. Auto-Apply Non-Conflicting Fixes
5. Final Regeneration
6. Validation Against Requirements

**Acceptance Criteria:**
- All 6 stages execute sequentially
- Errors in one stage don't crash pipeline
- Each stage logs to console
- Total time < 60 seconds

---

### 7. Confidence Scoring with Severity Levels
**Priority:** P1 (High)
**Dependencies:** Validation system (Phase 0)

**Implementation:**
- Categorize issues: CRITICAL, WARNING, INFO
- Weight scoring by severity
- Surface critical issues to user
- Auto-fix INFO-level issues

**Scoring Algorithm:**
```typescript
const calculateConfidence = (scene) => {
  let score = 100;
  scene.issues.forEach(issue => {
    if (issue.severity === 'CRITICAL') score -= 10;
    if (issue.severity === 'WARNING') score -= 3;
    if (issue.severity === 'INFO') score -= 1;
  });
  return Math.max(0, Math.min(100, score));
};
```

---

### 8. Context Window Management
**Priority:** P1 (High)
**Reason:** Long conversations exceed Gemini's token limit

**Implementation:**
- Track token count per message
- Summarize old messages when limit approached
- Preserve critical user requirements
- Add "reset conversation" button

**Token Budget:**
- Gemini 2.0: ~200k tokens
- Reserve 50k for response
- Use 150k for history + catalog
- Summarize when >100k used

---

### 9. Auto-Fix Non-Critical Issues
**Priority:** P2 (Medium)
**Dependencies:** Confidence scoring (#7)

**Auto-Fixable Issues:**
- Missing default values → apply defaults
- Color contrast < 4.5:1 → adjust automatically
- Duration < 0.8s → set to 1.2s
- Conflicting effects → disable lower priority

**Not Auto-Fixable:**
- Invalid asset IDs → user must fix
- Structural errors → regenerate scene
- Missing required content → user input needed

---

### 10. Comprehensive Logging/Diagnostics
**Priority:** P2 (Medium)

**Implementation:**
- Log each pipeline stage to console
- Track timing for each Gemini call
- Store failed generations for analysis
- Add "Debug Mode" toggle in UI

---

## Phase 2: Refinement Loop (User Experience)

### 11. Conversation Interface with Token Warnings
**Priority:** P1 (High)
**Dependencies:** Context window management (#8)

**Features:**
- Chat-style refinement UI
- Token usage meter
- Warning at 80% capacity
- "Summarize and continue" button

---

### 12. Version Timeline with Diff Storage
**Priority:** P1 (High)
**Dependencies:** Database schema (#5)

**Implementation:**
- Store diffs instead of full JSON (saves 70% space)
- Show "what changed" between versions
- One-click rollback to any version
- Export version history as ZIP

**Storage Strategy:**
```typescript
const storageStrategy = {
  version1: { type: 'full', size: '100%' },
  version2: { type: 'diff', size: '30%', basedOn: 'version1' },
  version3: { type: 'diff', size: '30%', basedOn: 'version2' }
};
```

---

### 13. Quick Prompts Library
**Priority:** P2 (Medium)

**Pre-Built Prompts:**
- "Make it more dramatic"
- "Speed up all transitions"
- "Add parallax to image scenes"
- "Use darker color palette"
- "Make text larger and bolder"

---

### 14. Scene JSON Editor with Syntax Highlighting
**Priority:** P2 (Medium)

**Features:**
- Monaco editor integration
- Real-time validation
- Format on save
- Diff view vs original

---

### 15. Real-time Validation Feedback
**Priority:** P2 (Medium)

**Implementation:**
- Validate director config on blur
- Show red underline for errors
- Tooltip with fix suggestion
- "Apply Fix" button

---

## Phase 3: Advanced UX (Polish)

### 16. Live Preview Panel (Desktop First)
**Priority:** P2 (Medium)
**Dependencies:** Error boundaries (#4)

**Current State:** Basic component exists
**Enhancements:**
- Add animation playback controls
- Show all scroll effects
- Scale preview to fit
- Export as video

---

### 17. Scene Overview Sidebar
**Priority:** P3 (Low)

**Features:**
- Thumbnail of each scene
- Drag to reorder
- Quick edit inline
- Color-coded by type

---

### 18. Cinematic Mode Asset Matching
**Priority:** P2 (Medium)

**Implementation:**
- Use Gemini to match assets to sections
- Semantic similarity scoring
- User approval before applying
- Fallback to manual selection

**Matching Algorithm:**
```typescript
const matchAssets = async (section, catalog) => {
  const prompt = `Match assets to section: ${section.prompt}
  Available: ${catalog.texts.map(t => t.content).join(', ')}
  Return asset IDs in priority order.`;
  
  const matches = await gemini.generate(prompt);
  return matches.filter(id => catalog.hasAsset(id));
};
```

---

### 19. Mobile-Responsive Layouts
**Priority:** P3 (Low)

**Features:**
- Collapsible sidebar on mobile
- Touch-friendly controls
- Simplified JSON editor
- Preview in mobile viewport

---

### 20. Onboarding Tour/Examples
**Priority:** P3 (Low)

**Features:**
- Interactive tutorial
- Sample portfolios to remix
- Tooltips on first use
- "How it works" video

---

## Phase 4: Polish & Optimization (Production Ready)

### 21. Advanced Cinematic Controls
**Priority:** P3 (Low)

**Features:**
- Keyframe editor
- Custom easing curves
- 3D transform controls
- Advanced blend modes

---

### 22. SEO/Accessibility Validation
**Priority:** P2 (Medium)

**Checks:**
- Heading hierarchy (h1 → h2 → h3)
- Alt text on all images
- Color contrast ratios
- Keyboard navigation

---

### 23. Performance Optimization
**Priority:** P2 (Medium)

**Optimizations:**
- Cache Gemini responses (30min TTL)
- Debounce real-time validation
- Lazy load scene previews
- Compress version diffs

---

### 24. Analytics/Usage Tracking
**Priority:** P3 (Low)

**Metrics:**
- Time per refinement iteration
- Average confidence scores
- Most used effects
- Conversion: generate → publish

---

### 25. Documentation & Help System
**Priority:** P3 (Low)

**Content:**
- Director config reference
- Effect examples
- Troubleshooting guide
- Video tutorials

---

## Critical Questions to Answer Before Starting

### Technical Architecture
1. **Version Storage:** PostgreSQL JSONB or separate blob storage?
   - **Recommendation:** JSONB for diffs < 100KB, S3 for full snapshots
   
2. **Gemini API Failures:** Retry logic? Fallback to simpler model?
   - **Recommendation:** 3 retries with exponential backoff, then fallback to gemini-1.5-flash

3. **Asset Limits:** Max assets per catalog? Per scene?
   - **Recommendation:** 100 assets/catalog, 10 assets/scene

### User Experience
4. **Conversation Persistence:** Across sessions or reset on page reload?
   - **Recommendation:** Persist in database, load on project open

5. **Rollback Scope:** Individual scenes or entire portfolio?
   - **Recommendation:** Both - scene-level for quick fixes, portfolio for major changes

6. **Preview Mode:** Production data or sandboxed?
   - **Recommendation:** Sandboxed with ability to "publish preview"

### Performance
7. **Caching Strategy:** Cache asset catalog? Gemini responses?
   - **Recommendation:** Yes to both - 30min TTL

8. **Export Format:** JSON only or include generated code?
   - **Recommendation:** JSON + React component code + styling

---

## Risk Mitigation

### High-Risk Areas Requiring Prototypes

1. **6-Stage Pipeline Performance**
   - **Risk:** Total time > 60s kills UX
   - **Mitigation:** Build isolated test, measure each stage
   - **Target:** < 45s total, with progress indicators

2. **Conflict Auto-Resolution**
   - **Risk:** AI makes unwanted changes
   - **Mitigation:** Show diff before applying, user approval
   - **Target:** 95% accuracy on auto-fixes

3. **Asset Matching Algorithm**
   - **Risk:** Semantic matching picks wrong assets
   - **Mitigation:** Test with 50+ real catalogs
   - **Target:** 80% user satisfaction with matches

4. **Mobile JSON Editor**
   - **Risk:** Unusable on small screens
   - **Mitigation:** User testing on phones/tablets
   - **Target:** Task completion < 2min on mobile

5. **Version Diff Storage**
   - **Risk:** Storage cost explosion with many versions
   - **Mitigation:** Benchmark with 100+ versions
   - **Target:** < 1MB per 10 versions

---

## Success Metrics

### Phase 0 Success
- Zero broken scenes in production
- 100% asset ID validation coverage
- All scenes have complete director configs

### Phase 1 Success
- 6-stage pipeline completes in < 60s
- Average confidence score > 85%
- < 5% regeneration requests

### Phase 2 Success
- Users complete 3+ refinement iterations
- Version rollback used by 40% of users
- Quick prompts save 50% of typing

### Phase 3 Success
- Live preview used by 60% of users
- Cinematic mode adoption > 30%
- Mobile users complete workflows

### Phase 4 Success
- 95% accessibility score
- Sub-second preview rendering
- 80% user satisfaction (NPS)

---

## Implementation Timeline

**Phase 0:** 1 week (CRITICAL PATH)
**Phase 1:** 2 weeks
**Phase 2:** 2 weeks
**Phase 3:** 2 weeks
**Phase 4:** 1 week

**Total:** 8 weeks to full implementation

**MVP (Minimum Viable Product):** Phase 0 + Phase 1 Core (4 weeks)

---

## Next Steps

1. **Week 1:** Complete Phase 0 (all 5 items)
2. **Week 2:** Build 6-stage pipeline prototype
3. **Week 3:** Implement conversation interface
4. **Week 4:** Test with real users, gather feedback
5. **Week 5-8:** Phases 2-4 based on user priorities

---

## Appendix: Detailed Conflict Matrix

```typescript
export const ANIMATION_CONFLICTS = {
  parallax_scale: {
    check: (d) => d.parallaxIntensity > 0 && d.scaleOnScroll,
    priority: 'parallaxIntensity', // Keep parallax, disable scale
    fix: (d) => ({ ...d, scaleOnScroll: false }),
    severity: 'CRITICAL',
    message: 'parallax and scaleOnScroll cannot be used together'
  },
  
  parallax_blur: {
    check: (d) => d.parallaxIntensity > 0 && d.blurOnScroll,
    priority: 'parallaxIntensity',
    fix: (d) => ({ ...d, blurOnScroll: false }),
    severity: 'WARNING',
    message: 'parallax + blur causes performance issues'
  },
  
  scale_blur: {
    check: (d) => d.scaleOnScroll && d.blurOnScroll,
    priority: 'scaleOnScroll',
    fix: (d) => ({ ...d, blurOnScroll: false }),
    severity: 'WARNING',
    message: 'scale + blur is visually overwhelming'
  },
  
  duration_too_fast: {
    check: (d) => d.entryDuration < 0.8,
    fix: (d) => ({ ...d, entryDuration: 1.2 }),
    severity: 'INFO',
    message: 'Entry duration increased for visibility'
  },
  
  color_contrast: {
    check: (d) => d.backgroundColor === d.textColor,
    fix: (d) => ({ 
      ...d, 
      textColor: isLightColor(d.backgroundColor) ? '#0a0a0a' : '#ffffff' 
    }),
    severity: 'CRITICAL',
    message: 'Text and background are same color'
  }
};
```

---

## Appendix: Token Budget Breakdown

| Component | Tokens | % of Budget |
|-----------|--------|-------------|
| System prompt | 5,000 | 2.5% |
| Asset catalog | 10,000 | 5% |
| Director notes | 2,000 | 1% |
| Conversation history | 80,000 | 40% |
| Current scene JSON | 8,000 | 4% |
| Reserved for response | 50,000 | 25% |
| Buffer | 45,000 | 22.5% |
| **Total** | **200,000** | **100%** |

**When to Summarize:**
- History > 80k tokens → summarize to 40k
- Preserve last 3 messages verbatim
- Preserve user requirements from message 1
