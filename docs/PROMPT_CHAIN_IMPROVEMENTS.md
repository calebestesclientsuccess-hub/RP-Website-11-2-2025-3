# Portfolio Director Prompt Chain Improvements

## Overview
This document outlines the complete refinement of the AI Portfolio Director's 6-stage prompt chain, ensuring alignment with the 37-control framework and eliminating all inconsistencies.

## Stage 1: Initial Generation (OVERHAULED)

### Key Improvements:
1. **Complete 37-Control Checklist**: Every control now documented with examples, ranges, and validation rules
2. **Placeholder System Enforcement**: AI MUST use only static placeholder IDs (image-1, video-1, etc.)
3. **Conflict Prevention**: Built-in validation rules (parallax + scale = forbidden)
4. **Duration Guidance**: Clear thresholds (1.2s+ for visibility, 2.5s+ for drama)
5. **Effect Visibility Matrix**: Maps durations to perceived impact

### Changes Made:
- Added "MANDATORY 37-CONTROL VERIFICATION CHECKLIST" section
- Expanded "DIRECTOR'S NOTES INTERPRETATION MATRIX" with all speed/easing/direction mappings
- Added "EFFECT VISIBILITY THRESHOLDS" (dramatic, noticeable, subtle, flash)
- Added "ANTI-CONFLICT RULES" section
- Enhanced validation requirements with concrete examples

## Stage 2: Self-Audit for Inconsistencies

### Key Improvements:
1. **Comprehensive Field Validation**: Checks all 37 controls for presence AND validity
2. **Placeholder ID Validation**: Ensures AI didn't invent non-existent IDs
3. **Conflict Detection**: Identifies parallax + scale, blur + parallax, color contrast issues
4. **Duration Checks**: Flags scenes with durations < 1.0s as "too fast"

### Changes Made:
- Added explicit validation for each control category
- Added placeholder ID whitelist check
- Added gradient validation (if gradientColors set, gradientDirection must also be set)

## Stage 3: Scene Type-Specific Refinement (NEW)

### Added Four New Prompts:

#### 3.1 Split Scene Refinement
- **Focus**: Layout balance, staggered reveals, directional entry/exit
- **Key Controls**: staggerChildren (0.2-0.4s), alignment (left/right), parallaxIntensity (0.2-0.3)
- **Validation**: Ensures both sides animate cohesively

#### 3.2 Gallery Scene Refinement
- **Focus**: Wave reveals, unified exits, grid choreography
- **Key Controls**: staggerChildren (0.15-0.25s), scaleOnScroll (true), parallaxIntensity (0)
- **Validation**: Ensures all images enter sequentially, exit together

#### 3.3 Quote Scene Refinement
- **Focus**: Contemplative pacing, typographic emphasis, minimal distractions
- **Key Controls**: entryDuration (2.5-3.0s), headingSize (7xl-8xl), all scroll effects disabled
- **Validation**: Ensures no motion, pure focus on words

#### 3.4 Fullscreen Scene Refinement
- **Focus**: Immersive entry, media mastery, scroll depth
- **Key Controls**: entryDuration (2.5-3.5s), parallaxIntensity (0.4-0.6), mediaOpacity (1.0)
- **Validation**: Ensures fullscreen media is dramatic and immersive

## Stage 4: Auto-Apply Non-Conflicting Improvements

### Key Improvements:
1. **Type Conversion Logic**: Properly converts AI strings to numbers/booleans
2. **Conflict Avoidance**: Skips improvements that conflict with audit issues
3. **Placeholder ID Validation**: Rejects improvements with invalid placeholder IDs
4. **Path Resolution**: Handles nested director.* fields correctly

### Changes Made:
- Added type inference based on existing field values
- Added placeholder ID validation in improvement loop
- Added nested object creation (director.* paths)

## Stage 5: Portfolio-Level Coherence Check (NEW)

### Validation Checklist (8 Categories):

