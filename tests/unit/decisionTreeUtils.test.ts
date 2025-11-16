
import { describe, it, expect } from 'vitest';
import { computeDecisionTree } from '../../client/src/lib/decisionTreeUtils';
import type { AssessmentConfig, AssessmentQuestion, AssessmentAnswer } from '@shared/schema';

describe('Decision Tree Utils', () => {
  const mockConfig: AssessmentConfig = {
    id: 'test-config',
    tenantId: 'test-tenant',
    title: 'Test Assessment',
    slug: 'test-assessment',
    scoringMethod: 'decision-tree',
    gateBehavior: 'UNGATED',
    published: true,
    entryQuestionId: 'q1',
    createdAt: new Date(),
    updatedAt: new Date(),
    description: null,
  };

  const mockQuestions: AssessmentQuestion[] = [
    {
      id: 'q1',
      assessmentId: 'test-config',
      questionText: 'Question 1',
      questionType: 'single-choice',
      order: 0,
      required: true,
      description: null,
      conditionalLogic: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'q2',
      assessmentId: 'test-config',
      questionText: 'Question 2',
      questionType: 'single-choice',
      order: 1,
      required: true,
      description: null,
      conditionalLogic: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockAnswers: AssessmentAnswer[] = [
    {
      id: 'a1',
      questionId: 'q1',
      answerText: 'Answer 1',
      answerValue: JSON.stringify({ nextQuestionId: 'q2' }),
      order: 0,
      points: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'a2',
      questionId: 'q2',
      answerText: 'Answer 2',
      answerValue: JSON.stringify({ resultBucketKey: 'result-1' }),
      order: 0,
      points: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('should identify entry question', () => {
    const tree = computeDecisionTree(mockConfig, mockQuestions, mockAnswers);
    
    const entryNode = tree.nodes.get('q1');
    expect(entryNode?.isEntry).toBe(true);
  });

  it('should mark reachable nodes', () => {
    const tree = computeDecisionTree(mockConfig, mockQuestions, mockAnswers);
    
    expect(tree.reachableNodes.has('q1')).toBe(true);
    expect(tree.reachableNodes.has('q2')).toBe(true);
  });

  it('should create edges from answer routing', () => {
    const tree = computeDecisionTree(mockConfig, mockQuestions, mockAnswers);
    
    expect(tree.edges).toHaveLength(1);
    expect(tree.edges[0]).toMatchObject({
      fromQuestionId: 'q1',
      toQuestionId: 'q2',
      type: 'answer',
    });
  });

  it('should detect orphaned nodes', () => {
    const orphanedQuestion: AssessmentQuestion = {
      id: 'q3',
      assessmentId: 'test-config',
      questionText: 'Orphaned Question',
      questionType: 'single-choice',
      order: 2,
      required: true,
      description: null,
      conditionalLogic: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const tree = computeDecisionTree(
      mockConfig,
      [...mockQuestions, orphanedQuestion],
      mockAnswers
    );
    
    expect(tree.orphanedNodes).toHaveLength(1);
    expect(tree.orphanedNodes[0].id).toBe('q3');
  });

  it('should detect cycles', () => {
    const cyclicAnswers: AssessmentAnswer[] = [
      {
        id: 'a1',
        questionId: 'q1',
        answerText: 'Answer 1',
        answerValue: JSON.stringify({ nextQuestionId: 'q2' }),
        order: 0,
        points: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'a2',
        questionId: 'q2',
        answerText: 'Answer 2',
        answerValue: JSON.stringify({ nextQuestionId: 'q1' }),
        order: 0,
        points: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const tree = computeDecisionTree(mockConfig, mockQuestions, cyclicAnswers);
    
    expect(tree.cycles.length).toBeGreaterThan(0);
  });
});
