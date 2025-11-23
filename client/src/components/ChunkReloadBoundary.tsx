import { Component, type ErrorInfo, type ReactNode } from "react";

const CHUNK_ERROR_PATTERNS = [
  /ChunkLoadError/i,
  /Loading chunk [\d]+ failed/i,
  /Importing a module script failed/i,
  /Failed to fetch dynamically imported module/i,
  /CSS chunk load failed/i,
];

const RELOAD_FLAG = "__revparty_last_chunk_reload";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

function isChunkError(error?: Error) {
  if (!error) {
    return false;
  }

  const message = error.message || error.toString();
  return CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

export class ChunkReloadBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Lazy chunk error boundary caught:", error, errorInfo);

    if (isChunkError(error) && typeof window !== "undefined") {
      try {
        const now = Date.now();
        const lastReload = Number(sessionStorage.getItem(RELOAD_FLAG) || "0");

        if (!lastReload || Number.isNaN(lastReload) || now - lastReload > 5000) {
          sessionStorage.setItem(RELOAD_FLAG, String(now));
          window.location.reload();
          return;
        }
      } catch (cleanupError) {
        console.warn("Unable to persist chunk reload flag:", cleanupError);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center text-sm text-muted-foreground">
          <p>We couldn&apos;t load the latest app bundle.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Reload now
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

