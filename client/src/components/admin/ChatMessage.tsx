
import { cn } from "@/lib/utils";
import { User, Sparkles, Copy, ThumbsUp, ThumbsDown, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  isTyping?: boolean;
  onCopy?: () => void;
  onFeedback?: (type: "positive" | "negative") => void;
  onEdit?: (newContent: string) => void;
}

export function ChatMessage({ role, content, timestamp, isTyping, onCopy, onFeedback, onEdit }: ChatMessageProps) {
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  
  // Sync editedContent with content prop changes
  useEffect(() => {
    setEditedContent(content);
  }, [content]);
  
  const handleFeedback = (type: "positive" | "negative") => {
    setFeedback(type);
    onFeedback?.(type);
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() && editedContent !== content) {
      onEdit?.(editedContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(content);
    setIsEditing(false);
  };
  
  return (
    <div className={cn(
      "flex gap-3 p-4 rounded-lg transition-all",
      role === "user" 
        ? "ml-auto max-w-[80%] bg-primary text-primary-foreground" 
        : "mr-auto max-w-[85%] bg-muted border border-border"
    )}>
      <div className="flex-shrink-0 mt-1">
        {role === "user" ? (
          <User className="w-5 h-5" />
        ) : (
          <Sparkles className="w-5 h-5 text-purple-500" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium opacity-70">
            {role === "user" ? "You" : "Gemini Director"}
          </span>
          <span className="text-xs opacity-50">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        </div>
        
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[100px] text-sm resize-y"
              data-testid="textarea-edit-message"
            />
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveEdit}
                disabled={!editedContent.trim() || editedContent === content}
                data-testid="button-save-edit"
              >
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                data-testid="button-cancel-edit"
              >
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className={cn(
            "text-sm whitespace-pre-wrap",
            isTyping && "animate-pulse"
          )}>
            {content}
          </div>
        )}
        
        {!isTyping && !isEditing && (
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-7 text-xs"
                data-testid="button-edit-message"
              >
                <Edit2 className="w-3 h-3 mr-1" />
                Edit
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopy}
              className="h-7 text-xs"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            
            {role === "assistant" && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback("positive")}
                  className={cn(
                    "h-7 w-7 p-0",
                    feedback === "positive" && "text-green-500"
                  )}
                >
                  <ThumbsUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback("negative")}
                  className={cn(
                    "h-7 w-7 p-0",
                    feedback === "negative" && "text-red-500"
                  )}
                >
                  <ThumbsDown className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
