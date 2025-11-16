
import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SuccessAnimationProps {
  message: string;
  subMessage?: string;
  size?: "sm" | "md" | "lg";
  onComplete?: () => void;
  duration?: number;
}

export function SuccessAnimation({
  message,
  subMessage,
  size = "md",
  onComplete,
  duration = 3000,
}: SuccessAnimationProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const iconSizes = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-300"
      role="alert"
      aria-live="polite"
    >
      <div className="bg-background rounded-lg p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-w-sm mx-4">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <CheckCircle2
              className={cn(iconSizes[size], "text-green-500 animate-in zoom-in-50 duration-500")}
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
          </div>
          <div className="space-y-2">
            <p className={cn("font-semibold text-foreground", sizeClasses[size])}>
              {message}
            </p>
            {subMessage && (
              <p className="text-sm text-muted-foreground">{subMessage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast-style success notification
export function SuccessToast({ message }: { message: string }) {
  return (
    <div
      className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-lg p-4 animate-in slide-in-from-top-2 duration-300"
      role="status"
      aria-live="polite"
    >
      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">{message}</p>
    </div>
  );
}