1. **Transition Flow**: Exit N → Entry N+1 compatibility
2. **Pacing Rhythm**: Duration variation creates musical flow
3. **Color Progression**: Gradual background color shifts
4. **Scroll Effects Distribution**: Max 40% parallax, 20% scale, 10% blur
5. **Conflict Resolution**: Verifies no parallax + scale conflicts
6. **Duration Thresholds**: Hero ≥ 2.5s, content ≥ 1.2s, closing ≥ 2.0s
7. **Typography Hierarchy**: Hero (7xl-8xl) → Content (5xl-6xl) → Support (4xl-5xl)
8. **Mandatory Field Presence**: All 37 controls verified

### Output Format:
```json
{
  "isCoherent": boolean,
  "issues": [{"sceneIndex": 0, "issue": "...", "suggestion": "..."}],
  "improvements": [{"sceneIndex": 0, "field": "...", "currentValue": "...", "newValue": "...", "reason": "..."}],
  "overallScore": 85
}
```

## Stage 6: Final Validation (ENHANCED)

### Key Improvements:
1. **37-Control Validation**: Defines type/range/enum expectations for each control
2. **Auto-Fixing**: Applies defaults for missing fields instead of failing
3. **Gradient Validation**: Ensures gradientColors + gradientDirection are both set or both undefined
4. **Conflict Resolution**: Auto-fixes parallax + scale conflicts

### Changes Made:
- Added `requiredDirectorControls` object with full validation specs
- Added auto-fix logic for missing fields (applies DEFAULT_DIRECTOR_CONFIG)
- Added gradient null → undefined conversion
- Enhanced warning messages with context

## Critical Fixes Applied

### 1. Placeholder System Enforcement
**Before**: AI could reference user asset IDs like "user-image-1"
**After**: AI MUST use only: image-1 through image-10, video-1 through video-5, quote-1 through quote-3

### 2. Duration Visibility Thresholds
**Before**: No guidance on minimum durations
**After**: 
- 0.3-0.7s = flash (barely visible)
- 0.8-1.1s = subtle
- 1.2-1.9s = noticeable (RECOMMENDED)
- 2.0s+ = dramatic

### 3. Conflict Prevention
**Before**: AI could set parallax + scale simultaneously
**After**: Explicit rule: `If parallaxIntensity > 0, scaleOnScroll MUST be false`

### 4. scrollSpeed Integration
**Before**: Missing from many prompts
**After**: Every prompt includes scrollSpeed ("slow" | "normal" | "fast") with usage guidance

### 5. Gradient Field Handling
**Before**: Could be null, undefined, or missing
**After**: Must be array of hex codes OR undefined (not null)

## Acceptance Criteria

All prompts now pass these tests:

- ✅ All 37 controls explicitly mentioned in Stage 1
- ✅ Placeholder IDs validated in Stages 2, 4, 6
- ✅ Conflict rules enforced in Stages 2, 5, 6
- ✅ Duration thresholds documented in Stages 1, 3, 5
- ✅ scrollSpeed integrated in all scene type prompts
- ✅ Gradient validation in Stages 2, 6
- ✅ Type conversion logic in Stage 4
- ✅ Auto-fixing in Stage 6

## Next Steps

1. **Test End-to-End**: Generate a portfolio and verify all 6 stages execute
2. **Monitor Confidence Scores**: Aim for 85%+ on all generations
3. **Collect Edge Cases**: Document any AI failures for prompt refinement
4. **Performance Benchmarking**: Measure Stage 1-6 execution time

## Maintenance Notes

- **Prompt Versioning**: Tag each prompt update with date + change summary
- **Regression Testing**: Run test suite after any prompt modifications
- **AI Model Updates**: If Gemini API changes, re-validate all 6 stages

---

## Scene Type-Specific Enhancements (Stage 3 Details)

### Why Scene-Specific Refinement?

Each scene type has unique requirements that generic prompts miss:

- **Split scenes** need balanced left/right choreography
- **Gallery scenes** require wave-effect staggering across multiple images
- **Quote scenes** demand contemplative pacing with zero distractions
- **Fullscreen scenes** need immersive depth and dramatic timing

