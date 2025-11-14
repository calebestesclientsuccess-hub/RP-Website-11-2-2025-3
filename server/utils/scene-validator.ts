
import type { SceneConfig } from "@shared/schema";

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates SEO compliance across all scenes in a project
 */
export function validateProjectSEO(scenes: SceneConfig[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Rule 1: Exactly one h1 per project
  const h1Count = scenes.filter(scene => 
    scene.type === "text" && scene.content.headingLevel === "h1"
  ).length;
  
  if (h1Count === 0) {
    errors.push("Project must have exactly one h1 heading");
  } else if (h1Count > 1) {
    errors.push(`Project has ${h1Count} h1 headings. Only one is allowed for SEO.`);
  }

  // Rule 2: Validate heading hierarchy
  const headingLevels = scenes
    .filter(scene => scene.type === "text")
    .map(scene => parseInt(scene.content.headingLevel?.replace('h', '') || '2'));
  
  for (let i = 1; i < headingLevels.length; i++) {
    const jump = headingLevels[i] - headingLevels[i - 1];
    if (jump > 1) {
      warnings.push(`Heading hierarchy skip detected: h${headingLevels[i - 1]} → h${headingLevels[i]}`);
    }
  }

  // Rule 3: All images must have alt text
  const imagesWithoutAlt = scenes.filter(scene => 
    (scene.type === "image" || scene.type === "split" || scene.type === "fullscreen") &&
    (!scene.content.alt || scene.content.alt.length < 10)
  );
  
  if (imagesWithoutAlt.length > 0) {
    errors.push(`${imagesWithoutAlt.length} image(s) missing valid alt text (10-125 characters)`);
  }

  // Rule 4: Check for keyword stuffing in alt text
  scenes.forEach((scene, index) => {
    if ((scene.type === "image" || scene.type === "split") && scene.content.alt) {
      const words = scene.content.alt.toLowerCase().split(/\s+/);
      const uniqueWords = new Set(words);
      
      if (uniqueWords.size / words.length < 0.5) {
        warnings.push(`Scene ${index + 1}: Alt text may contain keyword stuffing`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
