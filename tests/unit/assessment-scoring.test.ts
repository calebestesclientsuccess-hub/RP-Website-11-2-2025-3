
import { describe, it, expect } from 'vitest';
import {
  calculatePointsBasedBucket,
  calculateDecisionTreeBucket,
} from '../../server/utils/assessment-scoring';
import type { AssessmentAnswer, AssessmentQuestion, AssessmentResultBucket } from '@shared/schema';

describe('Assessment Scoring', () => {
  describe('calculatePointsBasedBucket', () => {
    const answers: AssessmentAnswer[] = [
      { id: 'a1', questionId: 'q1', answerText: 'Low', answerValue: '', order: 0, points: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 'a2', questionId: 'q1', answerText: 'Medium', answerValue: '', order: 1, points: 5, createdAt: new Date(), updatedAt: new Date() },
      { id: 'a3', questionId: 'q1', answerText: 'High', answerValue: '', order: 2, points: 10, createdAt: new Date(), updatedAt: new Date() },
    ];

    const buckets: AssessmentResultBucket[] = [
      { id: 'b1', assessmentId: 'test', bucketKey: 'low', title: 'Low', description: '', order: 0, minScore: 0, maxScore: 3, createdAt: new Date(), updatedAt: new Date(), resultContent: null },
      { id: 'b2', assessmentId: 'test', bucketKey: 'medium', title: 'Medium', description: '', order: 1, minScore: 4, maxScore: 7, createdAt: new Date(), updatedAt: new Date(), resultContent: null },
      { id: 'b3', assessmentId: 'test', bucketKey: 'high', title: 'High', description: '', order: 2, minScore: 8, maxScore: null, createdAt: new Date(), updatedAt: new Date(), resultContent: null },
    ];

    it('should calculate correct bucket for low score', () => {
      const submittedAnswers = [{ questionId: 'q1', answerId: 'a1' }];
      const result = calculatePointsBasedBucket(submittedAnswers, answers, buckets);
      
      expect(result).toBe('low');
    });

    it('should calculate correct bucket for medium score', () => {
      const submittedAnswers = [{ questionId: 'q1', answerId: 'a2' }];
      const result = calculatePointsBasedBucket(submittedAnswers, answers, buckets);
      
      expect(result).toBe('medium');
    });

    it('should calculate correct bucket for high score', () => {
      const submittedAnswers = [{ questionId: 'q1', answerId: 'a3' }];
      const result = calculatePointsBasedBucket(submittedAnswers, answers, buckets);
      
      expect(result).toBe('high');
    });

    it('should return null if no bucket matches', () => {
      const noBuckets: AssessmentResultBucket[] = [];
      const submittedAnswers = [{ questionId: 'q1', answerId: 'a1' }];
      const result = calculatePointsBasedBucket(submittedAnswers, answers, noBuckets);
      
      expect(result).toBeNull();
    });
  });

  describe('calculateDecisionTreeBucket', () => {
    const questions: AssessmentQuestion[] = [
      { id: 'q1', assessmentId: 'test', questionText: 'Q1', questionType: 'single-choice', order: 0, required: true, description: null, conditionalLogic: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 'q2', assessmentId: 'test', questionText: 'Q2', questionType: 'single-choice', order: 1, required: true, description: null, conditionalLogic: null, createdAt: new Date(), updatedAt: new Date() },
    ];

    const answers: AssessmentAnswer[] = [
      { id: 'a1', questionId: 'q1', answerText: 'Yes', answerValue: JSON.stringify({ nextQuestionId: 'q2' }), order: 0, points: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 'a2', questionId: 'q2', answerText: 'Option A', answerValue: JSON.stringify({ resultBucketKey: 'result-a' }), order: 0, points: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 'a3', questionId: 'q2', answerText: 'Option B', answerValue: JSON.stringify({ resultBucketKey: 'result-b' }), order: 1, points: null, createdAt: new Date(), updatedAt: new Date() },
    ];

    it('should navigate decision tree to correct result', () => {
      const submittedAnswers = [
        { questionId: 'q1', answerId: 'a1' },
        { questionId: 'q2', answerId: 'a2' },
      ];
      
      const result = calculateDecisionTreeBucket(submittedAnswers, questions, answers, 'q1');
      expect(result).toBe('result-a');
    });

    it('should return null if answer missing', () => {
      const submittedAnswers = [{ questionId: 'q1', answerId: 'a1' }];
      
      const result = calculateDecisionTreeBucket(submittedAnswers, questions, answers, 'q1');
      expect(result).toBeNull();
    });

    it('should handle early termination', () => {
      const earlyTermAnswer: AssessmentAnswer = {
        id: 'a4',
        questionId: 'q1',
        answerText: 'Early Exit',
        answerValue: JSON.stringify({ resultBucketKey: 'early-result' }),
        order: 1,
        points: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const submittedAnswers = [{ questionId: 'q1', answerId: 'a4' }];
      
      const result = calculateDecisionTreeBucket(
        submittedAnswers,
        questions,
        [...answers, earlyTermAnswer],
        'q1'
      );
      
      expect(result).toBe('early-result');
    });
  });
});