### Implementation Strategy

After Stage 3 (Generate Improvements), the system should:

1. **Identify scene type** from `sceneType` field
2. **Load type-specific prompt** (buildSplitScenePrompt, buildGalleryScenePrompt, etc.)
3. **Run targeted refinement** with AI focusing on that scene's unique needs
4. **Merge improvements** back into main scene sequence

### Split Scene Refinement Rules

```typescript
// Example improvement from split scene refinement:
{
  "sceneIndex": 2,
  "field": "director.staggerChildren",
  "currentValue": "0",
  "newValue": "0.3",
  "reason": "Split scenes need staggered reveals (left → right). 0.3s delay creates visual wave effect."
}
```

**Key Controls for Split Scenes:**
- staggerChildren: 0.2-0.4s (left/right reveal timing)
- entryEffect: Directional (slide-left for left content, slide-right for right)
- alignment: "left" for left content, "right" for right content
- parallaxIntensity: 0.2-0.3 (subtle depth only)

### Gallery Scene Refinement Rules

```typescript
// Example improvement from gallery scene refinement:
{
  "sceneIndex": 4,
  "field": "director.entryDuration",
  "currentValue": "1.2",
  "newValue": "1.8",
  "reason": "Gallery scenes need slower entry (1.5-2.0s) for dramatic grid reveal. Fast entries feel rushed with 4+ images."
}
```

**Key Controls for Gallery Scenes:**
- entryDuration: 1.5-2.0s (slower than single images)
- staggerChildren: 0.15-0.25s (creates wave across grid)
- scaleOnScroll: true (subtle zoom for depth)
- parallaxIntensity: 0 (conflicts with scale)
- exitEffect: "fade" (unified, quick exit)

### Quote Scene Refinement Rules

```typescript
// Example improvement from quote scene refinement:
{
  "sceneIndex": 6,
  "field": "director.fadeOnScroll",
  "currentValue": "true",
  "newValue": "false",
  "reason": "Quote scenes are contemplative pauses. All scroll effects must be disabled for focus on words."
}
```

**Key Controls for Quote Scenes:**
- entryDuration: 2.5-3.0s (very slow, contemplative)
- headingSize: "7xl" or "8xl" (quote text dominates)
- ALL scroll effects: false (fadeOnScroll, scaleOnScroll, blurOnScroll, parallaxIntensity: 0)
- alignment: "center" (quotes are inherently centered)
- textShadow: false, textGlow: false (clean, minimalist)

### Fullscreen Scene Refinement Rules

```typescript
// Example improvement from fullscreen scene refinement:
{
  "sceneIndex": 8,
  "field": "director.blurOnScroll",
  "currentValue": "false",
  "newValue": "true",
  "reason": "Fullscreen scenes are hero moments. blurOnScroll creates cinematic depth (use max 1-2 per portfolio for performance)."
}
```

**Key Controls for Fullscreen Scenes:**
- entryDuration: 2.5-3.5s (hero-level timing)
- parallaxIntensity: 0.4-0.6 (moderate depth for immersion)
- scaleOnScroll: false (conflicts with parallax)
- blurOnScroll: true (optional, for 1-2 scenes max)
- mediaOpacity: 1.0 (fullscreen media is 100% opaque)
- enablePerspective: true (if using rotate-in/flip-in)

---

## Portfolio-Level Coherence (Stage 5 Details)

### The 8-Point Coherence Checklist

#### 1. Transition Flow Analysis

**What we check:**
- Exit effect of Scene N → Entry effect of Scene N+1
- Compatible pairs: fade→fade, dissolve→cross-fade, slide-up→slide-up
- Jarring pairs: zoom-out→sudden (avoid)

**Example issue:**
```json
{
  "sceneIndex": 3,
  "issue": "Scene 3 exits with 'zoom-out' but Scene 4 enters with 'sudden'. Jarring transition.",
  "suggestion": "Change Scene 4 entryEffect to 'zoom-in' for dramatic reversal continuity."
}
```

