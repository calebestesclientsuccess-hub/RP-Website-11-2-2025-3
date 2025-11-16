
/**
 * Director Config Conflict Resolution
 * 
 * Implements the priority hierarchy:
 * 1. Core Effects (fade, parallax) - Highest Priority (KEEP)
 * 2. Scroll-Triggered Effects (scaleOnScroll) - Medium Priority
 * 3. Advanced Effects (blur, perspective) - Lowest Priority (DISABLE)
 */

interface DirectorConfig {
  parallaxIntensity?: number;
  scaleOnScroll?: boolean;
  blurOnScroll?: boolean;
  fadeOnScroll?: boolean;
  enablePerspective?: boolean;
  [key: string]: any;
}

export function resolveDirectorConflicts(config: DirectorConfig): {
  resolved: DirectorConfig;
  warnings: string[];
} {
  const resolved = { ...config };
  const warnings: string[] = [];

  // CONFLICT 1: parallax + scaleOnScroll (Core beats Scroll)
  if (resolved.parallaxIntensity && resolved.parallaxIntensity > 0 && resolved.scaleOnScroll) {
    warnings.push('Conflict: parallaxIntensity and scaleOnScroll cannot both be active. Disabling scaleOnScroll.');
    resolved.scaleOnScroll = false;
  }

  // CONFLICT 2: scaleOnScroll + blurOnScroll (Scroll beats Advanced)
  if (resolved.scaleOnScroll && resolved.blurOnScroll) {
    warnings.push('Conflict: scaleOnScroll and blurOnScroll both active. Disabling blurOnScroll.');
    resolved.blurOnScroll = false;
  }

  // CONFLICT 3: parallax + enablePerspective (Core beats Advanced)
  if (resolved.parallaxIntensity && resolved.parallaxIntensity > 0 && resolved.enablePerspective) {
    warnings.push('Conflict: parallaxIntensity and enablePerspective both active. Disabling enablePerspective.');
    resolved.enablePerspective = false;
  }

  return { resolved, warnings };
}
