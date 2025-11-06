import type { AssessmentAnswer, AssessmentQuestion, AssessmentResultBucket } from "@shared/schema";

/**
 * Submitted answer format from the frontend
 */
export interface SubmittedAnswer {
  questionId: string;
  answerId: string;
}

/**
 * Calculate points-based bucket assignment
 * 
 * Sums up points from selected answers and finds matching bucket by score range
 * 
 * @param answers - Array of submitted answers with questionId and answerId
 * @param allAnswers - All answer options with their points values
 * @param buckets - Result buckets with score ranges (minScore/maxScore)
 * @returns The matching bucket key, or null if no match found
 */
export function calculatePointsBasedBucket(
  answers: SubmittedAnswer[],
  allAnswers: AssessmentAnswer[],
  buckets: AssessmentResultBucket[]
): string | null {
  // Calculate total points by matching answer IDs
  let totalPoints = 0;
  
  for (const submittedAnswer of answers) {
    const answer = allAnswers.find(a => a.id === submittedAnswer.answerId);
    if (answer && answer.points !== null && answer.points !== undefined) {
      totalPoints += answer.points;
    }
  }

  console.log(`[Points-Based Scoring] Total points: ${totalPoints}`);

  // Sort buckets by order to ensure consistent matching
  const sortedBuckets = [...buckets].sort((a, b) => a.order - b.order);

  // Find matching bucket based on score range
  for (const bucket of sortedBuckets) {
    const { bucketKey, minScore, maxScore } = bucket;

    // Handle different score range scenarios
    if (minScore !== null && maxScore !== null) {
      // Both bounds defined: check if score is within range
      if (totalPoints >= minScore && totalPoints <= maxScore) {
        console.log(`[Points-Based Scoring] Matched bucket: ${bucketKey} (${minScore}-${maxScore})`);
        return bucketKey;
      }
    } else if (minScore !== null && maxScore === null) {
      // Only minimum bound: score >= min
      if (totalPoints >= minScore) {
        console.log(`[Points-Based Scoring] Matched bucket: ${bucketKey} (${minScore}+)`);
        return bucketKey;
      }
    } else if (minScore === null && maxScore !== null) {
      // Only maximum bound: score <= max
      if (totalPoints <= maxScore) {
        console.log(`[Points-Based Scoring] Matched bucket: ${bucketKey} (<= ${maxScore})`);
        return bucketKey;
      }
    }
  }

  // No matching bucket found
  console.warn(`[Points-Based Scoring] No bucket matched for score ${totalPoints}`);
  return null;
}

/**
 * Calculate decision-tree bucket assignment
 * 
 * Follows the answerValue JSON routing to navigate through questions
 * until reaching a final result bucket key
 * 
 * @param answers - Array of submitted answers with questionId and answerId
 * @param questions - All questions in the assessment
 * @param allAnswers - All answer options with their routing logic
 * @param entryQuestionId - The first question to start from
 * @returns The final bucket key, or null if routing fails
 */
export function calculateDecisionTreeBucket(
  answers: SubmittedAnswer[],
  questions: AssessmentQuestion[],
  allAnswers: AssessmentAnswer[],
  entryQuestionId: string
): string | null {
  console.log(`[Decision-Tree Scoring] Starting from question: ${entryQuestionId}`);
  
  // Create a map of questionId -> answerId for quick lookup
  const answerMap = new Map<string, string>();
  for (const answer of answers) {
    answerMap.set(answer.questionId, answer.answerId);
  }

  let currentQuestionId = entryQuestionId;
  let iterations = 0;
  const maxIterations = 100; // Prevent infinite loops

  while (iterations < maxIterations) {
    iterations++;

    // Get the user's answer for the current question
    const selectedAnswerId = answerMap.get(currentQuestionId);
    
    if (!selectedAnswerId) {
      console.warn(`[Decision-Tree Scoring] No answer found for question ${currentQuestionId}`);
      return null;
    }

    // Find the answer details
    const answer = allAnswers.find(a => a.id === selectedAnswerId);
    
    if (!answer) {
      console.warn(`[Decision-Tree Scoring] Answer ${selectedAnswerId} not found`);
      return null;
    }

    // Parse the answerValue JSON to get routing logic
    let routing: { nextQuestionId?: string; resultBucketKey?: string } = {};
    
    try {
      routing = JSON.parse(answer.answerValue);
    } catch (error) {
      console.error(`[Decision-Tree Scoring] Failed to parse answerValue for answer ${selectedAnswerId}:`, error);
      return null;
    }

    // Check if we've reached a final result
    if (routing.resultBucketKey) {
      console.log(`[Decision-Tree Scoring] Reached final bucket: ${routing.resultBucketKey}`);
      return routing.resultBucketKey;
    }

    // Continue to next question
    if (routing.nextQuestionId) {
      console.log(`[Decision-Tree Scoring] Moving to question: ${routing.nextQuestionId}`);
      currentQuestionId = routing.nextQuestionId;
      continue;
    }

    // No valid routing found
    console.warn(`[Decision-Tree Scoring] Answer has no nextQuestionId or resultBucketKey`);
    return null;
  }

  console.error(`[Decision-Tree Scoring] Max iterations (${maxIterations}) reached - possible infinite loop`);
  return null;
}