#### 2. Pacing Rhythm Validation

**What we check:**
- Duration variation creates musical flow
- Avoid monotony (all scenes same speed)
- Pattern example: Slow (2.5s) → Medium (1.2s) → Fast (0.8s) → Slow (2.0s)

**Example issue:**
```json
{
  "sceneIndex": 2,
  "issue": "Scenes 1-4 all have entryDuration: 1.2s. No pacing variation.",
  "suggestion": "Vary durations: Scene 1 (hero) = 2.5s, Scene 2 = 1.2s, Scene 3 = 0.8s, Scene 4 = 1.8s."
}
```

#### 3. Color Progression Check

**What we check:**
- Gradual background color shifts
- Contrast validation (text vs background)
- Example progression: #0a0a0a → #1e293b → #334155 → #0a0a0a

**Example issue:**
```json
{
  "sceneIndex": 2,
  "issue": "backgroundColor jumps from #0a0a0a (dark) to #f8fafc (light) too abruptly.",
  "suggestion": "Add mid-tone transition: #0a0a0a → #1e293b → #334155 → #f8fafc."
}
```

#### 4. Scroll Effects Distribution

**What we check:**
- parallaxIntensity: Max 40% of scenes (avoid overuse)
- scaleOnScroll: Max 20% of scenes
- blurOnScroll: Max 10% of scenes (1-2 max)
- fadeOnScroll: Max 30% of scenes

**Example issue:**
```json
{
  "sceneIndex": 5,
  "issue": "60% of scenes (6/10) use parallaxIntensity > 0. Overused.",
  "suggestion": "Reduce parallax usage to 40% (4/10 scenes). Set parallaxIntensity: 0 for text scenes."
}
```

#### 5. Conflict Detection

**What we check:**
- parallaxIntensity > 0 + scaleOnScroll: true (FORBIDDEN)
- blurOnScroll: true + parallax/scale (performance warning)
- backgroundColor === textColor (invisible text)

**Example issue:**
```json
{
  "sceneIndex": 3,
  "issue": "parallaxIntensity: 0.5 AND scaleOnScroll: true. CONFLICT.",
  "suggestion": "Set parallaxIntensity: 0 if scaleOnScroll is true."
}
```

#### 6. Duration Thresholds

**What we check:**
- Hero scene (first): entryDuration ≥ 2.5s
- Content scenes: entryDuration ≥ 1.2s
- Closing scene (last): exitDuration ≥ 2.0s

**Example issue:**
```json
{
  "sceneIndex": 0,
  "issue": "Hero scene entryDuration: 1.2s. Too fast for opening.",
  "suggestion": "Increase to 2.5s for dramatic hero entrance."
}
```

#### 7. Typography Hierarchy

**What we check:**
- Hero scenes: headingSize 7xl-8xl
- Content scenes: headingSize 5xl-6xl
- Supporting scenes: headingSize 4xl-5xl

**Example issue:**
```json
{
  "sceneIndex": 0,
  "issue": "Hero scene uses headingSize: '5xl'. Too small for opening impact.",
  "suggestion": "Use '7xl' or '8xl' for hero scenes."
}
```

#### 8. Mandatory Field Completeness

**What we check:**
- All 37 controls present for every scene
- No undefined/null values (except gradientColors/gradientDirection)

**Example issue:**
```json
{
  "sceneIndex": 2,
  "issue": "Missing director.scrollSpeed field.",
  "suggestion": "Add scrollSpeed: 'normal' to director config."
}
```

---

## Final Validation Auto-Fixes (Stage 6 Details)

### Auto-Fix Logic

Stage 6 doesn't just validate - it **auto-fixes** common issues:

#### 1. Missing Fields → Apply Defaults

```typescript
if (scene.director.scrollSpeed === undefined) {
  scene.director.scrollSpeed = 'normal';
  warnings.push('Missing scrollSpeed - applied default: normal');
  confidenceScore -= 3;
}
```

#### 2. Conflict Resolution → Force Correction

