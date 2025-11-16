
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
    'paddingTop', 'paddingBottom'
  ];

  for (const field of required) {
    if (config[field as keyof DirectorConfig] === undefined || config[field as keyof DirectorConfig] === null) {
      errors.push(`Scene ${sceneIndex}: Missing director.${field}`);
    }
  }

  // Conflict checks
  if (config.parallaxIntensity && config.parallaxIntensity > 0 && config.scaleOnScroll) {
    errors.push(`Scene ${sceneIndex}: parallaxIntensity and scaleOnScroll conflict`);
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
