import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, info);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-base-950 px-4">
          <div className="max-w-md w-full">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-danger-500/10 border border-danger-500/20 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-danger-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-base-50">
                  Something went wrong
                </h1>
                <p className="text-sm text-base-300 mt-1.5 leading-relaxed">
                  An unexpected error occurred. Your projects are safely stored and
                  will be available after reloading.
                </p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={this.handleHome}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-base-700 text-base-200 hover:text-base-50 hover:bg-base-800 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-accent text-base-950 hover:bg-accent-400 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
