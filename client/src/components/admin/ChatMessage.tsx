
import { cn } from "@/lib/utils";
import { User, Sparkles, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  isTyping?: boolean;
  onCopy?: () => void;
  onFeedback?: (type: "positive" | "negative") => void;
}

export function ChatMessage({ role, content, timestamp, isTyping, onCopy, onFeedback }: ChatMessageProps) {
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null);
  
  const handleFeedback = (type: "positive" | "negative") => {
    setFeedback(type);
    onFeedback?.(type);
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
        
        <div className={cn(
          "text-sm whitespace-pre-wrap",
          isTyping && "animate-pulse"
        )}>
          {content}
        </div>
        
        {role === "assistant" && !isTyping && (
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopy}
              className="h-7 text-xs"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            
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
          </div>
        )}
      </div>
    </div>
  );
}
