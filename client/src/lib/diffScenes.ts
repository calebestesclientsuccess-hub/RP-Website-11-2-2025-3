import type { SceneConfig } from "@shared/schema";

export interface SceneDiff {
  sceneIndex: number;
  before?: SceneConfig;
  after?: SceneConfig;
  changedFields: string[];
}

function collectFields(scene?: SceneConfig, prefix = ""): Record<string, any> {
  if (!scene) return {};
  const result: Record<string, any> = {};
  Object.entries(scene).forEach(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, collectFields(value as Record<string, any>, path));
    } else {
      result[path] = value;
    }
  });
  return result;
}

export function diffScenes(before: SceneConfig[] = [], after: SceneConfig[] = []): SceneDiff[] {
  const maxLength = Math.max(before.length, after.length);
  const diffs: SceneDiff[] = [];

  for (let i = 0; i < maxLength; i++) {
    const sceneBefore = before[i];
    const sceneAfter = after[i];
    const beforeFields = collectFields(sceneBefore);
    const afterFields = collectFields(sceneAfter);
    const changed = new Set<string>();

    const keys = new Set([...Object.keys(beforeFields), ...Object.keys(afterFields)]);
    keys.forEach((key) => {
      if (beforeFields[key] !== afterFields[key]) {
        changed.add(key);
      }
    });

    if (sceneBefore && sceneAfter && changed.size === 0) continue;

    diffs.push({
      sceneIndex: i,
      before: sceneBefore,
      after: sceneAfter,
      changedFields: Array.from(changed),
    });
  }

  return diffs;
}


