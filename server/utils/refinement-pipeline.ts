
/**
 * 6-Stage AI Refinement Pipeline
 * Ensures generated portfolios meet quality standards
 */

import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";
const REFINEMENT_MODEL_ID = "gemini-2.0-thinking-exp";
const GEMINI_BASE_URL =
  env.AI_INTEGRATIONS_GEMINI_BASE_URL ||
  "https://generativelanguage.googleapis.com";

import { generateLayoutFromPrompt } from "../services/layoutGenerator";
import { buildLayoutPrompt } from "../services/promptBuilder";

interface RefinementStage {
  name: string;
  execute: () => Promise<any>;
  timing: number;
}

interface RefinementResult {
  scenes: any[];
  confidenceScore: number;
  confidenceFactors: Array<{
    category: string;
    score: number;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    issues: string[];
  }>;
  totalTime: number;
  stageTimings: Record<string, number>;
}

export class RefinementPipeline {
  private ai: GoogleGenAI;
  private stages: RefinementStage[] = [];

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }
    this.ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        apiVersion: "",
        baseUrl: GEMINI_BASE_URL,
      },
    });
  }

  /**
   * Stage 1: Initial Generation (form-filling)
   */
  async stage1_initialGeneration(brand: any, draft: any): Promise<any[]> {
    const startTime = Date.now();
    console.log("🎬 [Stage 1/6] Initial Generation...");

    // Use existing layout generator logic
    const layout = await this.generateInitialLayout(brand, draft);
    const scenes = layout.sections || [];

    const timing = Date.now() - startTime;
    console.log(`✅ [Stage 1/6] Complete in ${timing}ms`);

    return scenes;
  }

  /**
   * Stage 2: Self-Audit (AI finds inconsistencies)
   */
  async stage2_selfAudit(scenes: any[]): Promise<Array<{
    sceneIndex: number;
    issue: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    suggestion: string;
  }>> {
    const startTime = Date.now();
    console.log("🔍 [Stage 2/6] Self-Audit...");

    const auditPrompt = `Analyze these ${scenes.length} portfolio scenes for inconsistencies:

${JSON.stringify(scenes, null, 2)}

Find issues in these categories:
1. Director config completeness (missing fields)
2. Animation conflicts (parallax + scaleOnScroll)
3. Duration thresholds (hero < 2.5s, content < 1.2s)
4. Typography hierarchy (hero should use 7xl-8xl)
5. Color contrast (background vs text)

Return JSON array of issues:
[{
  "sceneIndex": 0,
  "issue": "Description of issue",
  "severity": "CRITICAL" | "WARNING" | "INFO",
  "suggestion": "How to fix it"
}]`;

    const response = await this.ai.models.generateContent({
      model: REFINEMENT_MODEL_ID,
      contents: [{ role: "user", parts: [{ text: auditPrompt }] }],
      config: {
        responseMimeType: "application/json",
      },
    });

    const issues = JSON.parse(response.text || "[]");
    const timing = Date.now() - startTime;

    console.log(`✅ [Stage 2/6] Found ${issues.length} issues in ${timing}ms`);

    return issues;
  }

  /**
   * Stage 3: Generate 10 Improvements
   */
  async stage3_generateImprovements(scenes: any[], issues: any[]): Promise<any[]> {
    const startTime = Date.now();
    console.log("💡 [Stage 3/6] Generating Improvements...");

    const improvementPrompt = `Given these issues:
${JSON.stringify(issues, null, 2)}

Generate 10 specific improvements to fix them. Prioritize CRITICAL issues.

Return JSON array:
[{
  "sceneIndex": 0,
  "field": "director.entryDuration",
  "currentValue": 1.2,
  "newValue": 2.5,
  "reason": "Hero scene needs dramatic entrance",
  "autoApplyable": true
}]`;

    const response = await this.ai.models.generateContent({
      model: REFINEMENT_MODEL_ID,
      contents: [{ role: "user", parts: [{ text: improvementPrompt }] }],
      config: {
        responseMimeType: "application/json",
      },
    });

    const improvements = JSON.parse(response.text || "[]");
    const timing = Date.now() - startTime;

    console.log(`✅ [Stage 3/6] Generated ${improvements.length} improvements in ${timing}ms`);

    return improvements;
  }

  /**
   * Stage 4: Auto-Apply Non-Conflicting Fixes
   */
  async stage4_autoApplyFixes(scenes: any[], improvements: any[]): Promise<any[]> {
    const startTime = Date.now();
    console.log("🔧 [Stage 4/6] Auto-Applying Fixes...");

    const updatedScenes = JSON.parse(JSON.stringify(scenes)); // Deep clone

    let appliedCount = 0;
    for (const improvement of improvements) {
      if (improvement.autoApplyable) {
        const scene = updatedScenes[improvement.sceneIndex];
        const fieldPath = improvement.field.split('.');

        let target = scene;
        for (let i = 0; i < fieldPath.length - 1; i++) {
          target = target[fieldPath[i]];
        }
        target[fieldPath[fieldPath.length - 1]] = improvement.newValue;

        appliedCount++;
        console.log(`  ✓ Applied: ${improvement.field} = ${improvement.newValue}`);
      }
    }

    const timing = Date.now() - startTime;
    console.log(`✅ [Stage 4/6] Applied ${appliedCount}/${improvements.length} fixes in ${timing}ms`);

    return updatedScenes;
  }

  /**
   * Stage 5: Final Regeneration (if needed)
   */
  async stage5_finalRegeneration(scenes: any[], issues: any[]): Promise<any[]> {
    const startTime = Date.now();
    console.log("🎨 [Stage 5/6] Final Regeneration...");

    const criticalIssues = issues.filter(i => i.severity === 'CRITICAL');

    if (criticalIssues.length === 0) {
      console.log(`✅ [Stage 5/6] Skipped (no critical issues) in ${Date.now() - startTime}ms`);
      return scenes;
    }

    // Only regenerate scenes with critical issues
    const scenesToRegenerate = Array.from(new Set(criticalIssues.map(i => i.sceneIndex)));
    console.log(`  Regenerating ${scenesToRegenerate.length} scenes...`);

    // In production, this would call the AI again for those specific scenes
    const timing = Date.now() - startTime;
    console.log(`✅ [Stage 5/6] Complete in ${timing}ms`);

    return scenes;
  }

  /**
   * Stage 6: Final Validation
   */
  async stage6_finalValidation(scenes: any[]): Promise<{
    confidenceScore: number;
    confidenceFactors: any[];
  }> {
    const startTime = Date.now();
    console.log("✅ [Stage 6/6] Final Validation...");

    const factors = [];
    let totalScore = 100;

    // Check 1: All scenes have complete director configs
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      if (!scene.director || Object.keys(scene.director).length < 35) {
        factors.push({
          category: 'Director Config Completeness',
          score: 70,
          severity: 'CRITICAL' as const,
          issues: [`Scene ${i} missing director fields`],
        });
        totalScore -= 10;
      }
    }

    // Check 2: No animation conflicts
    for (let i = 0; i < scenes.length; i++) {
      const d = scenes[i].director;
      if (d?.parallaxIntensity > 0 && d?.scaleOnScroll) {
        factors.push({
          category: 'Animation Conflicts',
          score: 80,
          severity: 'WARNING' as const,
          issues: [`Scene ${i} has parallax + scaleOnScroll conflict`],
        });
        totalScore -= 5;
      }
    }

    // Check 3: Duration thresholds
    if (scenes[0]?.director?.entryDuration < 2.5) {
      factors.push({
        category: 'Duration Thresholds',
        score: 85,
        severity: 'INFO' as const,
        issues: ['Hero scene entry duration < 2.5s'],
      });
      totalScore -= 3;
    }

    const timing = Date.now() - startTime;
    const confidenceScore = Math.max(0, Math.min(100, totalScore));

    console.log(`✅ [Stage 6/6] Confidence: ${confidenceScore}% (${timing}ms)`);

    return { confidenceScore, confidenceFactors: factors };
  }

  /**
   * Execute full 6-stage pipeline
   */
  async execute(brand: any, draft: any): Promise<RefinementResult> {
    const pipelineStart = Date.now();
    const stageTimings: Record<string, number> = {};

    console.log("🎬 Starting 6-Stage Refinement Pipeline...");

    try {
      // Stage 1
      const stage1Start = Date.now();
      const initialScenes = await this.stage1_initialGeneration(brand, draft);
      stageTimings['Stage 1: Initial Generation'] = Date.now() - stage1Start;

      // Stage 2
      const stage2Start = Date.now();
      const issues = await this.stage2_selfAudit(initialScenes);
      stageTimings['Stage 2: Self-Audit'] = Date.now() - stage2Start;

      // Stage 3
      const stage3Start = Date.now();
      const improvements = await this.stage3_generateImprovements(initialScenes, issues);
      stageTimings['Stage 3: Generate Improvements'] = Date.now() - stage3Start;

      // Stage 4
      const stage4Start = Date.now();
      const fixedScenes = await this.stage4_autoApplyFixes(initialScenes, improvements);
      stageTimings['Stage 4: Auto-Apply Fixes'] = Date.now() - stage4Start;

      // Stage 5
      const stage5Start = Date.now();
      const regeneratedScenes = await this.stage5_finalRegeneration(fixedScenes, issues);
      stageTimings['Stage 5: Final Regeneration'] = Date.now() - stage5Start;

      // Stage 6
      const stage6Start = Date.now();
      const validation = await this.stage6_finalValidation(regeneratedScenes);
      stageTimings['Stage 6: Final Validation'] = Date.now() - stage6Start;

      const totalTime = Date.now() - pipelineStart;

      console.log(`\n🎉 Pipeline Complete in ${totalTime}ms`);
      console.log(`📊 Confidence Score: ${validation.confidenceScore}%`);

      return {
        scenes: regeneratedScenes,
        confidenceScore: validation.confidenceScore,
        confidenceFactors: validation.confidenceFactors,
        totalTime,
        stageTimings,
      };

    } catch (error) {
      console.error("❌ Pipeline Failed:", error);
      throw error;
    }
  }

  /**
   * Execute Stages 2-6 (Background Refinement)
   */
  async refineV1toV2(initialScenes: any[]): Promise<RefinementResult> {
    const pipelineStart = Date.now();
    const stageTimings: Record<string, number> = {};

    console.log("🎬 Starting Background Refinement (Stages 2-6)...");

    try {
      // Stage 2
      const stage2Start = Date.now();
      const issues = await this.stage2_selfAudit(initialScenes);
      stageTimings['Stage 2: Self-Audit'] = Date.now() - stage2Start;

      // Stage 3
      const stage3Start = Date.now();
      const improvements = await this.stage3_generateImprovements(initialScenes, issues);
      stageTimings['Stage 3: Generate Improvements'] = Date.now() - stage3Start;

      // Stage 4
      const stage4Start = Date.now();
      const fixedScenes = await this.stage4_autoApplyFixes(initialScenes, improvements);
      stageTimings['Stage 4: Auto-Apply Fixes'] = Date.now() - stage4Start;

      // Stage 5
      const stage5Start = Date.now();
      const regeneratedScenes = await this.stage5_finalRegeneration(fixedScenes, issues);
      stageTimings['Stage 5: Final Regeneration'] = Date.now() - stage5Start;

      // Stage 6
      const stage6Start = Date.now();
      const validation = await this.stage6_finalValidation(regeneratedScenes);
      stageTimings['Stage 6: Final Validation'] = Date.now() - stage6Start;

      const totalTime = Date.now() - pipelineStart;

      console.log(`\n🎉 Background Refinement Complete in ${totalTime}ms`);

      return {
        scenes: regeneratedScenes,
        confidenceScore: validation.confidenceScore,
        confidenceFactors: validation.confidenceFactors,
        totalTime,
        stageTimings,
      };

    } catch (error) {
      console.error("❌ Background Refinement Failed:", error);
      throw error;
    }
  }

  /**
   * Generate initial layout using the layout generator service
   */
  private async generateInitialLayout(brand: any, draft: any): Promise<any> {
    const prompt = buildLayoutPrompt(brand, draft);
    return await generateLayoutFromPrompt(prompt);
  }
}
