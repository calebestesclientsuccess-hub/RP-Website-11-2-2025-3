import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Star, AlertTriangle, GitBranch } from "lucide-react";
import type { AssessmentConfig, AssessmentQuestion, AssessmentAnswer } from "@shared/schema";
import { computeDecisionTree } from "@/lib/decisionTreeUtils";

interface DecisionTreeVisualizationProps {
  assessmentId: string;
  config: AssessmentConfig;
}

export function DecisionTreeVisualization({ assessmentId, config }: DecisionTreeVisualizationProps) {
  const { data: questions = [], isLoading: isLoadingQuestions } = useQuery<AssessmentQuestion[]>({
    queryKey: [`/api/assessment-configs/${assessmentId}/questions`],
  });

  const { data: answers = [], isLoading: isLoadingAnswers } = useQuery<AssessmentAnswer[]>({
    queryKey: [`/api/assessment-configs/${assessmentId}/answers`],
  });

  const graph = useMemo(() => {
    if (!questions.length) return null;
    return computeDecisionTree(config, questions, answers);
  }, [config, questions, answers]);

  const isLoading = isLoadingQuestions || isLoadingAnswers;

  if (isLoading) {
    return (
      <Card data-testid="decision-tree-loading">
        <CardContent className="py-12">
          <div className="flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!questions.length) {
    return (
      <Card data-testid="decision-tree-empty">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GitBranch className="w-4 h-4" />
            Decision Tree
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add questions to see the decision tree visualization
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!graph) {
    return null;
  }

  const { nodes, edges, cycles, orphanedNodes } = graph;
  const reachableQuestions = Array.from(nodes.values())
    .filter(n => n.isReachable || n.isEntry)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4" data-testid="decision-tree-visualization">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <GitBranch className="w-4 h-4" />
            Decision Tree
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Warnings */}
          {cycles.length > 0 && (
            <Alert variant="destructive" data-testid="alert-cycles">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Cycle detected!</span> 
                <span className="text-sm block mt-1">
                  {cycles.length} circular {cycles.length === 1 ? "reference" : "references"} found.
                  Users may get stuck in a loop.
                </span>
              </AlertDescription>
            </Alert>
          )}
          
          {orphanedNodes.length > 0 && (
            <Alert data-testid="alert-orphaned">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">{orphanedNodes.length} orphaned question{orphanedNodes.length !== 1 ? "s" : ""}</span>
                <span className="text-sm block mt-1">
                  These questions are not reachable from the start.
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Total Questions:</span>
              <span className="font-medium" data-testid="stat-total-questions">{nodes.size}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Reachable:</span>
              <span className="font-medium" data-testid="stat-reachable">{reachableQuestions.length}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Edges:</span>
              <span className="font-medium" data-testid="stat-edges">{edges.length}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Orphaned:</span>
              <span className="font-medium" data-testid="stat-orphaned">{orphanedNodes.length}</span>
            </div>
          </div>

          {/* Reachable Questions List */}
          <div className="space-y-2 pt-2">
            <h4 className="text-sm font-medium">Reachable Flow:</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {reachableQuestions.map((node, index) => {
                const outgoingEdges = edges.filter(e => e.fromQuestionId === node.id);
                const hasCycle = outgoingEdges.some(e => e.isCycle);
                
                return (
                  <div key={node.id} className="space-y-1">
                    <Card 
                      className="border-l-4"
                      style={{
                        borderLeftColor: node.isEntry 
                          ? 'hsl(var(--primary))' 
                          : hasCycle 
                          ? 'hsl(var(--destructive))'
                          : 'hsl(var(--border))'
                      }}
                      data-testid={`tree-node-${node.id}`}
                    >
                      <CardHeader className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-xs font-medium text-muted-foreground">
                                Q{node.order}
                              </span>
                              {node.isEntry && (
                                <Badge variant="default" className="h-5 gap-1" data-testid={`badge-start-${node.id}`}>
                                  <Star className="w-3 h-3" />
                                  START
                                </Badge>
                              )}
                              {node.hasConditionalLogic && (
                                <Badge variant="secondary" className="h-5" data-testid={`badge-conditional-${node.id}`}>
                                  Conditional
                                </Badge>
                              )}
                              {hasCycle && (
                                <Badge variant="destructive" className="h-5" data-testid={`badge-cycle-${node.id}`}>
                                  Cycle
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs line-clamp-2">{node.questionText}</p>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                    
                    {/* Show outgoing edges */}
                    {outgoingEdges.length > 0 && (
                      <div className="ml-6 space-y-1">
                        {outgoingEdges.slice(0, 3).map(edge => {
                          const toNode = nodes.get(edge.toQuestionId);
                          return (
                            <div 
                              key={edge.id}
                              className="flex items-center gap-2 text-xs text-muted-foreground"
                              data-testid={`edge-${edge.id}`}
                            >
                              <div className={`w-0.5 h-3 ${edge.isCycle ? 'bg-destructive' : 'bg-border'}`} />
                              <span className="truncate">
                                {edge.type === "conditional" ? "🔀" : "→"} {edge.label}
                                {toNode && ` (Q${toNode.order})`}
                              </span>
                            </div>
                          );
                        })}
                        {outgoingEdges.length > 3 && (
                          <div className="text-xs text-muted-foreground ml-4">
                            +{outgoingEdges.length - 3} more...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Orphaned Questions */}
          {orphanedNodes.length > 0 && (
            <div className="space-y-2 pt-3 border-t">
              <h4 className="text-sm font-medium text-muted-foreground">Orphaned Questions:</h4>
              <div className="space-y-1">
                {orphanedNodes.map(node => (
                  <Card 
                    key={node.id}
                    className="border-l-4 border-l-muted-foreground/30"
                    data-testid={`orphaned-node-${node.id}`}
                  >
                    <CardHeader className="p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Q{node.order}
                        </span>
                        <p className="text-xs line-clamp-1 flex-1">{node.questionText}</p>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
