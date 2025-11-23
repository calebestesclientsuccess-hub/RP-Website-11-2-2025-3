import { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasChunkError: boolean;
  error?: Error;
  retryCount: number;
}

/**
 * ChunkLoadError Boundary
 * 
 * Detects ChunkLoadError which occurs when:
 * - User has an old version of index.html cached
 * - Browser tries to load a chunk (JS/CSS) that no longer exists on the server
 * - This happens after deployments when asset filenames change
 * 
 * Solution: Automatically force a hard reload to fetch the latest index.html
 */
export class ChunkLoadErrorBoundary extends Component<Props, State> {
  private reloadTimeoutId: number | null = null;
  private readonly MAX_RETRIES = 3;
  private readonly RELOAD_DELAY_MS = 1000;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasChunkError: false, 
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Detect ChunkLoadError - this happens when a chunk fails to load
    const isChunkError = 
      error.name === 'ChunkLoadError' ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('Loading CSS chunk') ||
      (error as any).type === 'chunk-load-error';

    if (isChunkError) {
      return { hasChunkError: true, error };
    }

    // Not a chunk error, let parent error boundary handle it
    return { hasChunkError: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only handle chunk load errors here
    if (!this.state.hasChunkError) {
      return;
    }

    console.warn('ChunkLoadError detected:', {
      error: error.message,
      errorInfo,
      retryCount: this.state.retryCount,
    });

    // Auto-reload after a short delay to allow user to see the message
    if (this.state.retryCount < this.MAX_RETRIES) {
      this.reloadTimeoutId = window.setTimeout(() => {
        this.handleReload();
      }, this.RELOAD_DELAY_MS);
    }
  }

  componentWillUnmount() {
    if (this.reloadTimeoutId !== null) {
      clearTimeout(this.reloadTimeoutId);
    }
  }

  handleReload = () => {
    // Clear any service worker caches that might be causing issues
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
        // Force hard reload after unregistering service workers
        window.location.reload();
      });
    } else {
      // Force hard reload (bypasses cache)
      window.location.reload();
    }
  };

  handleManualReload = () => {
    if (this.reloadTimeoutId !== null) {
      clearTimeout(this.reloadTimeoutId);
    }
    this.handleReload();
  };

  render() {
    if (this.state.hasChunkError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md p-8 text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Update Available</h2>
            <p className="text-muted-foreground mb-6">
              A new version of the application is available. The page will reload automatically in a moment,
              or you can reload now to get the latest version.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleManualReload}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Reload Now
              </button>
              {this.state.retryCount >= this.MAX_RETRIES && (
                <p className="text-sm text-muted-foreground">
                  If this issue persists, please clear your browser cache and reload.
                </p>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

