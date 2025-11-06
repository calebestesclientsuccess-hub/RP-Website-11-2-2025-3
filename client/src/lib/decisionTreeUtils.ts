import type { AssessmentConfig, AssessmentQuestion, AssessmentAnswer } from "@shared/schema";

export interface DecisionTreeNode {
  id: string;
  questionText: string;
  order: number;
  isEntry: boolean;
  isOrphaned: boolean;
  isReachable: boolean;
  hasConditionalLogic: boolean;
}

export interface DecisionTreeEdge {
  id: string;
  fromQuestionId: string;
  toQuestionId: string;
  answerId?: string;
  type: "answer" | "conditional";
  label: string;
  isCycle: boolean;
}

export interface DecisionTreeGraph {
  nodes: Map<string, DecisionTreeNode>;
  edges: DecisionTreeEdge[];
  reachableNodes: Set<string>;
  cycles: DecisionTreeEdge[];
  orphanedNodes: DecisionTreeNode[];
}

export function computeDecisionTree(
  config: AssessmentConfig,
  questions: AssessmentQuestion[],
  answers: AssessmentAnswer[]
): DecisionTreeGraph {
  const nodes = new Map<string, DecisionTreeNode>();
  const edges: DecisionTreeEdge[] = [];
  const questionMap = new Map<string, AssessmentQuestion>();
  const answersByQuestion = new Map<string, AssessmentAnswer[]>();
  
  // Build question map
  questions.forEach(q => {
    questionMap.set(q.id, q);
  });
  
  // Group answers by question
  answers.forEach(a => {
    const list = answersByQuestion.get(a.questionId) || [];
    list.push(a);
    answersByQuestion.set(a.questionId, list);
  });
  
  // Create nodes
  questions.forEach(q => {
    const hasConditionalLogic = !!q.conditionalLogic;
    nodes.set(q.id, {
      id: q.id,
      questionText: q.questionText,
      order: q.order,
      isEntry: false,
      isOrphaned: false,
      isReachable: false,
      hasConditionalLogic,
    });
  });
  
  // Determine entry question (use entryQuestionId or fallback to first by order)
  const entryQuestionId = config.entryQuestionId || 
    [...questions].sort((a, b) => a.order - b.order)[0]?.id;
  
  if (entryQuestionId && nodes.has(entryQuestionId)) {
    const entryNode = nodes.get(entryQuestionId)!;
    entryNode.isEntry = true;
  }
  
  // Build edges from answer routing
  answers.forEach(answer => {
    try {
      const routing = JSON.parse(answer.answerValue);
      if (routing.nextQuestionId && questionMap.has(routing.nextQuestionId)) {
        edges.push({
          id: `answer-${answer.id}`,
          fromQuestionId: answer.questionId,
          toQuestionId: routing.nextQuestionId,
          answerId: answer.id,
          type: "answer",
          label: answer.answerText.substring(0, 30) + (answer.answerText.length > 30 ? "..." : ""),
          isCycle: false,
        });
      }
    } catch (e) {
      // Invalid JSON, skip
    }
  });
  
  // Build edges from conditional logic
  questions.forEach(q => {
    if (q.conditionalLogic) {
      try {
        const logic = JSON.parse(q.conditionalLogic);
        if (logic.questionId && logic.answerId && questionMap.has(logic.questionId)) {
          const answer = answers.find(a => a.id === logic.answerId);
          const label = answer ? answer.answerText.substring(0, 30) : "condition";
          edges.push({
            id: `conditional-${q.id}`,
            fromQuestionId: logic.questionId,
            toQuestionId: q.id,
            answerId: logic.answerId,
            type: "conditional",
            label: `if: ${label}${answer && answer.answerText.length > 30 ? "..." : ""}`,
            isCycle: false,
          });
        }
      } catch (e) {
        // Invalid JSON, skip
      }
    }
  });
  
  // Build adjacency list for DFS
  const adjacencyList = new Map<string, string[]>();
  questions.forEach(q => adjacencyList.set(q.id, []));
  edges.forEach(edge => {
    const neighbors = adjacencyList.get(edge.fromQuestionId) || [];
    neighbors.push(edge.toQuestionId);
    adjacencyList.set(edge.fromQuestionId, neighbors);
  });
  
  // DFS Pass 1: Find reachable nodes from entry point
  const reachableNodes = new Set<string>();
  if (entryQuestionId) {
    const visited = new Set<string>();
    const dfsReachable = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      reachableNodes.add(nodeId);
      
      const neighbors = adjacencyList.get(nodeId) || [];
      neighbors.forEach(neighbor => dfsReachable(neighbor));
    };
    
    dfsReachable(entryQuestionId);
  }
  
  // Update nodes with reachability
  reachableNodes.forEach(nodeId => {
    const node = nodes.get(nodeId);
    if (node) {
      node.isReachable = true;
    }
  });
  
  // DFS Pass 2: Cycle detection using color-marking (white/gray/black)
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const colors = new Map<string, number>();
  const cycleEdges = new Set<string>();
  
  questions.forEach(q => colors.set(q.id, WHITE));
  
  const dfsCycle = (nodeId: string, parent: string | null = null): void => {
    colors.set(nodeId, GRAY);
    
    const neighbors = adjacencyList.get(nodeId) || [];
    neighbors.forEach(neighbor => {
      const color = colors.get(neighbor);
      
      if (color === GRAY) {
        // Back edge found - cycle detected
        const cycleEdge = edges.find(
          e => e.fromQuestionId === nodeId && e.toQuestionId === neighbor
        );
        if (cycleEdge) {
          cycleEdges.add(cycleEdge.id);
        }
      } else if (color === WHITE) {
        dfsCycle(neighbor, nodeId);
      }
    });
    
    colors.set(nodeId, BLACK);
  };
  
  // Run cycle detection from all unvisited nodes
  questions.forEach(q => {
    if (colors.get(q.id) === WHITE) {
      dfsCycle(q.id);
    }
  });
  
  // Mark cycle edges
  const cycles: DecisionTreeEdge[] = [];
  edges.forEach(edge => {
    if (cycleEdges.has(edge.id)) {
      edge.isCycle = true;
      cycles.push(edge);
    }
  });
  
  // Find orphaned nodes (unreachable from entry)
  const orphanedNodes: DecisionTreeNode[] = [];
  nodes.forEach(node => {
    if (!node.isReachable && !node.isEntry) {
      node.isOrphaned = true;
      orphanedNodes.push(node);
    }
  });
  
  return {
    nodes,
    edges,
    reachableNodes,
    cycles,
    orphanedNodes,
  };
}
