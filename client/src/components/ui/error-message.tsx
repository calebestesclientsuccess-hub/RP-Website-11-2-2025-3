import * as React from "react";
import { AlertCircle, RefreshCw, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "./alert";


export interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: "inline" | "card" | "page";
  showIcon?: boolean;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  }[];
  suggestions?: string[];
}

export function ErrorMessage({
  title = "Something went wrong",
  message,
  variant = "card",
  showIcon = true,
  actions,
  suggestions,
}: ErrorMessageProps) {
  const baseStyles = "rounded-lg border border-destructive/20 bg-destructive/5";

  const variantStyles = {
    inline: "p-3",
    card: "p-6",
    page: "p-8 max-w-2xl mx-auto my-12",
  };

  return (
    <div className={cn(baseStyles, variantStyles[variant])} role="alert" aria-live="assertive">
      <div className="flex gap-3">
        {showIcon && (
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
        )}
        <div className="flex-1 space-y-3">
          {title && (
            <h3 className="font-semibold text-destructive text-base md:text-lg">
              {title}
            </h3>
          )}
          <p className="text-sm text-muted-foreground">{message}</p>

          {suggestions && suggestions.length > 0 && (
            <div className="space-y-2 mt-4">
              <p className="text-sm font-medium flex items-center gap-2">
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
                Try these suggestions:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "outline"}
                  size="sm"
                  onClick={action.onClick}
                  className="touch-target-button"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Specialized error components
export function NotFoundError({ onGoBack, onGoHome }: { onGoBack?: () => void; onGoHome?: () => void }) {
  return (
    <ErrorMessage
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      variant="page"
      suggestions={[
        "Check the URL for typos",
        "Use the navigation menu to find what you're looking for",
        "Go back to the previous page",
      ]}
      actions={[
        ...(onGoBack ? [{ label: "Go Back", onClick: onGoBack, variant: "outline" as const }] : []),
        ...(onGoHome ? [{ label: "Go Home", onClick: onGoHome, variant: "default" as const }] : []),
      ]}
    />
  );
}

export function NetworkError({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorMessage
      title="Connection Error"
      message="We're having trouble connecting to the server. This might be a temporary issue."
      variant="card"
      suggestions={[
        "Check your internet connection",
        "Try refreshing the page",
        "Wait a moment and try again",
      ]}
      actions={[
        { label: "Retry", onClick: onRetry, variant: "default" },
      ]}
    />
  );
}

export function FormError({ message, field }: { message: string; field?: string }) {
  return (
    <ErrorMessage
      title={field ? `Error in ${field}` : "Form Error"}
      message={message}
      variant="inline"
      showIcon={true}
    />
  );
}