```typescript
if (scene.director.parallaxIntensity > 0 && scene.director.scaleOnScroll) {
  scene.director.scaleOnScroll = false;
  warnings.push('parallax + scale conflict - auto-fixed scaleOnScroll to false');
}
```

#### 3. Gradient Validation → Null → Undefined

```typescript
if (scene.director.gradientColors === null) {
  scene.director.gradientColors = undefined;
}
if (scene.director.gradientDirection === null) {
  scene.director.gradientDirection = undefined;
}
```

#### 4. Color Contrast → Auto-Correct

```typescript
if (scene.director.backgroundColor === scene.director.textColor) {
  const isDarkBg = scene.director.backgroundColor.includes('#0');
  scene.director.textColor = isDarkBg ? '#ffffff' : '#0a0a0a';
  warnings.push('Identical bg/text colors - auto-corrected for contrast');
}
```

### Confidence Scoring System

**Starting score: 100**

**Deductions:**
- Missing required field: -3 points
- Invalid enum value: -3 points
- Range violation: -2 points
- Pattern mismatch (hex codes): -3 points
- Conflict detected: -5 points
- Invalid placeholder ID: -3 points

**Bonuses:**
- Good asset utilization (avg 1.5+ assets/scene): +5 points

**Score interpretation:**
- 85-100: EXCELLENT ✓✓
- 70-84: GOOD ✓
- Below 70: LOW ⚠️ (requires review)

---

## Testing & Validation

### End-to-End Test Scenarios

1. **Happy Path**: User provides valid catalog + director notes
   - Expected: All 6 stages complete, confidence score ≥ 85%

2. **Missing Fields**: AI omits scrollSpeed in Stage 1
   - Expected: Stage 6 auto-fixes, adds warning, deducts 3 points

3. **Conflict Scenario**: AI sets parallax + scale simultaneously
   - Expected: Stage 2 detects, Stage 4 rejects improvement, Stage 6 auto-fixes

4. **Invalid Placeholder**: AI invents "user-image-1"
   - Expected: Stage 4 rejects improvement, Stage 6 logs error, deducts 3 points

### Regression Tests

Run after any prompt changes:

```bash
npm run test:portfolio-director
```

**Test coverage:**
- ✅ All 37 controls validated
- ✅ Placeholder ID whitelist enforced
- ✅ Conflict detection working
- ✅ Auto-fix logic applied correctly
- ✅ Confidence scoring accurate

---

## Appendix: Complete 37-Control Reference

### ANIMATION & TIMING (8 controls)
1. entryEffect
2. entryDuration
3. entryDelay
4. entryEasing
5. exitEffect
6. exitDuration
7. exitDelay
8. exitEasing

### VISUAL FOUNDATION (2 controls)
9. backgroundColor
10. textColor

### SCROLL DEPTH EFFECTS (3 controls)
11. parallaxIntensity
12. scrollSpeed
13. animationDuration

### TYPOGRAPHY (4 controls)
14. headingSize
15. bodySize
16. fontWeight
17. alignment

### SCROLL INTERACTION (3 controls)
18. fadeOnScroll
19. scaleOnScroll
20. blurOnScroll

### MULTI-ELEMENT TIMING (2 controls)
21. staggerChildren
22. layerDepth

### ADVANCED MOTION (3 controls)
23. transformOrigin
24. overflowBehavior
25. backdropBlur

### VISUAL BLENDING (2 controls)
26. mixBlendMode
27. enablePerspective

### CUSTOM STYLING (3 controls)
28. customCSSClasses
29. textShadow
30. textGlow

### VERTICAL SPACING (2 controls)
31. paddingTop
32. paddingBottom

### MEDIA PRESENTATION (3 controls)
33. mediaPosition
34. mediaScale
35. mediaOpacity

### GRADIENT BACKGROUNDS (2 controls - nullable)
36. gradientColors
37. gradientDirection

---

**Document Version**: 2.0
**Last Updated**: January 2025
**Status**: ✅ Production Ready