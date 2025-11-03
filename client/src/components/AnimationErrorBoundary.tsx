import { Component, ReactNode, ErrorInfo } from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary for Animation Components
 * 
 * Wraps animation-heavy components to prevent cascading failures.
 * If an animation breaks, this shows a graceful fallback and logs
 * the error without breaking the entire page.
 * 
 * Usage:
 * <AnimationErrorBoundary componentName="OrbitalPowers">
 *   <OrbitalPowers />
 * </AnimationErrorBoundary>
 */
export class AnimationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error(
        `Animation Error in ${this.props.componentName || 'Unknown Component'}:`,
        error,
        errorInfo
      );
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // In production, you might want to send this to an error tracking service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback: show a subtle notice in development, hide in production
      if (import.meta.env.DEV) {
        return (
          <Card className="p-6 border-destructive/50 bg-destructive/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-destructive mb-1">
                  Animation Component Error
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {this.props.componentName || 'An animation component'} encountered an error and couldn't render.
                </p>
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer hover:text-foreground">
                    Error details
                  </summary>
                  <pre className="mt-2 p-2 bg-background rounded text-xs overflow-auto">
                    {this.state.error?.message}
                  </pre>
                </details>
              </div>
            </div>
          </Card>
        );
      }

      // In production, render nothing (graceful degradation)
      return null;
    }

    return this.props.children;
  }
}

/**
 * Convenience wrapper with sensible defaults
 */
export function withAnimationErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function WrappedComponent(props: P) {
    return (
      <AnimationErrorBoundary componentName={componentName}>
        <Component {...props} />
      </AnimationErrorBoundary>
    );
  };
}
