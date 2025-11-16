
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Link as LinkIcon } from "lucide-react";

interface LinkSuggestion {
  targetSlug: string;
  targetTitle: string;
  anchorText: string;
  relevanceScore: number;
  context: string;
}

interface InternalLinkSuggestionsProps {
  postId?: string;
  onInsertLink: (suggestion: LinkSuggestion) => void;
}

export function InternalLinkSuggestions({ postId, onInsertLink }: InternalLinkSuggestionsProps) {
  const { data: suggestions, isLoading } = useQuery<LinkSuggestion[]>({
    queryKey: [`/api/internal-links/suggestions/${postId}`],
    enabled: !!postId,
  });

  if (!postId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Internal Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Save the post first to see link suggestions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Suggested Internal Links
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading suggestions...</p>
        ) : suggestions && suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <div key={index} className="p-3 border rounded-md space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium line-clamp-2">
                  {suggestion.targetTitle}
                </h4>
                <Badge variant="secondary" className="text-xs">
                  {Math.round(suggestion.relevanceScore * 100)}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                Anchor: "{suggestion.anchorText}"
              </p>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => onInsertLink(suggestion)}
              >
                <LinkIcon className="h-3 w-3 mr-1" />
                Insert Link
              </Button>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No related posts found
          </p>
        )}
      </CardContent>
    </Card>
  );
}
