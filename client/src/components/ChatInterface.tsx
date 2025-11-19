import { useState, useEffect, useRef, useId } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Loader2, 
  Wand2, 
  Plus, 
  Palette, 
  Play, 
  Layout,
  Sparkles,
  Image,
  Type,
  Film,
  Quote,
  Grid,
  Maximize,
  Check,
  CheckCheck,
  AlertCircle,
  RotateCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Enhanced message type with status tracking
export type MessageStatus = 'sending' | 'sent' | 'error' | 'ai-thinking' | 'ai-complete';

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  status?: MessageStatus;
  error?: string;
  tempId?: string; // For optimistic updates
}

interface ChatInterfaceProps {
  conversationHistory: ChatMessage[];
  onSendMessage: (message: string) => Promise<void> | void;
  onRetryMessage?: (message: ChatMessage) => void;
  isProcessing: boolean;
  suggestedPrompts?: string[];
  onQuickAction?: (action: string) => void;
  className?: string;
  debugMode?: boolean;
  enableOptimistic?: boolean;
}

// Typing indicator component
const TypingIndicator = () => (
  <div className="flex items-center gap-1">
    <motion.div
      className="w-2 h-2 bg-current rounded-full"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
    />
    <motion.div
      className="w-2 h-2 bg-current rounded-full"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
    />
    <motion.div
      className="w-2 h-2 bg-current rounded-full"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
    />
  </div>
);

// Message status indicator
const MessageStatusIndicator = ({ status, onRetry }: { 
  status?: MessageStatus; 
  onRetry?: () => void;
}) => {
  switch (status) {
    case 'sending':
      return (
        <motion.div
          className="flex items-center gap-1 text-xs opacity-70"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-1.5 h-1.5 bg-current rounded-full" />
          Sending...
        </motion.div>
      );
    case 'sent':
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1 text-xs opacity-70"
        >
          <Check className="w-3 h-3" />
        </motion.div>
      );
    case 'error':
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="w-3 h-3" />
            Failed
          </div>
          {onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="h-5 px-2 text-xs"
            >
              <RotateCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      );
    case 'ai-thinking':
      return <TypingIndicator />;
    case 'ai-complete':
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1 text-xs opacity-70"
        >
          <CheckCheck className="w-3 h-3" />
        </motion.div>
      );
    default:
      return null;
  }
};

