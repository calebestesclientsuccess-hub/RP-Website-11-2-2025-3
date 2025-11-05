#!/usr/bin/env tsx
/**
 * Migration script to create GTM Assessment in the new configurable system
 * This script creates:
 * - 1 Assessment Config for GTM
 * - 2 Questions (Value Prop Complexity, Investment Level)
 * - 5 Answers total (2 for Q1, 3 for Q2)
 * - 4 Result Buckets (path-1, path-2, path-3, path-4)
 */

const API_BASE = process.env.API_URL || "http://localhost:5000";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function apiRequest<T>(method: string, path: string, body?: any): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Cookie": process.env.AUTH_COOKIE || "",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

async function migrateGTMAssessment() {
  console.log("🚀 Starting GTM Assessment migration...\n");

  try {
    // Step 1: Create Assessment Config
    console.log("📝 Creating assessment config...");
    const config = await apiRequest<any>("POST", "/api/assessment-configs", {
      name: "GTM Assessment",
      slug: "gtm-assessment",
      description: "Determine the best go-to-market strategy for your product",
      isActive: true,
      scoringMethod: "routing",
    });
    console.log(`✓ Created config: ${config.name} (ID: ${config.id})\n`);

    // Step 2: Create Questions
    console.log("❓ Creating questions...");
    
    const q1 = await apiRequest<any>("POST", `/api/assessment-configs/${config.id}/questions`, {
      questionText: "How would you describe your product's value proposition?",
      description: "This helps us understand the complexity of your sales cycle",
      order: 1,
      questionType: "single-choice",
    });
    console.log(`✓ Created Q1: ${q1.questionText}`);

    const q2 = await apiRequest<any>("POST", `/api/assessment-configs/${config.id}/questions`, {
      questionText: "What's your monthly investment capacity for outbound sales?",
      description: "This helps us recommend the right solution for your budget",
      order: 2,
      questionType: "single-choice",
    });
    console.log(`✓ Created Q2: ${q2.questionText}\n`);

    // Step 3: Create Answers for Q1
    console.log("💡 Creating answers for Q1...");
    
    const q1a1 = await apiRequest<any>("POST", `/api/assessment-questions/${q1.id}/answers`, {
      answerText: "Simple Value Prop",
      answerValue: JSON.stringify({
        text: "Simple Value Prop",
        description: "Easy to explain, clear benefits, fast decision-making",
        resultBucketKey: "path-1",
      }),
      order: 1,
    });
    console.log(`✓ Answer 1: ${q1a1.answerText} → path-1`);

    const q1a2 = await apiRequest<any>("POST", `/api/assessment-questions/${q1.id}/answers`, {
      answerText: "Complex Value Prop",
      answerValue: JSON.stringify({
        text: "Complex Value Prop",
        description: "Requires education, multiple stakeholders, longer sales cycle",
        nextQuestionId: q2.id,
      }),
      order: 2,
    });
    console.log(`✓ Answer 2: ${q1a2.answerText} → Q2\n`);

    // Step 4: Create Answers for Q2
    console.log("💡 Creating answers for Q2...");
    
    await apiRequest<any>("POST", `/api/assessment-questions/${q2.id}/answers`, {
      answerText: "Low Budget",
      answerValue: JSON.stringify({
        text: "Low Budget",
        description: "$5k-$15k per month",
        resultBucketKey: "path-2",
      }),
      order: 1,
    });
    console.log("✓ Answer 1: Low Budget → path-2");

    await apiRequest<any>("POST", `/api/assessment-questions/${q2.id}/answers`, {
      answerText: "Target Budget",
      answerValue: JSON.stringify({
        text: "Target Budget",
        description: "$15k-$40k per month",
        resultBucketKey: "path-3",
      }),
      order: 2,
    });
    console.log("✓ Answer 2: Target Budget → path-3");

    await apiRequest<any>("POST", `/api/assessment-questions/${q2.id}/answers`, {
      answerText: "Enterprise Budget",
      answerValue: JSON.stringify({
        text: "Enterprise Budget",
        description: "$40k+ per month",
        resultBucketKey: "path-4",
      }),
      order: 3,
    });
    console.log("✓ Answer 3: Enterprise Budget → path-4\n");

    // Step 5: Create Result Buckets
    console.log("🎯 Creating result buckets...");
    
    await apiRequest<any>("POST", `/api/assessment-configs/${config.id}/buckets`, {
      bucketName: "Path 1: Simple Sales",
      bucketKey: "path-1",
      title: "Simple Value Proposition Path",
      content: "Your path to success with a simple value proposition...",
      order: 1,
    });
    console.log("✓ Bucket: path-1");

    await apiRequest<any>("POST", `/api/assessment-configs/${config.id}/buckets`, {
      bucketName: "Path 2: Low Budget Complex",
      bucketKey: "path-2",
      title: "Complex Sales with Limited Budget",
      content: "Optimized approach for complex sales on a tighter budget...",
      order: 2,
    });
    console.log("✓ Bucket: path-2");

    await apiRequest<any>("POST", `/api/assessment-configs/${config.id}/buckets`, {
      bucketName: "Path 3: Target Budget Complex",
      bucketKey: "path-3",
      title: "Complex Sales with Optimal Budget",
      content: "Full GTM strategy for complex sales with proper investment...",
      order: 3,
    });
    console.log("✓ Bucket: path-3");

    await apiRequest<any>("POST", `/api/assessment-configs/${config.id}/buckets`, {
      bucketName: "Path 4: Enterprise Complex",
      bucketKey: "path-4",
      title: "Enterprise-Scale Complex Sales",
      content: "Enterprise GTM strategy for high-touch complex sales...",
      order: 4,
    });
    console.log("✓ Bucket: path-4\n");

    console.log("✅ GTM Assessment migration completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   - Config ID: ${config.id}`);
    console.log(`   - Slug: ${config.slug}`);
    console.log(`   - Questions: 2`);
    console.log(`   - Answers: 5`);
    console.log(`   - Result Buckets: 4`);

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migrateGTMAssessment();
