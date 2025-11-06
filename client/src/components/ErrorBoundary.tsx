import { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  silent?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Global Error Boundary
 * Catches and displays errors gracefully
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Widget error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.silent) {
        return null;
      }
      
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      if (process.env.NODE_ENV === 'production') {
        return (
          <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-md p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
              <p className="text-muted-foreground mb-6">
                We encountered an unexpected error. Please refresh the page to try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Refresh Page
              </button>
            </Card>
          </div>
        );
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-2xl p-8">
            <h2 className="text-2xl font-bold mb-4 text-destructive">
              Error
            </h2>
            <pre className="bg-muted p-4 rounded overflow-auto text-sm mb-6">
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}