export function ChatInterface({
  conversationHistory,
  onSendMessage,
  onRetryMessage,
  isProcessing,
  suggestedPrompts = [],
  onQuickAction,
  className = "",
  debugMode = false,
  enableOptimistic = true
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [localHistory, setLocalHistory] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageIdPrefix = useId();
  const messageCounter = useRef(0);

  // Default suggested prompts if none provided
  const defaultPrompts = [
    "Make the headline punchier",
    "Add more energy to the animations", 
    "Change to a darker theme",
    "Add testimonials section",
    "Slow down transitions",
    "Make it more cinematic"
  ];

  const prompts = suggestedPrompts.length > 0 ? suggestedPrompts : defaultPrompts;

  // Quick action templates
  const quickActions = [
    { icon: Plus, label: "Add Scene", action: "I want to add a new scene to showcase " },
    { icon: Palette, label: "Change Colors", action: "Change the color scheme to " },
    { icon: Layout, label: "Adjust Layout", action: "Adjust the layout to be more " },
    { icon: Play, label: "Preview", action: "preview" },
  ];

  // Scene type templates for quick insertion
  const sceneTemplates = [
    { icon: Type, label: "Text Scene", prompt: "Add a text scene with a powerful headline about " },
    { icon: Image, label: "Image Scene", prompt: "Add an image scene showcasing " },
    { icon: Film, label: "Video Scene", prompt: "Add a video scene that demonstrates " },
    { icon: Quote, label: "Quote Scene", prompt: "Add a testimonial quote from " },
    { icon: Grid, label: "Gallery", prompt: "Create a gallery scene with images of " },
    { icon: Maximize, label: "Fullscreen", prompt: "Add a fullscreen immersive scene about " },
  ];

  // Sync external history with local optimistic history
  useEffect(() => {
    if (!enableOptimistic) {
      setLocalHistory(conversationHistory);
    } else {
      // Merge optimistic updates with server state
      const mergedHistory = conversationHistory.map(msg => {
        const localMsg = localHistory.find(m => m.tempId === msg.tempId || m.id === msg.id);
        if (localMsg && localMsg.status === 'sending') {
          // Update status to sent when server confirms
          return { ...msg, status: 'sent' as MessageStatus };
        }
        return msg;
      });
      setLocalHistory(mergedHistory);
    }
  }, [conversationHistory, enableOptimistic]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
  }, [localHistory]);

  // Generate unique message ID
  const generateMessageId = () => {
    messageCounter.current += 1;
    return `${messageIdPrefix}-${messageCounter.current}-${Date.now()}`;
  };

  const handleSend = async () => {
    if (message.trim() && !isProcessing) {
      const userMessage = message.trim();
      const msgId = generateMessageId();
      
      // Optimistically add user message
      if (enableOptimistic) {
        const optimisticUserMsg: ChatMessage = {
          id: msgId,
          tempId: msgId,
          role: "user",
          content: userMessage,
          timestamp: Date.now(),
          status: 'sending'
        };
        
        const optimisticAiMsg: ChatMessage = {
          id: `${msgId}-ai`,
          tempId: `${msgId}-ai`,
          role: "assistant",
          content: "Analyzing your request...",
          timestamp: Date.now() + 1,
          status: 'ai-thinking'
        };
        
        // Add both messages optimistically
        setLocalHistory(prev => [...prev, optimisticUserMsg, optimisticAiMsg]);
        
        // Clear input immediately for better UX
        setMessage("");
        
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
      
      try {
        // Call parent handler (can be async)
        await onSendMessage(userMessage);
        
        // Update status to sent
        if (enableOptimistic) {
          setLocalHistory(prev => 
            prev.map(msg => 
              msg.id === msgId 
                ? { ...msg, status: 'sent' as MessageStatus }
                : msg
            )
          );
        }
      } catch (error) {
        // Handle error with rollback
        if (enableOptimistic) {
          setLocalHistory(prev => 
            prev.map(msg => 
              msg.id === msgId 
                ? { ...msg, status: 'error' as MessageStatus, error: error instanceof Error ? error.message : 'Failed to send' }
                : msg.id === `${msgId}-ai`
                  ? { ...msg, content: "Failed to process request", status: 'error' as MessageStatus }
                  : msg
            )
          );
        }
      }
      
      // If not using optimistic updates, clear after sending
      if (!enableOptimistic) {
        setMessage("");
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    }
  };

  const handleRetry = (msg: ChatMessage) => {
    if (onRetryMessage) {
      onRetryMessage(msg);
    } else if (msg.role === 'user') {
      // Set message back in input for retry
      setMessage(msg.content);
      // Remove failed messages
      setLocalHistory(prev => prev.filter(m => m.id !== msg.id && m.id !== `${msg.id}-ai`));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setMessage(prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Trigger resize
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleQuickAction = (actionTemplate: string) => {
    if (actionTemplate === "preview") {
      onQuickAction?.(actionTemplate);
    } else {
      handlePromptClick(actionTemplate);
    }
  };

  // Auto-resize textarea with debouncing
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Use requestAnimationFrame for smooth resizing
    requestAnimationFrame(() => {
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
    });
  };

  // Display either local optimistic history or regular history
  const displayHistory = enableOptimistic ? localHistory : conversationHistory;

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      {/* Chat Header with Scene Templates */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Director Chat
          </h3>
          <div className="flex items-center gap-2">
            {enableOptimistic && (
              <Badge variant="secondary" className="text-xs">
                Instant Mode
              </Badge>
            )}
            {debugMode && <Badge variant="outline">Debug Mode</Badge>}
          </div>
        </div>
        
        {/* Scene Template Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {sceneTemplates.map((template, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              onClick={() => handlePromptClick(template.prompt)}
              className="hover-elevate"
              disabled={isProcessing}
              data-testid={`scene-template-${idx}`}
            >
              <template.icon className="w-3 h-3 mr-1" />
              {template.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {displayHistory.length === 0 && (
            <div className="text-center py-8">
              <Wand2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-medium mb-2">Start Creating Your Portfolio</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Describe what you want and I'll help you build it. Try one of these:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {prompts.slice(0, 3).map((prompt, idx) => (
                  <Badge 
                    key={idx}
                    variant="secondary" 
                    className="cursor-pointer hover-elevate"
                    onClick={() => handlePromptClick(prompt)}
                    data-testid={`suggested-prompt-${idx}`}
                  >
                    {prompt}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {displayHistory.map((msg) => (
              <motion.div
                key={msg.id || msg.tempId}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ 
                  opacity: msg.status === 'sending' ? 0.7 : 1, 
                  y: 0,
                  scale: 1
                }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ 
                  duration: 0.2,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`
                    max-w-[80%] p-3 rounded-lg transition-all
                    ${msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-4' 
                      : 'bg-muted mr-4'
                    }
                    ${msg.status === 'error' ? 'ring-2 ring-destructive/50' : ''}
                  `}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="text-sm font-medium">
                      {msg.role === 'user' ? 'You' : 'AI Director'}
                    </div>
                    <MessageStatusIndicator 
                      status={msg.status} 
                      onRetry={msg.status === 'error' ? () => handleRetry(msg) : undefined}
                    />
                  </div>
                  <div className="text-sm whitespace-pre-wrap">
                    {msg.status === 'ai-thinking' && msg.role === 'assistant' ? (
                      <div className="flex items-center gap-2">
                        <TypingIndicator />
                        <span className="text-muted-foreground">{msg.content}</span>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                  {msg.timestamp && msg.status !== 'sending' && (
                    <div className="text-xs opacity-50 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Quick Actions Bar */}
      <div className="px-4 py-2 border-t border-b bg-muted/30">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Quick actions:</span>
          {quickActions.map((action, idx) => (
            <Button
              key={idx}
              variant="ghost"
              size="sm"
              onClick={() => handleQuickAction(action.action)}
              className="h-7 px-2"
              disabled={isProcessing}
              data-testid={`quick-action-${idx}`}
            >
              <action.icon className="w-3 h-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Suggested Prompts */}
      {displayHistory.length > 0 && (
        <div className="px-4 py-2 border-b bg-muted/20">
          <div className="flex gap-2 flex-wrap">
            {prompts.map((prompt, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="cursor-pointer hover-elevate text-xs"
                onClick={() => handlePromptClick(prompt)}
                data-testid={`chat-suggestion-${idx}`}
              >
                {prompt}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 space-y-2">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to create or change..."
            className="min-h-[60px] max-h-[200px] resize-none"
            disabled={isProcessing}
            data-testid="chat-input"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isProcessing}
            size="icon"
            className="h-[60px] w-[60px]"
            data-testid="send-message"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span className={message.length > 1800 ? 'text-warning' : ''}>{message.length}/2000</span>
        </div>
      </div>
    </Card>
  );
}