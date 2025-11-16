
# Portfolio Director Configuration Guide

## Complete Control Reference

This guide documents every UI/UX control available to designers and film directors when creating cinematic portfolio experiences.

### Entry/Exit Animations
- **entryEffect**: How scene appears (fade, slide-up, zoom-in, rotate-in, flip-in, spiral-in, elastic-bounce, blur-focus, etc.)
- **exitEffect**: How scene disappears (fade, slide-down, zoom-out, dissolve, rotate-out, flip-out, scale-blur, etc.)
- **entryDuration**: Animation speed in seconds (0.8s = quick, 2.5s+ = dramatic)
- **exitDuration**: Exit speed (typically 20% faster than entry)
- **entryDelay**: Wait time before animation starts (0-2s)
- **exitDelay**: Stagger exit timing for layered effects

### Motion Quality (Easing)
- **entryEasing**: Acceleration curve (linear, ease-out, power3, elastic, bounce, etc.)
- **exitEasing**: Deceleration curve (ease-in recommended for exits)

### Visual Style
- **backgroundColor**: Scene background (hex code)
- **textColor**: Text color (hex code)
- **alignment**: Text alignment (left, center, right)
- **headingSize**: Heading scale (4xl to 8xl)
- **bodySize**: Body text scale (base to 2xl)
- **fontWeight**: Text weight (normal, medium, semibold, bold)

### Cinematic Controls (NEW)
- **transformOrigin**: Pivot point for rotations/scales (center center, top left, etc.)
- **overflowBehavior**: Content clipping (visible, hidden, auto)
- **backdropBlur**: Glass morphism effect (none, sm, md, lg, xl)
- **mixBlendMode**: Photoshop-style blending (multiply, screen, overlay, difference, etc.)
- **enablePerspective**: Enable 3D depth for rotations (boolean)
- **customCSSClasses**: Add Tailwind classes for advanced control

### Scroll Effects
- **parallaxIntensity**: Depth layering (0.0-1.0, conflicts with scaleOnScroll)
- **fadeOnScroll**: Fade as user scrolls (boolean)
- **scaleOnScroll**: Zoom during scroll (boolean, conflicts with parallax)
- **blurOnScroll**: Motion blur effect (use sparingly for performance)

### Layout & Spacing
- **paddingTop**: Top spacing (none, sm, md, lg, xl, 2xl)
- **paddingBottom**: Bottom spacing (none, sm, md, lg, xl, 2xl)
- **layerDepth**: Z-index for parallax layering (0-10)
- **staggerChildren**: Delay between child animations (0-1s)

### Text Effects
- **textShadow**: Drop shadow on text (boolean)
- **textGlow**: Luminous text effect (boolean)

### Media Controls (Image/Video Scenes)
- **mediaPosition**: Focal point (center, top, bottom, left, right)
- **mediaScale**: Fit behavior (cover, contain, fill)
- **mediaOpacity**: Media transparency (0.0-1.0)

## Common Patterns

### Dramatic Hero Entrance
```json
{
  "entryEffect": "blur-focus",
  "entryDuration": 2.5,
  "entryEasing": "power4",
  "transformOrigin": "center center",
  "enablePerspective": true
}
```

### Smooth Content Transition
```json
{
  "entryEffect": "fade",
  "exitEffect": "cross-fade",
  "entryDuration": 1.2,
  "exitDuration": 1.0,
  "entryEasing": "ease-out",
  "exitEasing": "ease-in"
}
```

### Playful Bounce
```json
{
  "entryEffect": "elastic-bounce",
  "entryEasing": "elastic",
  "entryDuration": 1.8
}
```
