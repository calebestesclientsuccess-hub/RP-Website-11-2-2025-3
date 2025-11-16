import type { DirectorConfig } from "@shared/schema";

export function validateDirectorConfig(config: Partial<DirectorConfig>, sceneIndex: number): string[] {
  const errors: string[] = [];
  const required = [
    'entryEffect', 'entryDuration', 'entryDelay', 'entryEasing',
    'exitEffect', 'exitDuration', 'exitDelay', 'exitEasing',
    'backgroundColor', 'textColor', 'parallaxIntensity',
    'headingSize', 'bodySize', 'fontWeight', 'alignment',
    'fadeOnScroll', 'scaleOnScroll', 'blurOnScroll',
    'layerDepth', 'staggerChildren', 'transformOrigin',
    'overflowBehavior', 'backdropBlur', 'mixBlendMode',
    'enablePerspective', 'textShadow', 'textGlow',
    'paddingTop', 'paddingBottom', 'scrollSpeed',
    'mediaPosition', 'mediaScale', 'mediaOpacity', 'animationDuration',
    'customCSSClasses'
  ];

  for (const field of required) {
    if (config[field as keyof DirectorConfig] === undefined || config[field as keyof DirectorConfig] === null) {
      errors.push(`Scene ${sceneIndex}: Missing director.${field}`);
    }
  }

  // Conflict checks
  if (config.parallaxIntensity && config.parallaxIntensity > 0 && config.scaleOnScroll) {
    errors.push(`Scene ${sceneIndex}: parallaxIntensity and scaleOnScroll conflict - set one to 0/false`);
  }

  if (config.blurOnScroll && config.parallaxIntensity && config.parallaxIntensity > 0) {
    errors.push(`Scene ${sceneIndex}: blurOnScroll conflicts with parallax - disable one`);
  }

  // Duration checks
  if (config.entryDuration !== undefined && config.entryDuration < 0.3) {
    errors.push(`Scene ${sceneIndex}: entryDuration too short (${config.entryDuration}s) - minimum 0.3s recommended`);
  }

  if (config.exitDuration !== undefined && config.exitDuration < 0.2) {
    errors.push(`Scene ${sceneIndex}: exitDuration too short (${config.exitDuration}s) - minimum 0.2s recommended`);
  }

  // Color validation
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  if (config.backgroundColor && !hexRegex.test(config.backgroundColor)) {
    errors.push(`Scene ${sceneIndex}: backgroundColor "${config.backgroundColor}" is not a valid hex color`);
  }

  if (config.textColor && !hexRegex.test(config.textColor)) {
    errors.push(`Scene ${sceneIndex}: textColor "${config.textColor}" is not a valid hex color`);
  }

  // Range validation
  if (config.parallaxIntensity !== undefined && (config.parallaxIntensity < 0 || config.parallaxIntensity > 1)) {
    errors.push(`Scene ${sceneIndex}: parallaxIntensity must be between 0 and 1 (got ${config.parallaxIntensity})`);
  }

  // Validate scrollSpeed
  if (config.scrollSpeed && !['slow', 'normal', 'fast'].includes(config.scrollSpeed)) {
    errors.push(`Scene ${sceneIndex}: Invalid scrollSpeed: ${config.scrollSpeed}. Must be 'slow', 'normal', or 'fast'`);
  }

  // Validate media controls
  if (config.mediaOpacity !== undefined && (config.mediaOpacity < 0 || config.mediaOpacity > 1)) {
    errors.push(`Scene ${sceneIndex}: mediaOpacity must be between 0 and 1 (got ${config.mediaOpacity})`);
  }

  // Validate cinematic options
  if (config.enablePerspective && config.parallaxIntensity && config.parallaxIntensity > 0) {
    errors.push(`Scene ${sceneIndex}: Combining 3D perspective with parallax may cause visual conflicts`);
  }

  // Check for conflicting scroll effects
  const scrollEffects = [config.fadeOnScroll, config.scaleOnScroll, config.blurOnScroll].filter(Boolean);
  if (scrollEffects.length > 2) {
    errors.push(`Scene ${sceneIndex}: Multiple scroll effects may compete - consider using only 1-2 for clarity`);
  }


  return errors;
}

export function logDirectorConfigDiagnostics(scenes: any[]) {
  console.group('🎬 Director Config Diagnostics');
  scenes.forEach((scene, idx) => {
    const errors = validateDirectorConfig(scene.director || {}, idx);
    if (errors.length > 0) {
      console.error(`Scene ${idx} has ${errors.length} issues:`, errors);
    } else {
      console.log(`✅ Scene ${idx}: All director configs present`);
    }
  });
  console.groupEnd();
}